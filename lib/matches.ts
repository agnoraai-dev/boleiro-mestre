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
  ["copa-do-mundo-2026", "Portugal", "Uzbekistan", "Grupo K - rodada 2", "K", "Rodada 2", 2, "Houston Stadium", "Houston", "2026-06-23T17:00:00.000Z"],
  ["copa-do-mundo-2026", "England", "Ghana", "Grupo L - rodada 2", "L", "Rodada 2", 2, "Boston Stadium", "Boston", "2026-06-23T20:00:00.000Z"],
  ["copa-do-mundo-2026", "Panama", "Croatia", "Grupo L - rodada 2", "L", "Rodada 2", 2, "Toronto Stadium", "Toronto", "2026-06-23T23:00:00.000Z"],
  ["copa-do-mundo-2026", "Colombia", "Congo DR", "Grupo K - rodada 2", "K", "Rodada 2", 2, "Estadio Guadalajara", "Guadalajara", "2026-06-24T02:00:00.000Z"],
  ["copa-do-mundo-2026", "Scotland", "Brasil", "Grupo C - rodada 3", "C", "Rodada 3", 3, "Miami Stadium", "Miami", "2026-06-24T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Morocco", "Haiti", "Grupo C - rodada 3", "C", "Rodada 3", 3, "Atlanta Stadium", "Atlanta", "2026-06-24T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Switzerland", "Canada", "Grupo B - rodada 3", "B", "Rodada 3", 3, "BC Place Vancouver", "Vancouver", "2026-06-24T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Bosnia and Herzegovina", "Qatar", "Grupo B - rodada 3", "B", "Rodada 3", 3, "Seattle Stadium", "Seattle", "2026-06-24T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Czechia", "Mexico", "Grupo A - rodada 3", "A", "Rodada 3", 3, "Mexico City Stadium", "Mexico City", "2026-06-25T01:00:00.000Z"],
  ["copa-do-mundo-2026", "South Africa", "Korea Republic", "Grupo A - rodada 3", "A", "Rodada 3", 3, "Estadio Monterrey", "Monterrey", "2026-06-25T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Curacao", "Cote d'Ivoire", "Grupo E - rodada 3", "E", "Rodada 3", 3, "Philadelphia Stadium", "Philadelphia", "2026-06-25T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Ecuador", "Germany", "Grupo E - rodada 3", "E", "Rodada 3", 3, "New York New Jersey Stadium", "New York/New Jersey", "2026-06-25T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Japan", "Sweden", "Grupo F - rodada 3", "F", "Rodada 3", 3, "Dallas Stadium", "Dallas", "2026-06-25T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Tunisia", "Netherlands", "Grupo F - rodada 3", "F", "Rodada 3", 3, "Kansas City Stadium", "Kansas City", "2026-06-25T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Turkiye", "USA", "Grupo D - rodada 3", "D", "Rodada 3", 3, "Los Angeles Stadium", "Los Angeles", "2026-06-26T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Paraguay", "Australia", "Grupo D - rodada 3", "D", "Rodada 3", 3, "San Francisco Bay Area Stadium", "San Francisco Bay Area", "2026-06-26T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Norway", "France", "Grupo I - rodada 3", "I", "Rodada 3", 3, "Boston Stadium", "Boston", "2026-06-26T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Senegal", "Iraq", "Grupo I - rodada 3", "I", "Rodada 3", 3, "Toronto Stadium", "Toronto", "2026-06-26T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Egypt", "IR Iran", "Grupo G - rodada 3", "G", "Rodada 3", 3, "Seattle Stadium", "Seattle", "2026-06-26T22:00:00.000Z"],
  ["copa-do-mundo-2026", "New Zealand", "Belgium", "Grupo G - rodada 3", "G", "Rodada 3", 3, "BC Place Vancouver", "Vancouver", "2026-06-26T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Cabo Verde", "Saudi Arabia", "Grupo H - rodada 3", "H", "Rodada 3", 3, "Houston Stadium", "Houston", "2026-06-27T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Uruguai", "Spain", "Grupo H - rodada 3", "H", "Rodada 3", 3, "Estadio Guadalajara", "Guadalajara", "2026-06-27T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Algeria", "Austria", "Grupo J - rodada 3", "J", "Rodada 3", 3, "Kansas City Stadium", "Kansas City", "2026-06-27T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Jordan", "Argentina", "Grupo J - rodada 3", "J", "Rodada 3", 3, "Dallas Stadium", "Dallas", "2026-06-27T19:00:00.000Z"],
  ["copa-do-mundo-2026", "Colombia", "Portugal", "Grupo K - rodada 3", "K", "Rodada 3", 3, "Miami Stadium", "Miami", "2026-06-27T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Congo DR", "Uzbekistan", "Grupo K - rodada 3", "K", "Rodada 3", 3, "Atlanta Stadium", "Atlanta", "2026-06-27T22:00:00.000Z"],
  ["copa-do-mundo-2026", "Panama", "England", "Grupo L - rodada 3", "L", "Rodada 3", 3, "New York New Jersey Stadium", "New York/New Jersey", "2026-06-28T01:00:00.000Z"],
  ["copa-do-mundo-2026", "Croatia", "Ghana", "Grupo L - rodada 3", "L", "Rodada 3", 3, "Philadelphia Stadium", "Philadelphia", "2026-06-28T01:00:00.000Z"]
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
