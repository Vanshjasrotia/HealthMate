from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

try:
    from ..auth_dependencies import get_optional_user_id
    from ..database import get_db
    from ..models.schemas import ReportAnalyzeResponse
    from ..report_analyzer import analyze_report
    from ..services.activity_log import log_report_upload
except ImportError:
    from auth_dependencies import get_optional_user_id
    from database import get_db
    from models.schemas import ReportAnalyzeResponse
    from report_analyzer import analyze_report
    from services.activity_log import log_report_upload

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
async def analyze_report_endpoint(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> ReportAnalyzeResponse:
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

    log_report_upload(db, get_optional_user_id(request), file.filename)
    return ReportAnalyzeResponse(**result)
