"""CargoPredict local Prefect orchestration. No Prefect Cloud account is required."""
import argparse
import json
import os
from pathlib import Path
from uuid import uuid4

# Keep Prefect runtime files inside the project; don't persist datasets/credentials.
os.environ.setdefault('PREFECT_HOME',str(Path(__file__).resolve().parents[2]/'.prefect'))
os.environ.setdefault('PREFECT_SERVER_ANALYTICS_ENABLED','false')
os.environ.setdefault('PREFECT_SERVER_EPHEMERAL_STARTUP_TIMEOUT_SECONDS','120')
os.environ.setdefault('PREFECT_TASKS_DEFAULT_PERSIST_RESULT','false')
from prefect import flow, task, get_run_logger
from prefect.cache_policies import NO_CACHE
from prefect.runtime import flow_run
from prefect.utilities.annotations import quote
from src.config import resolve_config, FLOW_NAME
from src.discover_files import discover
from src.validate_csv import CONTRACTS, checksum_registry, validate_file, cross_validate, ensure_valid, ValidationError
from src.database import connection, create_schemas, write_audit, DatabaseError, TemporaryDatabaseError
from src.load_to_postgres import stage_table, promote_table
from src.verify_database import verify_tables, verify_constraints
from src.reporting import now, export_report, public_report

TASK_OPTIONS=dict(persist_result=False,cache_policy=NO_CACHE,log_prints=False)
resolve_task=task(name='Resolve configuration',**TASK_OPTIONS)(resolve_config)
discover_task=task(name='Discover dataset files',**TASK_OPTIONS)(discover)

@task(name='Validate dataset layer',**TASK_OPTIONS)
def validate_layer(root, files, layer):
    registry=checksum_registry(root)
    return [validate_file(root,p,checksum=registry.get(p.relative_to(root).as_posix()))
            for p in files if p.relative_to(root).parts[0]==layer]

cross_task=task(name='Validate references and earlier-date features',**TASK_OPTIONS)(cross_validate)
gate_task=task(name='Enforce validation gate',**TASK_OPTIONS)(ensure_valid)

def retry_connection(task,task_run,state):
    try: state.result()
    except TemporaryDatabaseError: return True
    except Exception: return False
    return False

@task(name='Test database connection',retries=2,retry_delay_seconds=5,
      retry_condition_fn=retry_connection,**TASK_OPTIONS)
def connection_task(target):
    with connection(target) as conn:
        return conn.execute('SHOW server_version').fetchone()[0]

schemas_task=task(name='Create required schemas',**TASK_OPTIONS)(create_schemas)
audit_task=task(name='Write audit results',**TASK_OPTIONS)(write_audit)
counts_task=task(name='Verify inserted counts and typed contents',**TASK_OPTIONS)(verify_tables)
constraints_task=task(name='Verify database constraints and indexes',**TASK_OPTIONS)(verify_constraints)
export_task=task(name='Export local run report',**TASK_OPTIONS)(export_report)

@task(name='Stage dataset layer',**TASK_OPTIONS)
def stage_layer(conn, results, schema):
    for r in results:
        if r['schema']==schema: stage_table(conn,r)
    return sum(r['schema']==schema for r in results)

@task(name='Promote verified snapshots',**TASK_OPTIONS)
def promote(conn,results):
    for r in results:
        if r['schema']: promote_table(conn,r)

@task(name='Produce final pipeline summary',**TASK_OPTIONS)
def summary_task(report):
    summary={k:report[k] for k in ['run_id','mode','status','database_status','audit_status']}
    summary['csv_files']=len(report['files'])
    summary['tables_loaded']=sum(r.get('load_status')=='LOADED' for r in report['files'])
    get_run_logger().info(json.dumps(summary,sort_keys=True))
    return summary

@flow(name=FLOW_NAME,persist_result=False,log_prints=False)
def cargopredict_data_pipeline(dataset_root: str | None=None, mode: str='validate-only',
                               database: str='local', report_dir: str | None=None):
    config=resolve_task(dataset_root,mode,database,report_dir)
    report=dict(run_id=str(flow_run.id or uuid4()),flow_name=FLOW_NAME,mode=mode,
                started_at=now(),completed_at=None,status='RUNNING',error=None,
                database_status='NOT_VERIFIED',audit_status='LOCAL_ONLY',files=[],global_errors=[])
    committed=False
    try:
        files=discover_task(config.dataset_root)
        report['global_errors']=['required_file_missing:'+p for p in sorted(set(CONTRACTS)-{p.relative_to(config.dataset_root).as_posix() for p in files})]
        for layer,label in [('raw_supplied','Validate raw source files'),('documentation','Validate documentation CSVs'),
             ('standardized','Validate standardized datasets'),('synthetic','Validate synthetic datasets'),('ml_ready','Validate ML-ready dataset')]:
            report['files'].extend(validate_layer.with_options(name=label)(config.dataset_root,files,layer))
        report['global_errors'].extend(cross_task(quote(report['files'])))
        gate_task(quote(report['files']),report['global_errors'])
        if mode!='validate-only':
            report['postgres_version']=connection_task(database)
            with connection(database) as conn:
                schemas_task(quote(conn))
                audit_task(quote(conn),quote(report))
                report['audit_status']='STARTED'
                with conn.transaction():
                    # Serialize all CargoPredict snapshot runs on this database.
                    conn.execute("SET LOCAL lock_timeout='15s'")
                    conn.execute("SET LOCAL statement_timeout='300s'")
                    conn.execute("SELECT pg_advisory_xact_lock(hashtext('cargopredict_pipeline'))")
                    if mode=='full-refresh':
                        for schema,label in [('reference','Load reference staging tables'),('synthetic','Load synthetic staging tables'),('ml','Load ML-ready staging tables')]:
                            stage_layer.with_options(name=label)(quote(conn),quote(report['files']),schema)
                        promote(quote(conn),quote(report['files']))
                    report['verification']=counts_task(quote(conn),quote(report['files']))
                    report['constraints']=constraints_task(quote(conn))
                    report.update(status='SUCCESS',database_status='PASS',completed_at=now(),audit_status='WRITTEN')
                    for r in report['files']:
                        if r['schema']: r['load_status']='LOADED' if mode=='full-refresh' else 'VERIFIED_ONLY'
                    audit_task(quote(conn),quote(report))
                committed=True
                # Commit completed before local success is exported.
        else:
            report.update(status='SUCCESS',completed_at=now(),database_status='NOT_REQUESTED')
        export_task(quote(report),config.report_dir)
        return summary_task(quote(report))
    except Exception as exc:
        safe=str(exc) if isinstance(exc,(ValidationError,DatabaseError)) else 'Pipeline failed: '+type(exc).__name__
        report.update(status='FAILED',completed_at=now(),error=safe)
        if mode!='validate-only' and not committed:
            report['database_status']='FAILED'
        for r in report['files']:
            if r.get('load_status') in {'STAGED','PROMOTED_PENDING_COMMIT','LOADED'} and report['database_status']!='PASS':
                r['load_status']='ROLLED_BACK'
                r['inserted_rows']=0
                r['database_rows']=None
        if mode!='validate-only':
            try:
                with connection(database) as conn:
                    create_schemas(conn)
                    write_audit(conn,report)
                report['audit_status']='FAILURE_WRITTEN'
            except Exception:
                report['audit_status']='NOT_WRITTEN'
                report['audit_error']='Failure audit unavailable; original pipeline error preserved'
        try: export_report(report,config.report_dir)
        except Exception: get_run_logger().error('Local report export failed; original pipeline error preserved')
        raise RuntimeError(safe) from None

def main():
    parser=argparse.ArgumentParser(description='CargoPredict data engineering pipeline')
    parser.add_argument('--mode',choices=['validate-only','full-refresh','verify-only'],default='validate-only')
    parser.add_argument('--dataset-root')
    parser.add_argument('--database',choices=['local','supabase'],default='local')
    parser.add_argument('--report-dir')
    args=parser.parse_args()
    launched_at=now()
    try:
        result=cargopredict_data_pipeline(dataset_root=args.dataset_root,mode=args.mode,database=args.database,report_dir=args.report_dir)
        print(json.dumps(result,indent=2))
    except Exception as exc:
        # A server-startup failure occurs before the flow body can export its report.
        directory=Path(args.report_dir or Path(__file__).resolve().parents[2]/'reports')
        try:
            prior=json.loads((directory/'latest_pipeline_run.json').read_text())
        except (OSError,ValueError):
            prior={}
        if prior.get('started_at','')<launched_at:
            export_report(dict(run_id=str(uuid4()),flow_name=FLOW_NAME,mode=args.mode,
                started_at=launched_at,completed_at=now(),status='FAILED',
                error='Flow startup failed: '+type(exc).__name__,database_status='NOT_VERIFIED',
                audit_status='NOT_WRITTEN',files=[]),directory)
        print('CargoPredict pipeline FAILED. See reports/latest_pipeline_run.json and Prefect task states.')
        raise SystemExit(1) from None

if __name__=='__main__': main()
