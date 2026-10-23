from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

load_dotenv()

from app.agents.graphs import build_graph, close_graph


@asynccontextmanager
async def lifespan(app: FastAPI):
    await build_graph()
    yield
    await close_graph()
    

app = FastAPI(lifespan=lifespan)


origins = []

dev_origin = os.environ.get("DEV_ORIGIN")
prod_origin = os.environ.get("PROD_ORIGIN")

if dev_origin:
    origins.append(dev_origin)
if prod_origin:
    origins.append(prod_origin)

if not origins:
    origins = ["http://localhost:3000", "http://localhost:5173"]

print("CORS Origins:", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home_route():
    return {"message": "home"}


app.include_router(api_router, prefix="/api/v1")