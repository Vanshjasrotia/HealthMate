from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

try:
    from ..auth_dependencies import get_authenticated_user_id
    from ..database import get_db
    from ..schemas import DashboardResponse, HealthTipsResponse
    from ..services.dashboard_service import build_dashboard, refresh_user_health_tips_from_ai
except ImportError:
    from auth_dependencies import get_authenticated_user_id
    from database import get_db
    from schemas import DashboardResponse, HealthTipsResponse
    from services.dashboard_service import build_dashboard, refresh_user_health_tips_from_ai

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(request: Request, db: Session = Depends(get_db)) -> DashboardResponse:
    """JWT required. Returns counts and recent predictions for the current user."""
    user_id = get_authenticated_user_id(request)
    data = build_dashboard(db, user_id)
    return DashboardResponse(**data)


@router.post("/dashboard/health-tips", response_model=HealthTipsResponse)
def post_dashboard_health_tips(request: Request, db: Session = Depends(get_db)) -> HealthTipsResponse:
    """JWT required. Regenerates 3 wellness tips (AI) and stores them for this user — call after login."""
    user_id = get_authenticated_user_id(request)
    tips = refresh_user_health_tips_from_ai(db, user_id)
    return HealthTipsResponse(health_tips=tips)
