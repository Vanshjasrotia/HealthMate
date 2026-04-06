from __future__ import annotations

import asyncio
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


if __package__ in {None, ""}:
    project_root = Path(__file__).resolve().parent.parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))

    from backend.auth_middleware import AuthMiddleware
    from backend.auth_routes import router as auth_router
    from backend.config import get_settings
    from backend.database import init_db
    from backend.reminder_events_routes import router as reminder_events_router
    from backend.reminder_scheduler import start_reminder_scheduler, stop_reminder_scheduler
    from backend.reminder_ws import set_event_loop
    from backend.reminder_ws_routes import router as reminder_ws_router
    from backend.reminders_routes import router as reminders_router
    from backend.routes import chat_router, dashboard_router, prediction_router, report_router
else:
    from .auth_middleware import AuthMiddleware
    from .auth_routes import router as auth_router
    from .config import get_settings
    from .database import init_db
    from .reminder_events_routes import router as reminder_events_router
    from .reminder_scheduler import start_reminder_scheduler, stop_reminder_scheduler
    from .reminder_ws import set_event_loop
    from .reminder_ws_routes import router as reminder_ws_router
    from .reminders_routes import router as reminders_router
    from .routes import chat_router, dashboard_router, prediction_router, report_router


settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    set_event_loop(asyncio.get_running_loop())
    start_reminder_scheduler()
    try:
        yield
    finally:
        stop_reminder_scheduler()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        lifespan=lifespan,
    )

    app.add_middleware(AuthMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health_check():
        return {"status": "ok", "service": settings.app_name, "version": settings.app_version}

    app.include_router(auth_router)
    app.include_router(chat_router)
    app.include_router(prediction_router)
    app.include_router(report_router)
    app.include_router(dashboard_router)
    app.include_router(reminders_router)
    app.include_router(reminder_events_router)
    app.include_router(reminder_ws_router)

    return app


app = create_app()
