from typing import Optional

import google.generativeai as genai

try:
    from .config import get_gemini_api_key
    from .filters import (
        is_emergency_query,
        NON_MEDICAL_RESPONSE,
        EMERGENCY_RESPONSE,
    )
except ImportError:
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

HEALTH_TIPS_PROMPT = """You write brief wellness tips for a general health app dashboard.

Output EXACTLY 3 tips, one tip per line (3 lines total).
Each tip: one short sentence, under 100 characters if possible, plain language.
Focus on: hydration, movement, sleep, balanced meals, stress balance, or healthy habits.
General wellness only. Do NOT diagnose. Do NOT prescribe medications. Do not address specific diseases.
No numbering, no bullets, no markdown symbols — plain text only, one sentence per line."""


_model: Optional[genai.GenerativeModel] = None


def _get_model() -> genai.GenerativeModel:
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


def generate_dashboard_health_tips() -> list[str]:
    """Return exactly 3 wellness tips from Gemini for the dashboard."""
    model = _get_model()
    response = model.generate_content(HEALTH_TIPS_PROMPT)
    text = getattr(response, "text", None) or str(response)
    lines: list[str] = []
    for raw in text.splitlines():
        t = raw.strip()
        if not t:
            continue
        t = t.lstrip("0123456789.-•*·\t) ").strip()
        if t.startswith(("-", "*")):
            t = t[1:].strip()
        if t:
            lines.append(t[:220])
    fillers = [
        "Drink water regularly through the day.",
        "Take short walking breaks if you sit for long periods.",
        "Prioritize consistent sleep when you can.",
    ]
    while len(lines) < 3:
        lines.append(fillers[len(lines) % len(fillers)])
    return lines[:3]

