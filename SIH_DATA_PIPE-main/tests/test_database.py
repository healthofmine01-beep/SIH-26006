from copy import deepcopy
from uuid import uuid4
import pytest
from psycopg import sql
from src.database import DatabaseError, create_schemas
from src.load_to_postgres import stage_table, promote_table, verify_count
from src.validate_csv import validate_dataset, ensure_valid, ValidationError
from src.discover_files import discover
from src.verify_database import verify_tables, verify_constraints

def test_row_count_gate():
    verify_count(2,2)
    with pytest.raises(DatabaseError,match='mismatch'): verify_count(1,2)

def test_invalid_table_never_reaches_database():
    with pytest.raises(ValidationError):
        stage_table(None,{'file':'invalid.csv','errors':['invalid']})

@pytest.mark.integration
def test_staging_idempotency_and_rollback(db_connection,small_dataset):
    conn=db_connection
    results,errors=validate_dataset(small_dataset,discover(small_dataset))
    ensure_valid(results,errors)
    create_schemas(conn)
    # Roll back the entire integration fixture so the existing database remains intact.
    class FinishTest(Exception): pass
    with pytest.raises(FinishTest):
        with conn.transaction():
            for repetition in range(2):
                for r in results:
                    if r['schema']: stage_table(conn,r)
                for r in results:
                    if r['schema']: promote_table(conn,r)
                assert verify_tables(conn,results)['duplicate_ml_keys']==0
                assert verify_constraints(conn)['indexes']=='PASS'
            ml=next(r for r in results if r['table']=='ml_freight_daily')
            original=conn.execute('SELECT * FROM ml.ml_freight_daily ORDER BY date').fetchall()
            invalid=deepcopy(ml); invalid['errors']=['business_rule:freight_rate_usd_per_mt']
            with pytest.raises(ValidationError): stage_table(conn,invalid)
            assert conn.execute('SELECT * FROM ml.ml_freight_daily ORDER BY date').fetchall()==original
            # A failed staging count rolls back its new table and preserves the final table.
            with pytest.raises(DatabaseError):
                with conn.transaction():
                    invalid=deepcopy(ml); invalid['source_rows']+=1
                    stage_table(conn,invalid)
            assert conn.execute('SELECT * FROM ml.ml_freight_daily ORDER BY date').fetchall()==original
            # An unmarked table must never be adopted.
            with conn.transaction():
                conn.execute("COMMENT ON TABLE ml.ml_freight_daily IS 'unrelated owner'")
                stage_table(conn,ml)
                with pytest.raises(DatabaseError,match='unrelated'):
                    promote_table(conn,ml)
            conn.execute("COMMENT ON TABLE ml.ml_freight_daily IS 'cargopredict_pipeline'")
            # Same-count tampering is detected by full typed-record comparison.
            with pytest.raises(DatabaseError,match='values differ'):
                with conn.transaction():
                    conn.execute('UPDATE ml.ml_freight_daily SET freight_lag_1=999')
                    verify_tables(conn,results)
            raise FinishTest()

@pytest.mark.integration
def test_explicit_transaction_required(db_connection,small_dataset):
    results,errors=validate_dataset(small_dataset,discover(small_dataset))
    r=next(r for r in results if r['table']=='ml_freight_daily')
    with pytest.raises(DatabaseError,match='caller-owned transaction'):
        stage_table(db_connection,r)
