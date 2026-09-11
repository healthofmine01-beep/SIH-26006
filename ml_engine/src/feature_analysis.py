import os
import joblib
import pandas as pd
import matplotlib.pyplot as plt  # type: ignore[reportMissingImports]


MODEL_DIR = "models"
REPORT_DIR = "reports"

HORIZONS = [14, 30, 90]


def analyze_model(horizon):

    print("\n" + "=" * 70)
    print(f"FEATURE IMPORTANCE — {horizon}-DAY MODEL")
    print("=" * 70)

    model_path = (
        f"{MODEL_DIR}/xgboost_{horizon}d.joblib"
    )

    artifact = joblib.load(model_path)

    model = artifact["model"]
    preprocessor = artifact["preprocessor"]
    features = artifact["features"]

    # --------------------------------------------------------
    # Get feature names after preprocessing
    # --------------------------------------------------------

    try:

        feature_names = (
            preprocessor
            .get_feature_names_out()
        )

    except Exception:

        feature_names = features

    importances = model.feature_importances_

    # Make sure lengths match
    if len(feature_names) != len(importances):

        print(
            "WARNING: Feature name count does not "
            "match importance count."
        )

        feature_names = [
            f"feature_{i}"
            for i in range(len(importances))
        ]

    importance_df = pd.DataFrame({

        "feature": feature_names,

        "importance": importances

    })

    importance_df = (
        importance_df
        .sort_values(
            "importance",
            ascending=False
        )
        .reset_index(drop=True)
    )

    # --------------------------------------------------------
    # Print top features
    # --------------------------------------------------------

    print("\nTOP 15 FEATURES\n")

    print(
        importance_df
        .head(15)
        .to_string(index=False)
    )

    # --------------------------------------------------------
    # Save CSV
    # --------------------------------------------------------

    output_csv = (
        f"{REPORT_DIR}/"
        f"feature_importance_{horizon}d.csv"
    )

    importance_df.to_csv(
        output_csv,
        index=False
    )

    print(
        f"\nSaved: {output_csv}"
    )

    # --------------------------------------------------------
    # Plot top 15
    # --------------------------------------------------------

    top = importance_df.head(15)

    plt.figure(
        figsize=(10, 7)
    )

    plt.barh(
        top["feature"][::-1],
        top["importance"][::-1]
    )

    plt.xlabel(
        "XGBoost Feature Importance"
    )

    plt.ylabel(
        "Feature"
    )

    plt.title(
        f"Top 15 Features — "
        f"{horizon}-Day Freight Forecast"
    )

    plt.tight_layout()

    output_png = (
        f"{REPORT_DIR}/"
        f"feature_importance_{horizon}d.png"
    )

    plt.savefig(
        output_png,
        dpi=200
    )

    plt.close()

    print(
        f"Plot saved: {output_png}"
    )


def main():

    os.makedirs(
        REPORT_DIR,
        exist_ok=True
    )

    for horizon in HORIZONS:

        analyze_model(horizon)

    print(
        "\nFeature analysis complete."
    )


if __name__ == "__main__":
    main()