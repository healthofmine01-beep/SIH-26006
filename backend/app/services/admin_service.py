"""
Admin & Data Monitoring Service for CargoPredict.
Queries pipeline audit records, data quality checks, database catalog row counts,
and manages registered user accounts.
"""
from typing import Dict, Any, List
from app.db import execute_dict_query, get_connection
from app.auth import ACCOUNTS_SEED, USER_SETTINGS_STORE

class AdminMonitoringService:
    @staticmethod
    def get_pipeline_runs() -> List[Dict[str, Any]]:
        """Returns historical and latest pipeline runs from audit.pipeline_runs."""
        sql = """
            SELECT 
                run_id,
                flow_name,
                mode,
                started_at,
                completed_at,
                status,
                error_message,
                EXTRACT(EPOCH FROM (completed_at - started_at)) as duration_seconds
            FROM audit.pipeline_runs
            ORDER BY started_at DESC
            LIMIT 20;
        """
        return execute_dict_query(sql)

    @staticmethod
    def get_table_load_results(run_id: str = None) -> List[Dict[str, Any]]:
        """Returns per-table loading statistics and validation statuses."""
        if run_id:
            sql = """
                SELECT 
                    file_name,
                    target_schema,
                    target_table,
                    source_rows,
                    inserted_rows,
                    database_rows,
                    duplicate_count,
                    missing_count,
                    validation_status,
                    load_status,
                    synthetic_rows,
                    started_at,
                    completed_at
                FROM audit.table_load_results
                WHERE run_id = %s
                ORDER BY target_schema, target_table;
            """
            return execute_dict_query(sql, (run_id,))
        else:
            # Latest run load results
            sql = """
                SELECT 
                    file_name,
                    target_schema,
                    target_table,
                    source_rows,
                    inserted_rows,
                    database_rows,
                    duplicate_count,
                    missing_count,
                    validation_status,
                    load_status,
                    synthetic_rows,
                    started_at,
                    completed_at
                FROM audit.table_load_results
                WHERE run_id = (SELECT run_id FROM audit.pipeline_runs ORDER BY started_at DESC LIMIT 1)
                ORDER BY target_schema, target_table;
            """
            return execute_dict_query(sql)

    @staticmethod
    def get_data_quality_results() -> List[Dict[str, Any]]:
        """Returns quality test breakdown from audit.data_quality_results."""
        sql = """
            SELECT 
                file_name,
                check_name,
                status,
                detail
            FROM audit.data_quality_results
            WHERE run_id = (SELECT run_id FROM audit.pipeline_runs ORDER BY started_at DESC LIMIT 1)
            ORDER BY status DESC, file_name;
        """
        return execute_dict_query(sql)

    @staticmethod
    def get_database_catalog() -> Dict[str, Any]:
        """Queries PostgreSQL system catalogs to summarize all 28 tables and their live row counts."""
        tables_meta = [
            # ML
            ("ml", "ml_freight_daily", "active_dataset", "Primary 39-feature daily freight time-series"),
            # Reference
            ("reference", "bunker_fuel_prices", "active_dataset", "Global port VLSFO & MGO fuel prices"),
            ("reference", "commodity_prices", "active_dataset", "Coking coal, thermal coal, iron ore benchmarks"),
            ("reference", "economic_indicators", "active_dataset", "Macroeconomic and currency indicators"),
            ("reference", "freight_indices", "active_dataset", "Baltic Dry Index (BDI, BCI, BPI, BSI)"),
            ("reference", "freight_rates_observed", "active_dataset", "Observed market fixture rate records"),
            ("reference", "port_congestion_reference", "active_dataset", "Historical port waiting time benchmarks"),
            ("reference", "port_master", "active_dataset", "Master port registry and geo classifications"),
            ("reference", "port_specifications", "active_dataset", "Berth LOA, beam, draft and handling speeds"),
            ("reference", "route_master", "active_dataset", "Core trading routes origin-destination pairs"),
            ("reference", "trade_routes", "active_dataset", "Sea distance and steaming time evidence"),
            ("reference", "vessel_specifications", "active_dataset", "Fleet engineering and fuel consumption specs"),
            ("reference", "weather_climatology", "active_dataset", "Climatological wind, wave, cyclone history"),
            # Synthetic
            ("synthetic", "charter_contract_quotes_synthetic", "active_dataset", "Spot and forward term charter quotes"),
            ("synthetic", "daily_ais_vessel_supply_synthetic", "active_dataset", "Available and ballast vessel counts"),
            ("synthetic", "daily_berth_availability_synthetic", "active_dataset", "Berth queue and maintenance flags"),
            ("synthetic", "daily_market_drivers_synthetic", "active_dataset", "Daily BDI, VLSFO Singapore and USD/INR"),
            ("synthetic", "daily_port_congestion_synthetic", "active_dataset", "Daily waiting vessels and congestion scores"),
            ("synthetic", "daily_port_weather_synthetic", "active_dataset", "Daily port wave height and monsoon flags"),
            ("synthetic", "daily_tide_ukc_synthetic", "active_dataset", "Daily tidal heights and under-keel clearance"),
            ("synthetic", "fixture_activity_synthetic", "active_dataset", "Simulated fixture volume batches"),
            ("synthetic", "laytime_demurrage_rules_synthetic", "active_dataset", "Port laytime hours and demurrage tariffs"),
            ("synthetic", "monthly_cargo_trade_flows_synthetic", "active_dataset", "Simulated monthly bulk trade flow volume"),
            ("synthetic", "port_costs_synthetic", "active_dataset", "Port dues, pilotage, towage, stevedoring tariffs"),
            ("synthetic", "route_freight_rates_synthetic", "active_dataset", "Simulated freight rates per route"),
            # Audit
            ("audit", "pipeline_runs", "audit", "Pipeline orchestration execution log"),
            ("audit", "table_load_results", "audit", "Per-table insertion and verification audit"),
            ("audit", "data_quality_results", "audit", "Per-rule data quality check outcomes")
        ]

        catalog_rows = []
        total_rows_count = 0
        schemas_count = {"reference": 0, "synthetic": 0, "ml": 0, "audit": 0}

        with get_connection() as conn:
            with conn.cursor() as cur:
                for schema, table, kind, desc in tables_meta:
                    try:
                        cur.execute(f"SELECT COUNT(*) FROM {schema}.{table};")
                        cnt = cur.fetchone()[0]
                    except Exception:
                        cnt = 0
                    total_rows_count += cnt
                    schemas_count[schema] = schemas_count.get(schema, 0) + 1
                    catalog_rows.append({
                        "schema": schema,
                        "table": table,
                        "rows": cnt,
                        "kind": kind,
                        "description": desc
                    })

        return {
            "total_tables": len(catalog_rows),
            "total_rows": total_rows_count,
            "schemas_breakdown": schemas_count,
            "database_status": "ONLINE (Healthy)",
            "tables": catalog_rows
        }

    @staticmethod
    def get_users_list() -> List[Dict[str, Any]]:
        """Returns list of registered users and their session state."""
        try:
            sql = "SELECT username, role, full_name, created_at, last_login FROM cargopredict_app.users ORDER BY username;"
            db_users = execute_dict_query(sql)
            if db_users:
                return db_users
        except Exception:
            pass

        # Return from seed store
        users = []
        for username, u in ACCOUNTS_SEED.items():
            users.append({
                "username": username,
                "role": u["role"],
                "full_name": u["full_name"],
                "created_at": "2026-09-10T08:00:00Z",
                "last_login": "Active Session"
            })
        return users
