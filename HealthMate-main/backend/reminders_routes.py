from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from auth_dependencies import get_authenticated_user_id
from database import get_db
from models import Reminder
from schemas import ReminderCreateRequest, ReminderOut


router = APIRouter(tags=["reminders"])


@router.post("/reminders", response_model=ReminderOut, status_code=status.HTTP_201_CREATED)
def create_reminder(
    payload: ReminderCreateRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = get_authenticated_user_id(request)
    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="end_date must be greater than or equal to start_date.",
        )

    reminder = Reminder(
        user_id=user_id,
        medicine_name=payload.medicine_name.strip(),
        time=payload.time,
        frequency=payload.frequency.strip(),
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.get("/reminders", response_model=list[ReminderOut])
def list_reminders(request: Request, db: Session = Depends(get_db)):
    user_id = get_authenticated_user_id(request)
    reminders = (
        db.query(Reminder)
        .filter(Reminder.user_id == user_id)
        .order_by(Reminder.start_date.asc(), Reminder.time.asc())
        .all()
    )
    return reminders


@router.delete("/reminders/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(reminder_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_authenticated_user_id(request)
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
        .first()
    )
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found.",
        )

    db.delete(reminder)
    db.commit()
    return None
