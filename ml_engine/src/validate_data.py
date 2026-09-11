import pandas as pd
from pathlib import Path


# ============================================================
# DATASET PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "incoming" / "ml_freight_daily.csv"


# ============================================================
# LOAD DATA
# ============================================================

def load_dataset():
    print("=" * 70)
    print("CARGOPREDICT - DATA VALIDATION")
    print("=" * 70)

    print(f"\nDataset path:")
    print(DATA_PATH)

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"\nDataset not found at:\n{DATA_PATH}\n"
        )

    df = pd.read_csv(DATA_PATH)

    print("\nDataset successfully loaded.")

    return df


# ============================================================
# VALIDATION
# ============================================================

def validate_dataset(df):

    print("\n" + "=" * 70)
    print("1. BASIC DATASET INFORMATION")
    print("=" * 70)

    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")

    print("\nColumns:")
    for column in df.columns:
        print(f"  - {column}")


    # --------------------------------------------------------
    # DATE
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("2. DATE VALIDATION")
    print("=" * 70)

    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    print(f"Minimum date: {df['date'].min()}")
    print(f"Maximum date: {df['date'].max()}")
    print(f"Unique dates: {df['date'].nunique():,}")

    print(f"Invalid dates: {df['date'].isna().sum()}")


    # --------------------------------------------------------
    # DUPLICATES
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("3. DUPLICATE VALIDATION")
    print("=" * 70)

    print(f"Completely duplicate rows: {df.duplicated().sum():,}")

    duplicate_keys = df.duplicated(
        subset=["date", "route_id", "vessel_class"]
    ).sum()

    print(
        "Duplicate date + route + vessel combinations: "
        f"{duplicate_keys:,}"
    )


    # --------------------------------------------------------
    # MISSING VALUES
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("4. MISSING VALUES")
    print("=" * 70)

    missing = df.isna().sum()
    missing = missing[missing > 0]

    if len(missing) == 0:
        print("No missing values found.")
    else:
        print(missing.sort_values(ascending=False))


    # --------------------------------------------------------
    # ROUTES
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("5. ROUTES")
    print("=" * 70)

    print(f"Number of routes: {df['route_id'].nunique()}")

    print("\nRoutes:")
    for route in sorted(df["route_id"].unique()):
        print(f"  - {route}")


    # --------------------------------------------------------
    # VESSEL CLASSES
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("6. VESSEL CLASSES")
    print("=" * 70)

    print(
        f"Number of vessel classes: "
        f"{df['vessel_class'].nunique()}"
    )

    for vessel in sorted(df["vessel_class"].unique()):
        print(f"  - {vessel}")


    # --------------------------------------------------------
    # CARGO TYPES
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("7. CARGO TYPES")
    print("=" * 70)

    print(f"Number of cargo types: {df['cargo_type'].nunique()}")

    for cargo in sorted(df["cargo_type"].unique()):
        print(f"  - {cargo}")


    # --------------------------------------------------------
    # RATE UNIT
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("8. RATE UNIT")
    print("=" * 70)

    print(df["rate_unit"].value_counts(dropna=False))


    # --------------------------------------------------------
    # TARGET
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("9. TARGET VARIABLE")
    print("=" * 70)

    target = df["freight_rate_usd_per_mt"]

    print("Target: freight_rate_usd_per_mt")
    print(f"Minimum: {target.min():.4f}")
    print(f"Maximum: {target.max():.4f}")
    print(f"Mean: {target.mean():.4f}")
    print(f"Median: {target.median():.4f}")
    print(f"Missing: {target.isna().sum()}")
    print(f"Zero values: {(target == 0).sum()}")
    print(f"Negative values: {(target < 0).sum()}")


    # --------------------------------------------------------
    # SYNTHETIC DATA CHECK
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("10. DATA PROVENANCE")
    print("=" * 70)

    print("is_synthetic:")
    print(df["is_synthetic"].value_counts(dropna=False))

    print("\nsource_origin:")
    print(df["source_origin"].value_counts(dropna=False))


    # --------------------------------------------------------
    # ROWS PER GROUP
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("11. ROWS PER ROUTE + VESSEL")
    print("=" * 70)

    group_counts = (
        df.groupby(["route_id", "vessel_class"])
        .size()
        .sort_values()
    )

    print(group_counts.to_string())


    # --------------------------------------------------------
    # DATE CONTINUITY
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("12. DATE CONTINUITY")
    print("=" * 70)

    print(
        "Checking whether each route/vessel combination "
        "has continuous daily observations..."
    )

    problems = []

    for (route, vessel), group in df.groupby(
        ["route_id", "vessel_class"]
    ):

        dates = (
            group["date"]
            .drop_duplicates()
            .sort_values()
        )

        expected_dates = pd.date_range(
            start=dates.min(),
            end=dates.max(),
            freq="D"
        )

        missing_dates = expected_dates.difference(dates)

        if len(missing_dates) > 0:

            problems.append({
                "route": route,
                "vessel": vessel,
                "expected_days": len(expected_dates),
                "actual_days": len(dates),
                "missing_days": len(missing_dates)
            })


    if len(problems) == 0:

        print("\nSUCCESS: All route/vessel groups have")
        print("continuous daily observations.")

    else:

        print(
            f"\nWARNING: {len(problems)} groups "
            "have missing dates."
        )

        for problem in problems:
            print(problem)


    # --------------------------------------------------------
    # LAG FEATURES
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("13. HISTORICAL FEATURES")
    print("=" * 70)

    lag_columns = [
        "freight_lag_1",
        "freight_lag_7",
        "freight_lag_14",
        "freight_lag_30",
        "freight_rolling_mean_7",
        "freight_rolling_mean_14",
        "freight_rolling_mean_30",
        "freight_rolling_std_7"
    ]

    for column in lag_columns:

        if column in df.columns:

            print(
                f"{column}: "
                f"missing={df[column].isna().sum():,}"
            )


    # --------------------------------------------------------
    # FINAL
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("VALIDATION FINISHED")
    print("=" * 70)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    df = load_dataset()

    validate_dataset(df)