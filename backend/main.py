from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .auth_middleware import AuthMiddleware
    from .auth_routes import router as auth_router
    from .database import init_db
    from .reminders_routes import router as reminders_router
    from .routes import chat_router, dashboard_router, prediction_router, report_router
except ImportError:
    from auth_middleware import AuthMiddleware
    from auth_routes import router as auth_router
    from database import init_db
    from reminders_routes import router as reminders_router
    from routes import chat_router, dashboard_router, prediction_router, report_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Create SQLite tables (users, reminders, predictions, reports) if missing.
    init_db()
    yield


app = FastAPI(title="HealthMate API", version="1.0.0", lifespan=lifespan)

# Last registered middleware runs first on incoming requests — put CORS outermost.
app.add_middleware(AuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(prediction_router)
app.include_router(report_router)
app.include_router(dashboard_router)
app.include_router(reminders_router)
