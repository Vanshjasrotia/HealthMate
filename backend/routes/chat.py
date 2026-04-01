from fastapi import APIRouter

try:
    from ..chatbot import generate_chat_reply
    from ..models.schemas import ChatRequest, ChatResponse
except ImportError:
    from chatbot import generate_chat_reply
    from models.schemas import ChatRequest, ChatResponse

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    reply = generate_chat_reply(payload.message)
    return ChatResponse(reply=reply)
