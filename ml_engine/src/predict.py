import joblib
import pandas as pd

from config import (
    CATEGORICAL_FEATURES,
    NUMERIC_FEATURES
)


def load_model(horizon):

    path = (
        f"models/xgboost_{horizon}d.joblib"
    )

    artifact = joblib.load(path)

    return artifact


def predict(
    row,
    horizon
):

    artifact = load_model(
        horizon
    )

    model = artifact["model"]

    preprocessor = (
        artifact["preprocessor"]
    )

    features = artifact[
        "features"
    ]

    df = pd.DataFrame(
        [row]
    )

    X = df[features]

    X_processed = (
        preprocessor.transform(X)
    )

    prediction = (
        model.predict(
            X_processed
        )[0]
    )

    return float(prediction)


if __name__ == "__main__":

    df = pd.read_csv(
        "data/incoming/ml_freight_daily.csv"
    )

    row = df.iloc[-1].to_dict()

    prediction = predict(
        row,
        horizon=14
    )

    print(
        f"\n14-day predicted freight rate: "
        f"{prediction:.2f} USD/MT"
    )