# CargoPredict - Pipeline Data Package

## Purpose
A reproducible SIH demonstration dataset for PS 26006. It combines the team's supplied reference CSV files with explicitly labelled synthetic operational data and an ML-ready feature table.

## Critical limitation
Synthetic rows are simulations, not observed freight, AIS, fixture, congestion, FX, weather or bunker facts. They must not be presented as production data, used for commercial chartering, or used to claim real-world model accuracy. Replace synthetic tables with authorized live/historical feeds before production validation.

## Folders
- raw_supplied: unchanged files copied from the provided Drive folder.
- standardized: normalized filenames plus provenance flags; values are not independently certified.
- synthetic: deterministic scenario data (`is_synthetic=true`, seed 26006).
- ml_ready: joined daily dataset with leakage-safe target lags and rolling features.
- documentation: data dictionary, source registry, quality report and handoff notes.

## ML target
`freight_rate_usd_per_mt`; one row represents one date, route and vessel class.

## Time split
Use chronological train/validation/test splits. Never randomly shuffle time-series rows. A suitable demo split is train through 2024-12-31, validation during 2025, and test during 2026.

## Leakage control
All freight lag and rolling features use earlier observations. Rolling features apply `shift(1)` before the rolling calculation.

## Recommended production replacements
Authorized route fixtures/freight assessments, daily RBI FX, licensed bunker prices, AIS vessel supply, berth/congestion history, port constraint versions, tide/UKC, actual procurement outcomes and BOOK/WAIT decision results.
