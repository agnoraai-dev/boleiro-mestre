create extension if not exists "pgcrypto";

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  api_team_id integer not null unique,
  name text not null,
  country text,
  logo_url text,
  is_national boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_historical_stats (
  team_id uuid primary key references public.teams(id) on delete cascade,
  api_team_id integer not null unique references public.teams(api_team_id) on delete cascade,
  elo_rating numeric(8, 2) not null default 1500,
  avg_goals_for numeric(6, 3) not null default 0,
  avg_goals_against numeric(6, 3) not null default 0,
  accumulated_xg numeric(8, 3) not null default 0,
  fixtures_analyzed integer not null default 0,
  last_api_sync_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_dynamic_snapshots (
  id bigserial primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  api_team_id integer not null references public.teams(api_team_id) on delete cascade,
  snapshot_timestamp timestamptz not null default now(),
  injuries_count integer not null default 0,
  fatigue_index numeric(6, 3) not null default 0,
  recent_momentum numeric(6, 3) not null default 0,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  api_fixture_id integer not null unique,
  home_team_id uuid not null references public.teams(id) on delete restrict,
  away_team_id uuid not null references public.teams(id) on delete restrict,
  home_api_team_id integer not null references public.teams(api_team_id) on delete restrict,
  away_api_team_id integer not null references public.teams(api_team_id) on delete restrict,
  kickoff_at timestamptz not null,
  status_short text not null,
  status_long text,
  league_id integer,
  season integer,
  venue_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (home_team_id <> away_team_id),
  check (home_api_team_id <> away_api_team_id)
);

create index if not exists teams_name_idx
  on public.teams using btree (name);

create index if not exists team_historical_stats_elo_idx
  on public.team_historical_stats using btree (elo_rating desc);

create index if not exists team_dynamic_snapshots_team_timestamp_idx
  on public.team_dynamic_snapshots using btree (team_id, snapshot_timestamp desc);

create index if not exists team_dynamic_snapshots_api_team_timestamp_idx
  on public.team_dynamic_snapshots using btree (api_team_id, snapshot_timestamp desc);

create index if not exists fixtures_kickoff_status_idx
  on public.fixtures using btree (kickoff_at, status_short);

create index if not exists fixtures_home_team_kickoff_idx
  on public.fixtures using btree (home_team_id, kickoff_at desc);

create index if not exists fixtures_away_team_kickoff_idx
  on public.fixtures using btree (away_team_id, kickoff_at desc);

create index if not exists fixtures_api_teams_idx
  on public.fixtures using btree (home_api_team_id, away_api_team_id);
