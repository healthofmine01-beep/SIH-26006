import os
import joblib
import numpy as np
import pandas as pd

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)


# ============================================================
# CONFIGURATION
# ============================================================

DATA_PATH = "data/processed/forecast_dataset.csv"
MODEL_DIR = "models"
REPORT_DIR = "reports"

HORIZONS = [14, 30, 90]


# ============================================================
# METRICS
# ============================================================

def calculate_wape(y_true, y_pred):
    """
    Weighted Absolute Percentage Error.

    WAPE = sum(|actual - prediction|)
           / sum(|actual|)
    """

    denominator = np.sum(np.abs(y_true))

    if denominator == 0:
        return np.nan

    return np.sum(
        np.abs(y_true - y_pred)
    ) / denominator


def calculate_metrics(y_true, y_pred):

    mae = mean_absolute_error(
        y_true,
        y_pred
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_true,
            y_pred
        )
    )

    wape = calculate_wape(
        y_true,
        y_pred
    )

    r2 = r2_score(
        y_true,
        y_pred
    )

    return {
        "MAE": mae,
        "RMSE": rmse,
        "WAPE": wape,
        "R2": r2,
    }


# ============================================================
# CREATE SAME TEST SPLIT USED DURING TRAINING
# ============================================================

def create_test_split(df, target_column):

    df = df.copy()

    df["date"] = pd.to_datetime(
        df["date"]
    )

    # Remove rows where target does not exist
    df = df.dropna(
        subset=[target_column]
    )

    # Sort chronologically
    df = df.sort_values(
        "date"
    ).reset_index(
        drop=True
    )

    # Unique dates
    unique_dates = (
        df["date"]
        .sort_values()
        .unique()
    )

    train_end = int(
        len(unique_dates) * 0.70
    )

    validation_end = int(
        len(unique_dates) * 0.85
    )

    test_dates = unique_dates[
        validation_end:
    ]

    test = df[
        df["date"].isin(test_dates)
    ].copy()

    return test


# ============================================================
# EVALUATE ONE HORIZON
# ============================================================

def evaluate_horizon(horizon):

    print("\n" + "=" * 70)
    print(
        f"EVALUATING {horizon}-DAY FORECAST"
    )
    print("=" * 70)

    target_column = f"target_{horizon}"

    # --------------------------------------------------------
    # Load dataset
    # --------------------------------------------------------

    df = pd.read_csv(
        DATA_PATH
    )

    test = create_test_split(
        df,
        target_column
    )

    print(
        f"Test rows: {len(test):,}"
    )

    print(
        f"Test period: "
        f"{test['date'].min()} → "
        f"{test['date'].max()}"
    )

    # --------------------------------------------------------
    # Actual values
    # --------------------------------------------------------

    y_test = test[
        target_column
    ].values

    # --------------------------------------------------------
    # NAIVE BASELINE
    # --------------------------------------------------------
    #
    # Prediction:
    #
    # future freight rate =
    # current freight rate
    #
    # This is a very important baseline.
    # --------------------------------------------------------

    naive_prediction = test[
        "freight_rate_usd_per_mt"
    ].values

    naive_metrics = calculate_metrics(
        y_test,
        naive_prediction
    )

    # --------------------------------------------------------
    # LOAD XGBOOST MODEL
    # --------------------------------------------------------

    model_path = (
        f"{MODEL_DIR}/"
        f"xgboost_{horizon}d.joblib"
    )

    artifact = joblib.load(
        model_path
    )

    model = artifact["model"]
    preprocessor = artifact["preprocessor"]
    features = artifact["features"]

    print(
        f"Model loaded: {model_path}"
    )

    print(
        f"Features used: {len(features)}"
    )

    # --------------------------------------------------------
    # XGBOOST PREDICTION
    # --------------------------------------------------------

    X_test = test[
        features
    ]

    X_test_processed = (
        preprocessor.transform(
            X_test
        )
    )

    xgb_prediction = (
        model.predict(
            X_test_processed
        )
    )

    xgb_metrics = calculate_metrics(
        y_test,
        xgb_prediction
    )

    # --------------------------------------------------------
    # PRINT RESULTS
    # --------------------------------------------------------

    print("\nNAIVE BASELINE")
    print(
        f"MAE:  {naive_metrics['MAE']:.4f}"
    )
    print(
        f"RMSE: {naive_metrics['RMSE']:.4f}"
    )
    print(
        f"WAPE: {naive_metrics['WAPE']:.2%}"
    )
    print(
        f"R²:   {naive_metrics['R2']:.4f}"
    )

    print("\nXGBOOST")
    print(
        f"MAE:  {xgb_metrics['MAE']:.4f}"
    )
    print(
        f"RMSE: {xgb_metrics['RMSE']:.4f}"
    )
    print(
        f"WAPE: {xgb_metrics['WAPE']:.2%}"
    )
    print(
        f"R²:   {xgb_metrics['R2']:.4f}"
    )

    # --------------------------------------------------------
    # IMPROVEMENT
    # --------------------------------------------------------

    mae_improvement = (
        (
            naive_metrics["MAE"]
            - xgb_metrics["MAE"]
        )
        / naive_metrics["MAE"]
        * 100
    )

    wape_improvement = (
        (
            naive_metrics["WAPE"]
            - xgb_metrics["WAPE"]
        )
        / naive_metrics["WAPE"]
        * 100
    )

    print("\nXGBOOST IMPROVEMENT")

    print(
        f"MAE improvement: "
        f"{mae_improvement:.2f}%"
    )

    print(
        f"WAPE improvement: "
        f"{wape_improvement:.2f}%"
    )

    # --------------------------------------------------------
    # SAVE PREDICTIONS
    # --------------------------------------------------------

    predictions = pd.DataFrame({

        "date": test["date"].values,

        "route_id": test[
            "route_id"
        ].values,

        "vessel_class": test[
            "vessel_class"
        ].values,

        "cargo_type": test[
            "cargo_type"
        ].values,

        "actual": y_test,

        "naive_prediction":
            naive_prediction,

        "xgboost_prediction":
            xgb_prediction,

    })

    prediction_path = (
        f"{REPORT_DIR}/"
        f"predictions_{horizon}d.csv"
    )

    predictions.to_csv(
        prediction_path,
        index=False
    )

    print(
        f"\nPredictions saved: "
        f"{prediction_path}"
    )

    return {
        "model": "Naive",
        "horizon": horizon,
        **naive_metrics,
    }, {
        "model": "XGBoost",
        "horizon": horizon,
        **xgb_metrics,
    }


# ============================================================
# MAIN
# ============================================================

def main():

    os.makedirs(
        REPORT_DIR,
        exist_ok=True
    )

    all_results = []

    for horizon in HORIZONS:

        naive_result, xgb_result = (
            evaluate_horizon(
                horizon
            )
        )

        all_results.append(
            naive_result
        )

        all_results.append(
            xgb_result
        )

    # --------------------------------------------------------
    # CREATE FINAL REPORT
    # --------------------------------------------------------

    results = pd.DataFrame(
        all_results
    )

    results["WAPE"] = (
        results["WAPE"] * 100
    )

    report_path = (
        f"{REPORT_DIR}/"
        "model_comparison.csv"
    )

    results.to_csv(
        report_path,
        index=False
    )

    # --------------------------------------------------------
    # PRINT FINAL TABLE
    # --------------------------------------------------------

    print("\n\n")
    print("=" * 80)
    print("FINAL MODEL COMPARISON")
    print("=" * 80)

    print(
        results.to_string(
            index=False,
            formatters={
                "MAE": "{:.4f}".format,
                "RMSE": "{:.4f}".format,
                "WAPE": "{:.2f}%".format,
                "R2": "{:.4f}".format,
            }
        )
    )

    print(
        f"\nFinal report saved to: "
        f"{report_path}"
    )

    print("\nEvaluation complete.")


if __name__ == "__main__":
    main()