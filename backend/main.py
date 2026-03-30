import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth_middleware import AuthMiddleware
from auth_routes import router as auth_router
from chatbot import generate_chat_reply
from database import Base, engine
from reminder_events_routes import router as reminder_events_router
from reminder_scheduler import start_reminder_scheduler, stop_reminder_scheduler
from reminder_ws import set_event_loop
from reminder_ws_routes import router as reminder_ws_router
from reminders_routes import router as reminders_router


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


app = FastAPI(title="HealthMate Chatbot API")

Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuthMiddleware)
app.include_router(auth_router)
app.include_router(reminders_router)
app.include_router(reminder_events_router)
app.include_router(reminder_ws_router)


@app.on_event("startup")
async def startup_events():
    set_event_loop(asyncio.get_running_loop())
    start_reminder_scheduler()


@app.on_event("shutdown")
async def shutdown_events():
    stop_reminder_scheduler()


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    reply = generate_chat_reply(payload.message)
    return ChatResponse(reply=reply)


