from collections import defaultdict
from datetime import datetime, timezone
from threading import Lock


_events_by_user: dict[int, list[dict]] = defaultdict(list)
_events_lock = Lock()
_max_events_per_user = 100


def trigger_reminder_event(user_id: int, reminder_id: int, medicine_name: str, reminder_time: str):
    event = {
        "type": "reminder_due",
        "user_id": user_id,
        "reminder_id": reminder_id,
        "medicine_name": medicine_name,
        "time": reminder_time,
        "triggered_at": datetime.now(timezone.utc).isoformat(),
    }

    with _events_lock:
        user_events = _events_by_user[user_id]
        user_events.append(event)
        if len(user_events) > _max_events_per_user:
            del user_events[:-_max_events_per_user]


def pop_user_events(user_id: int) -> list[dict]:
    with _events_lock:
        events = _events_by_user.get(user_id, [])
        _events_by_user[user_id] = []
        return events
