create extension if not exists "pgcrypto";

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_name text not null,
  is_active boolean not null default false,
  starts_at date,
  ends_at date,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  name text not null,
  code text not null,
  flag text not null default '',
  group_code text not null default '',
  attack integer not null check (attack between 0 and 100),
  defense integer not null check (defense between 0 and 100),
  flair text not null,
  created_at timestamptz not null default now(),
  unique (competition_id, code),
  unique (competition_id, name)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  home_team_id uuid not null references public.teams(id) on delete restrict,
  away_team_id uuid not null references public.teams(id) on delete restrict,
  stage text not null,
  group_code text not null default '',
  venue text not null default '',
  city text not null default '',
  starts_at timestamptz not null,
  status text not null default 'scheduled',
  source text not null default 'local-world-cup-2026-schedule',
  created_at timestamptz not null default now(),
  check (home_team_id <> away_team_id)
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  match_id uuid references public.matches(id) on delete set null,
  team_a_id uuid references public.teams(id) on delete set null,
  team_b_id uuid references public.teams(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  team_a text not null,
  team_b text not null,
  score_a integer not null check (score_a >= 0),
  score_b integer not null check (score_b >= 0),
  probability_a integer not null check (probability_a between 0 and 100),
  probability_draw integer not null check (probability_draw between 0 and 100),
  probability_b integer not null check (probability_b between 0 and 100),
  commentary text not null,
  created_at timestamptz not null default now()
);

alter table public.teams add column if not exists flag text not null default '';
alter table public.teams add column if not exists group_code text not null default '';
alter table public.competitions add column if not exists country text not null default '';
alter table public.competitions add column if not exists region text not null default '';
alter table public.competitions add column if not exists kind text not null default 'domestic-league';
alter table public.competitions add column if not exists season_label text not null default '';
alter table public.competitions add column if not exists is_featured boolean not null default false;
alter table public.competitions add column if not exists display_order integer not null default 999;
alter table public.matches add column if not exists group_code text not null default '';
alter table public.matches add column if not exists round text not null default '';
alter table public.matches add column if not exists matchday integer;
alter table public.matches add column if not exists venue text not null default '';
alter table public.matches add column if not exists city text not null default '';
alter table public.matches add column if not exists source text not null default 'local-world-cup-2026-schedule';

insert into public.competitions (id, name, slug, short_name, country, region, kind, season_label, is_active, is_featured, display_order, starts_at, ends_at)
values
  ('11111111-1111-4111-8111-111111111111', 'Copa do Mundo 2026', 'copa-do-mundo-2026', 'Copa 2026', 'Mundo', 'FIFA', 'national-team', '2026', true, true, 1, '2026-06-11', '2026-07-19'),
  ('12111111-1111-4111-8111-111111111111', 'Campeonato Brasileiro Serie A', 'brasileirao-serie-a-2026', 'Brasileirao', 'Brasil', 'CONMEBOL', 'domestic-league', '2026', false, true, 2, '2026-01-28', '2026-12-02'),
  ('13111111-1111-4111-8111-111111111111', 'La Liga', 'la-liga-2026-27', 'La Liga', 'Espanha', 'UEFA', 'domestic-league', '2026/27', false, true, 3, '2026-08-15', '2027-05-31'),
  ('14111111-1111-4111-8111-111111111111', 'Copa Libertadores', 'copa-libertadores-2026', 'Libertadores', 'America do Sul', 'CONMEBOL', 'continental-cup', '2026', false, true, 4, '2026-02-03', '2026-11-28'),
  ('15111111-1111-4111-8111-111111111111', 'UEFA Champions League', 'champions-league-2026-27', 'Champions', 'Europa', 'UEFA', 'continental-cup', '2026/27', false, true, 5, '2026-07-01', '2027-05-31')
on conflict (slug) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  country = excluded.country,
  region = excluded.region,
  kind = excluded.kind,
  season_label = excluded.season_label,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  display_order = excluded.display_order,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at;

insert into public.teams (id, competition_id, name, code, flag, group_code, attack, defense, flair)
values
  ('21111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-111111111111', 'Mexico', 'MEX', '🇲🇽', 'A', 79, 77, 'torcida quente e jogo vertical'),
  ('21111111-1111-4111-8111-000000000002', '11111111-1111-4111-8111-111111111111', 'South Africa', 'RSA', '🇿🇦', 'A', 72, 71, 'contra-ataque leve e muita velocidade'),
  ('21111111-1111-4111-8111-000000000003', '11111111-1111-4111-8111-111111111111', 'Korea Republic', 'KOR', '🇰🇷', 'A', 79, 76, 'ritmo alto e disciplina'),
  ('21111111-1111-4111-8111-000000000004', '11111111-1111-4111-8111-111111111111', 'Czechia', 'CZE', '🇨🇿', 'A', 76, 78, 'bloco compacto e bola aerea'),
  ('21111111-1111-4111-8111-000000000005', '11111111-1111-4111-8111-111111111111', 'Canada', 'CAN', '🇨🇦', 'B', 80, 76, 'arrancada pelos lados'),
  ('21111111-1111-4111-8111-000000000006', '11111111-1111-4111-8111-111111111111', 'Bosnia and Herzegovina', 'BIH', '🇧🇦', 'B', 77, 74, 'meia armador e finalizacao forte'),
  ('21111111-1111-4111-8111-000000000007', '11111111-1111-4111-8111-111111111111', 'Qatar', 'QAT', '🇶🇦', 'B', 71, 72, 'posse curta e paciencia'),
  ('21111111-1111-4111-8111-000000000008', '11111111-1111-4111-8111-111111111111', 'Switzerland', 'SUI', '🇨🇭', 'B', 82, 84, 'organizacao e frieza'),
  ('21111111-1111-4111-8111-000000000009', '11111111-1111-4111-8111-111111111111', 'Haiti', 'HAI', '🇭🇹', 'C', 70, 68, 'transicao direta e energia'),
  ('21111111-1111-4111-8111-000000000010', '11111111-1111-4111-8111-111111111111', 'Scotland', 'SCO', '🏴', 'C', 76, 78, 'duelo fisico e cruzamento perigoso'),
  ('21111111-1111-4111-8111-000000000011', '11111111-1111-4111-8111-111111111111', 'Brasil', 'BRA', '🇧🇷', 'C', 94, 87, 'ginga, pressao e camisa pesada'),
  ('21111111-1111-4111-8111-000000000012', '11111111-1111-4111-8111-111111111111', 'Morocco', 'MAR', '🇲🇦', 'C', 83, 85, 'marcacao firme e contra-ataque afiado'),
  ('21111111-1111-4111-8111-000000000013', '11111111-1111-4111-8111-111111111111', 'USA', 'USA', '🇺🇸', 'D', 82, 79, 'intensidade e chegada de segunda linha'),
  ('21111111-1111-4111-8111-000000000014', '11111111-1111-4111-8111-111111111111', 'Paraguay', 'PAR', '🇵🇾', 'D', 76, 80, 'bola parada e casca grossa'),
  ('21111111-1111-4111-8111-000000000015', '11111111-1111-4111-8111-111111111111', 'Australia', 'AUS', '🇦🇺', 'D', 75, 78, 'forca fisica e jogo direto'),
  ('21111111-1111-4111-8111-000000000016', '11111111-1111-4111-8111-111111111111', 'Turkiye', 'TUR', '🇹🇷', 'D', 81, 76, 'meia criativo e chute de media distancia'),
  ('21111111-1111-4111-8111-000000000017', '11111111-1111-4111-8111-111111111111', 'Curacao', 'CUW', '🇨🇼', 'E', 69, 69, 'leveza para sair jogando'),
  ('21111111-1111-4111-8111-000000000018', '11111111-1111-4111-8111-111111111111', 'Cote d''Ivoire', 'CIV', '🇨🇮', 'E', 82, 78, 'potencia no ataque e corredor aberto'),
  ('21111111-1111-4111-8111-000000000019', '11111111-1111-4111-8111-111111111111', 'Ecuador', 'ECU', '🇪🇨', 'E', 80, 82, 'pressao alta e folego ate o fim'),
  ('21111111-1111-4111-8111-000000000020', '11111111-1111-4111-8111-111111111111', 'Germany', 'GER', '🇩🇪', 'E', 87, 84, 'organizacao e chute de fora'),
  ('21111111-1111-4111-8111-000000000021', '11111111-1111-4111-8111-111111111111', 'Netherlands', 'NED', '🇳🇱', 'F', 86, 85, 'transicao rapida e amplitude'),
  ('21111111-1111-4111-8111-000000000022', '11111111-1111-4111-8111-111111111111', 'Japan', 'JPN', '🇯🇵', 'F', 79, 77, 'ritmo alto e passe vertical'),
  ('21111111-1111-4111-8111-000000000023', '11111111-1111-4111-8111-111111111111', 'Sweden', 'SWE', '🇸🇪', 'F', 80, 81, 'bola parada perigosa'),
  ('21111111-1111-4111-8111-000000000024', '11111111-1111-4111-8111-111111111111', 'Tunisia', 'TUN', '🇹🇳', 'F', 73, 77, 'marcacao fechada e contra-golpe'),
  ('21111111-1111-4111-8111-000000000025', '11111111-1111-4111-8111-111111111111', 'IR Iran', 'IRN', '🇮🇷', 'G', 77, 78, 'jogo competitivo e finalizacao de longe'),
  ('21111111-1111-4111-8111-000000000026', '11111111-1111-4111-8111-111111111111', 'New Zealand', 'NZL', '🇳🇿', 'G', 70, 72, 'bola aerea e entrega'),
  ('21111111-1111-4111-8111-000000000027', '11111111-1111-4111-8111-111111111111', 'Belgium', 'BEL', '🇧🇪', 'G', 86, 80, 'talento entrelinhas'),
  ('21111111-1111-4111-8111-000000000028', '11111111-1111-4111-8111-111111111111', 'Egypt', 'EGY', '🇪🇬', 'G', 82, 78, 'contra-ataque com estrela'),
  ('21111111-1111-4111-8111-000000000029', '11111111-1111-4111-8111-111111111111', 'Saudi Arabia', 'KSA', '🇸🇦', 'H', 74, 73, 'linhas compactas e velocidade curta'),
  ('21111111-1111-4111-8111-000000000030', '11111111-1111-4111-8111-111111111111', 'Uruguai', 'URU', '🇺🇾', 'H', 84, 84, 'garra ate o apito final'),
  ('21111111-1111-4111-8111-000000000031', '11111111-1111-4111-8111-111111111111', 'Spain', 'ESP', '🇪🇸', 'H', 86, 85, 'posse de bola ate cansar'),
  ('21111111-1111-4111-8111-000000000032', '11111111-1111-4111-8111-111111111111', 'Cabo Verde', 'CPV', '🇨🇻', 'H', 72, 72, 'ousadia e bola esticada'),
  ('21111111-1111-4111-8111-000000000033', '11111111-1111-4111-8111-111111111111', 'France', 'FRA', '🇫🇷', 'I', 93, 88, 'velocidade pelas pontas'),
  ('21111111-1111-4111-8111-000000000034', '11111111-1111-4111-8111-111111111111', 'Senegal', 'SEN', '🇸🇳', 'I', 84, 82, 'forca fisica e ataque direto'),
  ('21111111-1111-4111-8111-000000000035', '11111111-1111-4111-8111-111111111111', 'Iraq', 'IRQ', '🇮🇶', 'I', 72, 73, 'compactacao e chegada rapida'),
  ('21111111-1111-4111-8111-000000000036', '11111111-1111-4111-8111-111111111111', 'Norway', 'NOR', '🇳🇴', 'I', 86, 78, 'referencia na area e passe longo'),
  ('21111111-1111-4111-8111-000000000037', '11111111-1111-4111-8111-111111111111', 'Argentina', 'ARG', '🇦🇷', 'J', 91, 86, 'catimba fina e toque de craque'),
  ('21111111-1111-4111-8111-000000000038', '11111111-1111-4111-8111-111111111111', 'Algeria', 'ALG', '🇩🇿', 'J', 80, 77, 'drible curto e transicao veloz'),
  ('21111111-1111-4111-8111-000000000039', '11111111-1111-4111-8111-111111111111', 'Austria', 'AUT', '🇦🇹', 'J', 82, 81, 'pressao coordenada'),
  ('21111111-1111-4111-8111-000000000040', '11111111-1111-4111-8111-111111111111', 'Jordan', 'JOR', '🇯🇴', 'J', 70, 71, 'valentia e saida direta'),
  ('21111111-1111-4111-8111-000000000041', '11111111-1111-4111-8111-111111111111', 'Portugal', 'POR', '🇵🇹', 'K', 88, 82, 'talento no ultimo terco'),
  ('21111111-1111-4111-8111-000000000042', '11111111-1111-4111-8111-111111111111', 'Congo DR', 'COD', '🇨🇩', 'K', 75, 76, 'arranque forte e duelo fisico'),
  ('21111111-1111-4111-8111-000000000043', '11111111-1111-4111-8111-111111111111', 'Uzbekistan', 'UZB', '🇺🇿', 'K', 73, 74, 'disciplina e contra-ataque'),
  ('21111111-1111-4111-8111-000000000044', '11111111-1111-4111-8111-111111111111', 'Colombia', 'COL', '🇨🇴', 'K', 84, 81, 'pontas soltos e meia criativo'),
  ('21111111-1111-4111-8111-000000000045', '11111111-1111-4111-8111-111111111111', 'Ghana', 'GHA', '🇬🇭', 'L', 79, 77, 'potencia, velocidade e bola viva'),
  ('21111111-1111-4111-8111-000000000046', '11111111-1111-4111-8111-111111111111', 'Panama', 'PAN', '🇵🇦', 'L', 71, 72, 'jogo coletivo e pressao no erro'),
  ('21111111-1111-4111-8111-000000000047', '11111111-1111-4111-8111-111111111111', 'England', 'ENG', '🏴', 'L', 89, 85, 'bola parada perigosa'),
  ('21111111-1111-4111-8111-000000000048', '11111111-1111-4111-8111-111111111111', 'Croatia', 'CRO', '🇭🇷', 'L', 82, 82, 'meio-campo tecnico e paciencia')
on conflict (competition_id, code) do update set
  name = excluded.name,
  flag = excluded.flag,
  group_code = excluded.group_code,
  attack = excluded.attack,
  defense = excluded.defense,
  flair = excluded.flair;

insert into public.matches (id, competition_id, home_team_id, away_team_id, stage, group_code, venue, city, starts_at, status)
values
  ('31111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000041', '21111111-1111-4111-8111-000000000043', 'Grupo K - rodada 2', 'K', 'Houston Stadium', 'Houston', '2026-06-23T17:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000002', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000047', '21111111-1111-4111-8111-000000000045', 'Grupo L - rodada 2', 'L', 'Boston Stadium', 'Boston', '2026-06-23T20:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000003', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000046', '21111111-1111-4111-8111-000000000048', 'Grupo L - rodada 2', 'L', 'Toronto Stadium', 'Toronto', '2026-06-23T23:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000004', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000044', '21111111-1111-4111-8111-000000000042', 'Grupo K - rodada 2', 'K', 'Estadio Guadalajara', 'Guadalajara', '2026-06-24T02:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000005', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000010', '21111111-1111-4111-8111-000000000011', 'Grupo C - rodada 3', 'C', 'Miami Stadium', 'Miami', '2026-06-24T19:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000006', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000012', '21111111-1111-4111-8111-000000000009', 'Grupo C - rodada 3', 'C', 'Atlanta Stadium', 'Atlanta', '2026-06-24T19:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000007', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000008', '21111111-1111-4111-8111-000000000005', 'Grupo B - rodada 3', 'B', 'BC Place Vancouver', 'Vancouver', '2026-06-24T22:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000008', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000006', '21111111-1111-4111-8111-000000000007', 'Grupo B - rodada 3', 'B', 'Seattle Stadium', 'Seattle', '2026-06-24T22:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000009', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000004', '21111111-1111-4111-8111-000000000001', 'Grupo A - rodada 3', 'A', 'Mexico City Stadium', 'Mexico City', '2026-06-25T01:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000010', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000002', '21111111-1111-4111-8111-000000000003', 'Grupo A - rodada 3', 'A', 'Estadio Monterrey', 'Monterrey', '2026-06-25T01:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000011', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000017', '21111111-1111-4111-8111-000000000018', 'Grupo E - rodada 3', 'E', 'Philadelphia Stadium', 'Philadelphia', '2026-06-25T19:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000012', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000019', '21111111-1111-4111-8111-000000000020', 'Grupo E - rodada 3', 'E', 'New York New Jersey Stadium', 'New York/New Jersey', '2026-06-25T19:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000013', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000022', '21111111-1111-4111-8111-000000000023', 'Grupo F - rodada 3', 'F', 'Dallas Stadium', 'Dallas', '2026-06-25T22:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000014', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000024', '21111111-1111-4111-8111-000000000021', 'Grupo F - rodada 3', 'F', 'Kansas City Stadium', 'Kansas City', '2026-06-25T22:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000015', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000016', '21111111-1111-4111-8111-000000000013', 'Grupo D - rodada 3', 'D', 'Los Angeles Stadium', 'Los Angeles', '2026-06-26T01:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000016', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000014', '21111111-1111-4111-8111-000000000015', 'Grupo D - rodada 3', 'D', 'San Francisco Bay Area Stadium', 'San Francisco Bay Area', '2026-06-26T01:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000017', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000036', '21111111-1111-4111-8111-000000000033', 'Grupo I - rodada 3', 'I', 'Boston Stadium', 'Boston', '2026-06-26T19:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000018', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000034', '21111111-1111-4111-8111-000000000035', 'Grupo I - rodada 3', 'I', 'Toronto Stadium', 'Toronto', '2026-06-26T19:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000019', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000028', '21111111-1111-4111-8111-000000000025', 'Grupo G - rodada 3', 'G', 'Seattle Stadium', 'Seattle', '2026-06-26T22:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000020', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000026', '21111111-1111-4111-8111-000000000027', 'Grupo G - rodada 3', 'G', 'BC Place Vancouver', 'Vancouver', '2026-06-26T22:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000021', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000032', '21111111-1111-4111-8111-000000000029', 'Grupo H - rodada 3', 'H', 'Houston Stadium', 'Houston', '2026-06-27T01:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000022', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000030', '21111111-1111-4111-8111-000000000031', 'Grupo H - rodada 3', 'H', 'Estadio Guadalajara', 'Guadalajara', '2026-06-27T01:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000023', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000038', '21111111-1111-4111-8111-000000000039', 'Grupo J - rodada 3', 'J', 'Kansas City Stadium', 'Kansas City', '2026-06-27T19:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000024', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000040', '21111111-1111-4111-8111-000000000037', 'Grupo J - rodada 3', 'J', 'Dallas Stadium', 'Dallas', '2026-06-27T19:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000025', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000044', '21111111-1111-4111-8111-000000000041', 'Grupo K - rodada 3', 'K', 'Miami Stadium', 'Miami', '2026-06-27T22:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000026', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000042', '21111111-1111-4111-8111-000000000043', 'Grupo K - rodada 3', 'K', 'Atlanta Stadium', 'Atlanta', '2026-06-27T22:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000027', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000046', '21111111-1111-4111-8111-000000000047', 'Grupo L - rodada 3', 'L', 'New York New Jersey Stadium', 'New York/New Jersey', '2026-06-28T01:00:00.000Z', 'scheduled'),
  ('31111111-1111-4111-8111-000000000028', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-000000000048', '21111111-1111-4111-8111-000000000045', 'Grupo L - rodada 3', 'L', 'Philadelphia Stadium', 'Philadelphia', '2026-06-28T01:00:00.000Z', 'scheduled')
on conflict (id) do update set
  competition_id = excluded.competition_id,
  home_team_id = excluded.home_team_id,
  away_team_id = excluded.away_team_id,
  stage = excluded.stage,
  group_code = excluded.group_code,
  venue = excluded.venue,
  city = excluded.city,
  starts_at = excluded.starts_at,
  status = excluded.status;

alter table public.competitions enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;

drop policy if exists "Anyone can read competitions" on public.competitions;
drop policy if exists "Anyone can read teams" on public.teams;
drop policy if exists "Anyone can read matches" on public.matches;
drop policy if exists "Users can read their own predictions" on public.predictions;
drop policy if exists "Users can insert their own predictions" on public.predictions;
drop policy if exists "Users can delete their own predictions" on public.predictions;

create policy "Anyone can read competitions"
  on public.competitions
  for select
  using (true);

create policy "Anyone can read teams"
  on public.teams
  for select
  using (true);

create policy "Anyone can read matches"
  on public.matches
  for select
  using (true);

create policy "Users can read their own predictions"
  on public.predictions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own predictions"
  on public.predictions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own predictions"
  on public.predictions
  for delete
  using (auth.uid() = user_id);

create index if not exists competitions_slug_idx
  on public.competitions (slug);

create index if not exists teams_competition_id_idx
  on public.teams (competition_id);

create index if not exists teams_group_code_idx
  on public.teams (competition_id, group_code);

create index if not exists matches_competition_starts_at_idx
  on public.matches (competition_id, starts_at);

create index if not exists matches_competition_group_idx
  on public.matches (competition_id, group_code);

create index if not exists predictions_user_competition_created_at_idx
  on public.predictions (user_id, competition_id, created_at desc);

create index if not exists predictions_match_id_idx
  on public.predictions (match_id);
