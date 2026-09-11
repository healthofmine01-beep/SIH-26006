import pandas as pd
from pathlib import Path

from data_loader2 import load_data


TARGET = "freight_rate_usd_per_mt"

GROUP_COLUMNS = [
    "route_id",
    "vessel_class"
]

HORIZONS = [14, 30, 90]


def prepare_data():

    df = load_data()

    print("\nPreparing forecasting dataset...")

    # --------------------------------------------------
    # Date
    # --------------------------------------------------

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    # Sort chronologically within each series
    df = df.sort_values(
        GROUP_COLUMNS + ["date"]
    ).reset_index(drop=True)

    # --------------------------------------------------
    # Remove duplicate observations
    # --------------------------------------------------

    before = len(df)

    df = df.drop_duplicates(
        subset=GROUP_COLUMNS + ["date"]
    )

    print(
        f"Removed {before - len(df)} duplicate observations."
    )

    # --------------------------------------------------
    # Create future targets
    # --------------------------------------------------

    for horizon in HORIZONS:

        column = f"target_{horizon}"

        df[column] = (
            df.groupby(GROUP_COLUMNS)[TARGET]
            .shift(-horizon)
        )

    # --------------------------------------------------
    # Save
    # --------------------------------------------------

    output_path = Path(
        "data/processed/forecast_dataset.csv"
    )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    df.to_csv(
        output_path,
        index=False
    )

    print(
        f"\nSaved prepared dataset to: {output_path}"
    )

    print("\nTarget availability:")

    for horizon in HORIZONS:
        column = f"target_{horizon}"

        print(
            f"{column}: "
            f"{df[column].notna().sum():,} rows"
        )

    return df


if __name__ == "__main__":
    prepare_data()