import aiohttp
from config import settings

async def get_models() -> list[dict]:
    """Gets all the available models from the API."""
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{settings.testing_api_url}/models") as response:
            json_response = await response.json()
            return json_response["data"]