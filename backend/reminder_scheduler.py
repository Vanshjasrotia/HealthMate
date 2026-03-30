from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Reminder
from reminder_events import trigger_reminder_event
from reminder_ws import push_reminder_notification


_scheduler = BackgroundScheduler()
_trigger_guard: set[str] = set()


def _is_frequency_match(frequency: str, now: datetime) -> bool:
    value = (frequency or "").strip().lower()
    if value in {"", "daily", "everyday"}:
        return True
    if value == "weekdays":
        return now.weekday() < 5
    if value == "weekends":
        return now.weekday() >= 5
    if value == "once":
        return True
    # Unknown values are treated as daily for backward compatibility.
    return True


def fetch_due_reminders(db: Session, now: datetime | None = None) -> list[Reminder]:
    current = now or datetime.now()
    today = current.date()
    current_hour = current.time().hour
    current_minute = current.time().minute

    candidates = (
        db.query(Reminder)
        .filter(
            Reminder.start_date <= today,
            Reminder.end_date >= today,
        )
        .all()
    )

    due: list[Reminder] = []
    for reminder in candidates:
        reminder_time = reminder.time
        if reminder_time.hour != current_hour or reminder_time.minute != current_minute:
            continue
        if not _is_frequency_match(reminder.frequency, current):
            continue
        if reminder.frequency.strip().lower() == "once" and reminder.start_date != today:
            continue
        due.append(reminder)
    return due


def _trigger_due_reminders():
    now = datetime.now()
    db = SessionLocal()
    try:
        for reminder in fetch_due_reminders(db, now):
            guard_key = f"{reminder.id}:{now.strftime('%Y-%m-%d %H:%M')}"
            if guard_key in _trigger_guard:
                continue
            _trigger_guard.add(guard_key)
            notification_payload = {
                "type": "reminder_due",
                "user_id": reminder.user_id,
                "reminder_id": reminder.id,
                "medicine_name": reminder.medicine_name,
                "time": reminder.time.strftime("%H:%M"),
                "message": f"Time to take {reminder.medicine_name}",
            }
            trigger_reminder_event(
                user_id=reminder.user_id,
                reminder_id=reminder.id,
                medicine_name=reminder.medicine_name,
                reminder_time=reminder.time.strftime("%H:%M"),
            )
            push_reminder_notification(reminder.user_id, notification_payload)
    finally:
        db.close()


def start_reminder_scheduler():
    if _scheduler.running:
        return
    _scheduler.add_job(
        _trigger_due_reminders,
        trigger="interval",
        minutes=1,
        id="reminder-check-job",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    _scheduler.start()


def stop_reminder_scheduler():
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
