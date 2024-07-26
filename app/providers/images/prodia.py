import aiohttp
import asyncio
import time
from ...routes import Image
from ...responses import PrettyJSONResponse
from ..utils import handle_errors

class Prodia:
    """
    A class for interacting with the Prodia API.
    """

    provider_name = "prodia"
    ai_models = [
        {"id": "stable-diffusion-1.4", "type": "images.generations", "premium": False, "real_name": "sdv1_4.ckpt [7460a6fa]"},
        {"id": "stable-diffusion-1.5", "type": "images.generations", "premium": False, "real_name": "v1-5-pruned-emaonly.safetensors [d7049739]"},
        {"id": "openjourney-v4", "type": "images.generations", "premium": False, "real_name": "openjourney_V4.ckpt [ca2f377f]"},
        {"id": "dreamshaper-6", "type": "images.generations", "premium": False, "real_name": "dreamshaper_6BakedVae.safetensors [114c8abb]"},
        {"id": "dreamshaper-7", "type": "images.generations", "premium": False, "real_name": "dreamshaper_7.safetensors [5cf5ae06]"},
        {"id": "dreamshaper-8", "type": "images.generations", "premium": False, "real_name": "dreamshaper_8.safetensors [9d40847d]"}
    ]
    
    @classmethod
    @handle_errors
    async def image_generation(cls, body: Image) -> PrettyJSONResponse:
        """Creates an image using the Prodia API."""

        model = next((model for model in cls.ai_models if model["id"] == body.model), None)

        params = {
            "new": "true",
            "prompt": body.prompt,
            "model": model,
            "negative_prompt": "Low quality image.",
            "steps": "20",
            "cfg": "7",
            "seed": "-1",
            "sampler": "DPM++ 2M Karras",
            "aspect_ratio": "square"
        }
        
        start = time.time()

        async with aiohttp.ClientSession() as session:
            async with session.get("https://api.prodia.com/generate", params=params) as response:
                generation_json_response = await response.json()
                job_id = generation_json_response["job"]

                for _ in range(30):
                    url = f"https://api.prodia.com/job/{job_id}"

                    async with session.get(url) as response:
                        job_json_response = await response.json()

                        if job_json_response["status"] == "succeeded":
                            response_headers = {
                                "X-Provider-Name": "prodia",
                                "X-Processing-Ms": str(round((time.time() - start) * 1000, 0))
                            }

                            return PrettyJSONResponse(
                                content={"data": [{"url": f"https://images.prodia.xyz/{job_id}.png"}]},
                                status_code=200,
                                headers=response_headers
                            )

                    await asyncio.sleep(1)

        raise RuntimeError("Failed to generate image")