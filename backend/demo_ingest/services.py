from __future__ import annotations

import gzip
import importlib
import json
import os
import shutil
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any, Iterable
from urllib.parse import urlparse
from urllib.request import Request, urlopen


class AwpyUnavailableError(RuntimeError):
    pass


class DemoDownloadError(RuntimeError):
    pass


def _env_positive_int(name: str, default: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
        return value if value > 0 else default
    except (TypeError, ValueError):
        return default


DEFAULT_SAMPLE_EVERY = _env_positive_int("DEMO_SAMPLE_EVERY", 64)
MAX_RADAR_FRAMES = _env_positive_int("DEMO_MAX_RADAR_FRAMES", 2000)


def _json_safe(value: Any) -> Any:
    try:
        json.dumps(value)
        return value
    except TypeError:
        if isinstance(value, dict):
            return {str(k): _json_safe(v) for k, v in value.items()}
        if isinstance(value, (list, tuple, set)):
            return [_json_safe(v) for v in value]
        return str(value)


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


def _frame_rows(frame: Any) -> list[dict[str, Any]]:
    if frame is None:
        return []
    if hasattr(frame, "to_dicts"):
        try:
            return frame.to_dicts()
        except Exception:  # noqa: BLE001
            pass
    if hasattr(frame, "to_dict"):
        try:
            rows = frame.to_dict(orient="records")
            if isinstance(rows, list):
                return rows
        except Exception:  # noqa: BLE001
            pass
    return []


def _iter_frame_rows(frame: Any, columns: list[str] | None = None) -> Iterable[dict[str, Any]]:
    if frame is None:
        return []

    selected = frame
    if columns and hasattr(frame, "columns") and hasattr(frame, "select"):
        existing = [c for c in columns if c in getattr(frame, "columns", [])]
        if existing:
            try:
                selected = frame.select(existing)
            except Exception:  # noqa: BLE001
                selected = frame

    if hasattr(selected, "iter_rows"):
        try:
            return selected.iter_rows(named=True)
        except TypeError:
            pass
        except Exception:  # noqa: BLE001
            pass

    return _frame_rows(selected)


def _extract_radar_from_ticks_frame(ticks_frame: Any, sample_every: int, max_frames: int) -> list[dict[str, Any]]:
    tick_columns = [
        "tick",
        "name",
        "player_name",
        "steamid",
        "side",
        "team_name",
        "team",
        "x",
        "y",
        "z",
        "health",
        "hp",
        "armor_value",
        "armor",
        "is_alive",
        "clock_time",
        "clockTime",
        "round_num",
        "round",
    ]

    sampled_tick_set: set[int] = set()
    sampled_tick_order: list[int] = []

    if hasattr(ticks_frame, "select") and hasattr(ticks_frame, "columns") and "tick" in ticks_frame.columns:
        try:
            tick_series = ticks_frame.select("tick").unique().sort("tick").to_series().to_list()
            for idx, value in enumerate(tick_series):
                if not isinstance(value, int):
                    continue
                if idx % sample_every != 0:
                    continue
                sampled_tick_set.add(value)
                sampled_tick_order.append(value)
        except Exception:  # noqa: BLE001
            sampled_tick_set.clear()
            sampled_tick_order.clear()

    if not sampled_tick_set:
        seen_ticks: set[int] = set()
        unique_ticks: list[int] = []
        for row in _iter_frame_rows(ticks_frame, ["tick"]):
            tick_val = row.get("tick")
            if isinstance(tick_val, int) and tick_val not in seen_ticks:
                seen_ticks.add(tick_val)
                unique_ticks.append(tick_val)
        for idx, tick in enumerate(unique_ticks):
            if idx % sample_every == 0:
                sampled_tick_set.add(tick)
                sampled_tick_order.append(tick)

    tick_to_players: dict[int, list[dict[str, Any]]] = {}
    tick_meta: dict[int, dict[str, Any]] = {}
    for row in _iter_frame_rows(ticks_frame, tick_columns):
        tick_val = row.get("tick")
        if not isinstance(tick_val, int) or tick_val not in sampled_tick_set:
            continue

        tick_meta.setdefault(
            tick_val,
            {
                "round": row.get("round_num") or row.get("round"),
                "clock_time": row.get("clock_time") or row.get("clockTime"),
            },
        )
        player = {
            "name": row.get("name") or row.get("player_name") or row.get("steamid") or "unknown",
            "side": row.get("side") or row.get("team_name") or row.get("team"),
            "x": row.get("x"),
            "y": row.get("y"),
            "z": row.get("z"),
            "hp": row.get("health") if row.get("health") is not None else row.get("hp"),
            "armor": row.get("armor_value") if row.get("armor_value") is not None else row.get("armor"),
            "is_alive": row.get("is_alive"),
        }
        tick_to_players.setdefault(tick_val, []).append(player)

    radar_frames: list[dict[str, Any]] = []
    for tick_val in sampled_tick_order:
        players = tick_to_players.get(tick_val)
        if not players:
            continue
        radar_frames.append({"tick": tick_val, **tick_meta.get(tick_val, {}), "players": players})
        if len(radar_frames) >= max_frames:
            break

    return radar_frames


def _extract_demo_instance_payload(demo: Any, sample_every: int) -> dict[str, Any]:
    rounds_rows = _frame_rows(getattr(demo, "rounds", None))
    damages_rows = _frame_rows(getattr(demo, "damages", None))
    kills_rows = _frame_rows(getattr(demo, "kills", None))
    ticks_frame = getattr(demo, "ticks", None)

    radar_frames = _extract_radar_from_ticks_frame(ticks_frame, sample_every=sample_every, max_frames=MAX_RADAR_FRAMES)

    kills_by_player: dict[str, int] = {}
    deaths_by_player: dict[str, int] = {}
    assists_by_player: dict[str, int] = {}
    hs_by_player: dict[str, int] = {}
    for row in kills_rows:
        killer = row.get("attacker_name") or row.get("killer_name") or row.get("player_name")
        victim = row.get("victim_name")
        assister = row.get("assister_name") or row.get("assistant_name")
        is_headshot = row.get("is_headshot") or row.get("headshot")
        if killer:
            key = str(killer)
            kills_by_player[key] = kills_by_player.get(key, 0) + 1
            if is_headshot:
                hs_by_player[key] = hs_by_player.get(key, 0) + 1
        if victim:
            key = str(victim)
            deaths_by_player[key] = deaths_by_player.get(key, 0) + 1
        if assister:
            key = str(assister)
            assists_by_player[key] = assists_by_player.get(key, 0) + 1

    player_damage: dict[str, int] = {}
    for row in damages_rows:
        attacker = row.get("attacker_name") or row.get("attackerName")
        if attacker:
            player_damage[str(attacker)] = player_damage.get(str(attacker), 0) + _safe_int(
                row.get("hp_damage") or row.get("health_damage") or row.get("dmg_health")
            )

    top_player = max(kills_by_player, key=kills_by_player.get) if kills_by_player else None
    if top_player is None and player_damage:
        top_player = max(player_damage, key=player_damage.get)
    top_player = top_player or "unknown"

    round_timeline = [
        {
            "round": row.get("round_num") or row.get("roundNum"),
            "winner_side": row.get("winner") or row.get("winningSide"),
            "reason": row.get("end_reason") or row.get("roundEndReason"),
            "ct_score": row.get("ct_score") or row.get("endCTScore") or row.get("ctScore"),
            "t_score": row.get("t_score") or row.get("endTScore") or row.get("tScore"),
        }
        for row in rounds_rows
    ]

    final_ct = round_timeline[-1].get("ct_score") if round_timeline else None
    final_t = round_timeline[-1].get("t_score") if round_timeline else None

    demo_header = getattr(demo, "header", {}) or {}
    if hasattr(demo_header, "to_dict"):
        try:
            demo_header = demo_header.to_dict()
        except Exception:  # noqa: BLE001
            demo_header = {}

    events = getattr(demo, "detected_events", [])
    events_count = len(events) if hasattr(events, "__len__") else 0

    return {
        "radar": {
            "map": demo_header.get("map_name") or demo_header.get("mapName") or demo_header.get("map"),
            "sample_every": sample_every,
            "max_frames": MAX_RADAR_FRAMES,
            "frames": radar_frames,
            "total_rounds": len(round_timeline),
            "total_sampled_frames": len(radar_frames),
        },
        "metrics": {
            "map": demo_header.get("map_name") or demo_header.get("mapName") or demo_header.get("map"),
            "sample_every": sample_every,
            "rounds": len(round_timeline),
            "score": {"ct": final_ct, "t": final_t, "result": "unknown"},
            "player_stats": {
                "player": top_player,
                "kills": kills_by_player.get(top_player, 0),
                "deaths": deaths_by_player.get(top_player, 0),
                "assists": assists_by_player.get(top_player, 0),
                "kd": round(kills_by_player.get(top_player, 0) / max(deaths_by_player.get(top_player, 0), 1), 2),
                "adr": round(player_damage.get(top_player, 0) / max(len(round_timeline), 1), 2),
                "hs_percent": round((hs_by_player.get(top_player, 0) / max(kills_by_player.get(top_player, 0), 1)) * 100, 2),
                "kast": None,
                "opening_kills": None,
                "opening_deaths": None,
                "flash_assists": None,
                "utility_damage": player_damage.get(top_player, 0),
            },
            "round_timeline": round_timeline,
        },
        "parsed": {
            "header": _json_safe(demo_header),
            "events_count": events_count,
        },
    }


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


def _extract_radar_frames(parsed: Any, sample_every: int = DEFAULT_SAMPLE_EVERY) -> dict[str, Any]:
    if not isinstance(parsed, dict):
        return {"map": None, "frames": [], "sample_every": sample_every, "max_frames": MAX_RADAR_FRAMES}

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
            if len(radar_frames) >= MAX_RADAR_FRAMES:
                break
        if len(radar_frames) >= MAX_RADAR_FRAMES:
            break

    return {
        "map": parsed.get("mapName") or parsed.get("map"),
        "sample_every": sample_every,
        "max_frames": MAX_RADAR_FRAMES,
        "frames": radar_frames,
        "total_rounds": len(rounds),
        "total_sampled_frames": len(radar_frames),
    }


def _extract_player_stats(parsed: dict[str, Any]) -> dict[str, Any]:
    stats = parsed.get("playerStats") or parsed.get("players") or []
    if not isinstance(stats, list):
        return {}
    target = max([p for p in stats if isinstance(p, dict)], key=lambda p: _safe_int(p.get("kills")), default={})

    kills = _safe_int(target.get("kills"))
    deaths = _safe_int(target.get("deaths"))
    assists = _safe_int(target.get("assists"))
    return {
        "player": target.get("playerName") or target.get("name") or "unknown",
        "kills": kills,
        "deaths": deaths,
        "assists": assists,
        "kd": round(kills / deaths, 2) if deaths else float(kills),
        "adr": round(_safe_float(target.get("adr") or target.get("averageDamagePerRound")), 2),
        "hs_percent": round(_safe_float(target.get("hsPercent") or target.get("headshotPercentage")), 2),
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
        timeline.append(
            {
                "round": round_data.get("roundNum") or idx,
                "winner_side": round_data.get("winningSide"),
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
        result = "ct_win" if final_ct > final_t else "t_win" if final_t > final_ct else "draw"

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
        demo = awpy.Demo(Path(demo_path))
        parsed = demo.parse() if hasattr(demo, "parse") else None
        if isinstance(parsed, dict):
            return {
                "engine": "awpy.Demo",
                "summary": {
                    "type": type(parsed).__name__,
                    "events_count": len(parsed.get("kills") or parsed.get("damages") or []),
                },
                "radar": _extract_radar_frames(parsed, sample_every=sample_every),
                "metrics": _extract_metrics_summary(parsed, sample_every=sample_every),
                "parsed": {
                    "header": _json_safe(parsed.get("header") or {"map": parsed.get("mapName")}),
                    "events_count": len(parsed.get("gameRounds") or parsed.get("rounds") or []),
                },
            }

        demo_payload = _extract_demo_instance_payload(demo, sample_every=sample_every)
        if demo_payload.get("radar") or demo_payload.get("metrics"):
            return {
                "engine": "awpy.Demo",
                "summary": {"type": "DemoInstance"},
                "radar": demo_payload.get("radar"),
                "metrics": demo_payload.get("metrics"),
                "parsed": demo_payload.get("parsed"),
            }

    demo_module_spec = importlib.util.find_spec("awpy.demo")
    if demo_module_spec is not None:
        demo_module = importlib.import_module("awpy.demo")
        if hasattr(demo_module, "DemoParser"):
            parser = demo_module.DemoParser(str(demo_path))
            if hasattr(parser, "parse_events"):
                parsed = parser.parse_events()
                if parsed is not None:
                    rounds = parsed.get("gameRounds") or parsed.get("rounds") or [] if isinstance(parsed, dict) else []
                    return {
                        "engine": "awpy.demo.DemoParser",
                        "summary": {"type": type(parsed).__name__, "events_count": len(rounds)},
                        "radar": _extract_radar_frames(parsed, sample_every=sample_every),
                        "metrics": _extract_metrics_summary(parsed, sample_every=sample_every),
                        "parsed": {
                            "header": _json_safe((parsed or {}).get("header") if isinstance(parsed, dict) else {}),
                            "events_count": len(rounds),
                        },
                    }

    raise AwpyUnavailableError("AWPY API not recognized. Update integration for your installed version.")


def download_demo_file(demo_url: str, destination: str | Path) -> str:
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

    return Path(parsed_url.path).name or "downloaded.dem"


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


def analyze_demo_file(demo_path: str | Path, sample_every: int = DEFAULT_SAMPLE_EVERY) -> dict[str, Any]:
    if importlib.util.find_spec("awpy") is None:
        raise AwpyUnavailableError("AWPY is not installed. Install it with `pip install awpy` before processing demos.")

    sample_every = max(1, int(sample_every or DEFAULT_SAMPLE_EVERY))
    source_path = unpack_demo_if_needed(demo_path)
    parsed_payload = _parse_with_awpy(source_path, sample_every=sample_every)
    return {"source": str(source_path), "analysis": parsed_payload}


def download_and_analyze_demo(demo_url: str, sample_every: int = DEFAULT_SAMPLE_EVERY) -> dict[str, Any]:
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
