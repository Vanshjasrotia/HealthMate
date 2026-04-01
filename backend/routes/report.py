from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

try:
    from ..models.schemas import ReportAnalyzeResponse
    from ..report_analyzer import analyze_report
except ImportError:
    from models.schemas import ReportAnalyzeResponse
    from report_analyzer import analyze_report

router = APIRouter(prefix="/report", tags=["report"])

ALLOWED_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "text/plain",
}


@router.post("/analyze", response_model=ReportAnalyzeResponse)
async def analyze_report_endpoint(file: UploadFile = File(...)) -> ReportAnalyzeResponse:
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, image, or text.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = analyze_report(data, content_type, file.filename or "report")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Report analysis failed: {exc}") from exc

    return ReportAnalyzeResponse(**result)
