import aiohttp
import asyncio
import time
from ...db import ProviderManager
from ...routes import Image
from ...responses import PrettyJSONResponse
from ..utils import handle_errors

class Midjourney:
    """
    A class for interacting with the Midjourney API.
    """

    provider_name = "midjourney"
    ai_models = [
        {"id": "midjourney", "type": "images.generations", "premium": True}
    ]
    
    @classmethod
    @handle_errors
    async def image_generation(cls, body: Image) -> PrettyJSONResponse:
        """Creates an image using the Midjourney API."""
        
        provider = await ProviderManager.get_best_provider_by_model(body.model)

        url = f"{provider.api_url}/mjapi/mj/submit/imagine"
        data = {
            "base64Array": [],
            "notifyHook": "",
            "prompt": body.prompt,
            "state": "",
            "botType": "MID_JOURNEY"
        }
        headers = {
            "Accept": "*/*",
            "Host": provider.api_url.split("//")[1],
            "Origin": provider.api_url,
            "Referer": provider.api_url + "/",
            "X-Ptoken": provider.api_key
        }
        
        start = time.time()

        async with aiohttp.ClientSession(headers=headers) as client:
            async with client.post(url, json=data) as response:
                response.raise_for_status()
                result = (await response.json())["result"]
                image_fetch_url = f"{provider.api_url}/mjapi/mj/task/{result}/fetch"

            for _ in range(80):
                async with client.get(image_fetch_url) as response:
                    response.raise_for_status()
                    json_response = await response.json()

                    if json_response["status"] == "SUCCESS":
                        response_headers = {
                            "X-Provider-Name": provider.name,
                            "X-Processing-Ms": str(round((time.time() - start) * 1000, 0))
                        }

                        return PrettyJSONResponse(
                            content={"data": [{"url": json_response["imageUrl"]}]},
                            status_code=200,
                            headers=response_headers
                        )

                    await asyncio.sleep(1)

        raise RuntimeError("Couldn't generate a valid image")