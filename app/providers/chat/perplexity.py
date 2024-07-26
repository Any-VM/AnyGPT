import openai
import typing
import time
import ujson
from openai.types.chat import ChatCompletionChunk
from litestar.response import Stream
from ...routes import Chat
from ...db import ProviderManager
from ...responses import PrettyJSONResponse
from ..utils import handle_errors

class Perplexity:
    """
    Provider class for interacting with the Perplexity API.
    """

    provider_name = "perplexity"
    ai_models = [
        {"id": "llama-3-sonar-small-32k-chat", "type": "chat.completions", "premium": False},
        {"id": "llama-3-sonar-small-32k-online", "type": "chat.completions", "premium": False},
        {"id": "llama-3-sonar-large-32k-chat", "type": "chat.completions", "premium": False},
        {"id": "llama-3-sonar-large-32k-online", "type": "chat.completions", "premium": False}
    ]

    async def stream_response(response: openai.AsyncStream[ChatCompletionChunk], headers: dict[str, str]) -> Stream:
        """Streams the response from the Perplexity API."""

        def process_chunk(chunk: ChatCompletionChunk) -> str:
            return ujson.dumps({
                "id": chunk.id,
                "object": chunk.object,
                "created": chunk.created,
                "model": chunk.model,
                "choices": [
                    {
                        "index": choice.index,
                        "delta": {"role": choice.delta.role, "content": choice.delta.content},
                        "finish_reason": choice.finish_reason
                    }
                    for choice in chunk.choices
                ]
            }, escape_forward_slashes=False)

        async def async_generator():
            async for chunk in response:
                yield b"data: " + process_chunk(chunk).encode() + b"\n\n"

        return Stream(content=async_generator(), media_type="text/event-stream", status_code=200, headers=headers)

    @classmethod
    @handle_errors
    async def chat_completion(cls, body: Chat) -> typing.Union[Stream, PrettyJSONResponse]:
        """Creates a chat completion using the Perplexity API."""

        provider = await ProviderManager.get_best_provider_by_model(body.model)

        client = openai.AsyncOpenAI(
            api_key=provider.api_key,
            base_url=provider.api_url
        )

        start = time.time()

        body.frequency_penalty = 0.1 if body.frequency_penalty <= 0 else body.frequency_penalty
        response = await client.chat.completions.create(**body.model_dump(mode="json"))
        
        provider.usage += 1
        await ProviderManager.update_provider(provider)

        response_headers = {
            "X-Provider-Name": provider.name,
            "X-Processing-Ms": str(round((time.time() - start) * 1000, 0))
        }

        return await cls.stream_response(response, response_headers) if body.stream \
            else PrettyJSONResponse(response.model_dump(mode="json"), status_code=200, headers=response_headers)