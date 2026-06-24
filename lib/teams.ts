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
  { name: "México", code: "MEX", flag: "🇲🇽", group: "A", attack: 79, defense: 77, flair: "torcida quente e jogo vertical" },
  { name: "África do Sul", code: "RSA", flag: "🇿🇦", group: "A", attack: 72, defense: 71, flair: "contra-ataque leve e muita velocidade" },
  { name: "Coreia do Sul", code: "KOR", flag: "🇰🇷", group: "A", attack: 79, defense: 76, flair: "ritmo alto e disciplina" },
  { name: "Tchéquia", code: "CZE", flag: "🇨🇿", group: "A", attack: 76, defense: 78, flair: "bloco compacto e bola aérea" },
  { name: "Canadá", code: "CAN", flag: "🇨🇦", group: "B", attack: 80, defense: 76, flair: "arrancada pelos lados" },
  { name: "Bósnia e Herzegovina", code: "BIH", flag: "🇧🇦", group: "B", attack: 77, defense: 74, flair: "meia armador e finalização forte" },
  { name: "Catar", code: "QAT", flag: "🇶🇦", group: "B", attack: 71, defense: 72, flair: "posse curta e paciência" },
  { name: "Suíça", code: "SUI", flag: "🇨🇭", group: "B", attack: 82, defense: 84, flair: "organização e frieza" },
  { name: "Haiti", code: "HAI", flag: "🇭🇹", group: "C", attack: 70, defense: 68, flair: "transição direta e energia" },
  { name: "Escócia", code: "SCO", flag: "🏴", group: "C", attack: 76, defense: 78, flair: "duelo físico e cruzamento perigoso" },
  { name: "Brasil", code: "BRA", flag: "🇧🇷", group: "C", attack: 94, defense: 87, flair: "ginga, pressão e camisa pesada" },
  { name: "Marrocos", code: "MAR", flag: "🇲🇦", group: "C", attack: 83, defense: 85, flair: "marcação firme e contra-ataque afiado" },
  { name: "Estados Unidos", code: "USA", flag: "🇺🇸", group: "D", attack: 82, defense: 79, flair: "intensidade e chegada de segunda linha" },
  { name: "Paraguai", code: "PAR", flag: "🇵🇾", group: "D", attack: 76, defense: 80, flair: "bola parada e casca grossa" },
  { name: "Austrália", code: "AUS", flag: "🇦🇺", group: "D", attack: 75, defense: 78, flair: "força física e jogo direto" },
  { name: "Turquia", code: "TUR", flag: "🇹🇷", group: "D", attack: 81, defense: 76, flair: "meia criativo e chute de média distância" },
  { name: "Curaçao", code: "CUW", flag: "🇨🇼", group: "E", attack: 69, defense: 69, flair: "leveza para sair jogando" },
  { name: "Costa do Marfim", code: "CIV", flag: "🇨🇮", group: "E", attack: 82, defense: 78, flair: "potência no ataque e corredor aberto" },
  { name: "Equador", code: "ECU", flag: "🇪🇨", group: "E", attack: 80, defense: 82, flair: "pressão alta e fôlego até o fim" },
  { name: "Alemanha", code: "GER", flag: "🇩🇪", group: "E", attack: 87, defense: 84, flair: "organização e chute de fora" },
  { name: "Holanda", code: "NED", flag: "🇳🇱", group: "F", attack: 86, defense: 85, flair: "transição rápida e amplitude" },
  { name: "Japão", code: "JPN", flag: "🇯🇵", group: "F", attack: 79, defense: 77, flair: "ritmo alto e passe vertical" },
  { name: "Suécia", code: "SWE", flag: "🇸🇪", group: "F", attack: 80, defense: 81, flair: "bola parada perigosa" },
  { name: "Tunísia", code: "TUN", flag: "🇹🇳", group: "F", attack: 73, defense: 77, flair: "marcação fechada e contra-golpe" },
  { name: "Irã", code: "IRN", flag: "🇮🇷", group: "G", attack: 77, defense: 78, flair: "jogo competitivo e finalização de longe" },
  { name: "Nova Zelândia", code: "NZL", flag: "🇳🇿", group: "G", attack: 70, defense: 72, flair: "bola aérea e entrega" },
  { name: "Bélgica", code: "BEL", flag: "🇧🇪", group: "G", attack: 86, defense: 80, flair: "talento entrelinhas" },
  { name: "Egito", code: "EGY", flag: "🇪🇬", group: "G", attack: 82, defense: 78, flair: "contra-ataque com estrela" },
  { name: "Arábia Saudita", code: "KSA", flag: "🇸🇦", group: "H", attack: 74, defense: 73, flair: "linhas compactas e velocidade curta" },
  { name: "Uruguai", code: "URU", flag: "🇺🇾", group: "H", attack: 84, defense: 84, flair: "garra até o apito final" },
  { name: "Espanha", code: "ESP", flag: "🇪🇸", group: "H", attack: 86, defense: 85, flair: "posse de bola até cansar" },
  { name: "Cabo Verde", code: "CPV", flag: "🇨🇻", group: "H", attack: 72, defense: 72, flair: "ousadia e bola esticada" },
  { name: "França", code: "FRA", flag: "🇫🇷", group: "I", attack: 93, defense: 88, flair: "velocidade pelas pontas" },
  { name: "Senegal", code: "SEN", flag: "🇸🇳", group: "I", attack: 84, defense: 82, flair: "força física e ataque direto" },
  { name: "Iraque", code: "IRQ", flag: "🇮🇶", group: "I", attack: 72, defense: 73, flair: "compactação e chegada rápida" },
  { name: "Noruega", code: "NOR", flag: "🇳🇴", group: "I", attack: 86, defense: 78, flair: "referência na área e passe longo" },
  { name: "Argentina", code: "ARG", flag: "🇦🇷", group: "J", attack: 91, defense: 86, flair: "catimba fina e toque de craque" },
  { name: "Argélia", code: "ALG", flag: "🇩🇿", group: "J", attack: 80, defense: 77, flair: "drible curto e transição veloz" },
  { name: "Áustria", code: "AUT", flag: "🇦🇹", group: "J", attack: 82, defense: 81, flair: "pressão coordenada" },
  { name: "Jordânia", code: "JOR", flag: "🇯🇴", group: "J", attack: 70, defense: 71, flair: "valentia e saída direta" },
  { name: "Portugal", code: "POR", flag: "🇵🇹", group: "K", attack: 88, defense: 82, flair: "talento no último terço" },
  { name: "RD Congo", code: "COD", flag: "🇨🇩", group: "K", attack: 75, defense: 76, flair: "arranque forte e duelo físico" },
  { name: "Uzbequistão", code: "UZB", flag: "🇺🇿", group: "K", attack: 73, defense: 74, flair: "disciplina e contra-ataque" },
  { name: "Colômbia", code: "COL", flag: "🇨🇴", group: "K", attack: 84, defense: 81, flair: "pontas soltos e meia criativo" },
  { name: "Gana", code: "GHA", flag: "🇬🇭", group: "L", attack: 79, defense: 77, flair: "potência, velocidade e bola viva" },
  { name: "Panamá", code: "PAN", flag: "🇵🇦", group: "L", attack: 71, defense: 72, flair: "jogo coletivo e pressão no erro" },
  { name: "Inglaterra", code: "ENG", flag: "🏴", group: "L", attack: 89, defense: 85, flair: "bola parada perigosa" },
  { name: "Croácia", code: "CRO", flag: "🇭🇷", group: "L", attack: 82, defense: 82, flair: "meio-campo técnico e paciência" }
].map((team) => ({ ...team, competitionSlug: "copa-do-mundo-2026" }));

const clubRows: TeamRow[] = [
  { competitionSlug: "brasileirao-serie-a-2026", name: "Atlético Mineiro", code: "CAM", flag: "🇧🇷", group: "Série A", attack: 84, defense: 80, flair: "força em casa e pressão no terço final" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Athletico Paranaense", code: "CAP", flag: "🇧🇷", group: "Série A", attack: 80, defense: 79, flair: "intensidade e campo pesado para visitante" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Bahia", code: "BAH", flag: "🇧🇷", group: "Série A", attack: 79, defense: 76, flair: "toque rápido e lado esquerdo ativo" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Botafogo", code: "BOT", flag: "🇧🇷", group: "Série A", attack: 83, defense: 80, flair: "transição vertical e bola parada forte" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Chapecoense", code: "CHA", flag: "🇧🇷", group: "Série A", attack: 72, defense: 73, flair: "compactação e entrega física" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Corinthians", code: "COR", flag: "🇧🇷", group: "Série A", attack: 81, defense: 80, flair: "marcação forte e arena quente" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Coritiba", code: "CFC", flag: "🇧🇷", group: "Série A", attack: 74, defense: 75, flair: "jogo direto e bola aérea" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Cruzeiro", code: "CRU", flag: "🇧🇷", group: "Série A", attack: 82, defense: 80, flair: "posse paciente e chegada de meia" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Flamengo", code: "FLA", flag: "🇧🇷", group: "Série A", attack: 90, defense: 83, flair: "volume ofensivo e repertório técnico" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Fluminense", code: "FLU", flag: "🇧🇷", group: "Série A", attack: 83, defense: 78, flair: "posse curta e triangulações" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Grêmio", code: "GRE", flag: "🇧🇷", group: "Série A", attack: 82, defense: 77, flair: "imposição na área e apoio da torcida" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Internacional", code: "INT", flag: "🇧🇷", group: "Série A", attack: 81, defense: 79, flair: "jogo apoiado e chute de média distância" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Mirassol", code: "MIR", flag: "🇧🇷", group: "Série A", attack: 75, defense: 74, flair: "organização e transição rápida" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Palmeiras", code: "PAL", flag: "🇧🇷", group: "Série A", attack: 88, defense: 85, flair: "bola parada, pressão e elenco profundo" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Red Bull Bragantino", code: "RBB", flag: "🇧🇷", group: "Série A", attack: 78, defense: 76, flair: "pressão alta e juventude pelos lados" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Remo", code: "REM", flag: "🇧🇷", group: "Série A", attack: 72, defense: 72, flair: "energia, viagem longa e mando pesado" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Santos", code: "SAN", flag: "🇧🇷", group: "Série A", attack: 80, defense: 76, flair: "drible, velocidade e tradição ofensiva" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "São Paulo", code: "SAO", flag: "🇧🇷", group: "Série A", attack: 83, defense: 81, flair: "controle territorial e força no Morumbi" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Vasco da Gama", code: "VAS", flag: "🇧🇷", group: "Série A", attack: 78, defense: 75, flair: "cruzamento, torcida e jogo emocional" },
  { competitionSlug: "brasileirao-serie-a-2026", name: "Vitória", code: "VIT", flag: "🇧🇷", group: "Série A", attack: 75, defense: 74, flair: "pressão local e bola longa" },

  { competitionSlug: "la-liga-2026-27", name: "Barcelona", code: "BAR", flag: "🇪🇸", group: "La Liga", attack: 91, defense: 84, flair: "posse agressiva e ataque por dentro" },
  { competitionSlug: "la-liga-2026-27", name: "Real Madrid", code: "RMA", flag: "🇪🇸", group: "La Liga", attack: 92, defense: 85, flair: "transição mortal e decisão grande" },
  { competitionSlug: "la-liga-2026-27", name: "Atlético Madrid", code: "ATM", flag: "🇪🇸", group: "La Liga", attack: 86, defense: 87, flair: "defesa dura e contragolpe preciso" },
  { competitionSlug: "la-liga-2026-27", name: "Athletic Club", code: "ATH", flag: "🇪🇸", group: "La Liga", attack: 83, defense: 82, flair: "ritmo, pressão e San Mamés" },
  { competitionSlug: "la-liga-2026-27", name: "Real Betis", code: "BET", flag: "🇪🇸", group: "La Liga", attack: 81, defense: 78, flair: "meia criativo e jogo apoiado" },
  { competitionSlug: "la-liga-2026-27", name: "Real Sociedad", code: "RSO", flag: "🇪🇸", group: "La Liga", attack: 82, defense: 81, flair: "organização e passe vertical" },
  { competitionSlug: "la-liga-2026-27", name: "Villarreal", code: "VIL", flag: "🇪🇸", group: "La Liga", attack: 82, defense: 77, flair: "ataque técnico e troca curta" },
  { competitionSlug: "la-liga-2026-27", name: "Sevilla", code: "SEV", flag: "🇪🇸", group: "La Liga", attack: 78, defense: 77, flair: "casca de copa e bola parada" },
  { competitionSlug: "la-liga-2026-27", name: "Valencia", code: "VAL", flag: "🇪🇸", group: "La Liga", attack: 77, defense: 77, flair: "intensidade e Mestalla empurrando" },
  { competitionSlug: "la-liga-2026-27", name: "Girona", code: "GIR", flag: "🇪🇸", group: "La Liga", attack: 80, defense: 76, flair: "combinações rápidas no ataque" },
  { competitionSlug: "la-liga-2026-27", name: "Celta Vigo", code: "CEL", flag: "🇪🇸", group: "La Liga", attack: 77, defense: 75, flair: "jogo aberto e meia solto" },
  { competitionSlug: "la-liga-2026-27", name: "Osasuna", code: "OSA", flag: "🇪🇸", group: "La Liga", attack: 75, defense: 77, flair: "força física e bola parada" },

  { competitionSlug: "copa-libertadores-2026", name: "Boca Juniors", code: "BOC", flag: "🇦🇷", group: "Libertadores", attack: 84, defense: 83, flair: "mata-mata, pressão e La Bombonera" },
  { competitionSlug: "copa-libertadores-2026", name: "River Plate", code: "RIV", flag: "🇦🇷", group: "Libertadores", attack: 85, defense: 82, flair: "posse ofensiva e amplitude" },
  { competitionSlug: "copa-libertadores-2026", name: "Racing", code: "RAC", flag: "🇦🇷", group: "Libertadores", attack: 81, defense: 79, flair: "transição intensa e jogo físico" },
  { competitionSlug: "copa-libertadores-2026", name: "Flamengo", code: "FLA", flag: "🇧🇷", group: "Libertadores", attack: 90, defense: 83, flair: "volume ofensivo e repertório técnico" },
  { competitionSlug: "copa-libertadores-2026", name: "Palmeiras", code: "PAL", flag: "🇧🇷", group: "Libertadores", attack: 88, defense: 85, flair: "bola parada, pressão e elenco profundo" },
  { competitionSlug: "copa-libertadores-2026", name: "Corinthians", code: "COR", flag: "🇧🇷", group: "Libertadores", attack: 81, defense: 80, flair: "marcação forte e jogo de nervo" },
  { competitionSlug: "copa-libertadores-2026", name: "Atlético Mineiro", code: "CAM", flag: "🇧🇷", group: "Libertadores", attack: 84, defense: 80, flair: "força em casa e pressão no terço final" },
  { competitionSlug: "copa-libertadores-2026", name: "São Paulo", code: "SAO", flag: "🇧🇷", group: "Libertadores", attack: 83, defense: 81, flair: "controle territorial e experiência continental" },
  { competitionSlug: "copa-libertadores-2026", name: "LDU Quito", code: "LDU", flag: "🇪🇨", group: "Libertadores", attack: 80, defense: 82, flair: "altitude e controle de ritmo" },
  { competitionSlug: "copa-libertadores-2026", name: "Independiente del Valle", code: "IDV", flag: "🇪🇨", group: "Libertadores", attack: 82, defense: 80, flair: "modelo organizado e saída limpa" },
  { competitionSlug: "copa-libertadores-2026", name: "Colo-Colo", code: "COL", flag: "🇨🇱", group: "Libertadores", attack: 79, defense: 78, flair: "torcida forte e jogo direto" },
  { competitionSlug: "copa-libertadores-2026", name: "Peñarol", code: "PEN", flag: "🇺🇾", group: "Libertadores", attack: 79, defense: 80, flair: "tradição, entrega e bola parada" },

  { competitionSlug: "champions-league-2026-27", name: "Real Madrid", code: "RMA", flag: "🇪🇸", group: "Champions", attack: 92, defense: 85, flair: "noite europeia e transição mortal" },
  { competitionSlug: "champions-league-2026-27", name: "Barcelona", code: "BAR", flag: "🇪🇸", group: "Champions", attack: 91, defense: 84, flair: "posse agressiva e ataque por dentro" },
  { competitionSlug: "champions-league-2026-27", name: "Manchester City", code: "MCI", flag: "🏴", group: "Champions", attack: 91, defense: 86, flair: "controle total e paciência ofensiva" },
  { competitionSlug: "champions-league-2026-27", name: "Liverpool", code: "LIV", flag: "🏴", group: "Champions", attack: 88, defense: 83, flair: "pressão, velocidade e Anfield" },
  { competitionSlug: "champions-league-2026-27", name: "Bayern Munich", code: "BAY", flag: "🇩🇪", group: "Champions", attack: 89, defense: 83, flair: "volume, amplitude e finalização forte" },
  { competitionSlug: "champions-league-2026-27", name: "PSG", code: "PSG", flag: "🇫🇷", group: "Champions", attack: 88, defense: 82, flair: "talento no último terço e velocidade" },
  { competitionSlug: "champions-league-2026-27", name: "Inter Milan", code: "INT", flag: "🇮🇹", group: "Champions", attack: 85, defense: 86, flair: "linha firme e transição por alas" },
  { competitionSlug: "champions-league-2026-27", name: "Arsenal", code: "ARS", flag: "🏴", group: "Champions", attack: 87, defense: 84, flair: "pressão alta e bola parada ensaiada" }
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
  const normalizedName = normalizeTeamName(name);
  return (
    getTeamsByCompetitionId(competitionId).find((team) => normalizeTeamName(team.name) === normalizedName || team.code === name) ??
    getTeamsByCompetitionId(competitionId)[0] ??
    teams[0]
  );
}

export function getTeamByCode(code: string, competitionId = activeCompetition.id) {
  return getTeamsByCompetitionId(competitionId).find((team) => team.code === code);
}

function normalizeTeamName(name: string) {
  const aliases: Record<string, string> = {
    "bosnia and herzegovina": "bosnia e herzegovina",
    canada: "canada",
    colombia: "colombia",
    "congo dr": "rd congo",
    "cote d'ivoire": "costa do marfim",
    curacao: "curacao",
    czechia: "tchequia",
    england: "inglaterra",
    france: "franca",
    germany: "alemanha",
    ghana: "gana",
    "ir iran": "ira",
    iraq: "iraque",
    japan: "japao",
    mexico: "mexico",
    morocco: "marrocos",
    netherlands: "holanda",
    "new zealand": "nova zelandia",
    norway: "noruega",
    panama: "panama",
    paraguay: "paraguai",
    scotland: "escocia",
    "south africa": "africa do sul",
    spain: "espanha",
    sweden: "suecia",
    switzerland: "suica",
    tunisia: "tunisia",
    turkiye: "turquia",
    usa: "estados unidos",
    uzbekistan: "uzbequistao"
  };
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return aliases[normalized] ?? normalized;
}
