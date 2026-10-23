from fastapi import Cookie, HTTPException, status
from typing import Annotated
from app.core.security import decode_access_token
import os
from dotenv import load_dotenv

load_dotenv()

_COOKIE_NAME: str = os.getenv("COOKIE_NAME", "chatmate_access_token")


def get_current_user(
    token: Annotated[str | None, Cookie(alias=_COOKIE_NAME)] = None,
) -> dict:
    """Dependency: reads the httpOnly cookie and returns the decoded payload."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return payload
