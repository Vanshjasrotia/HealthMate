from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any, Dict

import joblib


MODEL_DIR = Path(__file__).resolve().parents[2] / "ml" / "models"


@lru_cache
def load_artifact(model_filename: str) -> Dict[str, Any]:
    model_path = MODEL_DIR / model_filename
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    return joblib.load(model_path)
