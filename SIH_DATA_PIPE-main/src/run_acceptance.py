"""Execute the requested acceptance sequence on an explicitly configured database.

The negative candidate is a temporary copy; source files and final tables are retained.
Run only when full-refresh of CargoPredict-owned tables is intended.
"""
import csv
import hashlib
import io
import json
import shutil
import tempfile
from psycopg import sql
from pathlib import Path
from src.config import PROJECT
from src.database import connection
from src.flows.cargopredict_pipeline import cargopredict_data_pipeline
from src.reporting import atomic_text, now

def main():
    evidence={'started_at':now(),'runs':[],'status':'RUNNING'}
    destination=PROJECT/'reports/execution_evidence.json'
    try:
        for mode in ['validate-only','full-refresh','verify-only','full-refresh','verify-only']:
            state=cargopredict_data_pipeline(mode=mode,return_state=True)
            result=json.loads((PROJECT/'reports/latest_pipeline_run.json').read_text())
            evidence['runs'].append({k:result.get(k) for k in ['run_id','mode','status','database_status','constraints','verification']})
            if not state.is_completed() or result['status']!='SUCCESS':
                raise RuntimeError('Acceptance flow failed: '+mode)
        # Verify the same active ML contents before and after a rejected input candidate.
        with connection() as conn:
            before=conn.execute('SELECT * FROM ml.ml_freight_daily ORDER BY date,route_id,vessel_class').fetchall()
        with tempfile.TemporaryDirectory(prefix='cargopredict-invalid-') as temp:
            root=Path(temp)/'CargoPredict_Pipeline_Data'
            shutil.copytree(PROJECT/'CargoPredict_Pipeline_Data',root)
            # Replace ONLY the temporary candidate ML file with one invalid small row.
            path=root/'ml_ready/ml_freight_daily.csv'
            with path.open(newline='') as f:
                reader=csv.DictReader(f); fields=reader.fieldnames; row=next(reader)
            row['freight_rate_usd_per_mt']='-1'
            with path.open('w',newline='') as f:
                writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerow(row)
            state=cargopredict_data_pipeline(str(root),mode='full-refresh',return_state=True)
            invalid=json.loads((PROJECT/'reports/latest_pipeline_run.json').read_text())
            if not state.is_failed(): raise RuntimeError('Invalid source was incorrectly accepted')
            ml=next(r for r in invalid['files'] if r['table']=='ml_freight_daily')
            if 'business_rule:freight_rate_usd_per_mt' not in ml['errors']:
                raise RuntimeError('Negative freight business gate did not execute')
            evidence['invalid_input']={'run_id':invalid['run_id'],'flow_state':'Failed',
                'checks':ml['errors'],'audit_status':invalid['audit_status']}
        with connection() as conn:
            after=conn.execute('SELECT * FROM ml.ml_freight_daily ORDER BY date,route_id,vessel_class').fetchall()
            if before!=after: raise RuntimeError('Invalid input changed the previously valid table')
        evidence['previous_table_unchanged_after_failure']=True
        state=cargopredict_data_pipeline(mode='verify-only',return_state=True)
        if not state.is_completed(): raise RuntimeError('Final clean verification failed')
        final=json.loads((PROJECT/'reports/latest_pipeline_run.json').read_text())
        evidence['final_verification_run_id']=final['run_id']
        loads=[json.loads((PROJECT/'reports'/(r['run_id']+'.json')).read_text()) for r in evidence['runs'] if r['mode']=='full-refresh']
        snapshots=[{r['schema']+'.'+r['table']:r['database_rows'] for r in run['files'] if r['schema']} for run in loads]
        evidence['idempotent_counts']=snapshots[0]==snapshots[1]
        if not evidence['idempotent_counts']: raise RuntimeError('Second-run counts changed')
        with connection() as conn:
            evidence['audit_counts']={name:conn.execute('SELECT count(*) FROM audit.'+name).fetchone()[0]
                for name in ['pipeline_runs','table_load_results','data_quality_results']}
            inventory=[]
            for schema,table in conn.execute("SELECT schemaname,tablename FROM pg_tables WHERE schemaname IN ('reference','synthetic','ml','audit') ORDER BY schemaname,tablename").fetchall():
                count=conn.execute(sql.SQL('SELECT count(*) FROM {}').format(sql.Identifier(schema,table))).fetchone()[0]
                inventory.append({'schema':schema,'table':table,'rows':count,'kind':'retained_snapshot' if table.startswith('_cp_previous_') else 'audit' if schema=='audit' else 'active_dataset'})
            output=io.StringIO(newline='')
            writer=csv.DictWriter(output,fieldnames=['schema','table','rows','kind'])
            writer.writeheader();writer.writerows(inventory)
            atomic_text(PROJECT/'reports/database_table_inventory.csv',output.getvalue())
            evidence['database_version']=conn.execute('SHOW server_version').fetchone()[0]
            evidence['audit_run_statuses']=[(str(run_id),status) for run_id,status in conn.execute('SELECT run_id,status FROM audit.pipeline_runs ORDER BY started_at').fetchall()]
            expected_ids=[r['run_id'] for r in evidence['runs'] if r['mode']!='validate-only']+[invalid['run_id'],final['run_id']]
            actual=dict(evidence['audit_run_statuses'])
            if any(rid not in actual for rid in expected_ids) or actual[invalid['run_id']]!='FAILED':
                raise RuntimeError('Expected audit run missing or invalid status')
        evidence['status']='PASS'
    except Exception as exc:
        evidence['status']='FAIL'
        evidence['error']='Acceptance failed: '+type(exc).__name__
        raise
    finally:
        evidence['completed_at']=now()
        atomic_text(destination,json.dumps(evidence,indent=2)+'\n')
    print(json.dumps({'acceptance':'PASS','idempotent_counts':True,'invalid_input_protected':True,'audit_counts':evidence['audit_counts']},indent=2))

if __name__=='__main__': main()
