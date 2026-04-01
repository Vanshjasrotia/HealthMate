from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from reminder_ws import connect_user, disconnect_user
from security import decode_access_token


router = APIRouter(tags=["reminder-ws"])


@router.websocket("/ws/reminders")
async def reminders_websocket(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = int(payload["sub"])
    await connect_user(user_id, websocket)

    try:
        while True:
            # Keep the connection alive and allow optional client ping messages.
            await websocket.receive_text()
    except WebSocketDisconnect:
        disconnect_user(user_id, websocket)
    except Exception:
        disconnect_user(user_id, websocket)
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
