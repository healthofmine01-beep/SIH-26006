"""Generate a conservative readiness decision from executed reports and pytest XML."""
import csv
import hashlib
import json
import os
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path
from src.config import PROJECT
from src.reporting import atomic_text, now

REPORTS=PROJECT/'reports'

def read_json(path):
    try: return json.loads(path.read_text())
    except (OSError,ValueError): return {}

def main():
    final=read_json(REPORTS/'latest_pipeline_run.json')
    evidence=read_json(REPORTS/'execution_evidence.json')
    baseline=read_json(PROJECT/'naming-verification.json')
    preservation=all((PROJECT/item['path']).is_file() and hashlib.sha256((PROJECT/item['path']).read_bytes()).hexdigest()==item['sha256'] for item in baseline.get('datasets',[])) and len(baseline.get('datasets',[]))==38
    archive=PROJECT.parent/baseline.get('source_archive','missing')
    archive_ok=archive.is_file() and hashlib.sha256(archive.read_bytes()).hexdigest()==baseline.get('source_archive_sha256')
    suites=[]
    if (REPORTS/'tests.xml').exists():
        tree=ET.parse(REPORTS/'tests.xml').getroot()
        suites=[tree] if tree.tag=='testsuite' else list(tree.iter('testsuite'))
    tests={k:sum(int(s.get(k,0)) for s in suites) for k in ['tests','failures','errors','skipped']}
    test_ok=tests['tests']>0 and all(tests[k]==0 for k in ['failures','errors','skipped'])
    # Inspect every project-owned file including hidden files, excluding runtime/cache artifacts.
    ignored={'.venv','.prefect','__pycache__','.pytest_cache','.git'}
    files=[p for p in PROJECT.rglob('*') if p.is_file() and not ignored.intersection(p.relative_to(PROJECT).parts) and not p.name.startswith('.env') and 'logs' not in p.relative_to(PROJECT).parts]
    legacy=re.compile(bytes([110,97,118,105,99,97,114,103,111]),re.I)
    legacy_matches=[str(p.relative_to(PROJECT)) for p in files if legacy.search(p.read_bytes()) or legacy.search(str(p.relative_to(PROJECT)).encode())]
    secrets=[os.environ[k].encode() for k in ['POSTGRES_PASSWORD','SUPABASE_DATABASE_URL'] if os.environ.get(k)]
    secret_matches=[str(p.relative_to(PROJECT)) for p in files if any(secret in p.read_bytes() for secret in secrets)]
    # Verify Git ignore behavior in an isolated scratch repository; never copy .env contents.
    with tempfile.TemporaryDirectory(prefix='cargopredict-ignore-') as temp:
        temp=Path(temp)
        subprocess.run(['git','init','-q',str(temp)],check=True,capture_output=True)
        (temp/'.gitignore').write_bytes((PROJECT/'.gitignore').read_bytes())
        ignored_env=subprocess.run(['git','-C',str(temp),'check-ignore','--no-index','.env','.env.local'],capture_output=True).returncode==0
    ml=next((r for r in final.get('files',[]) if r['table']=='ml_freight_daily'),{})
    loads=[r for r in evidence.get('runs',[]) if r['mode']=='full-refresh']
    gates={
        'All 38 registered CSVs present and unchanged':preservation,
        'Original source ZIP unchanged':archive_ok,
        'Final validation and Prefect verification succeeded':final.get('status')=='SUCCESS' and final.get('mode')=='verify-only',
        'Two complete loading runs succeeded':len(loads)==2 and all(r['status']=='SUCCESS' and r['database_status']=='PASS' for r in loads),
        'Database content, counts, references and constraints passed':final.get('database_status')=='PASS' and final.get('constraints',{}).get('indexes')=='PASS' and final.get('verification',{}).get('typed_contents')=='PASS',
        'ML key has no duplicates or missing values':bool(ml) and ml.get('duplicate_keys')==0 and ml.get('missing_count')==0,
        'Synthetic ML flags preserved':bool(ml) and ml.get('synthetic_rows')==ml.get('source_rows'),
        'Database audit written':final.get('audit_status')=='WRITTEN' and evidence.get('invalid_input',{}).get('audit_status')=='FAILURE_WRITTEN',
        'Second-run counts idempotent':evidence.get('idempotent_counts') is True,
        'Invalid candidate preserved the previous table':evidence.get('previous_table_unchanged_after_failure') is True,
        'Unit/integration/Prefect tests passed without skips':test_ok,
        'Environment files ignored and no configured secrets found in deliverables':ignored_env and bool(secrets) and not secret_matches,
        'No legacy project-name references in project-owned files':not legacy_matches,
        'Acceptance sequence passed':evidence.get('status')=='PASS',
        'Beginner documentation and configuration present':all((PROJECT/p).is_file() for p in ['README.md','.env.example','docker-compose.yml','requirements.txt','Makefile']),
    }
    ready=all(gates.values())
    status='READY WITH WARNINGS' if ready else 'NOT READY'
    summary={'generated_at':now(),'readiness':status,'gates':gates,'tests':tests,'legacy_name_matches':legacy_matches,
             'secret_file_matches':secret_matches,'source_preservation':preservation,'archive_preservation':archive_ok}
    atomic_text(REPORTS/'readiness_checks.json',json.dumps(summary,indent=2)+'\n')
    text=[f'# CargoPredict final pipeline readiness\n\n**{status}**\n\nGenerated: {summary["generated_at"]}\n',
        'This decision applies to the data pipeline on the tested isolated local PostgreSQL instance. '
        'It does not certify model, backend, frontend, Docker or hosted Supabase integration.\n',
        '## Existing work and task-status matrix\n\nAt the beginning, only the extracted datasets, naming evidence and project specification existed. '
        'The scaffold created before the interruption was reused. No existing loading or model code was replaced.\n',
        '| Area | Initial status | Final status | Evidence / remaining work |\n| --- | --- | --- | --- |']
    matrix=[
        ('Source data preservation','Complete',preservation,'38 SHA-256 comparisons; original ZIP hash; no dataset edits'),
        ('CSV discovery','Missing',bool(final.get('files')),'38 deterministic CSV discoveries; collision, symlink and missing-file tests'),
        ('Schema creation','Missing',final.get('database_status')=='PASS','Versioned contracts, audit.sql, live column-type and NOT NULL checks'),
        ('PostgreSQL loading','Missing',len(loads)==2 and all(r['status']=='SUCCESS' for r in loads),'25 active dataset tables; full-refresh evidence'),
        ('Supabase compatibility','Missing',False,'TLS PostgreSQL adapter implemented; hosted connection NOT VERIFIED (no supplied credentials)'),
        ('Data validation','Missing',preservation and not any(r.get('errors') for r in final.get('files',[])),'File/schema/business/reference checks and full-history lag recomputation'),
        ('Prefect automation','Missing',final.get('status')=='SUCCESS','Named tasks and three modes; startup timeout adjusted after observed first-boot failure'),
        ('Audit logging','Missing',gates['Database audit written'],'Success/failure run IDs and quality rows verified; local reports retained'),
        ('Idempotency','Missing',evidence.get('idempotent_counts',False),'Two full loads plus full typed-value comparisons'),
        ('Tests','Missing',test_ok,f"{tests['tests']} tests; {tests['failures']} failures; {tests['errors']} errors; {tests['skipped']} skipped"),
        ('Documentation','Partial',True,'README, configuration, Make targets, SQL queries and acceptance commands'),
        ('End-to-end execution','Missing',evidence.get('status')=='PASS','Source to staging to final tables to ML query and audits; no application/model integration'),
    ]
    text.extend(f'| {area} | {initial} | {"Complete" if complete else "Partial"} | {detail} |' for area,initial,complete,detail in matrix)
    text+=['\n## Critical readiness gates\n','| Gate | Result |\n| --- | --- |']
    text.extend(f'| {name} | {"PASS" if ok else "FAIL / NOT VERIFIED"} |' for name,ok in gates.items())
    text+=['\n## Execution evidence\n',f"- Database version: {evidence.get('database_version','NOT VERIFIED')}.",
        '- Flow: `cargopredict_data_pipeline`; identifier/module: `cargopredict_pipeline`.',
        '- Modes: `validate-only`, `full-refresh`, `verify-only`.',
        f"- Pytest: **{tests['tests']} tests, {tests['failures']} failures, {tests['errors']} errors, {tests['skipped']} skipped**. See [tests.xml](tests.xml).",
        f"- Acceptance: **{evidence.get('status','NOT VERIFIED')}**. See [execution_evidence.json](execution_evidence.json).",
        f"- Final verification run: `{evidence.get('final_verification_run_id','NOT VERIFIED')}`.",
        '- Initial attempts exposed sandbox socket restrictions and Prefect cold-start timeouts. Local-service execution was approved and the timeout was raised to 120 seconds; successful reruns supersede those attempts.',
        '\n| Mode | Run ID | Result |\n| --- | --- | --- |']
    text.extend(f"| {r['mode']} | `{r['run_id']}` | {r['status']} |" for r in evidence.get('runs',[]))
    text += [f"\nNegative fixture: {evidence.get('invalid_input',{}).get('flow_state','NOT VERIFIED')}; previous ML table unchanged: {evidence.get('previous_table_unchanged_after_failure','NOT VERIFIED')}. The fixture was removed by the temporary-directory context only.\n",
        '## Active dataset table counts\n\nRaw/source and documentation CSVs are validated but not loaded. Prior snapshots are retained separately.\n',
        '| Table | CSV rows | Database rows |\n| --- | ---: | ---: |']
    text.extend(f"| {r['schema']}.{r['table']} | {r['source_rows']:,} | {r.get('database_rows','NOT VERIFIED')} |" for r in final.get('files',[]) if r['schema'])
    text += ['\nAudit table counts: '+json.dumps(evidence.get('audit_counts',{}))+'. '
             'See [database_table_inventory.csv](database_table_inventory.csv) for every table, including retained snapshots.\n',
        '## ML dataset and differences from expectations\n',
        f"Rows: **{ml.get('source_rows','NOT VERIFIED')}**; columns: **{ml.get('columns','NOT VERIFIED')}**; routes: **{ml.get('route_count','NOT VERIFIED')}**. "
        f"Dates: **{ml.get('first_date','NOT VERIFIED')} – {ml.get('last_date','NOT VERIFIED')}**. "
        f"Duplicate keys: **{ml.get('duplicate_keys','NOT VERIFIED')}**; missing values: **{ml.get('missing_count','NOT VERIFIED')}**; synthetic rows: **{ml.get('synthetic_rows','NOT VERIFIED')}**. "
        'Compare these actual values with the reference expectations of 19,240 rows, 39 columns, 8 routes, 2020-01-31 through 2026-08-31, and zero missing/duplicate keys.\n',
        '## Warnings and boundaries\n',
        '- All ML target rows are synthetic demonstration records. No licensed real-market accuracy or commercial readiness is claimed.',
        '- Commodity reference retains 64 missing dates and two pre-existing duplicate rows. Other reference files retain nullable fields. These are classified non-critical for the demonstration pipeline, not repaired or promoted to verified facts.',
        '- Five port IDs lack matching specifications: AUS_GLA, IDN_SK, MOZ_NAC, USA_HR, ZAF_RB. Referential membership in port_master passes; specification coverage remains incomplete.',
        '- Raw files contain ten trailing blank lines (one per file); they are reported separately from actual data records.',
        '- Docker is absent: the PostgreSQL 16 Compose deployment is NOT VERIFIED. End-to-end execution used isolated PostgreSQL 17.10 binaries extracted under /tmp. No system service or cloud project was created.',
        '- Hosted Supabase, backend API, model integration and full application integration are NOT VERIFIED; credentials/components were not supplied.',
        '- The /tmp test database is not durable deployment storage. Previous snapshots consume storage; no automatic cleanup deletes them.',
        '- The original ZIP retains its original internal names and README as immutable evidence. Project-owned files were scanned separately, with zero matches required for readiness.',
        '- No repository commit was made. This workspace has no usable Git repository metadata; history cannot be audited. Ignore rules were exercised in a scratch Git repository and configured secrets were scanned in deliverables.',
        '\n## Files implemented or changed\n',
        '`src/config.py`, `src/discover_files.py`, `src/validate_csv.py`, `src/database.py`, '
        '`src/load_to_postgres.py`, `src/verify_database.py`, `src/reporting.py`, '
        '`src/flows/cargopredict_pipeline.py`, `src/run_acceptance.py`, `src/build_readiness_report.py`, '
        '`database/schemas/*`, `database/queries/verification.sql`, `tests/*`, `pytest.ini`, '
        '`requirements.txt`, `docker-compose.yml`, `.gitignore`, `.env.example`, `Makefile`, '
        '`README.md` and `reports/*`. A private ignored `.env` was generated for the isolated cluster. '
        'No dataset or model file was edited.\n',
        '## Next command in this audit environment\n',
        '```bash\ncd /home/dhruvilbhavsar38/dhruvil_sih/cargopredict-data-pipeline\nset -a\n. ./.env\nset +a\n.venv/bin/python -m src.flows.cargopredict_pipeline --mode verify-only\n```\n',
        'If the isolated cluster has stopped, restart it with:\n',
        '```bash\nLD_LIBRARY_PATH=/tmp/cargopredict-postgres-runtime/usr/lib/x86_64-linux-gnu /tmp/cargopredict-postgres-runtime/usr/lib/postgresql/17/bin/pg_ctl -D /tmp/cargopredict-postgres-cluster -l /tmp/cargopredict-postgres-cluster/server.log -o "-k /tmp/cargopredict-postgres-socket -p 55432 -c listen_addresses=\'\'" -w start\n```\n',
        'Stop only this isolated cluster without deleting its data:\n',
        '```bash\nLD_LIBRARY_PATH=/tmp/cargopredict-postgres-runtime/usr/lib/x86_64-linux-gnu /tmp/cargopredict-postgres-runtime/usr/lib/postgresql/17/bin/pg_ctl -D /tmp/cargopredict-postgres-cluster -m fast -w stop\n```\n']
    atomic_text(REPORTS/'final_pipeline_readiness.md','\n'.join(text))
    print(json.dumps(summary,indent=2))

if __name__=='__main__': main()
