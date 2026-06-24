"""Football probability engine based on Elo, expected goals and Poisson.

The module is intentionally self-contained:
- DataProcessor transforms API-like JSON into normalized team metrics.
- EloRating updates national team ratings from historical fixtures.
- ProbabilityEngine converts team strengths into lambdas and probability markets.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import exp, factorial
from typing import Any

import numpy as np


EPSILON = 1e-9


@dataclass(frozen=True)
class TeamProfile:
    """Processed team metrics consumed by the probability engine."""

    name: str
    elo: float
    avg_goals_for_home: float
    avg_goals_against_home: float
    avg_goals_for_away: float
    avg_goals_against_away: float
    attack_strength_home: float
    defense_weakness_home: float
    attack_strength_away: float
    defense_weakness_away: float


@dataclass(frozen=True)
class ProcessedDataset:
    """Container for team profiles and league-level baselines."""

    teams: dict[str, TeamProfile]
    league_avg_home_goals: float
    league_avg_away_goals: float


class DataProcessor:
    """Convert API JSON into home/away goal averages and strength indexes."""

    def __init__(self, api_payload: dict[str, Any]) -> None:
        self.api_payload = api_payload

    def process(self) -> ProcessedDataset:
        """Build team profiles from a JSON payload.

        Expected payload shape:
            {
                "teams": [
                    {
                        "name": "Selecao A",
                        "elo": 1800,
                        "matches": [
                            {"home": true, "goals_for": 2, "goals_against": 1}
                        ]
                    }
                ]
            }
        """

        teams_payload = self.api_payload.get("teams", [])
        if not teams_payload:
            raise ValueError("Payload must include at least one team")

        league_avg_home_goals = self._league_average_goals(teams_payload, home=True)
        league_avg_away_goals = self._league_average_goals(teams_payload, home=False)

        profiles = {
            team_payload["name"]: self._build_team_profile(
                team_payload=team_payload,
                league_avg_home_goals=league_avg_home_goals,
                league_avg_away_goals=league_avg_away_goals,
            )
            for team_payload in teams_payload
        }

        return ProcessedDataset(
            teams=profiles,
            league_avg_home_goals=league_avg_home_goals,
            league_avg_away_goals=league_avg_away_goals,
        )

    def _build_team_profile(
        self,
        team_payload: dict[str, Any],
        league_avg_home_goals: float,
        league_avg_away_goals: float,
    ) -> TeamProfile:
        home_matches = self._matches_by_venue(team_payload, home=True)
        away_matches = self._matches_by_venue(team_payload, home=False)

        avg_for_home = self._average(home_matches, "goals_for")
        avg_against_home = self._average(home_matches, "goals_against")
        avg_for_away = self._average(away_matches, "goals_for")
        avg_against_away = self._average(away_matches, "goals_against")

        return TeamProfile(
            name=team_payload["name"],
            elo=float(team_payload.get("elo", 1500)),
            avg_goals_for_home=avg_for_home,
            avg_goals_against_home=avg_against_home,
            avg_goals_for_away=avg_for_away,
            avg_goals_against_away=avg_against_away,
            attack_strength_home=avg_for_home / max(league_avg_home_goals, EPSILON),
            defense_weakness_home=avg_against_home / max(league_avg_away_goals, EPSILON),
            attack_strength_away=avg_for_away / max(league_avg_away_goals, EPSILON),
            defense_weakness_away=avg_against_away / max(league_avg_home_goals, EPSILON),
        )

    @staticmethod
    def _matches_by_venue(
        team_payload: dict[str, Any],
        *,
        home: bool,
    ) -> list[dict[str, Any]]:
        return [
            match
            for match in team_payload.get("matches", [])
            if bool(match.get("home")) is home
        ]

    @staticmethod
    def _average(matches: list[dict[str, Any]], key: str) -> float:
        if not matches:
            return 0.0
        return float(sum(float(match.get(key, 0)) for match in matches) / len(matches))

    def _league_average_goals(
        self,
        teams_payload: list[dict[str, Any]],
        *,
        home: bool,
    ) -> float:
        values = [
            float(match.get("goals_for", 0))
            for team_payload in teams_payload
            for match in self._matches_by_venue(team_payload, home=home)
        ]
        if not values:
            return 1.0
        return max(float(sum(values) / len(values)), EPSILON)


class EloRating:
    """Rating Elo implementation with home advantage adjustment."""

    def __init__(
        self,
        initial_ratings: dict[str, float] | None = None,
        *,
        k_factor: float = 32.0,
        home_advantage: float = 65.0,
    ) -> None:
        self.ratings = initial_ratings.copy() if initial_ratings else {}
        self.k_factor = k_factor
        self.home_advantage = home_advantage

    def get_rating(self, team_name: str) -> float:
        """Return a team rating, using 1500 as neutral starting point."""

        return self.ratings.get(team_name, 1500.0)

    def expected_score(
        self,
        team_rating: float,
        opponent_rating: float,
        *,
        home: bool = False,
    ) -> float:
        """Calculate Elo expected score adjusted for home advantage."""

        adjusted_rating = team_rating + (self.home_advantage if home else 0.0)
        exponent = (opponent_rating - adjusted_rating) / 400.0
        return 1.0 / (1.0 + 10.0**exponent)

    def update_match(
        self,
        home_team: str,
        away_team: str,
        home_goals: int,
        away_goals: int,
    ) -> tuple[float, float]:
        """Update ratings after a historical match and return new ratings."""

        home_rating = self.get_rating(home_team)
        away_rating = self.get_rating(away_team)

        actual_home = self._actual_score(home_goals, away_goals)
        expected_home = self.expected_score(home_rating, away_rating, home=True)
        margin_multiplier = self._margin_multiplier(home_goals, away_goals)

        rating_delta = self.k_factor * margin_multiplier * (
            actual_home - expected_home
        )
        self.ratings[home_team] = home_rating + rating_delta
        self.ratings[away_team] = away_rating - rating_delta

        return self.ratings[home_team], self.ratings[away_team]

    def process_matches(self, matches: list[dict[str, Any]]) -> dict[str, float]:
        """Process historical fixtures in chronological order."""

        ordered_matches = sorted(matches, key=lambda item: item.get("date", ""))
        for match in ordered_matches:
            self.update_match(
                home_team=match["home_team"],
                away_team=match["away_team"],
                home_goals=int(match["home_goals"]),
                away_goals=int(match["away_goals"]),
            )
        return self.ratings.copy()

    @staticmethod
    def _actual_score(home_goals: int, away_goals: int) -> float:
        if home_goals > away_goals:
            return 1.0
        if home_goals == away_goals:
            return 0.5
        return 0.0

    @staticmethod
    def _margin_multiplier(home_goals: int, away_goals: int) -> float:
        goal_diff = abs(home_goals - away_goals)
        if goal_diff <= 1:
            return 1.0
        return 1.0 + np.log(goal_diff)


class ProbabilityEngine:
    """Calculate score matrix and football betting market probabilities."""

    def __init__(
        self,
        *,
        max_goals: int = 5,
        elo_scale: float = 400.0,
        lambda_floor: float = 0.05,
        lambda_ceiling: float = 4.5,
    ) -> None:
        self.max_goals = max_goals
        self.elo_scale = elo_scale
        self.lambda_floor = lambda_floor
        self.lambda_ceiling = lambda_ceiling

    def calculate_lambdas(
        self,
        home_team: TeamProfile,
        away_team: TeamProfile,
        league_avg_home_goals: float,
        league_avg_away_goals: float,
    ) -> tuple[float, float]:
        """Estimate expected goals for home and away teams.

        Lambda combines:
        - league baseline goals by venue,
        - team attack strength,
        - opponent defensive weakness,
        - Elo-relative multiplier.
        """

        home_elo_multiplier = self._elo_multiplier(home_team.elo, away_team.elo)
        away_elo_multiplier = self._elo_multiplier(away_team.elo, home_team.elo)

        lambda_home = (
            league_avg_home_goals
            * home_team.attack_strength_home
            * away_team.defense_weakness_away
            * home_elo_multiplier
        )
        lambda_away = (
            league_avg_away_goals
            * away_team.attack_strength_away
            * home_team.defense_weakness_home
            * away_elo_multiplier
        )

        return (
            float(np.clip(lambda_home, self.lambda_floor, self.lambda_ceiling)),
            float(np.clip(lambda_away, self.lambda_floor, self.lambda_ceiling)),
        )

    def score_matrix(self, lambda_home: float, lambda_away: float) -> np.ndarray:
        """Return normalized Poisson score matrix from 0x0 to max_goals x max_goals."""

        goals = np.arange(self.max_goals + 1)
        home_probs = self._poisson_vector(lambda_home, goals)
        away_probs = self._poisson_vector(lambda_away, goals)
        matrix = np.outer(home_probs, away_probs)
        return matrix / matrix.sum()

    def calculate_probabilities(
        self,
        home_team: TeamProfile,
        away_team: TeamProfile,
        league_avg_home_goals: float,
        league_avg_away_goals: float,
    ) -> dict[str, Any]:
        """Calculate 1X2, BTTS and Over/Under 2.5 probabilities."""

        lambda_home, lambda_away = self.calculate_lambdas(
            home_team=home_team,
            away_team=away_team,
            league_avg_home_goals=league_avg_home_goals,
            league_avg_away_goals=league_avg_away_goals,
        )
        matrix = self.score_matrix(lambda_home, lambda_away)

        home_win = float(np.tril(matrix, k=-1).sum())
        draw = float(np.trace(matrix))
        away_win = float(np.triu(matrix, k=1).sum())

        both_score_yes = float(matrix[1:, 1:].sum())
        both_score_no = 1.0 - both_score_yes

        goal_grid_home, goal_grid_away = np.meshgrid(
            np.arange(self.max_goals + 1),
            np.arange(self.max_goals + 1),
            indexing="ij",
        )
        total_goals = goal_grid_home + goal_grid_away
        over_2_5 = float(matrix[total_goals > 2.5].sum())
        under_2_5 = 1.0 - over_2_5

        most_likely_index = np.unravel_index(np.argmax(matrix), matrix.shape)

        return {
            "lambda_home": round(lambda_home, 4),
            "lambda_away": round(lambda_away, 4),
            "matrix_sum": round(float(matrix.sum()), 10),
            "most_likely_score": {
                "home_goals": int(most_likely_index[0]),
                "away_goals": int(most_likely_index[1]),
                "probability": round(float(matrix[most_likely_index]), 6),
            },
            "market_1x2": {
                "home_win": round(home_win, 6),
                "draw": round(draw, 6),
                "away_win": round(away_win, 6),
            },
            "both_teams_to_score": {
                "yes": round(both_score_yes, 6),
                "no": round(both_score_no, 6),
            },
            "total_goals_2_5": {
                "over": round(over_2_5, 6),
                "under": round(under_2_5, 6),
            },
            "score_matrix_0_to_5": np.round(matrix, 6).tolist(),
        }

    def _elo_multiplier(self, team_elo: float, opponent_elo: float) -> float:
        elo_delta = (team_elo - opponent_elo) / self.elo_scale
        return float(np.clip(exp(elo_delta * 0.18), 0.75, 1.25))

    @staticmethod
    def _poisson_vector(lambda_value: float, goals: np.ndarray) -> np.ndarray:
        factorials = np.array([factorial(int(goal)) for goal in goals], dtype=float)
        return np.exp(-lambda_value) * np.power(lambda_value, goals) / factorials


def build_demo_payload() -> dict[str, Any]:
    """Return fictitious API-like data for a deterministic simulation."""

    return {
        "teams": [
            {
                "name": "Selecao A",
                "elo": 1800,
                "matches": [
                    {"home": True, "goals_for": 3, "goals_against": 1},
                    {"home": True, "goals_for": 2, "goals_against": 0},
                    {"home": True, "goals_for": 2, "goals_against": 1},
                    {"home": False, "goals_for": 1, "goals_against": 1},
                    {"home": False, "goals_for": 2, "goals_against": 1},
                    {"home": False, "goals_for": 1, "goals_against": 0},
                ],
            },
            {
                "name": "Selecao B",
                "elo": 1650,
                "matches": [
                    {"home": True, "goals_for": 1, "goals_against": 1},
                    {"home": True, "goals_for": 2, "goals_against": 2},
                    {"home": True, "goals_for": 1, "goals_against": 0},
                    {"home": False, "goals_for": 1, "goals_against": 2},
                    {"home": False, "goals_for": 0, "goals_against": 2},
                    {"home": False, "goals_for": 2, "goals_against": 3},
                ],
            },
        ],
        "historical_fixtures": [
            {
                "date": "2025-01-10",
                "home_team": "Selecao A",
                "away_team": "Selecao B",
                "home_goals": 2,
                "away_goals": 1,
            },
            {
                "date": "2025-03-14",
                "home_team": "Selecao B",
                "away_team": "Selecao A",
                "home_goals": 1,
                "away_goals": 1,
            },
        ],
    }


def run_demo() -> None:
    """Run the final simulation requested in the specification."""

    payload = build_demo_payload()
    processed = DataProcessor(payload).process()

    elo = EloRating(
        initial_ratings={
            team_name: profile.elo
            for team_name, profile in processed.teams.items()
        }
    )
    updated_ratings = elo.process_matches(payload["historical_fixtures"])

    teams = {
        name: TeamProfile(
            **{
                **profile.__dict__,
                "elo": updated_ratings.get(name, profile.elo),
            }
        )
        for name, profile in processed.teams.items()
    }

    engine = ProbabilityEngine(max_goals=5)
    probabilities = engine.calculate_probabilities(
        home_team=teams["Selecao A"],
        away_team=teams["Selecao B"],
        league_avg_home_goals=processed.league_avg_home_goals,
        league_avg_away_goals=processed.league_avg_away_goals,
    )

    print(probabilities)


if __name__ == "__main__":
    run_demo()
