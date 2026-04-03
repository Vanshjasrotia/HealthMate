from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

try:
    from ..auth_dependencies import get_authenticated_user_id, get_optional_user_id
    from ..chatbot import generate_chat_reply
    from ..database import get_db
    from ..models.schemas import (
        ChatConversationOut,
        ChatConversationsResponse,
        ChatHistoryItem,
        ChatHistoryResponse,
        ChatRequest,
        ChatResponse,
    )
    from ..orm_models import ChatConversation, ChatMessage
except ImportError:
    from auth_dependencies import get_authenticated_user_id, get_optional_user_id
    from chatbot import generate_chat_reply
    from database import get_db
    from models.schemas import (
        ChatConversationOut,
        ChatConversationsResponse,
        ChatHistoryItem,
        ChatHistoryResponse,
        ChatRequest,
        ChatResponse,
    )
    from orm_models import ChatConversation, ChatMessage

router = APIRouter(tags=["chat"])

_MAX_STORED_LEN = 16_000


def _preview_snippet(message: str, max_len: int = 100) -> str:
    t = (message or "").strip().replace("\n", " ")
    if len(t) <= max_len:
        return t or "New chat"
    return t[: max_len - 1] + "…"


def _persist_exchange(
    db: Session,
    *,
    user_id: int,
    conversation_id: int,
    user_text: str,
    assistant_text: str,
) -> None:
    now = datetime.now(timezone.utc)
    u = (user_text or "")[:_MAX_STORED_LEN]
    a = (assistant_text or "")[:_MAX_STORED_LEN]
    db.add(
        ChatMessage(
            user_id=user_id,
            conversation_id=conversation_id,
            role="user",
            content=u,
            created_at=now,
        )
    )
    db.add(
        ChatMessage(
            user_id=user_id,
            conversation_id=conversation_id,
            role="assistant",
            content=a,
            created_at=now,
        )
    )
    conv = db.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()
    if conv:
        conv.updated_at = now
    db.commit()


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(
    request: Request,
    payload: ChatRequest,
    db: Session = Depends(get_db),
) -> ChatResponse:
    reply = generate_chat_reply(payload.message)
    user_id = get_optional_user_id(request)
    msg = (payload.message or "").strip()

    if not user_id or not msg:
        return ChatResponse(reply=reply, conversation_id=None)

    conv_id = payload.conversation_id
    now = datetime.now(timezone.utc)

    try:
        if conv_id is not None:
            conv = (
                db.query(ChatConversation)
                .filter(ChatConversation.id == conv_id, ChatConversation.user_id == user_id)
                .first()
            )
            if not conv:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
        else:
            conv = ChatConversation(
                user_id=user_id,
                preview=_preview_snippet(msg, 120),
                created_at=now,
                updated_at=now,
            )
            db.add(conv)
            db.flush()
            conv_id = conv.id

        _persist_exchange(db, user_id=user_id, conversation_id=conv_id, user_text=msg, assistant_text=reply)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback

        print("Chat persist error:", repr(e))
        traceback.print_exc()
        return ChatResponse(reply=reply, conversation_id=None)

    return ChatResponse(reply=reply, conversation_id=conv_id)


@router.get("/chat/conversations", response_model=ChatConversationsResponse)
def list_conversations(
    request: Request,
    db: Session = Depends(get_db),
    limit: int | None = Query(default=None, ge=1, le=100),
) -> ChatConversationsResponse:
    user_id = get_authenticated_user_id(request)
    q = (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == user_id)
        .order_by(desc(ChatConversation.updated_at), desc(ChatConversation.id))
    )
    if limit is not None:
        q = q.limit(limit)
    rows = q.all()
    conversations = [
        ChatConversationOut(
            id=r.id,
            preview=r.preview,
            updated_at=r.updated_at.isoformat() if r.updated_at else "",
        )
        for r in rows
    ]
    return ChatConversationsResponse(conversations=conversations)


@router.get("/chat/history", response_model=ChatHistoryResponse)
def chat_history(
    request: Request,
    db: Session = Depends(get_db),
    conversation_id: int = Query(..., description="Chat thread id"),
    limit: int = 200,
) -> ChatHistoryResponse:
    user_id = get_authenticated_user_id(request)
    conv = (
        db.query(ChatConversation)
        .filter(ChatConversation.id == conversation_id, ChatConversation.user_id == user_id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    cap = max(1, min(limit, 500))
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc())
        .limit(cap)
        .all()
    )
    rows = list(reversed(rows))

    messages = [
        ChatHistoryItem(
            id=r.id,
            role=r.role,
            content=r.content,
            created_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in rows
    ]
    return ChatHistoryResponse(messages=messages)
