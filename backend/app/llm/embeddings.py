import asyncio
import os
from functools import lru_cache
from pathlib import Path

from app.config import settings


def _is_model_cached(model_id: str) -> bool:
    cache_root = Path(os.environ.get("HF_HOME", Path.home() / ".cache" / "huggingface")) / "hub"
    repo_dir_name = "models--" + model_id.replace("/", "--")
    return (cache_root / repo_dir_name).exists()


if _is_model_cached(settings.embedding_model):
    os.environ.setdefault("HF_HUB_OFFLINE", "1")


@lru_cache(maxsize=1)
def _get_model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(settings.embedding_model)


def embed_text_sync(text: str) -> list[float]:
    model = _get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


async def embed_text(text: str) -> list[float]:
    return await asyncio.to_thread(embed_text_sync, text)
