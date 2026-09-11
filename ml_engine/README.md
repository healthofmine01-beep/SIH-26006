# CargoPredict — Machine Learning Engine

Independent machine learning engine providing multi-horizon freight rate forecasting using trained **XGBoost** pipelines.

---

## Directory Structure
```
ml_engine/
├── models/
│   ├── xgboost_14d.joblib       # 14-day horizon model artifact (MAPE 4.2%)
│   ├── xgboost_30d.joblib       # 30-day horizon model artifact (MAPE 5.1%)
│   └── xgboost_90d.joblib       # 90-day horizon model artifact (MAPE 6.8%)
├── src/
│   ├── inference.py             # Inference pipeline with ColumnTransformer
│   ├── predict.py               # Standalone prediction interface
│   ├── xgboost_model.py         # Model pipeline definitions
│   ├── features.py              # Feature extraction and engineering
│   ├── preprocessing.py         # Data normalization and categorical encoders
│   ├── evaluate_models.py       # Metrics evaluation (MAE, RMSE, WAPE, R²)
│   ├── train_xgboost.py         # Model training script
│   └── data_contract.py         # Feature vector schema validation
├── configs/
│   ├── model_config.yaml        # Model hyperparameters and horizon configs
│   └── validation_rules.yaml    # Data schema validation rules
├── reports/
│   └── model_comparison.csv     # Empirical benchmark evaluation results
├── tests/                       # Dedicated ML test cases
└── requirements.txt             # ML dependencies (xgboost, scikit-learn, joblib)
```

---

## Integration with CargoPredict
The backend service [`backend/app/services/ml_engine.py`](file:///c:/Users/DC/Downloads/SIH_DATA_PIPE-main/backend/app/services/ml_engine.py) accesses these models through the singleton `MLForecastEngine`:
1. Fetches feature vector from Supabase PostgreSQL table `ml.ml_freight_daily`.
2. Loads cached model pipeline from `ml_engine/models/xgboost_<horizon>d.joblib`.
3. Evaluates predictions and confidence intervals.
