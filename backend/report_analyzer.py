from __future__ import annotations

import json
from typing import Any

import google.generativeai as genai

try:
    from .config import get_gemini_api_key
except ImportError:
    from config import get_gemini_api_key


MODEL_NAME = "gemini-2.5-flash"

ANALYZER_PROMPT = """
You are a medical report extraction assistant.
Read the uploaded lab report and return ONLY valid JSON with this schema:
{
  "summary": "2-4 sentence plain-language summary for patient",
  "extracted_values": [
    {
      "name": "Parameter name",
      "value": "Observed value with unit",
      "normal": true,
      "note": "Optional short explanation"
    }
  ],
  "abnormal_parameters": ["Parameter: value (reason)"],
  "remedies": [
    "Practical, safe lifestyle action to improve abnormal values",
    "Another specific remedy suggestion"
  ]
}

Rules:
- Include the most clinically relevant values you can read confidently.
- If a value seems out of range, set normal=false.
- If uncertain, still include with note mentioning uncertainty.
- If there are abnormal values, add 3-6 practical remedies (diet, hydration, exercise, follow-up tests).
- Remedies must be general wellness guidance, not prescriptions or medication dosages.
- Include a doctor-consult reminder in at least one remedy.
- If no abnormal values are detected, remedies can include preventive habits.
- Return JSON only. No markdown or extra text.
"""


def _build_payload(file_bytes: bytes, content_type: str, filename: str) -> list[Any]:
    if content_type.startswith("text/"):
        text = file_bytes.decode("utf-8", errors="ignore")
        return [ANALYZER_PROMPT, f"Filename: {filename}\n\n{text}"]

    inline_part = {"mime_type": content_type, "data": file_bytes}
    return [ANALYZER_PROMPT, inline_part]


def analyze_report(file_bytes: bytes, content_type: str, filename: str) -> dict[str, Any]:
    api_key = get_gemini_api_key()
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(MODEL_NAME)

    payload = _build_payload(file_bytes, content_type, filename)
    response = model.generate_content(payload)
    response_text = (getattr(response, "text", "") or "").strip()

    cleaned = response_text.strip("`")
    if cleaned.lower().startswith("json"):
        cleaned = cleaned[4:].strip()
    result = json.loads(cleaned)

    result.setdefault("summary", "Unable to generate summary from this report.")
    result.setdefault("extracted_values", [])
    result.setdefault("abnormal_parameters", [])
    result.setdefault("remedies", [])
    return result
