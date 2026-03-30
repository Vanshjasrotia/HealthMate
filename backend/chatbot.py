from typing import Any, Optional

try:
    import google.generativeai as genai
except Exception:  # pragma: no cover - dependency might be unavailable in some setups
    genai = None

from config import get_gemini_api_key
from filters import (
    is_emergency_query,
    NON_MEDICAL_RESPONSE,
    EMERGENCY_RESPONSE,
)


CLASSIFY_PROMPT = """You are a classifier. The user will send a message. Decide if it is a medical or health-related question (including symptoms, conditions, medicines, body, mental health, diet, pregnancy, etc.). Reply with exactly one word: MEDICAL or NON_MEDICAL. Do not add any other text, explanation, or punctuation."""

SYSTEM_PROMPT = """You are a medical support assistant for a student healthcare project named HealthMate.

Rules:
- Answer only medical and health related questions.
- Do NOT provide diagnosis.
- Do NOT prescribe medicines.
- Provide general medical awareness only.
- Always recommend consulting a qualified doctor.
- If the question is not medical or not health-related, reply with exactly:
'I’m designed to answer only medical-related questions.'"""

MODEL_NAME = "gemini-2.5-flash"


_model: Optional[Any] = None


def _get_model():
    if genai is None:
        raise RuntimeError("google-generativeai dependency is not available.")
    global _model
    if _model is None:
        api_key = get_gemini_api_key()
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel(MODEL_NAME)
    return _model


def _classify_medical(message: str) -> bool:
    model = _get_model()
    prompt = f"{CLASSIFY_PROMPT}\n\nUser message:\n{message.strip()}"
    response = model.generate_content(prompt)
    text = getattr(response, "text", None) or str(response)
    return "MEDICAL" in text.strip().upper()


def _call_gemini_answer(user_message: str) -> str:
    model = _get_model()
    prompt = f"{SYSTEM_PROMPT}\n\nUser question:\n{user_message.strip()}"
    response = model.generate_content(prompt)
    text = getattr(response, "text", None)
    if not text:
        text = str(response)
    return text.strip()


def generate_chat_reply(message: str) -> str:
    if not message or not message.strip():
        return NON_MEDICAL_RESPONSE

    if is_emergency_query(message):
        return EMERGENCY_RESPONSE

    try:
        if not _classify_medical(message):
            return NON_MEDICAL_RESPONSE
        reply = _call_gemini_answer(message)
    except Exception as e:
        import traceback
        print("Gemini error:", repr(e))
        traceback.print_exc()
        reply = (
            "Sorry, I'm unable to process your request at the moment. "
            "Please try again later and consult a qualified doctor for medical advice."
        )
    return reply

