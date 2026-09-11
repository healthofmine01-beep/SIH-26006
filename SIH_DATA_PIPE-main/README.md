# CargoPredict

Data engineering pipeline for SIH 2026 PS 26006. The local Prefect flow validates
immutable CSV inputs, loads typed PostgreSQL snapshots, verifies the database,
and records audit evidence. See [the readiness report](reports/final_pipeline_readiness.md)
for actual execution results and remaining limitations.

> Synthetic datasets are for SIH system demonstration and pipeline/model integration. They must not be used to claim production forecasting accuracy or make real chartering decisions.

## What is included

- `CargoPredict_Pipeline_Data/`: original extracted data; all 38 CSVs are preserved.
- `src/validate_csv.py`: explicit versioned schema, provenance, business, reference and leakage checks.
- `database/schemas/dataset_contracts.json`: registered columns and SQL types for every CSV.
- `src/load_to_postgres.py`: streamed COPY into staging tables and transactional promotion.
- `src/verify_database.py`: typed-content, count, index, constraint and referential verification.
- `src/flows/cargopredict_pipeline.py`: Prefect flow `cargopredict_data_pipeline`.
- `database/schemas/audit.sql`: the three audit tables; created by the flow.
- `tests/`: small fixtures and unit/real-PostgreSQL integration tests.
- `reports/`: JSON run records, CSV summaries and readiness evidence.

The project folder is `cargopredict-data-pipeline`; the pipeline identifier is
`cargopredict_pipeline`. The database/user are `cargopredict_db` / `cargopredict`,
the Docker container is `cargopredict-postgres`, and the Docker volume is
`cargopredict_postgres_data`. Keep legitimate dataset columns such as `cargo_type`.

## Setup on Linux or macOS

Install Python 3.11 or newer from [python.org](https://www.python.org/downloads/)
and Docker with Compose from [Docker's installation instructions](https://docs.docker.com/compose/install/).
Python 3.13 is used for this audit. Docker must be running before `db-up`.

```bash
cd cargopredict-data-pipeline
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
# Only if .env does not already exist:
cp -n .env.example .env
```

Edit `.env` locally and replace the placeholder password. Never paste credentials
into logs, chat, source code or a commit. `.env` and `.env.*` are ignored except
for `.env.example`. Python reads credentials only from process environment variables;
it does not automatically execute or read the `.env` file. Export the local file
before loading:

```bash
set -a
. ./.env
set +a
docker compose up -d --wait
```

For a normal Docker setup use `POSTGRES_HOST=localhost` and `POSTGRES_PORT=5432`
(or another unused host port). The isolated audit environment's `.env` points to a
private Unix socket under `/tmp` and port 55432; change these when moving to Docker.
Compose reads `.env` itself, while the Python commands use the exported variables.

## Run the pipeline

```bash
python -m src.flows.cargopredict_pipeline --mode validate-only
python -m src.flows.cargopredict_pipeline --mode full-refresh
python -m src.flows.cargopredict_pipeline --mode verify-only
# Second identical snapshot; final table counts must remain unchanged.
python -m src.flows.cargopredict_pipeline --mode full-refresh
python -m src.flows.cargopredict_pipeline --mode verify-only
python -m pytest -q
```

`--dataset-root /absolute/path/CargoPredict_Pipeline_Data` chooses another dataset
root. All registered files and original checksums are required. For an intentionally
new approved dataset version, review and update the contracts and preservation
baseline explicitly; the pipeline never silently trusts changed inputs.
`--report-dir /path/to/reports` separates run evidence.

`validate-only` requires no PostgreSQL connection and writes local audit evidence.
`full-refresh` validates all files before opening a loading transaction.
`verify-only` validates sources and checks existing final tables; it does not
replace data, but records the verification run in `audit`.
Every critical failure exits nonzero and produces a failed Prefect state.

Equivalent Make targets: `make setup`, `make db-up`, `make validate`, `make load`,
`make verify`, `make test`, `make db-down`. Export `.env` before the database targets.

## Windows PowerShell

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# Edit .env; then load this project's simple KEY=VALUE entries without executing them.
Get-Content .env | ForEach-Object {
  if ($_ -match '^([A-Z_]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
  }
}
docker compose up -d --wait
python -m src.flows.cargopredict_pipeline --mode full-refresh
python -m src.flows.cargopredict_pipeline --mode verify-only
python -m pytest -q
```

## Validation and data limitations

Discovery is sorted, rejects collisions and symlinks, and checks all required
folders and registered files. UTF-8 CSV structure, headers, missing values,
duplicates, finite numeric values, dates, Boolean formats, SHA-256 hashes and
provenance are checked. In-memory normalization converts blanks to NULL, dates
to DATE, numeric measures to NUMERIC, counts to BIGINT and Boolean flags to BOOLEAN.
IDs remain TEXT. Raw CSVs and documentation are inspected but never loaded as
reference/ML tables. Raw source period strings remain evidence, not invented dates.

All 39 ML fields are required. ML prices/distances must be positive, congestion
must be 0–100, and wave/wind/vessel counts must be nonnegative. Route, vessel and
port references are checked against masters. ML dates must be chronological within
each route/vessel group. Target lags and rolling means/std are recomputed from the
full synthetic freight history, using only earlier dates; coverage starts after
30 days. This checks feature arithmetic, not a trained model or forecasting skill.

Non-critical warnings preserve source evidence: nullable reference fields,
reference duplicate records, raw trailing blank lines and missing port specification
coverage. The supplied commodity reference has 64 missing dates and two duplicate
rows. Those are not silently filled, deduplicated or used as verified historical
facts. Five port IDs lack matching specifications. Source provenance labels are
preserved but do not establish licensing or independent factual verification.
Synthetic and observed layers have separate explicit Boolean constraints.

## Database safety and audits

There are 25 dataset destinations: 12 `reference`, 12 `synthetic`, and one `ml`.
Every refresh streams all validated records into new staging tables. It verifies
counts and builds constraints/indexes before promotion. Promotion, final typed-value
verification and successful audit writes share one transaction. A failure rolls
back the complete snapshot. A database advisory lock serializes refreshes.

Existing final tables must carry the `cargopredict_pipeline` ownership comment.
Unrelated tables are never adopted or overwritten. Prior snapshots are retained
as `_cp_previous_*` tables; they consume storage and are excluded from the 25
active-table counts. No automatic retention cleanup or database deletion occurs.
Tables with dependent views/foreign keys require a reviewed migration because
renaming would leave those dependencies pointing at the old snapshot. Referential
checks are performed in validation and SQL; the loader does not install cross-table
foreign keys that would obstruct snapshot replacement.

`ml.ml_freight_daily` has a unique `(date, route_id, vessel_class)` constraint,
indexes on each of those columns and `(route_id, vessel_class, date)`, NOT NULL
columns, eight named business checks and a synthetic-layer check. All final table
contents, including duplicate multiplicity, are compared with typed source rows.

audit tables:

- `audit.pipeline_runs`: Prefect run ID, mode, timestamps and final status.
- `audit.table_load_results`: hashes, row counts, duplicates, missing cells, labels and load status.
- `audit.data_quality_results`: validation results and classified warnings/errors.

Failure-audit errors cannot replace the original pipeline error. If PostgreSQL is
unavailable, the local JSON report records the failure and the missing database audit.
Validation-only success does not imply database readiness. Unique per-run JSON files
are retained; `latest_pipeline_run.json` and summary CSVs show the latest execution.
Concurrent runs should use separate report directories if independent latest reports
are needed.

## Prefect logs

Direct execution starts a temporary local server; no Prefect Cloud account,
deployment, worker or paid service is required. Startup allows 120 seconds for
first-time migrations. Runtime files are in ignored `.prefect/`.
For a persistent local UI, use two terminals:

```bash
# Terminal 1 (with the virtual environment active)
PREFECT_HOME="$PWD/.prefect" prefect server start --host 127.0.0.1
# Terminal 2
export PREFECT_API_URL=http://127.0.0.1:4200/api
python -m src.flows.cargopredict_pipeline --mode validate-only
```

Open the local UI to inspect flow/task states. Secrets are never flow parameters,
persisted task results or report fields. Only temporary connection failures retry;
invalid data does not retry.

## DBeaver, pgAdmin and Supabase

For Docker, connect DBeaver/pgAdmin using the host, port, database and user in your
local `.env`; enter the password privately. Inspect `reference`, `synthetic`, `ml`
and `audit`. Run [verification queries](database/queries/verification.sql).
The audit instance uses a local Unix socket and is not a network-accessible server;
use Docker for a normal GUI connection.

For an existing Supabase project, export `SUPABASE_DATABASE_URL` privately with its
direct or session-pooler PostgreSQL credentials. The client enforces TLS and disables
prepared statements. No Supabase service is created. The role needs schema/table
creation privileges. Then use:

```bash
python -m src.flows.cargopredict_pipeline --database supabase --mode full-refresh
python -m src.flows.cargopredict_pipeline --database supabase --mode verify-only
```

This is PostgreSQL compatibility code. A real Supabase connection is **NOT VERIFIED**
unless the readiness report explicitly records one. No backend, ML model or frontend
integration is claimed by data-pipeline tests.

## Integration tests and stopping

Unit tests run with `python -m pytest -q`. Database tests are skipped unless you
explicitly configure a separate database named `cargopredict_test_*` and set
`CARGOPREDICT_TEST_DATABASE=1`. They exercise two small snapshot loads, invalid-input
protection, count rollback, unrelated ownership refusal and same-count corruption.
Fixture data changes are rolled back; the test database may retain empty audit tables.
Never point these tests at an application database.

```bash
# After exporting credentials for an isolated test database:
CARGOPREDICT_TEST_DATABASE=1 POSTGRES_DB=cargopredict_test_audit python -m pytest -q
# Stop Docker without deleting the persistent volume:
docker compose stop
```

Do not remove the Docker volume to troubleshoot authentication: database credentials
are initialized when the volume is first created. Retain backups and plan any reset
explicitly. The test PostgreSQL cluster under `/tmp` is temporary, not deployment
storage; its shutdown command is recorded in the readiness report.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Port already used | Pick an unused POSTGRES_PORT, re-export `.env`, restart Compose. |
| Docker not running | Start Docker Desktop/Engine and check `docker info`. |
| Authentication failed | Check the environment matches the existing database role; don't delete its volume. |
| CSV missing/checksum failure | Confirm dataset root and restore the registered source; don't weaken the validation gate. |
| Invalid date/numeric/Boolean | Read the named check in the JSON report; review the source with its owner. |
| Connection refused | Check health, hostname, port and exported environment. |
| Prefect startup timeout | Allow first-time startup, check local sockets, or run a persistent local server. |
| Local sockets forbidden | Run in an environment permitting local services; sandbox execution requires approval. |
| Existing table refused | Use a separate database/schema or review ownership/dependencies explicitly. |

Implementation references: [Prefect tasks](https://docs.prefect.io/v3/concepts/tasks),
[Prefect states](https://docs.prefect.io/v3/concepts/states),
[Prefect result persistence](https://docs.prefect.io/v3/advanced/results),
and [PostgreSQL table changes](https://www.postgresql.org/docs/16/ddl-alter.html).

To reproduce the full acceptance sequence on your configured CargoPredict database:

```bash
python -m src.run_acceptance
python -m src.build_readiness_report
```

The acceptance runner performs two full refreshes (retaining previous snapshots),
verifies their contents, rejects a small invalid ML candidate in a temporary dataset
copy, checks the valid table is unchanged, and finishes with clean verification.
It does not modify original source files. This intentionally refreshes CargoPredict's
owned tables; use the separate test database for fixture-based pytest integration tests.
