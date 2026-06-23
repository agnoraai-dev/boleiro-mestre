import { activeCompetition } from "@/lib/competitions";
import { getTeam } from "@/lib/teams";

export type Match = {
  id: string;
  competitionId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  startsAt: string;
  stage: string;
};

const matchPairs = [
  ["Brasil", "Mexico", "Fase de grupos", "2026-06-12T21:00:00.000Z"],
  ["Argentina", "Japao", "Fase de grupos", "2026-06-13T18:00:00.000Z"],
  ["Franca", "Uruguai", "Fase de grupos", "2026-06-14T19:00:00.000Z"],
  ["Inglaterra", "Portugal", "Fase de grupos", "2026-06-15T22:00:00.000Z"],
  ["Espanha", "Holanda", "Fase de grupos", "2026-06-16T20:00:00.000Z"],
  ["Alemanha", "Italia", "Fase de grupos", "2026-06-17T17:00:00.000Z"]
] as const;

export const matches: Match[] = matchPairs.map(([homeTeamName, awayTeamName, stage, startsAt], index) => {
  const homeTeam = getTeam(homeTeamName, activeCompetition.id);
  const awayTeam = getTeam(awayTeamName, activeCompetition.id);

  return {
    id: `31111111-1111-4111-8111-11111111111${index + 1}`,
    competitionId: activeCompetition.id,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeTeamName,
    awayTeamName,
    startsAt,
    stage
  };
});

export function getMatchesByCompetitionId(competitionId: string) {
  return matches.filter((match) => match.competitionId === competitionId);
}

export function getMatchById(matchId: string) {
  return matches.find((match) => match.id === matchId);
}
