import os
import importlib
import typing

def get_modules():
    """Yield modules from the providers directory."""
    
    providers_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "providers"))
    
    for root, _, files in os.walk(providers_dir):
        for file in files:
            if file.endswith(".py") and not file.startswith("__") and file != "utils.py":
                module_path = os.path.relpath(os.path.join(root, file), providers_dir).replace(os.sep, ".")[:-3]
                yield importlib.import_module(f"app.providers.{module_path}")

def get_all_models(formatted: bool = False, type: str = "any") -> list:
    """Returns a list of all available models by dynamically importing all providers."""

    models = []

    for module in get_modules():
        for _, obj in module.__dict__.items():
            if hasattr(obj, "ai_models"):
                for model in obj.ai_models:
                    if model["type"] == type or type == "any":
                        if formatted:
                            models.append({
                                "id": model["id"],
                                "type": model["type"],
                                "owned_by": obj.provider_name,
                                "endpoint": f"/v1/{model['type'].replace('.', '/')}",
                                "premium": model["premium"]
                            })
                        else:
                            models.append(model["id"])
    return models

def get_all_provider_classes() -> list:
    """Returns a list of all available providers classes."""
    return [obj for module in get_modules() for _, obj in module.__dict__.items() if hasattr(obj, "ai_models")]

def get_provider_class(model: str) -> typing.Optional[typing.Any]:
    """Returns the provider class based on the model."""

    for provider in get_all_provider_classes():
        for provider_model in provider.ai_models:
            if model == provider_model["id"]:
                return provider

    return None