import litestar
import asyncer
from ..utils import get_provider_class
from ...responses import PrettyJSONResponse
from ..models import Image
from ...hooks import before_request
from ...guards import auth_guard

@litestar.post("/v1/images/generations", guards=[auth_guard], before_request=before_request, status_code=200)
async def chat(data: Image) -> PrettyJSONResponse:
    """The chat endpoint for the API."""
    provider = await asyncer.asyncify(get_provider_class)(data.model)
    return await provider.image_generation(data)