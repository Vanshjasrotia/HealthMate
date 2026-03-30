from fastapi import HTTPException, Request, status


def get_authenticated_user_id(request: Request) -> int:
    user_claims = getattr(request.state, "user", None)
    user_id = user_claims.get("id") if user_claims else None
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )
    return int(user_id)
