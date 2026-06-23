import { activeCompetition, getCompetitionBySlug } from "@/lib/competitions";

export type Team = {
  id: string;
  competitionId: string;
  name: string;
  code: string;
  flag: string;
  group: string;
  attack: number;
  defense: number;
  flair: string;
};

type TeamRow = Omit<Team, "id" | "competitionId"> & {
  competitionSlug: string;
};

const worldCupRows: TeamRow[] = [
  { name: "Mexico", code: "MEX", flag: "🇲🇽", group: "A", attack: 79, defense: 77, flair: "torcida quente e jogo vertical" },
  { name: "South Africa", code: "RSA", flag: "🇿🇦", group: "A", attack: 72, defense: 71, flair: "contra-ataque leve e muita velocidade" },
  { name: "Korea Republic", code: "KOR", flag: "🇰🇷", group: "A", attack: 79, defense: 76, flair: "ritmo alto e disciplina" },
  { name: "Czechia", code: "CZE", flag: "🇨🇿", group: "A", attack: 76, defense: 78, flair: "bloco compacto e bola aerea" },
  { name: "Canada", code: "CAN", flag: "🇨🇦", group: "B", attack: 80, defense: 76, flair: "arrancada pelos lados" },
  { name: "Bosnia and Herzegovina", code: "BIH", flag: "🇧🇦", group: "B", attack: 77, defense: 74, flair: "meia armador e finalizacao forte" },
  { name: "Qatar", code: "QAT", flag: "🇶🇦", group: "B", attack: 71, defense: 72, flair: "posse curta e paciencia" },
  { name: "Switzerland", code: "SUI", flag: "🇨🇭", group: "B", attack: 82, defense: 84, flair: "organizacao e frieza" },
  { name: "Haiti", code: "HAI", flag: "🇭🇹", group: "C", attack: 70, defense: 68, flair: "transicao direta e energia" },
  { name: "Scotland", code: "SCO", flag: "🏴", group: "C", attack: 76, defense: 78, flair: "duelo fisico e cruzamento perigoso" },
  { name: "Brasil", code: "BRA", flag: "🇧🇷", group: "C", attack: 94, defense: 87, flair: "ginga, pressao e camisa pesada" },
  { name: "Morocco", code: "MAR", flag: "🇲🇦", group: "C", attack: 83, defense: 85, flair: "marcacao firme e contra-ataque afiado" },
  { name: "USA", code: "USA", flag: "🇺🇸", group: "D", attack: 82, defense: 79, flair: "intensidade e chegada de segunda linha" },
  { name: "Paraguay", code: "PAR", flag: "🇵🇾", group: "D", attack: 76, defense: 80, flair: "bola parada e casca grossa" },
  { name: "Australia", code: "AUS", flag: "🇦🇺", group: "D", attack: 75, defense: 78, flair: "forca fisica e jogo direto" },
  { name: "Turkiye", code: "TUR", flag: "🇹🇷", group: "D", attack: 81, defense: 76, flair: "meia criativo e chute de media distancia" },
  { name: "Curacao", code: "CUW", flag: "🇨🇼", group: "E", attack: 69, defense: 69, flair: "leveza para sair jogando" },
  { name: "Cote d'Ivoire", code: "CIV", flag: "🇨🇮", group: "E", attack: 82, defense: 78, flair: "potencia no ataque e corredor aberto" },
  { name: "Ecuador", code: "ECU", flag: "🇪🇨", group: "E", attack: 80, defense: 82, flair: "pressao alta e folego ate o fim" },
  { name: "Germany", code: "GER", flag: "🇩🇪", group: "E", attack: 87, defense: 84, flair: "organizacao e chute de fora" },
  { name: "Netherlands", code: "NED", flag: "🇳🇱", group: "F", attack: 86, defense: 85, flair: "transicao rapida e amplitude" },
  { name: "Japan", code: "JPN", flag: "🇯🇵", group: "F", attack: 79, defense: 77, flair: "ritmo alto e passe vertical" },
  { name: "Sweden", code: "SWE", flag: "🇸🇪", group: "F", attack: 80, defense: 81, flair: "bola parada perigosa" },
  { name: "Tunisia", code: "TUN", flag: "🇹🇳", group: "F", attack: 73, defense: 77, flair: "marcacao fechada e contra-golpe" },
  { name: "IR Iran", code: "IRN", flag: "🇮🇷", group: "G", attack: 77, defense: 78, flair: "jogo competitivo e finalizacao de longe" },
  { name: "New Zealand", code: "NZL", flag: "🇳🇿", group: "G", attack: 70, defense: 72, flair: "bola aerea e entrega" },
  { name: "Belgium", code: "BEL", flag: "🇧🇪", group: "G", attack: 86, defense: 80, flair: "talento entrelinhas" },
  { name: "Egypt", code: "EGY", flag: "🇪🇬", group: "G", attack: 82, defense: 78, flair: "contra-ataque com estrela" },
  { name: "Saudi Arabia", code: "KSA", flag: "🇸🇦", group: "H", attack: 74, defense: 73, flair: "linhas compactas e velocidade curta" },
  { name: "Uruguai", code: "URU", flag: "🇺🇾", group: "H", attack: 84, defense: 84, flair: "garra ate o apito final" },
  { name: "Spain", code: "ESP", flag: "🇪🇸", group: "H", attack: 86, defense: 85, flair: "posse de bola ate cansar" },
  { name: "Cabo Verde", code: "CPV", flag: "🇨🇻", group: "H", attack: 72, defense: 72, flair: "ousadia e bola esticada" },
  { name: "France", code: "FRA", flag: "🇫🇷", group: "I", attack: 93, defense: 88, flair: "velocidade pelas pontas" },
  { name: "Senegal", code: "SEN", flag: "🇸🇳", group: "I", attack: 84, defense: 82, flair: "forca fisica e ataque direto" },
  { name: "Iraq", code: "IRQ", flag: "🇮🇶", group: "I", attack: 72, defense: 73, flair: "compactacao e chegada rapida" },
  { name: "Norway", code: "NOR", flag: "🇳🇴", group: "I", attack: 86, defense: 78, flair: "referencia na area e passe longo" },
  { name: "Argentina", code: "ARG", flag: "🇦🇷", group: "J", attack: 91, defense: 86, flair: "catimba fina e toque de craque" },
  { name: "Algeria", code: "ALG", flag: "🇩🇿", group: "J", attack: 80, defense: 77, flair: "drible curto e transicao veloz" },
  { name: "Austria", code: "AUT", flag: "🇦🇹", group: "J", attack: 82, defense: 81, flair: "pressao coordenada" },
  { name: "Jordan", code: "JOR", flag: "🇯🇴", group: "J", attack: 70, defense: 71, flair: "valentia e saida direta" },
  { name: "Portugal", code: "POR", flag: "🇵🇹", group: "K", attack: 88, defense: 82, flair: "talento no ultimo terco" },
  { name: "Congo DR", code: "COD", flag: "🇨🇩", group: "K", attack: 75, defense: 76, flair: "arranque forte e duelo fisico" },
  { name: "Uzbekistan", code: "UZB", flag: "🇺🇿", group: "K", attack: 73, defense: 74, flair: "disciplina e contra-ataque" },
  { name: "Colombia", code: "COL", flag: "🇨🇴", group: "K", attack: 84, defense: 81, flair: "pontas soltos e meia criativo" },
  { name: "Ghana", code: "GHA", flag: "🇬🇭", group: "L", attack: 79, defense: 77, flair: "potencia, velocidade e bola viva" },
  { name: "Panama", code: "PAN", flag: "🇵🇦", group: "L", attack: 71, defense: 72, flair: "jogo coletivo e pressao no erro" },
  { name: "England", code: "ENG", flag: "🏴", group: "L", attack: 89, defense: 85, flair: "bola parada perigosa" },
  { name: "Croatia", code: "CRO", flag: "🇭🇷", group: "L", attack: 82, defense: 82, flair: "meio-campo tecnico e paciencia" }
].map((team) => ({ ...team, competitionSlug: "copa-do-mundo-2026" }));

const clubRows: TeamRow[] = [
  { competitionSlug: "brasileirao-serie-a-2026", name: "Atletico Mineiro", code: "CAM", flag: "🇧🇷", group: "Serie A", attack: 84, defense: 80, flair: "forca em casa e pressao no terco final" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Athletico Paranaense", code: "CAP", flag: "🇧🇷", group: "Serie A", attack: 80, defense: 79, flair: "intensidade e campo pesado para visitante" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Bahia", code: "BAH", flag: "🇧🇷", group: "Serie A", attack: 79, defense: 76, flair: "toque rapido e lado esquerdo ativo" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Botafogo", code: "BOT", flag: "🇧🇷", group: "Serie A", attack: 83, defense: 80, flair: "transicao vertical e bola parada forte" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Chapecoense", code: "CHA", flag: "🇧🇷", group: "Serie A", attack: 72, defense: 73, flair: "compactacao e entrega fisica" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Corinthians", code: "COR", flag: "🇧🇷", group: "Serie A", attack: 81, defense: 80, flair: "marcacao forte e arena quente" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Coritiba", code: "CFC", flag: "🇧🇷", group: "Serie A", attack: 74, defense: 75, flair: "jogo direto e bola aerea" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Cruzeiro", code: "CRU", flag: "🇧🇷", group: "Serie A", attack: 82, defense: 80, flair: "posse paciente e chegada de meia" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Flamengo", code: "FLA", flag: "🇧🇷", group: "Serie A", attack: 90, defense: 83, flair: "volume ofensivo e repertorio tecnico" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Fluminense", code: "FLU", flag: "🇧🇷", group: "Serie A", attack: 83, defense: 78, flair: "posse curta e triangulacoes" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Gremio", code: "GRE", flag: "🇧🇷", group: "Serie A", attack: 82, defense: 77, flair: "imposicao na area e apoio da torcida" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Internacional", code: "INT", flag: "🇧🇷", group: "Serie A", attack: 81, defense: 79, flair: "jogo apoiado e chute de media distancia" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Mirassol", code: "MIR", flag: "🇧🇷", group: "Serie A", attack: 75, defense: 74, flair: "organizacao e transicao rapida" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Palmeiras", code: "PAL", flag: "🇧🇷", group: "Serie A", attack: 88, defense: 85, flair: "bola parada, pressao e elenco profundo" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Red Bull Bragantino", code: "RBB", flag: "🇧🇷", group: "Serie A", attack: 78, defense: 76, flair: "pressao alta e juventude pelos lados" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Remo", code: "REM", flag: "🇧🇷", group: "Serie A", attack: 72, defense: 72, flair: "energia, viagem longa e mando pesado" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Santos", code: "SAN", flag: "🇧🇷", group: "Serie A", attack: 80, defense: 76, flair: "drible, velocidade e tradicao ofensiva" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Sao Paulo", code: "SAO", flag: "🇧🇷", group: "Serie A", attack: 83, defense: 81, flair: "controle territorial e forca no Morumbi" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Vasco da Gama", code: "VAS", flag: "🇧🇷", group: "Serie A", attack: 78, defense: 75, flair: "cruzamento, torcida e jogo emocional" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Vitoria", code: "VIT", flag: "🇧🇷", group: "Serie A", attack: 75, defense: 74, flair: "pressao local e bola longa" },

  { competitionSlug: "la-liga-2026-27", name: "Barcelona", code: "BAR", flag: "🇪🇸", group: "La Liga", attack: 91, defense: 84, flair: "posse agressiva e ataque por dentro" },
  { competitionSlug: "la-liga-2026-27", name: "Real Madrid", code: "RMA", flag: "🇪🇸", group: "La Liga", attack: 92, defense: 85, flair: "transicao mortal e decisao grande" },
  { competitionSlug: "la-liga-2026-27", name: "Atletico Madrid", code: "ATM", flag: "🇪🇸", group: "La Liga", attack: 86, defense: 87, flair: "defesa dura e contragolpe preciso" },
  { competitionSlug: "la-liga-2026-27", name: "Athletic Club", code: "ATH", flag: "🇪🇸", group: "La Liga", attack: 83, defense: 82, flair: "ritmo, pressao e San Mames" },
  { competitionSlug: "la-liga-2026-27", name: "Real Betis", code: "BET", flag: "🇪🇸", group: "La Liga", attack: 81, defense: 78, flair: "meia criativo e jogo apoiado" },
  { competitionSlug: "la-liga-2026-27", name: "Real Sociedad", code: "RSO", flag: "🇪🇸", group: "La Liga", attack: 82, defense: 81, flair: "organizacao e passe vertical" },
  { competitionSlug: "la-liga-2026-27", name: "Villarreal", code: "VIL", flag: "🇪🇸", group: "La Liga", attack: 82, defense: 77, flair: "ataque tecnico e troca curta" },
  { competitionSlug: "la-liga-2026-27", name: "Sevilla", code: "SEV", flag: "🇪🇸", group: "La Liga", attack: 78, defense: 77, flair: "casca de copa e bola parada" },
  { competitionSlug: "la-liga-2026-27", name: "Valencia", code: "VAL", flag: "🇪🇸", group: "La Liga", attack: 77, defense: 77, flair: "intensidade e Mestalla empurrando" },
  { competitionSlug: "la-liga-2026-27", name: "Girona", code: "GIR", flag: "🇪🇸", group: "La Liga", attack: 80, defense: 76, flair: "combinacoes rapidas no ataque" },
  { competitionSlug: "la-liga-2026-27", name: "Celta Vigo", code: "CEL", flag: "🇪🇸", group: "La Liga", attack: 77, defense: 75, flair: "jogo aberto e meia solto" },
  { competitionSlug: "la-liga-2026-27", name: "Osasuna", code: "OSA", flag: "🇪🇸", group: "La Liga", attack: 75, defense: 77, flair: "forca fisica e bola parada" },

  { competitionSlug: "copa-libertadores-2026", name: "Boca Juniors", code: "BOC", flag: "🇦🇷", group: "Libertadores", attack: 84, defense: 83, flair: "mata-mata, pressao e La Bombonera" },
  { competitionSlug: "copa-libertadores-2026", name: "River Plate", code: "RIV", flag: "🇦🇷", group: "Libertadores", attack: 85, defense: 82, flair: "posse ofensiva e amplitude" },
  { competitionSlug: "copa-libertadores-2026", name: "Racing", code: "RAC", flag: "🇦🇷", group: "Libertadores", attack: 81, defense: 79, flair: "transicao intensa e jogo fisico" },
  { competitionSlug: "copa-libertadores-2026", name: "Flamengo", code: "FLA", flag: "🇧🇷", group: "Libertadores", attack: 90, defense: 83, flair: "volume ofensivo e repertorio tecnico" },
  { competitionSlug: "copa-libertadores-2026", name: "Palmeiras", code: "PAL", flag: "🇧🇷", group: "Libertadores", attack: 88, defense: 85, flair: "bola parada, pressao e elenco profundo" },
  { competitionSlug: "copa-libertadores-2026", name: "Corinthians", code: "COR", flag: "🇧🇷", group: "Libertadores", attack: 81, defense: 80, flair: "marcacao forte e jogo de nervo" },
  { competitionSlug: "copa-libertadores-2026", name: "Atletico Mineiro", code: "CAM", flag: "🇧🇷", group: "Libertadores", attack: 84, defense: 80, flair: "forca em casa e pressao no terco final" },
  { competitionSlug: "copa-libertadores-2026", name: "Sao Paulo", code: "SAO", flag: "🇧🇷", group: "Libertadores", attack: 83, defense: 81, flair: "controle territorial e experiencia continental" },
  { competitionSlug: "copa-libertadores-2026", name: "LDU Quito", code: "LDU", flag: "🇪🇨", group: "Libertadores", attack: 80, defense: 82, flair: "altitude e controle de ritmo" },
  { competitionSlug: "copa-libertadores-2026", name: "Independiente del Valle", code: "IDV", flag: "🇪🇨", group: "Libertadores", attack: 82, defense: 80, flair: "modelo organizado e saida limpa" },
  { competitionSlug: "copa-libertadores-2026", name: "Colo-Colo", code: "COL", flag: "🇨🇱", group: "Libertadores", attack: 79, defense: 78, flair: "torcida forte e jogo direto" },
  { competitionSlug: "copa-libertadores-2026", name: "Penarol", code: "PEN", flag: "🇺🇾", group: "Libertadores", attack: 79, defense: 80, flair: "tradicao, entrega e bola parada" },

  { competitionSlug: "champions-league-2026-27", name: "Real Madrid", code: "RMA", flag: "🇪🇸", group: "Champions", attack: 92, defense: 85, flair: "noite europeia e transicao mortal" },
  { competitionSlug: "champions-league-2026-27", name: "Barcelona", code: "BAR", flag: "🇪🇸", group: "Champions", attack: 91, defense: 84, flair: "posse agressiva e ataque por dentro" },
  { competitionSlug: "champions-league-2026-27", name: "Manchester City", code: "MCI", flag: "🏴", group: "Champions", attack: 91, defense: 86, flair: "controle total e paciencia ofensiva" },
  { competitionSlug: "champions-league-2026-27", name: "Liverpool", code: "LIV", flag: "🏴", group: "Champions", attack: 88, defense: 83, flair: "pressao, velocidade e Anfield" },
  { competitionSlug: "champions-league-2026-27", name: "Bayern Munich", code: "BAY", flag: "🇩🇪", group: "Champions", attack: 89, defense: 83, flair: "volume, amplitude e finalizacao forte" },
  { competitionSlug: "champions-league-2026-27", name: "PSG", code: "PSG", flag: "🇫🇷", group: "Champions", attack: 88, defense: 82, flair: "talento no ultimo terco e velocidade" },
  { competitionSlug: "champions-league-2026-27", name: "Inter Milan", code: "INT", flag: "🇮🇹", group: "Champions", attack: 85, defense: 86, flair: "linha firme e transicao por alas" },
  { competitionSlug: "champions-league-2026-27", name: "Arsenal", code: "ARS", flag: "🏴", group: "Champions", attack: 87, defense: 84, flair: "pressao alta e bola parada ensaiada" }
];

function getCompetitionId(slug: string) {
  return getCompetitionBySlug(slug)?.id ?? activeCompetition.id;
}

function createTeamId(competitionSlug: string, index: number) {
  const prefixes: Record<string, string> = {
    "copa-do-mundo-2026": "21111111",
    "brasileirao-serie-a-2026": "22111111",
    "la-liga-2026-27": "23111111",
    "copa-libertadores-2026": "24111111",
    "champions-league-2026-27": "25111111"
  };

  return `${prefixes[competitionSlug] ?? "29111111"}-1111-4111-8111-${String(index + 1).padStart(12, "0")}`;
}

export const teams: Team[] = [...worldCupRows, ...clubRows].map((team, index) => ({
  ...team,
  id: createTeamId(team.competitionSlug, index),
  competitionId: getCompetitionId(team.competitionSlug)
}));

export function getTeamsByCompetitionId(competitionId: string) {
  return teams.filter((team) => team.competitionId === competitionId);
}

export function getTeam(name: string, competitionId = activeCompetition.id) {
  return getTeamsByCompetitionId(competitionId).find((team) => team.name === name) ?? getTeamsByCompetitionId(competitionId)[0] ?? teams[0];
}

export function getTeamByCode(code: string, competitionId = activeCompetition.id) {
  return getTeamsByCompetitionId(competitionId).find((team) => team.code === code);
}
