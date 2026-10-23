from fastapi import APIRouter, HTTPException, Response, status, Depends
from fastapi.responses import JSONResponse

from app.schemas.auth_schema import LoginRequest, RegisterRequest
from app.core.security import hash_password, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.core.deps import get_current_user
from app.db.supabase import get_supabase
from dotenv import load_dotenv
import os

load_dotenv()

import logging

auth_router = APIRouter()
logger = logging.getLogger(__name__)

COOKIE_MAX_AGE = ACCESS_TOKEN_EXPIRE_MINUTES * 60


def _set_auth_cookie(response: Response, token: str):
    is_production = os.getenv("ENV", "development") == "production"
    response.set_cookie(
        key=os.getenv("COOKIE_NAME"),
        value=token,
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=COOKIE_MAX_AGE,
        path="/",
    )


@auth_router.post("/auth/register", status_code=201)
async def register(body: RegisterRequest):
    supabase = get_supabase()
   
    existing = supabase.table("users").select("email").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    hashed = hash_password(body.password)
    try:
        supabase.table("users").insert({"email": body.email, "password_hash": hashed}).execute()
    except Exception as e:
        logger.exception("Failed to create user")
        raise HTTPException(status_code=500, detail="Could not create user")

    token = create_access_token({"sub": body.email})
    response = JSONResponse(
        status_code=201,
        content={"message": "Registered successfully", "user": {"email": body.email}},
    )
    _set_auth_cookie(response, token)
    return response


@auth_router.post("/auth/login")
async def login(body: LoginRequest):
    supabase = get_supabase()
    result = supabase.table("users").select("email, password_hash").eq("email", body.email).execute()

    if not result.data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user = result.data[0]
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": user["email"]})
    response = JSONResponse(
        status_code=200,
        content={"message": "Logged in", "user": {"email": user["email"]}},
    )
    _set_auth_cookie(response, token)
    return response


@auth_router.post("/auth/logout")
async def logout():
    response = JSONResponse(status_code=200, content={"message": "Logged out"})
    response.delete_cookie(key=os.getenv("COOKIE_NAME"), path="/")
    return response


@auth_router.get("/auth/me")
async def me(current_user: dict = Depends(get_current_user)):
    """Returns the currently authenticated user's info from the cookie."""
    return {"user": {"email": current_user["sub"]}}
