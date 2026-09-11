"""PostgreSQL connections and safe diagnostics. Never log driver error text."""
import os
from contextlib import contextmanager
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

import psycopg
from psycopg import sql
from src.config import PROJECT

class DatabaseError(RuntimeError):
    pass

class TemporaryDatabaseError(DatabaseError):
    pass

def safe_database_errors(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except psycopg.Error as exc:
            # Server errors can include rejected data and connection credentials.
            raise DatabaseError(f'{fn.__name__} failed (SQLSTATE {exc.sqlstate or "unavailable"})') from None
    return wrapper

@contextmanager
def connection(target='local'):
    conn = None
    try:
        if target == 'supabase':
            dsn=os.environ.get('SUPABASE_DATABASE_URL')
            if not dsn: raise DatabaseError('SUPABASE_DATABASE_URL is not configured')
            conn=psycopg.connect(dsn, sslmode='require', connect_timeout=10, autocommit=True,
                                 application_name='cargopredict_pipeline', prepare_threshold=None)
        else:
            password=os.environ.get('POSTGRES_PASSWORD')
            if not password or password in {'replace_with_a_unique_password','change_this_password'}:
                raise DatabaseError('Set a non-placeholder POSTGRES_PASSWORD in the environment')
            conn=psycopg.connect(host=os.environ.get('POSTGRES_HOST','localhost'),
                 port=os.environ.get('POSTGRES_PORT','5432'),
                 dbname=os.environ.get('POSTGRES_DB','cargopredict_db'),
                 user=os.environ.get('POSTGRES_USER','cargopredict'),password=password,
                 connect_timeout=10,autocommit=True,application_name='cargopredict_pipeline')
        yield conn
    except psycopg.Error as exc:
        state=exc.sqlstate or 'unavailable'
        transient=exc.sqlstate is None or str(state).startswith('08') or state in {'57P03','53300'}
        kind=TemporaryDatabaseError if transient else DatabaseError
        raise kind(f'Database operation failed (SQLSTATE {state}); check local service and environment configuration') from None
    except (ValueError, TypeError):
        raise DatabaseError('Invalid database connection configuration') from None
    finally:
        if conn is not None: conn.close()

@safe_database_errors
def create_schemas(conn):
    # Refuse unrelated existing audit tables rather than silently adopting them.
    for table in ['pipeline_runs','table_load_results','data_quality_results']:
        existing=conn.execute("SELECT obj_description(to_regclass(%s),'pg_class')",('audit.'+table,)).fetchone()[0]
        exists=conn.execute('SELECT to_regclass(%s)',('audit.'+table,)).fetchone()[0]
        if exists and existing!='cargopredict_pipeline':
            raise DatabaseError('Existing audit table is not owned by CargoPredict')
    with conn.transaction():
        conn.execute((PROJECT/'database/schemas/audit.sql').read_text())
        for table in ['pipeline_runs','table_load_results','data_quality_results']:
            conn.execute(sql.SQL('COMMENT ON TABLE {} IS {}').format(sql.Identifier('audit',table),sql.Literal('cargopredict_pipeline')))

@safe_database_errors
def write_audit(conn, report):
    with conn.transaction():
        conn.execute('''INSERT INTO audit.pipeline_runs VALUES (%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (run_id) DO UPDATE SET completed_at=EXCLUDED.completed_at,
            status=EXCLUDED.status,error_message=EXCLUDED.error_message''',
            (report['run_id'],report['flow_name'],report['mode'],report['started_at'],
             report.get('completed_at'),report['status'],report.get('error')))
        for r in report.get('files',[]):
            conn.execute('''INSERT INTO audit.table_load_results VALUES
                (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (run_id,file_name) DO UPDATE SET completed_at=EXCLUDED.completed_at,
                inserted_rows=EXCLUDED.inserted_rows,database_rows=EXCLUDED.database_rows,
                validation_status=EXCLUDED.validation_status,load_status=EXCLUDED.load_status,
                error_message=EXCLUDED.error_message''',
                (report['run_id'],r['file'],r['sha256'],r['schema'],r['table'],report['started_at'],
                 report.get('completed_at'),r['source_rows'],r.get('inserted_rows'),r.get('database_rows'),
                 r['duplicate_count'],r['missing_count'],r['status'],r.get('load_status','NOT_LOADED'),
                 r['synthetic_rows'],';'.join(r['errors']) or report.get('error')))
            checks=[('validation',r['status'], ';'.join(r['errors']))]
            checks += [(w,'WARNING',w) for w in r['warnings']]
            checks += [(e,'FAIL',e) for e in r['errors']]
            for check,status,detail in checks:
                conn.execute('''INSERT INTO audit.data_quality_results VALUES (%s,%s,%s,%s,%s)
                    ON CONFLICT (run_id,file_name,check_name) DO UPDATE SET status=EXCLUDED.status,detail=EXCLUDED.detail''',
                    (report['run_id'],r['file'],check,status,detail))
