from __future__ import annotations

import importlib
import json
from pathlib import Path
from typing import Any


class AwpyUnavailableError(RuntimeError):
    pass


def _json_safe(value: Any) -> Any:
    """Best-effort conversion to JSON-serializable data."""
    try:
        json.dumps(value)
        return value
    except TypeError:
        if isinstance(value, dict):
            return {str(k): _json_safe(v) for k, v in value.items()}
        if isinstance(value, (list, tuple, set)):
            return [_json_safe(v) for v in value]
        return str(value)


def _parse_with_awpy(demo_path: Path) -> dict[str, Any]:
    awpy = importlib.import_module("awpy")

    if hasattr(awpy, "Demo"):
        demo = awpy.Demo(demo_path)
        parsed = demo.parse() if hasattr(demo, "parse") else None
        if parsed is not None:
            return {
                "engine": "awpy.Demo",
                "summary": {
                    "type": type(parsed).__name__,
                },
                "parsed": _json_safe(parsed),
            }

    parser_spec = importlib.util.find_spec("awpy.parser")
    if parser_spec is not None:
        parser_module = importlib.import_module("awpy.parser")
        if hasattr(parser_module, "DemoParser"):
            parser = parser_module.DemoParser(str(demo_path))
            parsed = parser.parse() if hasattr(parser, "parse") else None
            if parsed is not None:
                return {
                    "engine": "awpy.parser.DemoParser",
                    "summary": {
                        "type": type(parsed).__name__,
                    },
                    "parsed": _json_safe(parsed),
                }

    raise AwpyUnavailableError("AWPY API not recognized. Update integration for your installed version.")


def analyze_demo_file(demo_path: str | Path) -> dict[str, Any]:
    """Run demo analysis using AWPY and normalize a minimal report payload."""
    if importlib.util.find_spec("awpy") is None:
        raise AwpyUnavailableError(
            "AWPY is not installed. Install it with `pip install awpy` before processing demos."
        )

    source_path = Path(demo_path)
    parsed_payload = _parse_with_awpy(source_path)

    return {
        "source": str(source_path),
        "analysis": parsed_payload,
    }
