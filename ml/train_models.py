"""
Train Random Forest models for HealthMate disease prediction.

This script:
- Trains separate models for diabetes, heart, liver, kidney disease
- Uses only requested features
- Applies dataset-specific preprocessing
- Evaluates with accuracy/precision/recall/F1
- Saves model artifacts with preprocessing metadata for inference
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

RANDOM_STATE = 42
TEST_SIZE = 0.2

DATA_DIR = Path(__file__).resolve().parent / "data"
MODELS_DIR = Path(__file__).resolve().parent / "models"

RF_PARAMS = {
    "n_estimators": 300,
    "max_depth": 8,
    "min_samples_split": 5,
    "class_weight": "balanced",
    "random_state": RANDOM_STATE,
}

DIABETES_FEATURES = ["Glucose", "BloodPressure", "BMI", "Age", "Insulin"]
HEART_FEATURES = ["Age", "Sex", "ChestPainType", "Cholesterol", "MaxHeartRate", "ExerciseAngina"]
LIVER_FEATURES = ["Age", "Gender", "TotalBilirubin", "DirectBilirubin", "SGPT", "SGOT"]
KIDNEY_FEATURES = ["Age", "BloodPressure", "Creatinine", "Hemoglobin", "Albumin"]


def _evaluate(y_true: pd.Series, y_pred: np.ndarray) -> Dict[str, float]:
    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, zero_division=0),
        "recall": recall_score(y_true, y_pred, zero_division=0),
        "f1_score": f1_score(y_true, y_pred, zero_division=0),
    }


def _fit_rf(X: pd.DataFrame, y: pd.Series) -> Tuple[RandomForestClassifier, Dict[str, float]]:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    model = RandomForestClassifier(**RF_PARAMS)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    return model, _evaluate(y_test, y_pred)


def _save_artifact(filename: str, artifact: Dict[str, Any]) -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, MODELS_DIR / filename)


def _normalize_heart_columns(df: pd.DataFrame) -> pd.DataFrame:
    renamed = df.rename(
        columns={
            "age": "Age",
            "sex": "Sex",
            "cp": "ChestPainType",
            "chol": "Cholesterol",
            "thalch": "MaxHeartRate",
            "exang": "ExerciseAngina",
            "num": "Target",
        }
    )
    if "Target" in renamed.columns:
        renamed["Target"] = pd.to_numeric(renamed["Target"], errors="coerce")
        renamed["Target"] = (renamed["Target"] > 0).astype(int)
    return renamed


def _normalize_liver_columns(df: pd.DataFrame) -> pd.DataFrame:
    # Some files are shipped without header, so detect and assign canonical names.
    if "Dataset" not in df.columns:
        df = pd.read_csv(
            DATA_DIR / "liver.csv",
            header=None,
            names=[
                "Age",
                "Gender",
                "TotalBilirubin",
                "DirectBilirubin",
                "Alkphos",
                "SGPT",
                "SGOT",
                "TotalProteins",
                "Albumin",
                "AGRatio",
                "Dataset",
            ],
        )
    return df


def train_diabetes() -> Dict[str, float]:
    df = pd.read_csv(DATA_DIR / "diabetes.csv")
    target_col = "Outcome"

    X = df[DIABETES_FEATURES].copy()
    y = df[target_col].astype(int)

    zero_invalid = ["Glucose", "BloodPressure", "BMI", "Insulin"]
    for col in zero_invalid:
        X[col] = X[col].replace(0, np.nan)
    medians = {col: float(X[col].median()) for col in DIABETES_FEATURES}
    X = X.fillna(medians)

    model, metrics = _fit_rf(X, y)
    _save_artifact(
        "diabetes_model.pkl",
        {
            "disease": "diabetes",
            "features": DIABETES_FEATURES,
            "optional_features": ["Insulin"],
            "medians": medians,
            "categorical_maps": {},
            "target_positive_label": "High Risk",
            "model": model,
        },
    )
    return metrics


def train_heart() -> Dict[str, float]:
    df = pd.read_csv(DATA_DIR / "heart.csv")
    df = _normalize_heart_columns(df)

    X = df[HEART_FEATURES].copy()
    y = df["Target"].astype(int)

    for col in ["Age", "Cholesterol", "MaxHeartRate"]:
        X[col] = pd.to_numeric(X[col], errors="coerce")

    sex_map = {"male": 1, "female": 0}
    cp_map = {
        "typical angina": 0,
        "atypical angina": 1,
        "non-anginal": 2,
        "asymptomatic": 3,
    }
    exang_map = {"true": 1, "false": 0, "yes": 1, "no": 0}

    X["Sex"] = X["Sex"].astype(str).str.strip().str.lower().map(sex_map)
    X["ChestPainType"] = X["ChestPainType"].astype(str).str.strip().str.lower().map(cp_map)
    X["ExerciseAngina"] = X["ExerciseAngina"].astype(str).str.strip().str.lower().map(exang_map)

    medians = {col: float(X[col].median()) for col in HEART_FEATURES}
    X = X.fillna(medians)

    model, metrics = _fit_rf(X, y)
    _save_artifact(
        "heart_model.pkl",
        {
            "disease": "heart",
            "features": HEART_FEATURES,
            "optional_features": [],
            "medians": medians,
            "categorical_maps": {
                "Sex": sex_map,
                "ChestPainType": cp_map,
                "ExerciseAngina": exang_map,
            },
            "target_positive_label": "High Risk",
            "model": model,
        },
    )
    return metrics


def train_liver() -> Dict[str, float]:
    df = pd.read_csv(DATA_DIR / "liver.csv")
    df = _normalize_liver_columns(df)

    X = df[LIVER_FEATURES].copy()
    y = df["Dataset"].map({1: 1, 2: 0}).astype(int)

    X["Gender"] = X["Gender"].astype(str).str.strip().str.lower().map({"male": 1, "female": 0})
    for col in ["Age", "TotalBilirubin", "DirectBilirubin", "SGPT", "SGOT"]:
        X[col] = pd.to_numeric(X[col], errors="coerce")

    medians = {col: float(X[col].median()) for col in LIVER_FEATURES}
    X = X.fillna(medians)

    model, metrics = _fit_rf(X, y)
    _save_artifact(
        "liver_model.pkl",
        {
            "disease": "liver",
            "features": LIVER_FEATURES,
            "optional_features": [],
            "medians": medians,
            "categorical_maps": {"Gender": {"male": 1, "female": 0}},
            "target_positive_label": "High Risk",
            "model": model,
        },
    )
    return metrics


def train_kidney() -> Dict[str, float]:
    df = pd.read_csv(DATA_DIR / "kidney.csv")
    renamed = df.rename(
        columns={
            "age": "Age",
            "bp": "BloodPressure",
            "sc": "Creatinine",
            "hemo": "Hemoglobin",
            "al": "Albumin",
            "classification": "Target",
        }
    )

    X = renamed[KIDNEY_FEATURES].copy()
    y = renamed["Target"].astype(str).str.strip().str.lower().map({"ckd": 1, "notckd": 0, "ckd\t": 1, "notckd\t": 0})

    for col in KIDNEY_FEATURES:
        X[col] = pd.to_numeric(X[col], errors="coerce")

    valid_rows = y.notna()
    X = X.loc[valid_rows]
    y = y.loc[valid_rows].astype(int)

    medians = {col: float(X[col].median()) for col in KIDNEY_FEATURES}
    X = X.fillna(medians)

    model, metrics = _fit_rf(X, y)
    _save_artifact(
        "kidney_model.pkl",
        {
            "disease": "kidney",
            "features": KIDNEY_FEATURES,
            "optional_features": [],
            "medians": medians,
            "categorical_maps": {},
            "target_positive_label": "High Risk",
            "model": model,
        },
    )
    return metrics


def main() -> None:
    trainers = [
        ("diabetes", train_diabetes),
        ("heart", train_heart),
        ("liver", train_liver),
        ("kidney", train_kidney),
    ]
    print("Training disease models for HealthMate...")
    for disease, fn in trainers:
        metrics = fn()
        print(f"\n{disease.upper()} metrics:")
        for key, value in metrics.items():
            print(f"- {key}: {value:.4f}")
    print("\nSaved model files in ml/models/")


if __name__ == "__main__":
    main()
