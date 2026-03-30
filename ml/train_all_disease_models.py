"""
HealthMate – Train Random Forest classification models for multiple diseases.
Each disease has its own dataset and trained model. Paths are configurable at the top.
"""

import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
)
from sklearn.preprocessing import LabelEncoder

RANDOM_STATE = 42
TEST_SIZE = 0.2
TRAIN_TEST_SPLIT = 1 - TEST_SIZE

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

DATASET_CONFIG = {
    "diabetes": {
        "path": os.path.join(DATA_DIR, "diabetes.csv"),
        "target": "Outcome",
        "invalid_zero_cols": ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"],
    },
    "heart": {
        "path": os.path.join(DATA_DIR, "heart.csv"),
        "target": "target",
        "target_binarize": True,
    },
    "liver": {
        "path": os.path.join(DATA_DIR, "liver.csv"),
        "target": "Dataset",
        "target_map": {1: 1, 2: 0},
    },
    "kidney": {
        "path": os.path.join(DATA_DIR, "kidney.csv"),
        "target": "class",
    },
}

MODEL_OUTPUT_NAMES = {
    "diabetes": "diabetes_model.pkl",
    "heart": "heart_model.pkl",
    "liver": "liver_model.pkl",
    "kidney": "kidney_model.pkl",
}


def load_dataset(file_path):
    """Load CSV from the given path. Raises FileNotFoundError if missing."""
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"Dataset not found: {file_path}")
    df = pd.read_csv(file_path)
    return df


def preprocess_diabetes(df, config):
    """
    Pima Indians Diabetes: handle invalid zeros (replace with NaN then impute),
    separate features and target. Target column: Outcome (0/1).
    """
    df = df.copy()
    target_col = config["target"]
    if target_col not in df.columns and "Diabetes" in df.columns:
        df = df.rename(columns={"Diabetes": "Outcome"})
        target_col = "Outcome"
    for col in config.get("invalid_zero_cols", []):
        if col in df.columns:
            df[col] = df[col].replace(0, np.nan)

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if target_col in numeric_cols:
        numeric_cols.remove(target_col)
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

    y = df[target_col].astype(int)
    X = df.drop(columns=[target_col])
    return X, y


def preprocess_heart(df, config):
    """
    UCI Heart Disease: handle missing values (?), optionally binarize target
    (0 = no disease, 1-4 = disease). Target column often 'target' or 'num'.
    Missing feature values are imputed with median so rows are not dropped.
    """
    df = df.copy()
    df = df.replace("?", np.nan)
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    target_col = config["target"]
    if target_col not in df.columns and "num" in df.columns:
        df["target"] = (df["num"] > 0).astype(int)
        target_col = "target"

    if config.get("target_binarize") and target_col in df.columns:
        if pd.api.types.is_numeric_dtype(df[target_col]) and df[target_col].max() > 1:
            df[target_col] = (df[target_col] > 0).astype(int)

    df = df.dropna(subset=[target_col])
    feature_cols = [c for c in df.columns if c != target_col]
    numeric_features = df[feature_cols].select_dtypes(include=[np.number]).columns.tolist()
    if numeric_features:
        df[numeric_features] = df[numeric_features].fillna(df[numeric_features].median())

    y = df[target_col].astype(int)
    X = df.drop(columns=[target_col], errors="ignore")
    if "num" in X.columns:
        X = X.drop(columns=["num"], errors="ignore")
    return X, y


def preprocess_liver(df, config):
    """
    Indian Liver Patient: encode Gender, map Dataset 1=Liver/2=No to binary 1/0.
    """
    df = df.copy()
    target_col = config["target"]
    if "Selector" in df.columns and target_col not in df.columns:
        df = df.rename(columns={"Selector": "Dataset"})
        target_col = "Dataset"

    if "Gender" in df.columns:
        df["Gender"] = (df["Gender"].astype(str).str.strip().str.lower() == "male").astype(int)

    df[target_col] = df[target_col].map(config.get("target_map", {1: 1, 2: 0}))
    df = df.dropna(subset=[target_col])
    df = df.fillna(df.select_dtypes(include=[np.number]).median())

    y = df[target_col].astype(int)
    X = df.drop(columns=[target_col])
    return X, y


def preprocess_kidney(df, config):
    """
    Chronic Kidney Disease: replace ? with NaN, encode categorical columns,
    separate features and target. Target: class (ckd / notckd).
    """
    df = df.copy()
    target_col = config["target"]
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found. Columns: {list(df.columns)}")

    df = df.replace("?", np.nan)

    for col in df.columns:
        if col == target_col:
            continue
        if df[col].dtype == object:
            try:
                df[col] = pd.to_numeric(df[col], errors="raise")
            except (ValueError, TypeError):
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str).fillna("__missing__"))
        else:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df[target_col] = df[target_col].astype(str).str.strip().str.lower()
    target_map = {"ckd": 1, "notckd": 0, "ckd\t": 1, "notckd\t": 0}
    df[target_col] = df[target_col].map(target_map)
    df = df.dropna(subset=[target_col])

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if target_col in numeric_cols:
        numeric_cols.remove(target_col)
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

    y = df[target_col].astype(int)
    X = df.drop(columns=[target_col])
    return X, y


PREPROCESSORS = {
    "diabetes": preprocess_diabetes,
    "heart": preprocess_heart,
    "liver": preprocess_liver,
    "kidney": preprocess_kidney,
}


def train_and_evaluate(X_train, X_test, y_train, y_test, disease_name):
    """
    Train a Random Forest classifier and compute accuracy, precision, recall, F1,
    and classification report. Returns the fitted model and a dict of metrics.
    """
    model = RandomForestClassifier(random_state=RANDOM_STATE)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, zero_division=0, average="binary"),
        "recall": recall_score(y_test, y_pred, zero_division=0, average="binary"),
        "f1": f1_score(y_test, y_pred, zero_division=0, average="binary"),
    }
    report = classification_report(y_test, y_pred, zero_division=0)
    return model, metrics, report


def save_model(model, disease_name, output_dir):
    """Save the trained model with joblib to output_dir using the configured filename."""
    os.makedirs(output_dir, exist_ok=True)
    filename = MODEL_OUTPUT_NAMES[disease_name]
    path = os.path.join(output_dir, filename)
    joblib.dump(model, path)
    return path


def run_pipeline(disease_name, data_path, config, output_dir):
    """
    Load data, preprocess, split 80/20, train, evaluate, and save model.
    Returns (metrics, report, saved_path) for the caller to print.
    """
    df = load_dataset(data_path)
    preprocess_fn = PREPROCESSORS[disease_name]
    X, y = preprocess_fn(df, config)

    if len(X) == 0 or len(y) == 0:
        raise ValueError(
            "No samples remaining after preprocessing. Check target column name and missing values."
        )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    model, metrics, report = train_and_evaluate(
        X_train, X_test, y_train, y_test, disease_name
    )
    saved_path = save_model(model, disease_name, output_dir)
    return metrics, report, saved_path


def main():
    """Train all four disease models sequentially and print progress and metrics."""
    print("HealthMate – Training all disease models (Random Forest)\n")
    print(f"Data directory: {DATA_DIR}")
    print(f"Models output directory: {MODELS_DIR}\n")

    for disease_name, config in DATASET_CONFIG.items():
        path = config.get("path") or os.path.join(DATA_DIR, f"{disease_name}.csv")
        print("=" * 60)
        print(f"Training model: {disease_name.upper()}")
        print("=" * 60)
        try:
            metrics, report, saved_path = run_pipeline(
                disease_name, path, config, MODELS_DIR
            )
            print(f"Accuracy:  {metrics['accuracy']:.4f}")
            print(f"Precision: {metrics['precision']:.4f}")
            print(f"Recall:    {metrics['recall']:.4f}")
            print(f"F1-score:  {metrics['f1']:.4f}")
            print("\nClassification report:")
            print(report)
            print(f"Model saved: {saved_path}\n")
        except FileNotFoundError as e:
            print(f"SKIP – {e}\n")
        except Exception as e:
            print(f"SKIP – {e}\n")

    print("All requested models have been processed.")


if __name__ == "__main__":
    main()
