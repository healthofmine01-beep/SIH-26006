"""Validated snapshots: stage all tables, verify, then promote in one transaction.

Old snapshots are retained under unique _cp_previous_* names; no tables are dropped.
The flow owns the transaction so loading, verification and audit commit together.
"""
import uuid
from psycopg import sql
from psycopg.pq import TransactionStatus
from src.database import DatabaseError, safe_database_errors
from src.validate_csv import ensure_valid, ML_KEY, POSITIVE, NONNEGATIVE

OWNER='cargopredict_pipeline'
SQL_TYPES={'TEXT','DATE','TIMESTAMP WITH TIME ZONE','NUMERIC','BIGINT','BOOLEAN'}
ML_CHECKS = {**{c:f'{c} > 0' for c in POSITIVE},
             **{c:f'{c} >= 0' for c in NONNEGATIVE},
             'congestion_score':'congestion_score >= 0 AND congestion_score <= 100',
             'is_synthetic':'is_synthetic IS TRUE'}
ML_INDEXES=[('date',),('route_id',),('vessel_class',),('route_id','vessel_class','date')]

def verify_count(actual, expected):
    if actual != expected:
        raise DatabaseError(f'Row count mismatch: received {actual}; expected {expected}')

@safe_database_errors
def stage_table(conn, result):
    ensure_valid([result])
    if conn.info.transaction_status != TransactionStatus.INTRANS:
        raise DatabaseError('Staging requires a caller-owned transaction')
    schema=result['schema']
    if schema not in {'reference','synthetic','ml'}:
        raise DatabaseError('Refusing to load a source/documentation table')
    name='_cp_stage_'+uuid.uuid4().hex[:20]
    ident=sql.Identifier(schema,name)
    required=result['layer'] in {'synthetic','ml_ready'} or result['table'] in {'port_master','route_master'}
    columns=[]
    for c,t in result['types'].items():
        if t not in SQL_TYPES: raise DatabaseError('Unsupported SQL type')
        columns.append(sql.SQL('{} {} {}').format(sql.Identifier(c),sql.SQL(t),sql.SQL('NOT NULL' if required or c in {'source_origin','is_synthetic'} else '')))
    conn.execute(sql.SQL('CREATE TABLE {} ({})').format(ident,sql.SQL(',').join(columns)))
    with conn.cursor() as cur:
        with cur.copy(sql.SQL('COPY {} ({}) FROM STDIN').format(ident,sql.SQL(',').join(map(sql.Identifier,result['types'])))) as copy:
            # psycopg COPY streams/buffers rows; no single oversized INSERT statement.
            for row in result['rows']: copy.write_row(tuple(row[c] for c in result['types']))
    count=conn.execute(sql.SQL('SELECT count(*) FROM {}').format(ident)).fetchone()[0]
    verify_count(count,result['source_rows'])
    if result['table']=='ml_freight_daily':
        conn.execute(sql.SQL('ALTER TABLE {} ADD UNIQUE ({})').format(ident,sql.SQL(',').join(map(sql.Identifier,ML_KEY))))
        for c,expression in ML_CHECKS.items():
            conn.execute(sql.SQL('ALTER TABLE {} ADD CONSTRAINT {} CHECK ({})').format(
                ident,sql.Identifier('cp_check_'+c),sql.SQL(expression)))
        for i,cols in enumerate(ML_INDEXES):
            conn.execute(sql.SQL('CREATE INDEX {} ON {} ({})').format(sql.Identifier(name+'_idx'+str(i)),ident,sql.SQL(',').join(map(sql.Identifier,cols))))
    elif result['table'] in {'route_master','port_master'}:
        key='route_id' if result['table']=='route_master' else 'port_id'
        conn.execute(sql.SQL('ALTER TABLE {} ADD PRIMARY KEY ({})').format(ident,sql.Identifier(key)))
    if 'is_synthetic' in result['types']:
        expected=result['layer'] in {'synthetic','ml_ready'}
        conn.execute(sql.SQL('ALTER TABLE {} ADD CHECK (is_synthetic IS {})').format(ident,sql.SQL('TRUE' if expected else 'FALSE')))
    conn.execute(sql.SQL('COMMENT ON TABLE {} IS {}').format(ident,sql.Literal(OWNER)))
    result.update(staging_table=name,inserted_rows=count,load_status='STAGED')
    return name

@safe_database_errors
def promote_table(conn, result):
    if conn.info.transaction_status != TransactionStatus.INTRANS:
        raise DatabaseError('Promotion requires a caller-owned transaction')
    schema,name=result['schema'],result['table']
    existing=conn.execute('SELECT to_regclass(%s)',(schema+'.'+name,)).fetchone()[0]
    if existing:
        owner=conn.execute("SELECT obj_description(to_regclass(%s),'pg_class')",(schema+'.'+name,)).fetchone()[0]
        if owner!=OWNER: raise DatabaseError('Refusing to replace an unrelated existing table')
        # Renaming a relation would leave existing views/FKs bound to the old snapshot.
        dependencies=conn.execute('''SELECT EXISTS(
            SELECT 1 FROM pg_depend d WHERE d.refobjid=to_regclass(%s)
              AND d.classid='pg_rewrite'::regclass
            UNION ALL SELECT 1 FROM pg_constraint WHERE confrelid=to_regclass(%s))''',
            (schema+'.'+name,schema+'.'+name)).fetchone()[0]
        if dependencies: raise DatabaseError('Existing views or foreign keys depend on the table; explicit migration required')
        backup='_cp_previous_'+uuid.uuid4().hex[:20]
        conn.execute(sql.SQL('ALTER TABLE {} RENAME TO {}').format(sql.Identifier(schema,name),sql.Identifier(backup)))
        result['previous_table']=backup
    conn.execute(sql.SQL('ALTER TABLE {} RENAME TO {}').format(sql.Identifier(schema,result['staging_table']),sql.Identifier(name)))
    result['load_status']='PROMOTED_PENDING_COMMIT'
