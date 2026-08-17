import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.llm.client import build_default_llm_client

TEXT_PROMPT = "Reply with exactly the word: PONG"

VISION_IMAGE_URL = (
    "https://raw.githubusercontent.com/microsoft/vscode/main/resources/win32/code_150x150.png"
)
VISION_PROMPT = "Describe in one short sentence what this image shows."


async def main():
    client = build_default_llm_client()

    print("== text completion ==")
    text_result = await client.complete(TEXT_PROMPT)
    print(text_result)

    print("\n== vision completion ==")
    try:
        vision_result = await client.complete_vision(VISION_PROMPT, [VISION_IMAGE_URL])
        print(vision_result)
    except Exception as e:
        print(f"vision call failed (non-fatal for Phase 1 text-first scope): {e}")


if __name__ == "__main__":
    asyncio.run(main())
