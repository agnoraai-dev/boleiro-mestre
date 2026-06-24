import { activeCompetition, getCompetitionBySlug } from "@/lib/competitions";
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
  group: string;
  round: string;
  matchday: number | null;
  venue: string;
  city: string;
  status: "scheduled" | "live" | "finished";
  source: "local" | "api";
};

const matchRows = [
  ["copa-do-mundo-2026", "Portugal", "Uzbequistão", "Grupo K - rodada 2", "K", "Rodada 2", 2, "Houston Stadium", "Houston", "2026-06-23T17:00:00.000Z"],
  ["copa-do-mundo-2026", "Inglaterra", "Gana", "Grupo L - rodada 2", "L", "Rodada 2", 2, "Boston Stadium", "Boston", "2026-06-23T20:00:00.000Z"],
  ["copa-do-mundo-2026", "Panamá", "Croácia", "Grupo L - rodada 2", "L", "Rodada 2", 2, "Toronto Stadium", "Toronto", "2026-06-23T23:00:00.000Z"],
  ["copa-do-mundo-2026", "Colômbia", "RD Congo", "Grupo K - rodada 2", "K", "Rodada 2", 2, "Estádio Guadalajara", "Guadalajara", "2026-06-24T02:00:00.000Z"],
  ["copa-do-mundo-2026", "Escócia", "Brasil", "Grupo C - rodada 3", "C", "Rodada 3", 3, "Miami Stadium", "Miami", "2026-06-24T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Marrocos", "Haiti", "Grupo C - rodada 3", "C", "Rodada 3", 3, "Atlanta Stadium", "Atlanta", "2026-06-24T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Suíça", "Canadá", "Grupo B - rodada 3", "B", "Rodada 3", 3, "BC Place Vancouver", "Vancouver", "2026-06-24T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Bósnia e Herzegovina", "Catar", "Grupo B - rodada 3", "B", "Rodada 3", 3, "Seattle Stadium", "Seattle", "2026-06-24T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Tchéquia", "México", "Grupo A - rodada 3", "A", "Rodada 3", 3, "Mexico City Stadium", "Cidade do México", "2026-06-25T01:00:00.000Z"],
  ["copa-do-mundo-2026", "África do Sul", "Coreia do Sul", "Grupo A - rodada 3", "A", "Rodada 3", 3, "Estádio Monterrey", "Monterrey", "2026-06-25T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Curaçao", "Costa do Marfim", "Grupo E - rodada 3", "E", "Rodada 3", 3, "Philadelphia Stadium", "Philadelphia", "2026-06-25T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Equador", "Alemanha", "Grupo E - rodada 3", "E", "Rodada 3", 3, "New York New Jersey Stadium", "New York/New Jersey", "2026-06-25T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Japão", "Suécia", "Grupo F - rodada 3", "F", "Rodada 3", 3, "Dallas Stadium", "Dallas", "2026-06-25T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Tunísia", "Holanda", "Grupo F - rodada 3", "F", "Rodada 3", 3, "Kansas City Stadium", "Kansas City", "2026-06-25T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Turquia", "Estados Unidos", "Grupo D - rodada 3", "D", "Rodada 3", 3, "Los Angeles Stadium", "Los Angeles", "2026-06-26T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Paraguai", "Austrália", "Grupo D - rodada 3", "D", "Rodada 3", 3, "San Francisco Bay Area Stadium", "San Francisco Bay Area", "2026-06-26T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Noruega", "França", "Grupo I - rodada 3", "I", "Rodada 3", 3, "Boston Stadium", "Boston", "2026-06-26T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Senegal", "Iraque", "Grupo I - rodada 3", "I", "Rodada 3", 3, "Toronto Stadium", "Toronto", "2026-06-26T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Egito", "Irã", "Grupo G - rodada 3", "G", "Rodada 3", 3, "Seattle Stadium", "Seattle", "2026-06-26T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Nova Zelândia", "Bélgica", "Grupo G - rodada 3", "G", "Rodada 3", 3, "BC Place Vancouver", "Vancouver", "2026-06-26T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Cabo Verde", "Arábia Saudita", "Grupo H - rodada 3", "H", "Rodada 3", 3, "Houston Stadium", "Houston", "2026-06-27T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Uruguai", "Espanha", "Grupo H - rodada 3", "H", "Rodada 3", 3, "Estádio Guadalajara", "Guadalajara", "2026-06-27T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Argélia", "Áustria", "Grupo J - rodada 3", "J", "Rodada 3", 3, "Kansas City Stadium", "Kansas City", "2026-06-27T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Jordânia", "Argentina", "Grupo J - rodada 3", "J", "Rodada 3", 3, "Dallas Stadium", "Dallas", "2026-06-27T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Colômbia", "Portugal", "Grupo K - rodada 3", "K", "Rodada 3", 3, "Miami Stadium", "Miami", "2026-06-27T22:00:00.000Z"],
  ["copa-do-mundo-2026", "RD Congo", "Uzbequistão", "Grupo K - rodada 3", "K", "Rodada 3", 3, "Atlanta Stadium", "Atlanta", "2026-06-27T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Panamá", "Inglaterra", "Grupo L - rodada 3", "L", "Rodada 3", 3, "New York New Jersey Stadium", "New York/New Jersey", "2026-06-28T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Croácia", "Gana", "Grupo L - rodada 3", "L", "Rodada 3", 3, "Philadelphia Stadium", "Philadelphia", "2026-06-28T01:00:00.000Z"]
] as const;

function createMatchId(index: number) {
  return `31111111-1111-4111-8111-${String(index + 1).padStart(12, "0")}`;
}

export const matches: Match[] = matchRows.map(([competitionSlug, homeTeamName, awayTeamName, stage, group, round, matchday, venue, city, startsAt], index) => {
  const competition = getCompetitionBySlug(competitionSlug) ?? activeCompetition;
  const homeTeam = getTeam(homeTeamName, competition.id);
  const awayTeam = getTeam(awayTeamName, competition.id);

  return {
    id: createMatchId(index),
    competitionId: competition.id,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeTeamName,
    awayTeamName,
    startsAt,
    stage,
    group,
    round,
    matchday,
    venue,
    city,
    status: "scheduled",
    source: "local"
  };
});

export function getMatchesByCompetitionId(competitionId: string) {
  return matches.filter((match) => match.competitionId === competitionId);
}

export function getMatchById(matchId: string) {
  return matches.find((match) => match.id === matchId);
}

export function getUpcomingMatchesByCompetitionId(competitionId: string, limit = 8, from = new Date()) {
  const fromTime = from.getTime();

  return getMatchesByCompetitionId(competitionId)
    .filter((match) => new Date(match.startsAt).getTime() >= fromTime)
    .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime())
    .slice(0, limit);
}
