from pathlib import Path
import pandas as pd


DATA_PATH = Path("data/incoming/ml_freight_daily.csv")


def load_data():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_PATH}"
        )

    df = pd.read_csv(DATA_PATH)

    print("=" * 60)
    print("DATASET LOADED")
    print("=" * 60)
    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")
    print("\nColumns:")
    for column in df.columns:
        print(f"  - {column}")

    return df


if __name__ == "__main__":
    df = load_data()