from __future__ import annotations

import gzip
import importlib
import json
import shutil
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any
from urllib.parse import urlparse
from urllib.request import Request, urlopen


class AwpyUnavailableError(RuntimeError):
    pass


class DemoDownloadError(RuntimeError):
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


def _extract_player_position(player: dict[str, Any], side: str) -> dict[str, Any]:
    return {
        "name": player.get("name") or player.get("steamID") or "unknown",
        "side": side,
        "x": player.get("x"),
        "y": player.get("y"),
        "z": player.get("z"),
        "hp": player.get("hp"),
        "armor": player.get("armor"),
        "is_alive": player.get("isAlive"),
    }


def _extract_radar_frames(parsed: Any, sample_every: int = 8) -> dict[str, Any]:
    if not isinstance(parsed, dict):
        return {"map": None, "frames": [], "sample_every": sample_every}

    rounds = parsed.get("gameRounds") or parsed.get("rounds") or []
    radar_frames: list[dict[str, Any]] = []

    for round_data in rounds:
        if not isinstance(round_data, dict):
            continue

        round_num = round_data.get("roundNum")
        for frame_idx, frame in enumerate(round_data.get("frames") or []):
            if frame_idx % sample_every != 0:
                continue
            if not isinstance(frame, dict):
                continue

            ct_players = frame.get("ct", {}).get("players") or []
            t_players = frame.get("t", {}).get("players") or []
            players = [
                *[_extract_player_position(p, "ct") for p in ct_players if isinstance(p, dict)],
                *[_extract_player_position(p, "t") for p in t_players if isinstance(p, dict)],
            ]

            radar_frames.append(
                {
                    "round": round_num,
                    "tick": frame.get("tick"),
                    "clock_time": frame.get("clockTime"),
                    "players": players,
                }
            )

    return {
        "map": parsed.get("mapName") or parsed.get("map"),
        "sample_every": sample_every,
        "frames": radar_frames,
        "total_rounds": len(rounds),
        "total_sampled_frames": len(radar_frames),
    }




def _safe_float(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _safe_int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _extract_player_stats(parsed: dict[str, Any]) -> dict[str, Any]:
    stats = parsed.get("playerStats") or parsed.get("players") or []
    if not isinstance(stats, list):
        return {}

    if stats:
        target = max(
            [p for p in stats if isinstance(p, dict)],
            key=lambda p: _safe_int(p.get("kills")),
            default={},
        )
    else:
        target = {}

    kills = _safe_int(target.get("kills"))
    deaths = _safe_int(target.get("deaths"))
    assists = _safe_int(target.get("assists"))
    adr = round(_safe_float(target.get("adr") or target.get("averageDamagePerRound")), 2)
    hs_percent = round(_safe_float(target.get("hsPercent") or target.get("headshotPercentage")), 2)

    return {
        "player": target.get("playerName") or target.get("name") or "unknown",
        "kills": kills,
        "deaths": deaths,
        "assists": assists,
        "kd": round(kills / deaths, 2) if deaths else float(kills),
        "adr": adr,
        "hs_percent": hs_percent,
        "kast": round(_safe_float(target.get("kast")), 2),
        "opening_kills": _safe_int(target.get("firstKills") or target.get("openingKills")),
        "opening_deaths": _safe_int(target.get("firstDeaths") or target.get("openingDeaths")),
        "flash_assists": _safe_int(target.get("flashAssists")),
        "utility_damage": _safe_int(target.get("utilityDamage")),
    }


def _extract_round_timeline(parsed: dict[str, Any]) -> list[dict[str, Any]]:
    rounds = parsed.get("gameRounds") or parsed.get("rounds") or []
    timeline: list[dict[str, Any]] = []

    for idx, round_data in enumerate(rounds, start=1):
        if not isinstance(round_data, dict):
            continue

        winner_side = round_data.get("winningSide")
        timeline.append(
            {
                "round": round_data.get("roundNum") or idx,
                "winner_side": winner_side,
                "reason": round_data.get("roundEndReason"),
                "ct_score": round_data.get("endCTScore") or round_data.get("ctScore"),
                "t_score": round_data.get("endTScore") or round_data.get("tScore"),
            }
        )

    return timeline


def _extract_metrics_summary(parsed: Any, sample_every: int) -> dict[str, Any]:
    if not isinstance(parsed, dict):
        return {"sample_every": sample_every}

    round_timeline = _extract_round_timeline(parsed)
    player_stats = _extract_player_stats(parsed)

    final_ct = round_timeline[-1].get("ct_score") if round_timeline else None
    final_t = round_timeline[-1].get("t_score") if round_timeline else None
    result = "unknown"
    if isinstance(final_ct, int) and isinstance(final_t, int):
        if final_ct > final_t:
            result = "ct_win"
        elif final_t > final_ct:
            result = "t_win"
        else:
            result = "draw"

    return {
        "map": parsed.get("mapName") or parsed.get("map"),
        "sample_every": sample_every,
        "rounds": len(round_timeline),
        "score": {"ct": final_ct, "t": final_t, "result": result},
        "player_stats": player_stats,
        "round_timeline": round_timeline,
    }
def _parse_with_awpy(demo_path: Path, sample_every: int) -> dict[str, Any]:
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
                "radar": _extract_radar_frames(parsed, sample_every=sample_every),
                "metrics": _extract_metrics_summary(parsed, sample_every=sample_every),
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
                    "radar": _extract_radar_frames(parsed, sample_every=sample_every),
                    "metrics": _extract_metrics_summary(parsed, sample_every=sample_every),
                    "parsed": _json_safe(parsed),
                }

    raise AwpyUnavailableError("AWPY API not recognized. Update integration for your installed version.")


def download_demo_file(demo_url: str, destination: str | Path) -> str:
    """Download a demo from URL to destination. Returns final filename."""
    parsed_url = urlparse(demo_url)
    if parsed_url.scheme not in {"http", "https"}:
        raise DemoDownloadError("Only http/https demo URLs are supported.")

    destination_path = Path(destination)
    destination_path.parent.mkdir(parents=True, exist_ok=True)

    req = Request(demo_url, headers={"User-Agent": "syntra-demo-ingest/1.0"})
    try:
        with urlopen(req, timeout=45) as response, destination_path.open("wb") as out:
            shutil.copyfileobj(response, out)
    except Exception as exc:  # noqa: BLE001
        raise DemoDownloadError(f"Could not download demo: {exc}") from exc

    filename = Path(parsed_url.path).name or "downloaded.dem"
    return filename


def unpack_demo_if_needed(demo_path: str | Path) -> Path:
    source_path = Path(demo_path)
    if source_path.suffix != ".gz":
        return source_path

    if not source_path.name.endswith(".dem.gz"):
        raise DemoDownloadError("Only .dem.gz compression format is supported.")

    unpacked_path = source_path.with_suffix("")
    with gzip.open(source_path, "rb") as gz_in, unpacked_path.open("wb") as dem_out:
        shutil.copyfileobj(gz_in, dem_out)
    return unpacked_path


def analyze_demo_file(demo_path: str | Path, sample_every: int = 8) -> dict[str, Any]:
    """Run demo analysis using AWPY and normalize a report payload with radar frames."""
    if importlib.util.find_spec("awpy") is None:
        raise AwpyUnavailableError(
            "AWPY is not installed. Install it with `pip install awpy` before processing demos."
        )

    if sample_every < 1:
        sample_every = 1

    source_path = unpack_demo_if_needed(demo_path)
    parsed_payload = _parse_with_awpy(source_path, sample_every=sample_every)

    return {
        "source": str(source_path),
        "analysis": parsed_payload,
    }


def download_and_analyze_demo(demo_url: str, sample_every: int = 8) -> dict[str, Any]:
    with NamedTemporaryFile(prefix="syntra_demo_", suffix=".dem", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    download_demo_file(demo_url, tmp_path)

    try:
        return analyze_demo_file(tmp_path, sample_every=sample_every)
    finally:
        if tmp_path.exists():
            tmp_path.unlink()
        unpacked = tmp_path.with_suffix("")
        if unpacked != tmp_path and unpacked.exists():
            unpacked.unlink()
