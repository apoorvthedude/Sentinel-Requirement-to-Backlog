import base64
import logging
from abc import ABC, abstractmethod

import httpx

from app.config import settings
from app.llm.usage_tracker import record_usage

logger = logging.getLogger(__name__)


class LLMClient(ABC):
    @abstractmethod
    async def complete(self, prompt: str) -> str:
        ...

    @abstractmethod
    async def complete_vision(self, prompt: str, image_urls: list[str]) -> str:
        ...


class OpenAIClient(LLMClient):
    def __init__(self, model_chain: list[str] | None = None):
        self.model_chain = model_chain or [
            settings.openai_model,
            settings.openai_fallback_model,
        ]
        self.api_key = settings.openai_api_key
        self.base_url = "https://api.openai.com/v1"

    async def _call_model(self, model: str, content) -> str:
        async with httpx.AsyncClient(timeout=25) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": content}],
                },
            )
            response.raise_for_status()
            data = response.json()
            if "choices" not in data:
                raise RuntimeError(f"OpenAI response missing 'choices': {data!r}")

            usage = data.get("usage") or {}
            record_usage(
                prompt_tokens=usage.get("prompt_tokens", 0),
                completion_tokens=usage.get("completion_tokens", 0),
                total_tokens=usage.get("total_tokens", 0),
            )

            return data["choices"][0]["message"]["content"]

    async def _chat(self, content) -> str:
        errors = []
        for model in self.model_chain:
            try:
                return await self._call_model(model, content)
            except Exception as e:
                logger.warning("OpenAI model %s failed: %s", model, e)
                errors.append(f"{model}: {e}")

        raise RuntimeError(
            "All OpenAI models in the fallback chain failed:\n" + "\n".join(errors)
        )

    async def complete(self, prompt: str) -> str:
        return await self._chat(prompt)

    async def complete_vision(self, prompt: str, image_urls: list[str]) -> str:
        content = [{"type": "text", "text": prompt}]
        async with httpx.AsyncClient(timeout=25) as client:
            for url in image_urls:
                image_response = await client.get(url)
                image_response.raise_for_status()
                mime_type = image_response.headers.get("content-type", "image/png")
                encoded = base64.b64encode(image_response.content).decode("utf-8")
                content.append(
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{encoded}"},
                    }
                )
        return await self._chat(content)


def build_default_llm_client() -> LLMClient:
    return OpenAIClient()
