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
  tuningSummary?: string;
  commentary: string;
};

export type GameRhythm = "balanced" | "open" | "locked";

export type PredictionTuning = {
  homeMomentum: number;
  awayMomentum: number;
  homeAdvantage: number;
  gameRhythm: GameRhythm;
};

export const defaultPredictionTuning: PredictionTuning = {
  homeMomentum: 0,
  awayMomentum: 0,
  homeAdvantage: 3,
  gameRhythm: "balanced"
};

const rhythmAdjustments: Record<GameRhythm, { drawShift: number; goalShift: number; label: string }> = {
  balanced: { drawShift: 0, goalShift: 0, label: "equilibrado" },
  open: { drawShift: -4, goalShift: 0.35, label: "aberto" },
  locked: { drawShift: 5, goalShift: -0.35, label: "truncado" }
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeTuning(tuning: PredictionTuning = defaultPredictionTuning): PredictionTuning {
  return {
    homeMomentum: clamp(Math.round(tuning.homeMomentum), -10, 10),
    awayMomentum: clamp(Math.round(tuning.awayMomentum), -10, 10),
    homeAdvantage: clamp(Math.round(tuning.homeAdvantage), 0, 10),
    gameRhythm: tuning.gameRhythm in rhythmAdjustments ? tuning.gameRhythm : defaultPredictionTuning.gameRhythm
  };
}

function stableNoise(seed: string, range: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return (hash % (range * 2 + 1)) - range;
}

function formatSigned(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function buildTuningSummary(tuning: PredictionTuning) {
  return `Ajustes: mandante ${formatSigned(tuning.homeMomentum)}, visitante ${formatSigned(tuning.awayMomentum)}, mando ${tuning.homeAdvantage}/10, ritmo ${rhythmAdjustments[tuning.gameRhythm].label}.`;
}

export function calculatePrediction(
  teamA: Team,
  teamB: Team,
  competitionSlug: string,
  matchId?: string,
  tuning: PredictionTuning = defaultPredictionTuning
): PredictionResult {
  const normalizedTuning = normalizeTuning(tuning);
  const rhythm = rhythmAdjustments[normalizedTuning.gameRhythm];
  const homeContextBoost = normalizedTuning.homeMomentum * 1.15 + normalizedTuning.homeAdvantage * 1.35;
  const awayContextBoost = normalizedTuning.awayMomentum * 1.15;
  const strengthA = teamA.attack * 0.62 + teamA.defense * 0.38 + stableNoise(teamA.code + teamB.code, 5) + homeContextBoost;
  const strengthB = teamB.attack * 0.62 + teamB.defense * 0.38 + stableNoise(teamB.code + teamA.code, 5) + awayContextBoost;
  const diff = strengthA - strengthB;

  const momentumGap = Math.abs(normalizedTuning.homeMomentum - normalizedTuning.awayMomentum);
  const probabilityDraw = clamp(Math.round(27 - Math.abs(diff) * 0.35 + rhythm.drawShift - momentumGap * 0.15), 12, 36);
  const remaining = 100 - probabilityDraw;
  const probabilityA = clamp(Math.round(remaining * (0.5 + diff / 90)), 18, remaining - 18);
  const probabilityB = 100 - probabilityDraw - probabilityA;

  const expectedA = clamp(
    Math.round(
      teamA.attack / 42 -
        teamB.defense / 95 +
        1.2 +
        diff / 45 +
        normalizedTuning.homeMomentum / 18 +
        normalizedTuning.homeAdvantage / 18 +
        rhythm.goalShift
    ),
    0,
    6
  );
  const expectedB = clamp(
    Math.round(teamB.attack / 42 - teamA.defense / 95 + 1.2 - diff / 45 + normalizedTuning.awayMomentum / 18 + rhythm.goalShift),
    0,
    6
  );
  const tuningSummary = buildTuningSummary(normalizedTuning);

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
    tuningSummary,
    commentary: buildFallbackCommentary(teamA, teamB, expectedA, expectedB, tuningSummary)
  };
}

export function buildFallbackCommentary(teamA: Team, teamB: Team, scoreA: number, scoreB: number, tuningSummary?: string) {
  const winner =
    scoreA === scoreB ? "empate com cara de jogo nervoso" : scoreA > scoreB ? `vitória do ${teamA.name}` : `vitória do ${teamB.name}`;

  return `O Boleiro Mestre cravou ${teamA.name} ${scoreA} x ${scoreB} ${teamB.name}: ${winner}. Vai ter ${teamA.flair} de um lado, ${teamB.flair} do outro, e aquele jogo em que até lateral pode virar lance perigoso.${tuningSummary ? ` ${tuningSummary}` : ""}`;
}
