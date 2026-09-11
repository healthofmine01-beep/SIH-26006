import pandas as pd
import numpy as np

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error
)

from config import (
    TARGET,
    GROUP_COLUMNS
)


DATA_PATH = (
    "data/processed/forecast_dataset.csv"
)


def wape(y_true, y_pred):

    denominator = np.sum(
        np.abs(y_true)
    )

    if denominator == 0:
        return np.nan

    return (
        np.sum(
            np.abs(y_true - y_pred)
        )
        / denominator
    )


def train_baseline(horizon):

    df = pd.read_csv(DATA_PATH)

    df["date"] = pd.to_datetime(
        df["date"]
    )

    target_column = f"target_{horizon}"

    # ------------------------------------------------
    # Remove rows without target
    # ------------------------------------------------

    df = df.dropna(
        subset=[target_column]
    )

    # ------------------------------------------------
    # Chronological split
    # ------------------------------------------------

    df = df.sort_values("date")

    split_date = df["date"].quantile(0.8)

    train = df[
        df["date"] <= split_date
    ]

    test = df[
        df["date"] > split_date
    ]

    # ------------------------------------------------
    # Naive forecast
    #
    # Predict future rate using current rate
    # ------------------------------------------------

    predictions = test[TARGET]

    actual = test[target_column]

    mae = mean_absolute_error(
        actual,
        predictions
    )

    rmse = np.sqrt(
        mean_squared_error(
            actual,
            predictions
        )
    )

    wape_score = wape(
        actual.values,
        predictions.values
    )

    print("\n" + "=" * 60)
    print(f"BASELINE — {horizon}-DAY")
    print("=" * 60)

    print(
        f"Train rows: {len(train):,}"
    )

    print(
        f"Test rows: {len(test):,}"
    )

    print(
        f"MAE: {mae:.4f}"
    )

    print(
        f"RMSE: {rmse:.4f}"
    )

    print(
        f"WAPE: {wape_score:.2%}"
    )


if __name__ == "__main__":

    for horizon in [14, 30, 90]:

        train_baseline(horizon)