import litestar
import logging
from litestar.exceptions import ValidationException, HTTPException
from .responses import PrettyJSONResponse

def get_exception_handlers() -> dict:
    """Returns a dictionary of exception handlers."""

    def not_found(request: litestar.Request, _: Exception) -> PrettyJSONResponse:
        """Handles an error for when an endpoint is not found."""
        return PrettyJSONResponse(
            content={
                "error": {
                    "message": f"Invalid URL ({request.method} {request.url.path})",
                    "type": "invalid_request_error",
                    "param": None,
                    "code": None
                }
            },
            status_code=404
        )
    
    def method_not_allowed(request: litestar.Request, _: Exception) -> PrettyJSONResponse:
        """Handles an error for when an endpoint is not found."""
        return PrettyJSONResponse(
            content={
                "error": {
                    "message": f"Not allowed to {request.method} on {request.url.path}.",
                    "type": "invalid_request_error",
                    "param": None,
                    "code": None
                }
            },
            status_code=405
        )

    def internal_server_error(_: litestar.Request, exc: Exception) -> PrettyJSONResponse:
        """Handles an unexpected internal server error."""
        logging.error(exc)
        return PrettyJSONResponse(
            content={
                "error": {
                    "message": f"Unexpected error: {exc}",
                    "type": "unexpected_error",
                    "param": None,
                    "code": None
                }
            },
            status_code=500
        )

    def validation_error(_: litestar.Request, exc: ValidationException) -> PrettyJSONResponse:
        """Handles a validation error."""

        message = exc.extra[0]["message"].replace("Value error, ", "") if len(exc.extra) == 1 else "Validation error."
        params = ", ".join(field["key"] for field in exc.extra)

        return PrettyJSONResponse(
            content={
                "error": {
                    "message": message,
                    "type": "invalid_request_error",
                    "param": params,
                    "code": None
                }
            },
            status_code=422 if "Model" not in message else 404
        )

    def http_exception(_: litestar.Request, exc: HTTPException) -> PrettyJSONResponse:
        """Handles an HTTP exception."""
        return PrettyJSONResponse(
            content={
                "error": {
                    "message": exc.detail,
                    "type": "invalid_request_error",
                    "param": None,
                    "code": None
                }
            },
            status_code=exc.status_code
        )
        
    return {
        404: not_found,
        Exception: internal_server_error,
        500: internal_server_error,
        405: method_not_allowed,
        HTTPException: http_exception,
        ValidationException: validation_error
    }