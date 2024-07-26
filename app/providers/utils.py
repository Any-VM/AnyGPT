import typing
import openai
import logging
from litestar.response import Stream
from ..responses import PrettyJSONResponse

def handle_errors(func: typing.Coroutine) -> typing.Coroutine:
    """Decorator to handle errors for a provider."""
    
    async def wrapper(*args, **kwargs) -> typing.Union[PrettyJSONResponse, Stream]:
        """Wrapper function to handle errors."""
        try:
            return await func(*args, **kwargs)
        except (IndexError, RuntimeError, openai.APIError) as e:
            logging.error(e)
            return PrettyJSONResponse(
                content={
                    "error": {
                        "message": "We're sorry, something went wrong. Please try again later.",
                        "type": "unexpected_error",
                        "param": None,
                        "code": 500
                    }
                },
                status_code=500
            )
    
    return wrapper