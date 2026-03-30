from typing import List


MEDICAL_KEYWORDS: List[str] = [
    "health",
    "healthy",
    "fever",
    "temperature",
    "cold",
    "flu",
    "cough",
    "sore throat",
    "throat",
    "pain",
    "chest",
    "stomach",
    "abdomen",
    "headache",
    "migraine",
    "blood pressure",
    "bp",
    "cholesterol",
    "sugar level",
    "blood sugar",
    "glucose",
    "insulin",
    "diabetes",
    "heart",
    "cardiac",
    "liver",
    "kidney",
    "asthma",
    "allergy",
    "breathing",
    "shortness of breath",
    "nausea",
    "vomiting",
    "diarrhea",
    "constipation",
    "fatigue",
    "weakness",
    "dizziness",
    "injury",
    "fracture",
    "wound",
    "burn",
    "infection",
    "symptom",
    "symptoms",
    "disease",
    "illness",
    "report",
    "lab report",
    "scan",
    "x-ray",
    "medicine",
    "medication",
    "tablet",
    "pill",
    "dose",
    "dosage",
    "prescription",
    "doctor",
    "physician",
    "hospital",
    "clinic",
    "surgeon",
    "operation",
    "surgery",
    "period",
    "menstruation",
    "pregnancy",
    "pregnant",
    "fertility",
    "mental health",
    "anxiety",
    "depression",
    "sleep",
    "insomnia",
    "diet",
    "nutrition",
    "exercise",
    "pcod",
    "pcos",
    "polycystic",
    "ovary",
    "ovarian",
    "thyroid",
    "hormone",
    "hormonal",
    "anemia",
    "arthritis",
    "joint",
    "bones",
    "skin",
    "acne",
    "hair loss",
    "hairfall",
    "weight",
    "obesity",
    "vitamin",
    "immunity",
    "immune",
    "acidity",
    "indigestion",
    "gas",
    "bloating",
    "cyst",
    "uterus",
    "infertility",
    "cancer",
    "tumor",
    "tumour",
    "blood",
    "urine",
    "urinary",
    "bladder",
    "eye",
    "vision",
    "ear",
    "hearing",
    "nose",
    "sinus",
    "teeth",
    "dental",
    "gum",
    "muscle",
    "spine",
    "back",
    "knee",
    "arthritis",
    "rheumatoid",
    "osteoporosis",
    "hypertension",
    "hypothyroidism",
    "hyperthyroidism",
]

EMERGENCY_KEYWORDS: List[str] = [
    "chest pain",
    "breathing difficulty",
    "unconscious",
    "seizure",
    "severe bleeding",
]

NON_MEDICAL_RESPONSE = (
    "I'm designed to answer only medical-related questions. "
    "Please ask something related to health."
)

EMERGENCY_RESPONSE = (
    "This may be a medical emergency. Please seek immediate medical help."
)


def _normalize(text: str) -> str:
    return (text or "").strip().lower()


def is_medical_query(message: str) -> bool:
    text = _normalize(message)
    if not text:
        return False
    return any(keyword in text for keyword in MEDICAL_KEYWORDS)


def is_emergency_query(message: str) -> bool:
    text = _normalize(message)
    if not text:
        return False
    return any(phrase in text for phrase in EMERGENCY_KEYWORDS)

