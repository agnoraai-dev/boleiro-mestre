import type { Team } from "@/lib/teams";

export type PredictionResult = {
  competitionId: string;
  competitionSlug: string;
  matchId?: string;
  teamAId: string;
  teamBId: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  probabilityA: number;
  probabilityDraw: number;
  probabilityB: number;
  commentary: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function stableNoise(seed: string, range: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return (hash % (range * 2 + 1)) - range;
}

export function calculatePrediction(teamA: Team, teamB: Team, competitionSlug: string, matchId?: string): PredictionResult {
  const strengthA = teamA.attack * 0.62 + teamA.defense * 0.38 + stableNoise(teamA.code + teamB.code, 5);
  const strengthB = teamB.attack * 0.62 + teamB.defense * 0.38 + stableNoise(teamB.code + teamA.code, 5);
  const diff = strengthA - strengthB;

  const probabilityDraw = clamp(Math.round(27 - Math.abs(diff) * 0.35), 16, 31);
  const remaining = 100 - probabilityDraw;
  const probabilityA = clamp(Math.round(remaining * (0.5 + diff / 90)), 18, remaining - 18);
  const probabilityB = 100 - probabilityDraw - probabilityA;

  const expectedA = clamp(Math.round((teamA.attack / 42 - teamB.defense / 95 + 1.2) + diff / 45), 0, 5);
  const expectedB = clamp(Math.round((teamB.attack / 42 - teamA.defense / 95 + 1.2) - diff / 45), 0, 5);

  return {
    competitionId: teamA.competitionId,
    competitionSlug,
    matchId,
    teamAId: teamA.id,
    teamBId: teamB.id,
    teamA: teamA.name,
    teamB: teamB.name,
    scoreA: expectedA,
    scoreB: expectedB,
    probabilityA,
    probabilityDraw,
    probabilityB,
    commentary: buildFallbackCommentary(teamA, teamB, expectedA, expectedB)
  };
}

export function buildFallbackCommentary(teamA: Team, teamB: Team, scoreA: number, scoreB: number) {
  const winner =
    scoreA === scoreB ? "empate com cara de jogo nervoso" : scoreA > scoreB ? `vitoria do ${teamA.name}` : `vitoria do ${teamB.name}`;

  return `O Boleiro Mestre cravou ${teamA.name} ${scoreA} x ${scoreB} ${teamB.name}: ${winner}. Vai ter ${teamA.flair} de um lado, ${teamB.flair} do outro, e aquele clima de Copa em que ate lateral vira lance perigoso.`;
}
