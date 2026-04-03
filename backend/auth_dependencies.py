from typing import Optional

from fastapi import HTTPException, Request, status


def get_optional_user_id(request: Request) -> Optional[int]:
    """JWT user id if Authorization Bearer is valid; otherwise None."""
    user_claims = getattr(request.state, "user", None)
    if not user_claims or not user_claims.get("id"):
        return None
    return int(user_claims["id"])


def get_authenticated_user_id(request: Request) -> int:
    user_claims = getattr(request.state, "user", None)
    user_id = user_claims.get("id") if user_claims else None
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )
    return int(user_id)
