from __future__ import annotations

from typing import Any, Dict

import pandas as pd


def preprocess_input(payload: Dict[str, Any], artifact: Dict[str, Any]) -> pd.DataFrame:
    features = artifact["features"]
    optional_features = set(artifact.get("optional_features", []))
    medians = artifact.get("medians", {})
    categorical_maps = artifact.get("categorical_maps", {})

    row: Dict[str, Any] = {}
    for feature in features:
        value = payload.get(feature)
        if value is None and feature in optional_features:
            value = medians.get(feature)
        row[feature] = value

    df = pd.DataFrame([row], columns=features)

    for column, mapping in categorical_maps.items():
        if column in df.columns:
            df[column] = (
                df[column]
                .astype(str)
                .str.strip()
                .str.lower()
                .map(mapping)
            )

    for col in features:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.fillna(medians)
    return df
