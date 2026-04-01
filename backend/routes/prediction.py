from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, HTTPException

try:
    from ..models.schemas import (
        DiabetesRequest,
        HeartRequest,
        KidneyRequest,
        LiverRequest,
        PredictionResponse,
    )
    from ..utils.model_loader import load_artifact
    from ..utils.preprocessing import preprocess_input
except ImportError:
    from models.schemas import (
        DiabetesRequest,
        HeartRequest,
        KidneyRequest,
        LiverRequest,
        PredictionResponse,
    )
    from utils.model_loader import load_artifact
    from utils.preprocessing import preprocess_input

router = APIRouter(prefix="/predict", tags=["prediction"])


def _make_response(prediction_class: int, probability: float) -> PredictionResponse:
    probability_pct = probability * 100

    if probability_pct >= 70:
        prediction_label = "High Risk"
        message = "There may be a risk. Please consult a doctor."
    elif probability_pct >= 40:
        prediction_label = "Medium Risk"
        message = "There may be a moderate risk. Please consult a doctor for guidance."
    else:
        prediction_label = "Low Risk"
        message = "The risk appears lower, but regular checkups are recommended."

    # Preserve model class output for possible downstream logic/logging.
    _ = prediction_class

    return PredictionResponse(
        prediction=prediction_label,
        probability=f"{round(probability_pct)}%",
        message=message,
    )


def _predict(model_filename: str, payload_dict: Dict[str, Any]) -> PredictionResponse:
    try:
        artifact = load_artifact(model_filename)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    model = artifact["model"]
    features_df = preprocess_input(payload_dict, artifact)

    pred_class = int(model.predict(features_df)[0])
    pred_prob = float(model.predict_proba(features_df)[0][1])
    return _make_response(pred_class, pred_prob)


@router.post("/diabetes", response_model=PredictionResponse)
async def predict_diabetes(payload: DiabetesRequest) -> PredictionResponse:
    return _predict("diabetes_model.pkl", payload.model_dump())


@router.post("/heart", response_model=PredictionResponse)
async def predict_heart(payload: HeartRequest) -> PredictionResponse:
    return _predict("heart_model.pkl", payload.model_dump())


@router.post("/liver", response_model=PredictionResponse)
async def predict_liver(payload: LiverRequest) -> PredictionResponse:
    return _predict("liver_model.pkl", payload.model_dump())


@router.post("/kidney", response_model=PredictionResponse)
async def predict_kidney(payload: KidneyRequest) -> PredictionResponse:
    return _predict("kidney_model.pkl", payload.model_dump())
