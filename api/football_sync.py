import json
import os
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler
from typing import Any

import psycopg2
from psycopg2.extras import Json
import requests


API_BASE_URL = "https://v3.football.api-sports.io"
DEFAULT_LEAGUE_ID = 1
DEFAULT_SEASON = 2026
DEFAULT_TIMEOUT_SECONDS = 12


class handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        try:
            self._authorize_cron()
            result = sync_api_football()
            self._send_json(200, result)
        except PermissionError as exc:
            self._send_json(401, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": str(exc)})

    def _authorize_cron(self) -> None:
        cron_secret = os.getenv("CRON_SECRET")
        if not cron_secret:
            return

        expected = f"Bearer {cron_secret}"
        received = self.headers.get("Authorization")
        if received != expected:
            raise PermissionError("Unauthorized cron request")

    def _send_json(self, status_code: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, default=str).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def sync_api_football() -> dict[str, Any]:
    api_key = os.getenv("API_FOOTBALL_KEY")
    database_url = os.getenv("DATABASE_URL")

    if not api_key:
        raise RuntimeError("Missing API_FOOTBALL_KEY environment variable")
    if not database_url:
        raise RuntimeError("Missing DATABASE_URL environment variable")

    league_id = int(os.getenv("API_FOOTBALL_LEAGUE_ID", DEFAULT_LEAGUE_ID))
    season = int(os.getenv("API_FOOTBALL_SEASON", DEFAULT_SEASON))
    team_limit = int(os.getenv("SYNC_TEAM_LIMIT", "0"))
    snapshot_timestamp = datetime.now(timezone.utc)

    api_client = ApiFootballClient(api_key)

    conn = psycopg2.connect(database_url, connect_timeout=10)
    conn.autocommit = False

    try:
        with conn.cursor() as cursor:
            team_payloads = api_client.get_teams(league_id=league_id, season=season)
            if team_limit > 0:
                team_payloads = team_payloads[:team_limit]

            team_map: dict[int, str] = {}
            for team_payload in team_payloads:
                api_team_id, team_uuid = upsert_team(cursor, team_payload)
                team_map[api_team_id] = team_uuid

            fixtures_payloads = api_client.get_fixtures(league_id=league_id, season=season)
            fixtures_updated = 0
            for fixture_payload in fixtures_payloads:
                ensure_fixture_teams(cursor, fixture_payload, team_map)
                if upsert_fixture(cursor, fixture_payload, team_map, league_id, season):
                    fixtures_updated += 1

            stats_updated = 0
            snapshots_inserted = 0
            for api_team_id, team_uuid in team_map.items():
                stats_payload = api_client.get_team_statistics(league_id=league_id, season=season, api_team_id=api_team_id)
                historical_stats = build_historical_stats(api_team_id, stats_payload)
                upsert_historical_stats(cursor, team_uuid, historical_stats)
                stats_updated += 1

                dynamic_payload = build_dynamic_snapshot(
                    api_client=api_client,
                    api_team_id=api_team_id,
                    team_uuid=team_uuid,
                    league_id=league_id,
                    season=season,
                    snapshot_timestamp=snapshot_timestamp,
                )
                insert_dynamic_snapshot(cursor, dynamic_payload)
                snapshots_inserted += 1

        conn.commit()
        return {
            "ok": True,
            "league_id": league_id,
            "season": season,
            "teams_updated": len(team_map),
            "fixtures_updated": fixtures_updated,
            "historical_stats_updated": stats_updated,
            "dynamic_snapshots_inserted": snapshots_inserted,
            "synced_at": snapshot_timestamp.isoformat(),
        }
    except (requests.Timeout, requests.RequestException, psycopg2.Error) as exc:
        conn.rollback()
        raise RuntimeError(f"Sync failed: {exc}") from exc
    finally:
        conn.close()


class ApiFootballClient:
    def __init__(self, api_key: str) -> None:
        self.session = requests.Session()
        self.session.headers.update({"x-apisports-key": api_key})
        self.timeout = int(os.getenv("API_FOOTBALL_TIMEOUT_SECONDS", DEFAULT_TIMEOUT_SECONDS))

    def get_teams(self, league_id: int, season: int) -> list[dict[str, Any]]:
        return self._get("/teams", {"league": league_id, "season": season})

    def get_fixtures(self, league_id: int, season: int) -> list[dict[str, Any]]:
        return self._get("/fixtures", {"league": league_id, "season": season})

    def get_team_statistics(self, league_id: int, season: int, api_team_id: int) -> dict[str, Any]:
        response = self._get("/teams/statistics", {"league": league_id, "season": season, "team": api_team_id})
        return response if isinstance(response, dict) else {}

    def get_injuries_count(self, league_id: int, season: int, api_team_id: int) -> int:
        injuries = self._get("/injuries", {"league": league_id, "season": season, "team": api_team_id})
        return len(injuries) if isinstance(injuries, list) else 0

    def get_recent_fixtures(self, api_team_id: int, last: int = 5) -> list[dict[str, Any]]:
        return self._get("/fixtures", {"team": api_team_id, "last": last})

    def _get(self, path: str, params: dict[str, Any]) -> Any:
        response = self.session.get(f"{API_BASE_URL}{path}", params=params, timeout=self.timeout)
        response.raise_for_status()
        payload = response.json()

        errors = payload.get("errors")
        if errors:
            raise RuntimeError(f"API-Football error on {path}: {errors}")

        return payload.get("response", [])


def upsert_team(cursor: Any, team_payload: dict[str, Any]) -> tuple[int, str]:
    team = team_payload.get("team", team_payload)
    api_team_id = int(team["id"])
    name = team.get("name") or f"Team {api_team_id}"
    country = team.get("country")
    logo_url = team.get("logo")
    is_national = bool(team.get("national", True))

    cursor.execute(
        """
        insert into public.teams (api_team_id, name, country, logo_url, is_national, updated_at)
        values (%s, %s, %s, %s, %s, now())
        on conflict (api_team_id) do update set
          name = excluded.name,
          country = excluded.country,
          logo_url = excluded.logo_url,
          is_national = excluded.is_national,
          updated_at = now()
        returning id
        """,
        (api_team_id, name, country, logo_url, is_national),
    )
    team_uuid = cursor.fetchone()[0]
    return api_team_id, str(team_uuid)


def ensure_fixture_teams(cursor: Any, fixture_payload: dict[str, Any], team_map: dict[int, str]) -> None:
    teams = fixture_payload.get("teams", {})
    for side in ("home", "away"):
        team = teams.get(side) or {}
        api_team_id = team.get("id")
        if not api_team_id or api_team_id in team_map:
            continue

        api_team_id, team_uuid = upsert_team(cursor, {"team": team})
        team_map[api_team_id] = team_uuid


def upsert_fixture(
    cursor: Any,
    fixture_payload: dict[str, Any],
    team_map: dict[int, str],
    league_id: int,
    season: int,
) -> bool:
    fixture = fixture_payload.get("fixture", {})
    teams = fixture_payload.get("teams", {})
    league = fixture_payload.get("league", {})

    api_fixture_id = fixture.get("id")
    home_api_team_id = (teams.get("home") or {}).get("id")
    away_api_team_id = (teams.get("away") or {}).get("id")

    if not api_fixture_id or home_api_team_id not in team_map or away_api_team_id not in team_map:
        return False

    status = fixture.get("status") or {}
    venue = fixture.get("venue") or {}

    cursor.execute(
        """
        insert into public.fixtures (
          api_fixture_id,
          home_team_id,
          away_team_id,
          home_api_team_id,
          away_api_team_id,
          kickoff_at,
          status_short,
          status_long,
          league_id,
          season,
          venue_name,
          updated_at
        )
        values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now())
        on conflict (api_fixture_id) do update set
          home_team_id = excluded.home_team_id,
          away_team_id = excluded.away_team_id,
          home_api_team_id = excluded.home_api_team_id,
          away_api_team_id = excluded.away_api_team_id,
          kickoff_at = excluded.kickoff_at,
          status_short = excluded.status_short,
          status_long = excluded.status_long,
          league_id = excluded.league_id,
          season = excluded.season,
          venue_name = excluded.venue_name,
          updated_at = now()
        """,
        (
            api_fixture_id,
            team_map[home_api_team_id],
            team_map[away_api_team_id],
            home_api_team_id,
            away_api_team_id,
            fixture.get("date"),
            status.get("short") or "TBD",
            status.get("long"),
            league.get("id") or league_id,
            league.get("season") or season,
            venue.get("name"),
        ),
    )
    return True


def build_historical_stats(api_team_id: int, stats_payload: dict[str, Any]) -> dict[str, Any]:
    fixtures = stats_payload.get("fixtures", {})
    goals = stats_payload.get("goals", {})
    played = int(((fixtures.get("played") or {}).get("total")) or 0)

    goals_for = float((((goals.get("for") or {}).get("total") or {}).get("total")) or 0)
    goals_against = float((((goals.get("against") or {}).get("total") or {}).get("total")) or 0)
    avg_goals_for = goals_for / played if played else 0
    avg_goals_against = goals_against / played if played else 0
    accumulated_xg = extract_accumulated_xg(stats_payload)
    elo_rating = estimate_elo_rating(avg_goals_for, avg_goals_against, played)

    return {
        "api_team_id": api_team_id,
        "elo_rating": elo_rating,
        "avg_goals_for": avg_goals_for,
        "avg_goals_against": avg_goals_against,
        "accumulated_xg": accumulated_xg,
        "fixtures_analyzed": played,
    }


def upsert_historical_stats(cursor: Any, team_uuid: str, stats: dict[str, Any]) -> None:
    cursor.execute(
        """
        insert into public.team_historical_stats (
          team_id,
          api_team_id,
          elo_rating,
          avg_goals_for,
          avg_goals_against,
          accumulated_xg,
          fixtures_analyzed,
          last_api_sync_at,
          updated_at
        )
        values (%s, %s, %s, %s, %s, %s, %s, now(), now())
        on conflict (team_id) do update set
          api_team_id = excluded.api_team_id,
          elo_rating = excluded.elo_rating,
          avg_goals_for = excluded.avg_goals_for,
          avg_goals_against = excluded.avg_goals_against,
          accumulated_xg = excluded.accumulated_xg,
          fixtures_analyzed = excluded.fixtures_analyzed,
          last_api_sync_at = now(),
          updated_at = now()
        """,
        (
            team_uuid,
            stats["api_team_id"],
            stats["elo_rating"],
            stats["avg_goals_for"],
            stats["avg_goals_against"],
            stats["accumulated_xg"],
            stats["fixtures_analyzed"],
        ),
    )


def build_dynamic_snapshot(
    api_client: ApiFootballClient,
    api_team_id: int,
    team_uuid: str,
    league_id: int,
    season: int,
    snapshot_timestamp: datetime,
) -> dict[str, Any]:
    injuries_count = api_client.get_injuries_count(league_id=league_id, season=season, api_team_id=api_team_id)
    recent_fixtures = api_client.get_recent_fixtures(api_team_id=api_team_id, last=5)

    return {
        "team_id": team_uuid,
        "api_team_id": api_team_id,
        "snapshot_timestamp": snapshot_timestamp,
        "injuries_count": injuries_count,
        "fatigue_index": estimate_fatigue_index(recent_fixtures, snapshot_timestamp),
        "recent_momentum": estimate_recent_momentum(api_team_id, recent_fixtures),
        "payload": {
            "recent_fixture_count": len(recent_fixtures),
            "source": "api-football",
        },
    }


def insert_dynamic_snapshot(cursor: Any, snapshot: dict[str, Any]) -> None:
    cursor.execute(
        """
        insert into public.team_dynamic_snapshots (
          team_id,
          api_team_id,
          snapshot_timestamp,
          injuries_count,
          fatigue_index,
          recent_momentum,
          payload
        )
        values (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            snapshot["team_id"],
            snapshot["api_team_id"],
            snapshot["snapshot_timestamp"],
            snapshot["injuries_count"],
            snapshot["fatigue_index"],
            snapshot["recent_momentum"],
            Json(snapshot["payload"]),
        ),
    )


def extract_accumulated_xg(stats_payload: dict[str, Any]) -> float:
    expected = stats_payload.get("expected_goals") or stats_payload.get("xg") or {}
    if isinstance(expected, dict):
        value = expected.get("total") or expected.get("for") or 0
        return float(value or 0)
    return 0


def estimate_elo_rating(avg_goals_for: float, avg_goals_against: float, played: int) -> float:
    goal_delta = avg_goals_for - avg_goals_against
    sample_weight = min(played, 20) / 20 if played else 0
    return round(1500 + (goal_delta * 120 * sample_weight), 2)


def estimate_fatigue_index(recent_fixtures: list[dict[str, Any]], now_utc: datetime) -> float:
    if not recent_fixtures:
        return 0

    fatigue = 0.0
    for fixture_payload in recent_fixtures:
        fixture_date = ((fixture_payload.get("fixture") or {}).get("date")) or ""
        try:
            played_at = datetime.fromisoformat(fixture_date.replace("Z", "+00:00"))
        except ValueError:
            continue

        days_since_match = max((now_utc - played_at).total_seconds() / 86400, 0)
        fatigue += max(0, 1 - (days_since_match / 14))

    return round(min(fatigue / 5, 1), 3)


def estimate_recent_momentum(api_team_id: int, recent_fixtures: list[dict[str, Any]]) -> float:
    if not recent_fixtures:
        return 0

    points = 0
    counted = 0
    for fixture_payload in recent_fixtures:
        teams = fixture_payload.get("teams") or {}
        goals = fixture_payload.get("goals") or {}
        home_team = teams.get("home") or {}
        away_team = teams.get("away") or {}

        home_goals = goals.get("home")
        away_goals = goals.get("away")
        if home_goals is None or away_goals is None:
            continue

        is_home = home_team.get("id") == api_team_id
        team_goals = home_goals if is_home else away_goals
        opponent_goals = away_goals if is_home else home_goals

        if team_goals > opponent_goals:
            points += 3
        elif team_goals == opponent_goals:
            points += 1
        counted += 1

    if counted == 0:
        return 0

    return round(points / (counted * 3), 3)
