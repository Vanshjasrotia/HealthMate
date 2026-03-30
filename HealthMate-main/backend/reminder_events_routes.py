from fastapi import APIRouter, Request

from auth_dependencies import get_authenticated_user_id
from reminder_events import pop_user_events


router = APIRouter(tags=["reminder-events"])


@router.get("/reminder-events")
def get_reminder_events(request: Request):
    user_id = get_authenticated_user_id(request)
    events = pop_user_events(user_id)
    return {"events": events}
