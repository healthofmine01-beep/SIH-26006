import os
import joblib
import numpy as np
import pandas as pd

from xgboost import XGBRegressor

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error
)

from config import (
    CATEGORICAL_FEATURES,
    NUMERIC_FEATURES,
    TARGET
)


DATA_PATH = (
    "data/processed/forecast_dataset.csv"
)

MODEL_DIR = "models"


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


def create_preprocessor():

    numeric_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(
                    strategy="median"
                )
            )
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(
                    strategy="most_frequent"
                )
            ),
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore"
                )
            )
        ]
    )

    return ColumnTransformer(
        transformers=[
            (
                "numeric",
                numeric_pipeline,
                NUMERIC_FEATURES
            ),
            (
                "categorical",
                categorical_pipeline,
                CATEGORICAL_FEATURES
            )
        ],
        remainder="drop"
    )


def train_model(horizon):

    print("\n" + "=" * 70)
    print(f"TRAINING XGBOOST — {horizon}-DAY FORECAST")
    print("=" * 70)

    df = pd.read_csv(DATA_PATH)

    df["date"] = pd.to_datetime(
        df["date"]
    )

    target_column = (
        f"target_{horizon}"
    )

    # ------------------------------------------------
    # Ensure features exist
    # ------------------------------------------------

    feature_columns = (
        NUMERIC_FEATURES
        + CATEGORICAL_FEATURES
    )

    missing_features = [
        column
        for column in feature_columns
        if column not in df.columns
    ]

    if missing_features:

        raise ValueError(
            "Missing features:\n"
            + "\n".join(
                missing_features
            )
        )

    # ------------------------------------------------
    # Remove rows without target
    # ------------------------------------------------

    df = df.dropna(
        subset=[target_column]
    )

    # ------------------------------------------------
    # Sort by time
    # ------------------------------------------------

    df = df.sort_values(
        "date"
    ).reset_index(
        drop=True
    )

    # ------------------------------------------------
    # Chronological split
    # ------------------------------------------------

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

    train_dates = unique_dates[
        :train_end
    ]

    validation_dates = unique_dates[
        train_end:validation_end
    ]

    test_dates = unique_dates[
        validation_end:
    ]

    train = df[
        df["date"].isin(train_dates)
    ]

    validation = df[
        df["date"].isin(
            validation_dates
        )
    ]

    test = df[
        df["date"].isin(test_dates)
    ]

    print(
        f"Train:      {len(train):,}"
    )

    print(
        f"Validation: {len(validation):,}"
    )

    print(
        f"Test:       {len(test):,}"
    )

    print(
        f"Train period: "
        f"{train.date.min().date()} → "
        f"{train.date.max().date()}"
    )

    print(
        f"Validation period: "
        f"{validation.date.min().date()} → "
        f"{validation.date.max().date()}"
    )

    print(
        f"Test period: "
        f"{test.date.min().date()} → "
        f"{test.date.max().date()}"
    )

    # ------------------------------------------------
    # X and y
    # ------------------------------------------------

    X_train = train[
        feature_columns
    ]

    y_train = train[
        target_column
    ]

    X_validation = validation[
        feature_columns
    ]

    y_validation = validation[
        target_column
    ]

    X_test = test[
        feature_columns
    ]

    y_test = test[
        target_column
    ]

    # ------------------------------------------------
    # Preprocessing
    # ------------------------------------------------

    preprocessor = (
        create_preprocessor()
    )

    X_train_processed = (
        preprocessor.fit_transform(
            X_train
        )
    )

    X_validation_processed = (
        preprocessor.transform(
            X_validation
        )
    )

    X_test_processed = (
        preprocessor.transform(
            X_test
        )
    )

    print(
        "\nProcessed feature count:",
        X_train_processed.shape[1]
    )

    # ------------------------------------------------
    # XGBoost
    # ------------------------------------------------

    model = XGBRegressor(

        objective="reg:squarederror",

        n_estimators=500,

        learning_rate=0.03,

        max_depth=6,

        min_child_weight=3,

        subsample=0.8,

        colsample_bytree=0.8,

        reg_alpha=0.1,

        reg_lambda=1.0,

        random_state=42,

        n_jobs=-1
    )

    model.fit(
        X_train_processed,
        y_train,

        eval_set=[
            (
                X_validation_processed,
                y_validation
            )
        ],

        verbose=False
    )

    # ------------------------------------------------
    # Validation
    # ------------------------------------------------

    validation_prediction = (
        model.predict(
            X_validation_processed
        )
    )

    validation_mae = (
        mean_absolute_error(
            y_validation,
            validation_prediction
        )
    )

    validation_rmse = np.sqrt(
        mean_squared_error(
            y_validation,
            validation_prediction
        )
    )

    validation_wape = wape(
        y_validation.values,
        validation_prediction
    )

    print("\nVALIDATION")

    print(
        f"MAE:  {validation_mae:.4f}"
    )

    print(
        f"RMSE: {validation_rmse:.4f}"
    )

    print(
        f"WAPE: {validation_wape:.2%}"
    )

    # ------------------------------------------------
    # Final test
    # ------------------------------------------------

    test_prediction = (
        model.predict(
            X_test_processed
        )
    )

    test_mae = (
        mean_absolute_error(
            y_test,
            test_prediction
        )
    )

    test_rmse = np.sqrt(
        mean_squared_error(
            y_test,
            test_prediction
        )
    )

    test_wape = wape(
        y_test.values,
        test_prediction
    )

    print("\nTEST")

    print(
        f"MAE:  {test_mae:.4f}"
    )

    print(
        f"RMSE: {test_rmse:.4f}"
    )

    print(
        f"WAPE: {test_wape:.2%}"
    )

    # ------------------------------------------------
    # Save model + preprocessor
    # ------------------------------------------------

    os.makedirs(
        MODEL_DIR,
        exist_ok=True
    )

    artifact = {

        "model": model,

        "preprocessor": preprocessor,

        "features": feature_columns,

        "horizon": horizon,

        "target": target_column
    }

    model_path = (
        f"{MODEL_DIR}/"
        f"xgboost_{horizon}d.joblib"
    )

    joblib.dump(
        artifact,
        model_path
    )

    print(
        f"\nModel saved: {model_path}"
    )


if __name__ == "__main__":

    for horizon in [14, 30, 90]:

        train_model(horizon)