import litestar
import typing
import asyncer
from litestar.response import Stream
from ..utils import get_provider_class
from ...responses import PrettyJSONResponse
from ..models import Chat
from ...hooks import before_request
from ...guards import auth_guard

@litestar.post("/v1/chat/completions", guards=[auth_guard], before_request=before_request, status_code=200)
async def chat(data: Chat) -> typing.Union[PrettyJSONResponse, Stream]:
    """The chat endpoint for the API."""

    provider = await asyncer.asyncify(get_provider_class)(data.model)
    
    for message in data.messages:
        message["content"] = message["content"].replace("`", "").replace("'", "")
    
    return await provider.chat_completion(data)