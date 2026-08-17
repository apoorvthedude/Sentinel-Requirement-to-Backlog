from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.db.neo4j_client import close_driver as close_neo4j_driver
from app.db.postgres import init_db
from app.graph.checkpointer import shutdown_checkpointer, startup_checkpointer
from app.observability.langfuse_setup import init_langfuse


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_langfuse()
    await init_db()
    await startup_checkpointer()
    yield
    await shutdown_checkpointer()
    await close_neo4j_driver()


app = FastAPI(title="Sentinel — Requirement to Backlog", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok"}
