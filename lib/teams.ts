import { activeCompetition } from "@/lib/competitions";

export type Team = {
  id: string;
  competitionId: string;
  name: string;
  code: string;
  attack: number;
  defense: number;
  flair: string;
};

export const teams: Team[] = [
  { id: "21111111-1111-4111-8111-111111111111", competitionId: activeCompetition.id, name: "Brasil", code: "BRA", attack: 94, defense: 87, flair: "ginga, pressao e camisa pesada" },
  { id: "21111111-1111-4111-8111-111111111112", competitionId: activeCompetition.id, name: "Argentina", code: "ARG", attack: 91, defense: 86, flair: "catimba fina e toque de craque" },
  { id: "21111111-1111-4111-8111-111111111113", competitionId: activeCompetition.id, name: "Franca", code: "FRA", attack: 92, defense: 88, flair: "velocidade pelas pontas" },
  { id: "21111111-1111-4111-8111-111111111114", competitionId: activeCompetition.id, name: "Alemanha", code: "ALE", attack: 86, defense: 84, flair: "organizacao e chute de fora" },
  { id: "21111111-1111-4111-8111-111111111115", competitionId: activeCompetition.id, name: "Espanha", code: "ESP", attack: 84, defense: 85, flair: "posse de bola ate cansar" },
  { id: "21111111-1111-4111-8111-111111111116", competitionId: activeCompetition.id, name: "Inglaterra", code: "ING", attack: 87, defense: 84, flair: "bola parada perigosa" },
  { id: "21111111-1111-4111-8111-111111111117", competitionId: activeCompetition.id, name: "Portugal", code: "POR", attack: 88, defense: 82, flair: "talento no ultimo terco" },
  { id: "21111111-1111-4111-8111-111111111118", competitionId: activeCompetition.id, name: "Uruguai", code: "URU", attack: 82, defense: 83, flair: "garra ate o apito final" },
  { id: "21111111-1111-4111-8111-111111111119", competitionId: activeCompetition.id, name: "Holanda", code: "HOL", attack: 85, defense: 84, flair: "transicao rapida" },
  { id: "21111111-1111-4111-8111-111111111120", competitionId: activeCompetition.id, name: "Italia", code: "ITA", attack: 81, defense: 88, flair: "defesa cascuda" },
  { id: "21111111-1111-4111-8111-111111111121", competitionId: activeCompetition.id, name: "Japao", code: "JAP", attack: 78, defense: 76, flair: "ritmo alto e disciplina" },
  { id: "21111111-1111-4111-8111-111111111122", competitionId: activeCompetition.id, name: "Mexico", code: "MEX", attack: 77, defense: 75, flair: "torcida quente e contra-ataque" }
];

export function getTeamsByCompetitionId(competitionId: string) {
  return teams.filter((team) => team.competitionId === competitionId);
}

export function getTeam(name: string, competitionId = activeCompetition.id) {
  return getTeamsByCompetitionId(competitionId).find((team) => team.name === name) ?? getTeamsByCompetitionId(competitionId)[0] ?? teams[0];
}
