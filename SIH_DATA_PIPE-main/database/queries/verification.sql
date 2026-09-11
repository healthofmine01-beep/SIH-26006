-- CargoPredict: read-only integration queries.
SELECT count(*) FROM ml.ml_freight_daily;
SELECT min(date), max(date), count(DISTINCT route_id) FROM ml.ml_freight_daily;
SELECT date, route_id, vessel_class, count(*)
FROM ml.ml_freight_daily GROUP BY date, route_id, vessel_class HAVING count(*) > 1;
SELECT is_synthetic, count(*) FROM ml.ml_freight_daily GROUP BY is_synthetic;
SELECT run_id, mode, status, started_at, completed_at
FROM audit.pipeline_runs ORDER BY started_at DESC;
SELECT target_schema, target_table, source_rows, inserted_rows, database_rows, load_status
FROM audit.table_load_results WHERE run_id = (
 SELECT run_id FROM audit.pipeline_runs ORDER BY started_at DESC LIMIT 1
) ORDER BY target_schema, target_table;
SELECT indexdef FROM pg_indexes WHERE schemaname='ml' AND tablename='ml_freight_daily';
SELECT conname,pg_get_constraintdef(oid) FROM pg_constraint
WHERE conrelid='ml.ml_freight_daily'::regclass;
-- Query example for the model integration owner; no model is executed here.
SELECT date, route_id, vessel_class, freight_rate_usd_per_mt, freight_lag_7, is_synthetic
FROM ml.ml_freight_daily WHERE route_id='R001' ORDER BY date LIMIT 10;
