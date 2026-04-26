# Demo Analysis MVP

## 1) Product Goal
Build a deterministic first version of demo analysis that converts uploaded CS2 demos into normalized events and a compact tactical report.

## 2) MVP Scope
### Inputs
- `.dem` and `.dem.gz` files up to 500 MB.
- Optional metadata: map, source, notes.

### Core outputs
- Normalized event stream with timestamps.
- Baseline metrics for report generation.
- JSON export of the analysis payload.

## 3) Event Types in V1
Must support at least these event types:
1. `player_kill`
2. `player_damage`
3. `utility_thrown`
4. `round_start`
5. `round_end`

## 4) Baseline Metrics in V1
1. Total rounds
2. Kills
3. Deaths
4. Damage dealt
5. Utility usage count
6. K/D ratio

## 5) Non-goals for MVP
- No ML scoring.
- No role classification.
- No automatic mistake clustering.

## 6) Acceptance Criteria
- Parsing pipeline completes with unsupported raw events safely ignored.
- Analysis payload is schema-valid and versioned.
- Deterministic output for the same input demo.

## 7) Sprint-1 Plan
1. Define schema and DTOs (`Demo`, `Event`, `Metric`).
2. Implement parser skeleton with fallback handling.
3. Implement baseline analyzer for summary metrics.
4. Connect UI processing screen to real parser/analyzer state (mock data source allowed for now).
