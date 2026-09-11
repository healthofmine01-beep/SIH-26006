# CargoPredict final pipeline readiness

**READY WITH WARNINGS**

Generated: 2026-09-09T20:12:17.818896+00:00

This decision applies to the data pipeline on the tested isolated local PostgreSQL instance. It does not certify model, backend, frontend, Docker or hosted Supabase integration.

## Existing work and task-status matrix

At the beginning, only the extracted datasets, naming evidence and project specification existed. The scaffold created before the interruption was reused. No existing loading or model code was replaced.

| Area | Initial status | Final status | Evidence / remaining work |
| --- | --- | --- | --- |
| Source data preservation | Complete | Complete | 38 SHA-256 comparisons; original ZIP hash; no dataset edits |
| CSV discovery | Missing | Complete | 38 deterministic CSV discoveries; collision, symlink and missing-file tests |
| Schema creation | Missing | Complete | Versioned contracts, audit.sql, live column-type and NOT NULL checks |
| PostgreSQL loading | Missing | Complete | 25 active dataset tables; full-refresh evidence |
| Supabase compatibility | Missing | Partial | TLS PostgreSQL adapter implemented; hosted connection NOT VERIFIED (no supplied credentials) |
| Data validation | Missing | Complete | File/schema/business/reference checks and full-history lag recomputation |
| Prefect automation | Missing | Complete | Named tasks and three modes; startup timeout adjusted after observed first-boot failure |
| Audit logging | Missing | Complete | Success/failure run IDs and quality rows verified; local reports retained |
| Idempotency | Missing | Complete | Two full loads plus full typed-value comparisons |
| Tests | Missing | Complete | 63 tests; 0 failures; 0 errors; 0 skipped |
| Documentation | Partial | Complete | README, configuration, Make targets, SQL queries and acceptance commands |
| End-to-end execution | Missing | Complete | Source to staging to final tables to ML query and audits; no application/model integration |

## Critical readiness gates

| Gate | Result |
| --- | --- |
| All 38 registered CSVs present and unchanged | PASS |
| Original source ZIP unchanged | PASS |
| Final validation and Prefect verification succeeded | PASS |
| Two complete loading runs succeeded | PASS |
| Database content, counts, references and constraints passed | PASS |
| ML key has no duplicates or missing values | PASS |
| Synthetic ML flags preserved | PASS |
| Database audit written | PASS |
| Second-run counts idempotent | PASS |
| Invalid candidate preserved the previous table | PASS |
| Unit/integration/Prefect tests passed without skips | PASS |
| Environment files ignored and no configured secrets found in deliverables | PASS |
| No legacy project-name references in project-owned files | PASS |
| Acceptance sequence passed | PASS |
| Beginner documentation and configuration present | PASS |

## Execution evidence

- Database version: 17.10 (Debian 17.10-0+deb13u1).
- Flow: `cargopredict_data_pipeline`; identifier/module: `cargopredict_pipeline`.
- Modes: `validate-only`, `full-refresh`, `verify-only`.
- Pytest: **63 tests, 0 failures, 0 errors, 0 skipped**. See [tests.xml](tests.xml).
- Acceptance: **PASS**. See [execution_evidence.json](execution_evidence.json).
- Final verification run: `f805e21c-7310-42c5-86cf-c25eaa8c169d`.
- Initial attempts exposed sandbox socket restrictions and Prefect cold-start timeouts. Local-service execution was approved and the timeout was raised to 120 seconds; successful reruns supersede those attempts.

| Mode | Run ID | Result |
| --- | --- | --- |
| validate-only | `b19d4bc7-6242-4eea-8d88-5a5c53c5f7e4` | SUCCESS |
| full-refresh | `ecdd44e1-06fd-4e3b-8742-dc5484feeb14` | SUCCESS |
| verify-only | `41f1905a-256b-4fbe-b96e-b5655042ea09` | SUCCESS |
| full-refresh | `bfdccfd1-4759-4c74-8d88-337812558c04` | SUCCESS |
| verify-only | `f5faae44-4695-458c-862f-a5798f2ac718` | SUCCESS |

Negative fixture: Failed; previous ML table unchanged: True. The fixture was removed by the temporary-directory context only.

## Active dataset table counts

Raw/source and documentation CSVs are validated but not loaded. Prior snapshots are retained separately.

| Table | CSV rows | Database rows |
| --- | ---: | ---: |
| reference.bunker_fuel_prices | 334 | 334 |
| reference.commodity_prices | 76 | 76 |
| reference.economic_indicators | 35 | 35 |
| reference.freight_indices | 468 | 468 |
| reference.freight_rates_observed | 30 | 30 |
| reference.port_congestion_reference | 43 | 43 |
| reference.port_master | 11 | 11 |
| reference.port_specifications | 28 | 28 |
| reference.route_master | 8 | 8 |
| reference.trade_routes | 12 | 12 |
| reference.vessel_specifications | 32 | 32 |
| reference.weather_climatology | 238 | 238 |
| synthetic.charter_contract_quotes_synthetic | 480 | 480 |
| synthetic.daily_ais_vessel_supply_synthetic | 19,480 | 19480 |
| synthetic.daily_berth_availability_synthetic | 9,740 | 9740 |
| synthetic.daily_market_drivers_synthetic | 2,435 | 2435 |
| synthetic.daily_port_congestion_synthetic | 9,740 | 9740 |
| synthetic.daily_port_weather_synthetic | 9,740 | 9740 |
| synthetic.daily_tide_ukc_synthetic | 9,740 | 9740 |
| synthetic.fixture_activity_synthetic | 6,494 | 6494 |
| synthetic.laytime_demurrage_rules_synthetic | 8 | 8 |
| synthetic.monthly_cargo_trade_flows_synthetic | 640 | 640 |
| synthetic.port_costs_synthetic | 4 | 4 |
| synthetic.route_freight_rates_synthetic | 19,480 | 19480 |
| ml.ml_freight_daily | 19,240 | 19240 |

Audit table counts: {"pipeline_runs": 6, "table_load_results": 228, "data_quality_results": 355}. See [database_table_inventory.csv](database_table_inventory.csv) for every table, including retained snapshots.

## ML dataset and differences from expectations

Rows: **19240**; columns: **39**; routes: **8**. Dates: **2020-01-31 – 2026-08-31**. Duplicate keys: **0**; missing values: **0**; synthetic rows: **19240**. Compare these actual values with the reference expectations of 19,240 rows, 39 columns, 8 routes, 2020-01-31 through 2026-08-31, and zero missing/duplicate keys.

## Warnings and boundaries

- All ML target rows are synthetic demonstration records. No licensed real-market accuracy or commercial readiness is claimed.
- Commodity reference retains 64 missing dates and two pre-existing duplicate rows. Other reference files retain nullable fields. These are classified non-critical for the demonstration pipeline, not repaired or promoted to verified facts.
- Five port IDs lack matching specifications: AUS_GLA, IDN_SK, MOZ_NAC, USA_HR, ZAF_RB. Referential membership in port_master passes; specification coverage remains incomplete.
- Raw files contain ten trailing blank lines (one per file); they are reported separately from actual data records.
- Docker is absent: the PostgreSQL 16 Compose deployment is NOT VERIFIED. End-to-end execution used isolated PostgreSQL 17.10 binaries extracted under /tmp. No system service or cloud project was created.
- Hosted Supabase, backend API, model integration and full application integration are NOT VERIFIED; credentials/components were not supplied.
- The /tmp test database is not durable deployment storage. Previous snapshots consume storage; no automatic cleanup deletes them.
- The original ZIP retains its original internal names and README as immutable evidence. Project-owned files were scanned separately, with zero matches required for readiness.
- No repository commit was made. This workspace has no usable Git repository metadata; history cannot be audited. Ignore rules were exercised in a scratch Git repository and configured secrets were scanned in deliverables.

## Files implemented or changed

`src/config.py`, `src/discover_files.py`, `src/validate_csv.py`, `src/database.py`, `src/load_to_postgres.py`, `src/verify_database.py`, `src/reporting.py`, `src/flows/cargopredict_pipeline.py`, `src/run_acceptance.py`, `src/build_readiness_report.py`, `database/schemas/*`, `database/queries/verification.sql`, `tests/*`, `pytest.ini`, `requirements.txt`, `docker-compose.yml`, `.gitignore`, `.env.example`, `Makefile`, `README.md` and `reports/*`. A private ignored `.env` was generated for the isolated cluster. No dataset or model file was edited.

## Next command in this audit environment

```bash
cd /home/dhruvilbhavsar38/dhruvil_sih/cargopredict-data-pipeline
set -a
. ./.env
set +a
.venv/bin/python -m src.flows.cargopredict_pipeline --mode verify-only
```

If the isolated cluster has stopped, restart it with:

```bash
LD_LIBRARY_PATH=/tmp/cargopredict-postgres-runtime/usr/lib/x86_64-linux-gnu /tmp/cargopredict-postgres-runtime/usr/lib/postgresql/17/bin/pg_ctl -D /tmp/cargopredict-postgres-cluster -l /tmp/cargopredict-postgres-cluster/server.log -o "-k /tmp/cargopredict-postgres-socket -p 55432 -c listen_addresses=''" -w start
```

Stop only this isolated cluster without deleting its data:

```bash
LD_LIBRARY_PATH=/tmp/cargopredict-postgres-runtime/usr/lib/x86_64-linux-gnu /tmp/cargopredict-postgres-runtime/usr/lib/postgresql/17/bin/pg_ctl -D /tmp/cargopredict-postgres-cluster -m fast -w stop
```
