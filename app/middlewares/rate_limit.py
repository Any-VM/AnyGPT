import os
import importlib
import typing
from litestar.handlers.http_handlers import HTTPRouteHandler
from litestar.connection import ASGIConnection
from litestar.middleware.rate_limit import RateLimitConfig

def get_all_paths() -> typing.Set[HTTPRouteHandler]:
    """Loads routers dynamically from the routers directory and returns them."""

    routers = set()
    handlers_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "routes", "handlers"))

    for _, _, files in os.walk(handlers_dir):
        for file in files:
            if file.endswith(".py") and not file.startswith("__"):
                module = importlib.import_module(f"app.routes.handlers.{file[:-3]}")
                for obj in module.__dict__.values():
                    if isinstance(obj, HTTPRouteHandler):
                        routers.add(obj)

    return [path for router in routers for path in router.paths if path.startswith("/v1/") and path != "/v1/models"]

async def check_rate_limit(connection: ASGIConnection) -> bool:
    """Checks if the user is eligible for rate limiting."""
    if connection.url.path in get_all_paths():
        return True
    return False

rate_limit_config = RateLimitConfig(
    rate_limit=("minute", 10),
    check_throttle_handler=check_rate_limit
)