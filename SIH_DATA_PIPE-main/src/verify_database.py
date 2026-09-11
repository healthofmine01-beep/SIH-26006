"""Read-only verification of live PostgreSQL tables against validated CSV records."""
import re
from psycopg import sql
from src.database import DatabaseError, safe_database_errors
from src.load_to_postgres import verify_count, ML_CHECKS, ML_INDEXES
from src.validate_csv import ML_KEY

TYPE_NAMES={'TEXT':'text','DATE':'date','BIGINT':'bigint','NUMERIC':'numeric','BOOLEAN':'boolean',
            'TIMESTAMP WITH TIME ZONE':'timestamp with time zone'}

@safe_database_errors
def verify_tables(conn, results):
    for r in results:
        if not r['schema']: continue
        ident=sql.Identifier(r['schema'],r['table'])
        count=conn.execute(sql.SQL('SELECT count(*) FROM {}').format(ident)).fetchone()[0]
        r['database_rows']=count
        verify_count(count,r['source_rows'])
        types=conn.execute('''SELECT column_name,data_type,is_nullable FROM information_schema.columns
            WHERE table_schema=%s AND table_name=%s ORDER BY ordinal_position''',(r['schema'],r['table'])).fetchall()
        if {c:t for c,t,n in types}!={c:TYPE_NAMES[t] for c,t in r['types'].items()}:
            raise DatabaseError('Database column types do not match contract')
        if r['layer'] in {'synthetic','ml_ready'} and any(n!='NO' for c,t,n in types):
            raise DatabaseError('Required NOT NULL constraint missing')
        if 'is_synthetic' in r['types']:
            actual=conn.execute(sql.SQL('SELECT count(*) FROM {} WHERE is_synthetic IS TRUE').format(ident)).fetchone()[0]
            verify_count(actual,r['synthetic_rows'])
            missing=conn.execute(sql.SQL('SELECT count(*) FROM {} WHERE is_synthetic IS NULL OR source_origin IS NULL').format(ident)).fetchone()[0]
            verify_count(missing,0)
        # Compare complete normalized records (including multiplicity); catches same-count corruption.
        from collections import Counter
        columns=list(r['types'])
        actual=Counter(conn.execute(sql.SQL('SELECT {} FROM {}').format(sql.SQL(',').join(map(sql.Identifier,columns)),ident)).fetchall())
        expected=Counter(tuple(row[c] for c in columns) for row in r['rows'])
        if actual!=expected: raise DatabaseError('Database values differ from validated source snapshot')
        r['database_verification']='PASS'
    ml=next(r for r in results if r['table']=='ml_freight_daily')
    first,last,routes=conn.execute('SELECT min(date),max(date),count(DISTINCT route_id) FROM ml.ml_freight_daily').fetchone()
    if (str(first),str(last),routes)!=(ml['first_date'],ml['last_date'],ml['route_count']):
        raise DatabaseError('ML date range or routes differ from CSV')
    duplicate=conn.execute('''SELECT count(*) FROM (SELECT date,route_id,vessel_class FROM ml.ml_freight_daily
        GROUP BY date,route_id,vessel_class HAVING count(*)>1) d''').fetchone()[0]
    verify_count(duplicate,0)
    missing=conn.execute(sql.SQL('SELECT count(*) FROM ml.ml_freight_daily WHERE {}').format(
        sql.SQL(' OR ').join(sql.SQL('{} IS NULL').format(sql.Identifier(c)) for c in ml['types']))).fetchone()[0]
    verify_count(missing,0)
    invalid_refs=conn.execute('''SELECT count(*) FROM ml.ml_freight_daily m
        LEFT JOIN reference.route_master r USING(route_id)
        LEFT JOIN reference.port_master o ON o.port_id=m.origin_port_id
        LEFT JOIN reference.port_master d ON d.port_id=m.destination_port_id
        WHERE r.route_id IS NULL OR o.port_id IS NULL OR d.port_id IS NULL
          OR r.vessel_class<>m.vessel_class OR r.origin_port_id<>m.origin_port_id
          OR r.destination_port_id<>m.destination_port_id OR r.distance_nm<>m.distance_nm
          OR NOT EXISTS (SELECT 1 FROM reference.vessel_specifications v WHERE v.vessel_class=m.vessel_class)''').fetchone()[0]
    verify_count(invalid_refs,0)
    return {'row_counts':'PASS','typed_contents':'PASS','duplicate_ml_keys':duplicate,'missing_ml_values':missing,'referential_checks':'PASS'}

@safe_database_errors
def verify_constraints(conn):
    constraints=conn.execute('''SELECT contype,conname,pg_get_constraintdef(oid),convalidated FROM pg_constraint
        WHERE conrelid='ml.ml_freight_daily'::regclass''').fetchall()
    if not any(t=='u' and d=='UNIQUE (date, route_id, vessel_class)' and v for t,n,d,v in constraints):
        raise DatabaseError('ML unique constraint missing')
    names={n for t,n,d,v in constraints if t=='c' and v}
    if not {'cp_check_'+c for c in ML_CHECKS} <= names:
        raise DatabaseError('ML check constraints missing')
    def normalized(expression):
        expression=re.sub(r'::(?:numeric|bigint|integer)', '', expression.lower())
        return re.sub(r'[\s()]', '', expression).removeprefix('check')
    definitions={n:d for t,n,d,v in constraints if t=='c' and v}
    if any(normalized(definitions['cp_check_'+c])!=normalized(expression) for c,expression in ML_CHECKS.items()):
        raise DatabaseError('ML check constraint definition mismatch')
    # Verify actual violations as well as the catalog definitions.
    for expression in ML_CHECKS.values():
        n=conn.execute(sql.SQL('SELECT count(*) FROM ml.ml_freight_daily WHERE NOT ({})').format(sql.SQL(expression))).fetchone()[0]
        verify_count(n,0)
    indexes=conn.execute('''SELECT array_agg(a.attname ORDER BY k.ord)::text[]
        FROM pg_index i CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY k(attnum,ord)
        JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=k.attnum
        WHERE i.indrelid='ml.ml_freight_daily'::regclass AND i.indisvalid
          AND i.indpred IS NULL AND i.indexprs IS NULL
        GROUP BY i.indexrelid''').fetchall()
    if not set(ML_INDEXES)<=set(tuple(row[0]) for row in indexes):
        raise DatabaseError('Required ML index missing')
    return {'unique_key':'PASS','checks':'PASS','indexes':'PASS'}
