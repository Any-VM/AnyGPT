from litestar.exceptions import HTTPException
from litestar.connection import ASGIConnection
from litestar.handlers.base import BaseRouteHandler
from ..db import UserManager

async def auth_guard(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    """Checks if the user is authenticated."""

    key = connection.headers.get("Authorization", "").replace("Bearer ", "")

    if key == "":
        raise HTTPException(
            detail="You didn't provide an API key (e.g. Authorization: Bearer sk-...).",
            status_code=429
        )

    user = await UserManager.get_user(property="key", value=key)

    if not user:
        raise HTTPException(
            detail="Invalid API key.",
            status_code=401
        )
    elif user.banned:
        raise HTTPException(
            detail="You're banned from using the API.",
            status_code=403
        )