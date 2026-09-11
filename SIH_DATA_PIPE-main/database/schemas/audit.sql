CREATE SCHEMA IF NOT EXISTS reference;
CREATE SCHEMA IF NOT EXISTS synthetic;
CREATE SCHEMA IF NOT EXISTS ml;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE TABLE IF NOT EXISTS audit.pipeline_runs (
 run_id UUID PRIMARY KEY, flow_name TEXT NOT NULL, mode TEXT NOT NULL,
 started_at TIMESTAMPTZ NOT NULL, completed_at TIMESTAMPTZ,
 status TEXT NOT NULL, error_message TEXT
);
CREATE TABLE IF NOT EXISTS audit.table_load_results (
 run_id UUID REFERENCES audit.pipeline_runs(run_id), file_name TEXT NOT NULL,
 checksum TEXT, target_schema TEXT, target_table TEXT,
 started_at TIMESTAMPTZ NOT NULL, completed_at TIMESTAMPTZ,
 source_rows BIGINT, inserted_rows BIGINT, database_rows BIGINT,
 duplicate_count BIGINT, missing_count BIGINT,
 validation_status TEXT, load_status TEXT, synthetic_rows BIGINT, error_message TEXT,
 PRIMARY KEY (run_id, file_name)
);
CREATE TABLE IF NOT EXISTS audit.data_quality_results (
 run_id UUID REFERENCES audit.pipeline_runs(run_id), file_name TEXT NOT NULL,
 check_name TEXT NOT NULL, status TEXT NOT NULL, detail TEXT,
 PRIMARY KEY (run_id, file_name, check_name)
);
