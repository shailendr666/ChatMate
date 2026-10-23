from fastapi import APIRouter
from .endpoints.chat_api import chat_router
from .endpoints.auth_api import auth_router

api_router = APIRouter()
api_router.include_router(chat_router, tags=["chat"])
api_router.include_router(auth_router, tags=["auth"])
