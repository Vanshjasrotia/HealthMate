from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware

from .security import decode_access_token


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request.state.user = None

        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            payload = decode_access_token(token)
            if payload:
                request.state.user = {
                    "id": payload.get("sub"),
                    "email": payload.get("email"),
                }

        return await call_next(request)
