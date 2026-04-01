from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .routes import chat_router, prediction_router, report_router
except ImportError:
    from routes import chat_router, prediction_router, report_router

app = FastAPI(title="HealthMate API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(prediction_router)
app.include_router(report_router)


