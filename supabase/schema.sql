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
  starts_at timestamptz not null,
  status text not null default 'scheduled',
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

insert into public.competitions (id, name, slug, short_name, is_active, starts_at, ends_at)
values (
  '11111111-1111-4111-8111-111111111111',
  'Copa do Mundo 2026',
  'copa-do-mundo-2026',
  'Copa 2026',
  true,
  '2026-06-11',
  '2026-07-19'
)
on conflict (slug) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  is_active = excluded.is_active,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at;

insert into public.teams (id, competition_id, name, code, attack, defense, flair)
values
  ('21111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Brasil', 'BRA', 94, 87, 'ginga, pressao e camisa pesada'),
  ('21111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', 'Argentina', 'ARG', 91, 86, 'catimba fina e toque de craque'),
  ('21111111-1111-4111-8111-111111111113', '11111111-1111-4111-8111-111111111111', 'Franca', 'FRA', 92, 88, 'velocidade pelas pontas'),
  ('21111111-1111-4111-8111-111111111114', '11111111-1111-4111-8111-111111111111', 'Alemanha', 'ALE', 86, 84, 'organizacao e chute de fora'),
  ('21111111-1111-4111-8111-111111111115', '11111111-1111-4111-8111-111111111111', 'Espanha', 'ESP', 84, 85, 'posse de bola ate cansar'),
  ('21111111-1111-4111-8111-111111111116', '11111111-1111-4111-8111-111111111111', 'Inglaterra', 'ING', 87, 84, 'bola parada perigosa'),
  ('21111111-1111-4111-8111-111111111117', '11111111-1111-4111-8111-111111111111', 'Portugal', 'POR', 88, 82, 'talento no ultimo terco'),
  ('21111111-1111-4111-8111-111111111118', '11111111-1111-4111-8111-111111111111', 'Uruguai', 'URU', 82, 83, 'garra ate o apito final'),
  ('21111111-1111-4111-8111-111111111119', '11111111-1111-4111-8111-111111111111', 'Holanda', 'HOL', 85, 84, 'transicao rapida'),
  ('21111111-1111-4111-8111-111111111120', '11111111-1111-4111-8111-111111111111', 'Italia', 'ITA', 81, 88, 'defesa cascuda'),
  ('21111111-1111-4111-8111-111111111121', '11111111-1111-4111-8111-111111111111', 'Japao', 'JAP', 78, 76, 'ritmo alto e disciplina'),
  ('21111111-1111-4111-8111-111111111122', '11111111-1111-4111-8111-111111111111', 'Mexico', 'MEX', 77, 75, 'torcida quente e contra-ataque')
on conflict (competition_id, code) do update set
  name = excluded.name,
  attack = excluded.attack,
  defense = excluded.defense,
  flair = excluded.flair;

insert into public.matches (id, competition_id, home_team_id, away_team_id, stage, starts_at)
values
  ('31111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111122', 'Fase de grupos', '2026-06-12T21:00:00.000Z'),
  ('31111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111112', '21111111-1111-4111-8111-111111111121', 'Fase de grupos', '2026-06-13T18:00:00.000Z'),
  ('31111111-1111-4111-8111-111111111113', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111113', '21111111-1111-4111-8111-111111111118', 'Fase de grupos', '2026-06-14T19:00:00.000Z'),
  ('31111111-1111-4111-8111-111111111114', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111116', '21111111-1111-4111-8111-111111111117', 'Fase de grupos', '2026-06-15T22:00:00.000Z'),
  ('31111111-1111-4111-8111-111111111115', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111115', '21111111-1111-4111-8111-111111111119', 'Fase de grupos', '2026-06-16T20:00:00.000Z'),
  ('31111111-1111-4111-8111-111111111116', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111114', '21111111-1111-4111-8111-111111111120', 'Fase de grupos', '2026-06-17T17:00:00.000Z')
on conflict (id) do update set
  competition_id = excluded.competition_id,
  home_team_id = excluded.home_team_id,
  away_team_id = excluded.away_team_id,
  stage = excluded.stage,
  starts_at = excluded.starts_at;

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

create index if not exists matches_competition_starts_at_idx
  on public.matches (competition_id, starts_at);

create index if not exists predictions_user_competition_created_at_idx
  on public.predictions (user_id, competition_id, created_at desc);

create index if not exists predictions_match_id_idx
  on public.predictions (match_id);
