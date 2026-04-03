"""Persist optional activity when a JWT-authenticated user runs predictions or uploads reports."""

from sqlalchemy.orm import Session

from orm_models import Prediction, Report


def log_prediction(
    db: Session,
    user_id: int | None,
    disease: str,
    result: str,
    probability: str,
) -> None:
    if user_id is None:
        return
    try:
        db.add(
            Prediction(
                user_id=user_id,
                disease=disease,
                result=result,
                probability=probability,
            )
        )
        db.commit()
    except Exception:
        db.rollback()


def log_report_upload(db: Session, user_id: int | None, filename: str | None) -> None:
    if user_id is None:
        return
    try:
        db.add(Report(user_id=user_id, filename=filename or "report"))
        db.commit()
    except Exception:
        db.rollback()
