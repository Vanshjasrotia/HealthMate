"""Aggregate dashboard metrics for the authenticated user."""

import json
import random
from datetime import date

from sqlalchemy import desc
from sqlalchemy.orm import Session

from orm_models import Prediction, Reminder, Report, User

# Pool for GET /dashboard — exactly 3 tips are chosen at random on each request.
HEALTH_TIP_POOL = [
    "Drink enough water",
    "Exercise regularly",
    "Maintain balanced diet",
    "Sleep at least 7–8 hours",
    "Avoid excessive sugar",
    "Stay physically active",
]


def _random_health_tips() -> list[str]:
    """Return 3 distinct tips; order and selection change per request."""
    return random.sample(HEALTH_TIP_POOL, k=3)


def _stored_health_tips_for_user(db: Session, user_id: int) -> list[str] | None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.health_tips_json:
        return None
    try:
        arr = json.loads(user.health_tips_json)
        if isinstance(arr, list):
            out = [str(x).strip()[:500] for x in arr[:3] if str(x).strip()]
            if len(out) >= 3:
                return out
    except (json.JSONDecodeError, TypeError):
        pass
    return None


def refresh_user_health_tips_from_ai(db: Session, user_id: int) -> list[str]:
    """Generate tips via Gemini, save to user row; on failure use random pool."""
    try:
        from chatbot import generate_dashboard_health_tips

        tips = generate_dashboard_health_tips()
    except Exception as e:
        print("Dashboard health tips AI error:", repr(e))
        tips = _random_health_tips()
    tips = [t.strip() for t in tips if t and str(t).strip()][:3]
    while len(tips) < 3:
        tips.append(_random_health_tips()[0])
    tips = tips[:3]

    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.health_tips_json = json.dumps(tips)
        db.commit()
    return tips


def build_dashboard(db: Session, user_id: int) -> dict:
    total_predictions = db.query(Prediction).filter(Prediction.user_id == user_id).count()

    last = (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(desc(Prediction.created_at))
        .first()
    )
    last_prediction = f"{last.disease} - {last.result}" if last else "No predictions yet"

    reports_uploaded = db.query(Report).filter(Report.user_id == user_id).count()

    today = date.today()
    active_reminders = (
        db.query(Reminder)
        .filter(
            Reminder.user_id == user_id,
            Reminder.start_date <= today,
            Reminder.end_date >= today,
        )
        .count()
    )

    recent_rows = (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(desc(Prediction.created_at))
        .limit(5)
        .all()
    )
    recent_predictions = [
        {
            "disease": r.disease,
            "result": r.result,
            "probability": r.probability,
            "date": r.created_at.date().isoformat() if r.created_at else "",
        }
        for r in recent_rows
    ]

    stored = _stored_health_tips_for_user(db, user_id)
    health_tips = stored if stored else _random_health_tips()

    return {
        "total_predictions": total_predictions,
        "last_prediction": last_prediction,
        "reports_uploaded": reports_uploaded,
        "active_reminders": active_reminders,
        "recent_predictions": recent_predictions,
        "health_tips": health_tips,
    }
