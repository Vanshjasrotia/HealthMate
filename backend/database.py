from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = "sqlite:///./healthmate.db"


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _ensure_chat_conversation_columns() -> None:
    """Add chat_threads schema to existing SQLite DBs; backfill legacy flat messages."""
    from sqlalchemy import inspect, text
    import orm_models  # noqa: F401
    from orm_models import ChatConversation, ChatMessage

    insp = inspect(engine)
    if "chat_messages" not in insp.get_table_names():
        return

    cols = {c["name"] for c in insp.get_columns("chat_messages")}
    with engine.begin() as conn:
        if "conversation_id" not in cols:
            conn.execute(
                text(
                    "ALTER TABLE chat_messages ADD COLUMN conversation_id INTEGER "
                    "REFERENCES chat_conversations(id)"
                )
            )

    session = SessionLocal()
    try:
        orphan = (
            session.query(ChatMessage).filter(ChatMessage.conversation_id.is_(None)).first()
        )
        if not orphan:
            return

        q = (
            session.query(ChatMessage.user_id)
            .filter(ChatMessage.conversation_id.is_(None), ChatMessage.user_id.isnot(None))
            .distinct()
        )
        for (uid,) in q.all():
            msgs = (
                session.query(ChatMessage)
                .filter(ChatMessage.user_id == uid, ChatMessage.conversation_id.is_(None))
                .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
                .all()
            )
            if not msgs:
                continue
            first_user = next((m.content for m in msgs if m.role == "user"), "Chat")
            preview = (first_user or "Chat").strip().replace("\n", " ")[:120]
            conv = ChatConversation(
                user_id=uid,
                preview=preview or "Chat",
                created_at=msgs[0].created_at,
                updated_at=msgs[-1].created_at,
            )
            session.add(conv)
            session.flush()
            for m in msgs:
                m.conversation_id = conv.id
                if m.user_id is None:
                    m.user_id = uid
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def _ensure_user_age_column() -> None:
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "users" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("users")}
    if "age" not in cols:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN age INTEGER"))


def _ensure_user_health_tips_column() -> None:
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "users" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("users")}
    if "health_tips_json" not in cols:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN health_tips_json TEXT"))


def _ensure_reminder_dosage_and_frequency() -> None:
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "reminders" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("reminders")}
    with engine.begin() as conn:
        if "dosage" not in cols:
            conn.execute(text("ALTER TABLE reminders ADD COLUMN dosage VARCHAR(100)"))
    # Widen frequency column if still VARCHAR(50) — SQLite ignores length; no-op for width.


def init_db() -> None:
    """Create database tables if they do not exist (SQLite)."""
    import orm_models  # noqa: F401 — register models on metadata

    Base.metadata.create_all(bind=engine)
    _ensure_user_age_column()
    _ensure_user_health_tips_column()
    _ensure_reminder_dosage_and_frequency()
    _ensure_chat_conversation_columns()
