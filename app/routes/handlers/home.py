import litestar

@litestar.get("/")
async def home() -> dict[str, str]:
    """The home endpoint for the API."""
    return {
        "message": "Welcome to the the AnyGPT API homepage!",
        "discord": "https://discord.gg/42QA4y8te2"
    }
