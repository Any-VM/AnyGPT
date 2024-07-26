import openai
import asyncio
import logging
from config import settings
from utils import get_models

client = openai.AsyncOpenAI(
    api_key=settings.testing_api_key,
    base_url=settings.testing_api_url
)

async def test_chat(model: str, streaming: bool) -> str:
    """Tests chat completion with or without streaming."""
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say this is a test!"}],
            stream=streaming
        )

        if streaming:
            text = ""
            async for chunk in response:
                if chunk.choices[0].delta.content:
                    text += chunk.choices[0].delta.content
        else:
            text = response.choices[0].message.content

        return f"[{model}] Response: {text}"
    except openai.APIError as e:
        logging.error(e)
        return f"[{model}] Response: {e}"
    
async def test_image(model: str) -> str:
    """Tests image generation."""
    try:
        response = await client.images.generate(
            prompt="A cute black cat",
            model=model
        )
        return f"[{model}] Response: {response.data[0].url}"
    except openai.APIError as e:
        logging.error(e)
        return f"[{model}] Response: {e}"

async def main() -> None:
    """Tests all the models in the API."""

    models = await get_models()
    success_count = 0
    error_count = 0

    for model in models:
        if model["type"] == "image":
            response = await test_image(model["id"])
            success_count += 1 if "https://" in response else 0
            error_count += 1 if "https://" not in response else 0
        elif model["type"] == "chat":
            for streaming in [True, False]:
                response = await test_chat(model["id"], streaming)
                success_count += 1 if "test" in response else 0
                error_count += 1 if "test" not in response else 0

    logging.info(f"Success: {success_count}, Errors: {error_count}")

if __name__ == "__main__":
    asyncio.run(main())