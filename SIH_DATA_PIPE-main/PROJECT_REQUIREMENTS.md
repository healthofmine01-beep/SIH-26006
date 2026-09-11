# CargoPredict — PostgreSQL Pipeline Requirements

Naming correction applied to the supplied specification. This document describes the requested implementation; it is not an execution report.

## Canonical project names

- Project title: `CargoPredict`
- Project folder: `cargopredict-data-pipeline`
- Extracted package: `CargoPredict_Pipeline_Data`
- PostgreSQL database: `cargopredict_db`
- PostgreSQL user: `cargopredict`
- Docker container: `cargopredict-postgres`
- Docker volume: `cargopredict_postgres_data`
- Pipeline name and Python package: `cargopredict_pipeline`
- Connection-string example: `postgresql+psycopg2://cargopredict:change_this_password@localhost:5432/cargopredict_db`

The actual source archive is `../Cargopredict_Pipeline_Data.zip`. The extracted dataset is in `CargoPredict_Pipeline_Data/`; use that location instead of duplicating it into the illustrative `data/` folder below. Preserve dataset columns, including `cargo_type`. Apply these names to all implementation files, configuration, logs, comments and documentation.

## Supplied implementation requirements

I am building the CargoPredict project for SIH 2026 PS 26006. I am the Data Engineer/Pipeline Engineer.

My dataset ZIP is named:

`Cargopredict_Pipeline_Data.zip`

Your task is to build and verify a complete PostgreSQL data-loading system for this dataset.

Important instructions:

1. First inspect the complete project directory, ZIP structure, CSV headers, data types and row counts.
2. Check for any `AGENTS.md`, README or existing configuration before making changes.
3. Do not modify or delete the original ZIP or files inside `raw_supplied/`.
4. Preserve all existing user files.
5. Explain important actions in simple language.
6. Do not assume that Docker, Python or PostgreSQL is already configured—check first.
7. Use Docker Compose for PostgreSQL.
8. Keep passwords and connection details in `.env`; provide `.env.example`.
9. Never commit the real `.env`.
10. Treat every row with `is_synthetic=true` as demonstration data.
11. Do not describe synthetic data as observed, production-ready or commercially verified.
12. Do not train an ML model in this task. Only prepare and verify the database-loading system.

Expected extracted folders:

* `raw_supplied/`
* `standardized/`
* `synthetic/`
* `ml_ready/`
* `documentation/`

The primary ML dataset should be:

`ml_ready/ml_freight_daily.csv`

Its expected row count is approximately 19,240 rows. Verify the actual count instead of blindly trusting this number.

Build the following:

## 1. Project structure

Create a clean structure similar to:

```text
cargopredict-data-pipeline/
├── data/
│   ├── raw_supplied/
│   ├── standardized/
│   ├── synthetic/
│   ├── ml_ready/
│   └── documentation/
├── database/
│   ├── init/
│   ├── schemas/
│   └── queries/
├── src/
│   ├── config.py
│   ├── discover_files.py
│   ├── validate_csv.py
│   ├── load_to_postgres.py
│   └── verify_database.py
├── tests/
├── logs/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── requirements.txt
├── Makefile
└── README.md
```

Adapt this structure if the existing repository already has an appropriate organization.

## 2. Extract and inspect the ZIP

If the ZIP is not already extracted:

* Extract it safely.
* Do not overwrite unrelated existing files.
* Find the actual extracted root automatically.
* Print all discovered CSV files.
* Record each file’s row count and column count.
* Detect empty files, duplicate headers, malformed CSV rows and completely blank columns.

## 3. PostgreSQL with Docker Compose

Create `docker-compose.yml` using PostgreSQL 16.

Use environment variables such as:

```env
POSTGRES_USER=cargopredict
POSTGRES_PASSWORD=change_this_password
POSTGRES_DB=cargopredict_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

Add:

* Persistent PostgreSQL volume
* Health check using `pg_isready`
* Port mapping
* UTF-8-compatible database configuration
* Safe container name
* Automatic restart unless stopped

Do not hard-code the real password in Python files.

## 4. Python dependencies

Create `requirements.txt` containing only required packages, such as:

```text
pandas
sqlalchemy
psycopg2-binary
python-dotenv
pandera
pytest
```

Pin compatible versions if appropriate.

## 5. Database schemas

Create separate PostgreSQL schemas:

```text
reference
synthetic
ml
audit
```

Load files according to their folder:

* `standardized/` → `reference`
* `synthetic/` → `synthetic`
* `ml_ready/` → `ml`
* Pipeline logs and validation results → `audit`

Do not load `raw_supplied/` into production tables by default. Preserve it as immutable source evidence.

Convert filenames into safe table names:

* Lowercase
* Replace spaces and hyphens with underscores
* Remove `.csv`
* Remove unsafe characters
* Prevent duplicate table names

Example:

```text
ml_ready/ml_freight_daily.csv
→ ml.ml_freight_daily
```

## 6. Correct PostgreSQL data types

Do not load every column as text.

Infer and assign suitable data types:

* Dates → `DATE`
* Timestamps → `TIMESTAMP WITH TIME ZONE`
* Integer counts → `INTEGER` or `BIGINT`
* Prices, rates and measurements → `NUMERIC`
* Boolean flags → `BOOLEAN`
* Names, IDs and descriptions → `TEXT`

Explicitly verify important fields such as:

```text
date
route_id
vessel_class
freight_rate_usd_per_mt
is_synthetic
synthetic_seed
source_origin
```

Prevent values such as `"True"` and `"False"` from remaining plain text when they should be Boolean.

## 7. Data validation before loading

For every CSV, check:

* File exists
* File is not empty
* Headers are unique
* Required columns exist
* Dates can be parsed
* Numeric columns are valid
* Boolean fields can be parsed
* Duplicate records
* Missing values
* Infinite numeric values
* Invalid negative prices or distances
* Invalid route IDs
* Invalid vessel classes

For `ml_freight_daily.csv`, specifically verify:

* Unique key: `date + route_id + vessel_class`
* `freight_rate_usd_per_mt > 0`
* `distance_nm > 0`
* `congestion_score` is between 0 and 100
* `wave_height_m >= 0`
* `available_vessel_count >= 0`
* No missing values in required ML columns
* All synthetic rows are explicitly marked
* Date range is sensible
* Expected route count is approximately 8

Validation failure must stop that table from replacing a previously valid table.

## 8. Safe and repeatable loading

Create `src/load_to_postgres.py`.

Required behaviour:

1. Read database credentials from `.env`.
2. Wait for PostgreSQL health before loading.
3. Discover CSV files automatically.
4. Validate each file before database insertion.
5. Use chunked inserts for large files.
6. Load data inside database transactions.
7. Roll back a failed table load.
8. Print clear progress messages.
9. Create an audit record for every pipeline run.
10. Record:

* Pipeline run ID
* File name
* Target schema and table
* Started time
* Completed time
* Source row count
* Inserted row count
* Duplicate count
* Missing-cell count
* Status
* Error message

11. Verify database row count after insertion.
12. Exit with a non-zero status if a required table fails.

Use a safe staging-table method:

```text
CSV
→ validation
→ temporary/staging table
→ row-count verification
→ final table replacement
```

Do not immediately destroy a previously valid table before the new data is validated.

## 9. Idempotency

Running the loader twice with the same inputs must not create duplicate records.

Use one clearly documented strategy:

* Validated staging-table replacement for full snapshot files, or
* PostgreSQL `UPSERT` using stable unique keys

For this first project, use staging-table replacement for snapshot datasets unless an existing project design requires incremental loading.

## 10. Database indexes and constraints

Add useful constraints and indexes.

For `ml.ml_freight_daily`, create:

* Unique constraint on `(date, route_id, vessel_class)`
* Index on `date`
* Index on `route_id`
* Index on `vessel_class`
* Composite index on `(route_id, vessel_class, date)`

Add reasonable checks:

```sql
CHECK (freight_rate_usd_per_mt > 0)
CHECK (distance_nm > 0)
CHECK (congestion_score BETWEEN 0 AND 100)
CHECK (wave_height_m >= 0)
```

Only add constraints after inspecting the actual column names and values.

## 11. Audit tables

Create at least:

```text
audit.pipeline_runs
audit.table_load_results
audit.data_quality_results
```

The audit system should make it easy to answer:

* When did the pipeline run?
* Which files were loaded?
* How many rows were received and inserted?
* Which validation checks failed?
* Was the run successful?
* Which rows are synthetic?

## 12. Verification script

Create `src/verify_database.py`.

It should:

* Connect to PostgreSQL
* List schemas and tables
* Count every loaded table
* Compare database counts with CSV counts
* Verify required constraints and indexes
* Check duplicate keys
* Check missing required values
* Display date ranges
* Confirm synthetic flags
* Produce a final PASS/FAIL summary

For the ML table, run equivalent checks to:

```sql
SELECT COUNT(*) FROM ml.ml_freight_daily;

SELECT COUNT(*)
FROM (
    SELECT date, route_id, vessel_class, COUNT(*)
    FROM ml.ml_freight_daily
    GROUP BY date, route_id, vessel_class
    HAVING COUNT(*) > 1
) duplicates;

SELECT
    MIN(date) AS first_date,
    MAX(date) AS last_date,
    COUNT(DISTINCT route_id) AS route_count
FROM ml.ml_freight_daily;
```

## 13. Automated tests

Create useful pytest tests for:

* Filename-to-table-name conversion
* Date parsing
* Boolean parsing
* Duplicate detection
* Required-column validation
* Invalid negative freight rate
* Invalid congestion score
* Loader idempotency where practical

Run the tests and fix failures.

## 14. Commands for a beginner

Create a `Makefile` or simple documented commands:

```bash
make setup
make db-up
make validate
make load
make verify
make test
make db-down
```

If `make` is unavailable, document equivalent commands for Windows PowerShell.

The README must explain, in easy language:

1. How to install Docker and Python
2. How to create `.env`
3. How to start PostgreSQL
4. How to install Python packages
5. How to validate CSV files
6. How to load the data
7. How to verify row counts
8. How to inspect tables using DBeaver or pgAdmin
9. How to stop PostgreSQL without deleting the database
10. How to reset the database only when explicitly intended
11. How to troubleshoot common errors:

    * Port 5432 already in use
    * Docker not running
    * Password authentication failure
    * CSV not found
    * Invalid date
    * Database connection refused

## 15. Security and safety

* Add `.env` to `.gitignore`.
* Do not print the database password.
* Do not delete user data.
* Do not run destructive SQL against unrelated databases.
* Do not use `DROP DATABASE`.
* Restrict destructive actions to temporary staging tables created by this project.
* Preserve all raw source files.
* Clearly retain all synthetic-data labels.

## 16. Final execution and proof

After implementation:

1. Start PostgreSQL.
2. Run CSV validation.
3. Run the complete loader.
4. Run database verification.
5. Run pytest.
6. Run the loader a second time.
7. Confirm the second run creates no duplicate records.
8. Report actual results, not expected results.

Provide a final summary containing:

* Files created or changed
* Number of CSV files discovered
* Number of tables loaded
* Row count of each table
* Final ML-table row count
* ML-table date range
* Number of routes
* Duplicate count
* Missing required-value count
* Test results
* Any warnings or limitations
* Exact command I should run next

Do not say the work is complete unless PostgreSQL successfully starts, every required table loads, verification passes, and tests pass. If Docker cannot run in the environment, still create all necessary files and clearly state which execution steps I must run locally.
