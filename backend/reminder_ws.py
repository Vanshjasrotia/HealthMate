import asyncio
from collections import defaultdict
from threading import Lock

from fastapi import WebSocket


_connections: dict[int, set[WebSocket]] = defaultdict(set)
_connections_lock = Lock()
_event_loop: asyncio.AbstractEventLoop | None = None


def set_event_loop(loop: asyncio.AbstractEventLoop):
    global _event_loop
    _event_loop = loop


async def connect_user(user_id: int, websocket: WebSocket):
    await websocket.accept()
    with _connections_lock:
        _connections[user_id].add(websocket)


def disconnect_user(user_id: int, websocket: WebSocket):
    with _connections_lock:
        user_connections = _connections.get(user_id, set())
        user_connections.discard(websocket)
        if not user_connections and user_id in _connections:
            del _connections[user_id]


async def _broadcast_to_user(user_id: int, payload: dict):
    with _connections_lock:
        sockets = list(_connections.get(user_id, set()))

    for socket in sockets:
        try:
            await socket.send_json(payload)
        except Exception:
            disconnect_user(user_id, socket)


def push_reminder_notification(user_id: int, payload: dict):
    if _event_loop is None or _event_loop.is_closed():
        return
    asyncio.run_coroutine_threadsafe(_broadcast_to_user(user_id, payload), _event_loop)
