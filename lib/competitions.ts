export type CompetitionKind = "national-team" | "domestic-league" | "continental-cup" | "domestic-cup";

export type FixtureProvider = "local" | "football-data" | "sportmonks" | "api-football" | "manual";

export type CompetitionDataSource = {
  provider: FixtureProvider;
  code?: string;
  label: string;
  priority: number;
  supports: Array<"fixtures" | "teams" | "standings" | "scores" | "odds">;
  notes?: string;
};

export type CompetitionCalendarWindow = {
  label: string;
  startsAt: string;
  endsAt: string;
  status: "active" | "upcoming" | "finished" | "paused";
};

export type Competition = {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  country: string;
  region: string;
  kind: CompetitionKind;
  seasonLabel: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  dataSources: CompetitionDataSource[];
  calendarWindows: CompetitionCalendarWindow[];
};

export const competitions: Competition[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Copa do Mundo 2026",
    slug: "copa-do-mundo-2026",
    shortName: "Copa 2026",
    country: "Mundo",
    region: "FIFA",
    kind: "national-team",
    seasonLabel: "2026",
    startsAt: "2026-06-11",
    endsAt: "2026-07-19",
    isActive: true,
    isFeatured: true,
    displayOrder: 1,
    dataSources: [
      { provider: "local", label: "Agenda local normalizada", priority: 1, supports: ["fixtures", "teams"] },
      { provider: "football-data", code: "WC", label: "football-data.org", priority: 2, supports: ["fixtures", "teams", "standings", "scores"] },
      { provider: "sportmonks", label: "Sportmonks Football", priority: 3, supports: ["fixtures", "teams", "standings", "scores", "odds"] }
    ],
    calendarWindows: [
      { label: "Fase de grupos", startsAt: "2026-06-11", endsAt: "2026-06-27", status: "active" },
      { label: "Mata-mata", startsAt: "2026-06-28", endsAt: "2026-07-19", status: "upcoming" }
    ]
  },
  {
    id: "12111111-1111-4111-8111-111111111111",
    name: "Campeonato Brasileiro Serie A",
    slug: "brasileirao-serie-a-2026",
    shortName: "Brasileirao",
    country: "Brasil",
    region: "CONMEBOL",
    kind: "domestic-league",
    seasonLabel: "2026",
    startsAt: "2026-01-28",
    endsAt: "2026-12-02",
    isActive: false,
    isFeatured: true,
    displayOrder: 2,
    dataSources: [
      { provider: "football-data", code: "BSA", label: "football-data.org", priority: 1, supports: ["fixtures", "teams", "standings", "scores"] },
      { provider: "sportmonks", label: "Sportmonks Football", priority: 2, supports: ["fixtures", "teams", "standings", "scores", "odds"] },
      { provider: "api-football", label: "API-Football", priority: 3, supports: ["fixtures", "teams", "standings", "scores", "odds"] }
    ],
    calendarWindows: [
      { label: "Pontos corridos", startsAt: "2026-01-28", endsAt: "2026-12-02", status: "active" },
      { label: "Pausa da Copa", startsAt: "2026-06-11", endsAt: "2026-07-19", status: "paused" }
    ]
  },
  {
    id: "13111111-1111-4111-8111-111111111111",
    name: "La Liga",
    slug: "la-liga-2026-27",
    shortName: "La Liga",
    country: "Espanha",
    region: "UEFA",
    kind: "domestic-league",
    seasonLabel: "2026/27",
    startsAt: "2026-08-15",
    endsAt: "2027-05-31",
    isActive: false,
    isFeatured: true,
    displayOrder: 3,
    dataSources: [
      { provider: "football-data", code: "PD", label: "football-data.org", priority: 1, supports: ["fixtures", "teams", "standings", "scores"] },
      { provider: "sportmonks", label: "Sportmonks Football", priority: 2, supports: ["fixtures", "teams", "standings", "scores", "odds"] },
      { provider: "api-football", label: "API-Football", priority: 3, supports: ["fixtures", "teams", "standings", "scores", "odds"] }
    ],
    calendarWindows: [{ label: "Temporada regular", startsAt: "2026-08-15", endsAt: "2027-05-31", status: "upcoming" }]
  },
  {
    id: "14111111-1111-4111-8111-111111111111",
    name: "Copa Libertadores",
    slug: "copa-libertadores-2026",
    shortName: "Libertadores",
    country: "America do Sul",
    region: "CONMEBOL",
    kind: "continental-cup",
    seasonLabel: "2026",
    startsAt: "2026-02-03",
    endsAt: "2026-11-28",
    isActive: false,
    isFeatured: true,
    displayOrder: 4,
    dataSources: [
      { provider: "football-data", code: "CLI", label: "football-data.org", priority: 1, supports: ["fixtures", "teams", "standings", "scores"] },
      { provider: "sportmonks", label: "Sportmonks Football", priority: 2, supports: ["fixtures", "teams", "standings", "scores", "odds"] },
      { provider: "api-football", label: "API-Football", priority: 3, supports: ["fixtures", "teams", "standings", "scores", "odds"] }
    ],
    calendarWindows: [
      { label: "Fase preliminar", startsAt: "2026-02-03", endsAt: "2026-03-12", status: "finished" },
      { label: "Fase de grupos", startsAt: "2026-04-07", endsAt: "2026-05-28", status: "finished" },
      { label: "Oitavas de final", startsAt: "2026-08-11", endsAt: "2026-08-20", status: "upcoming" },
      { label: "Fase final", startsAt: "2026-09-08", endsAt: "2026-11-28", status: "upcoming" }
    ]
  },
  {
    id: "15111111-1111-4111-8111-111111111111",
    name: "UEFA Champions League",
    slug: "champions-league-2026-27",
    shortName: "Champions",
    country: "Europa",
    region: "UEFA",
    kind: "continental-cup",
    seasonLabel: "2026/27",
    startsAt: "2026-07-01",
    endsAt: "2027-05-31",
    isActive: false,
    isFeatured: true,
    displayOrder: 5,
    dataSources: [
      { provider: "football-data", code: "CL", label: "football-data.org", priority: 1, supports: ["fixtures", "teams", "standings", "scores"] },
      { provider: "sportmonks", label: "Sportmonks Football", priority: 2, supports: ["fixtures", "teams", "standings", "scores", "odds"] },
      { provider: "api-football", label: "API-Football", priority: 3, supports: ["fixtures", "teams", "standings", "scores", "odds"] }
    ],
    calendarWindows: [
      { label: "Qualificatorias", startsAt: "2026-07-01", endsAt: "2026-08-31", status: "upcoming" },
      { label: "Fase de liga", startsAt: "2026-09-01", endsAt: "2027-01-31", status: "upcoming" },
      { label: "Mata-mata", startsAt: "2027-02-01", endsAt: "2027-05-31", status: "upcoming" }
    ]
  }
];

export const activeCompetition = competitions.find((competition) => competition.isActive) ?? competitions[0];

export function getCompetitionBySlug(slug: string) {
  return competitions.find((competition) => competition.slug === slug);
}

export function getCompetitionById(id: string) {
  return competitions.find((competition) => competition.id === id);
}

export function getFeaturedCompetitions() {
  return competitions.filter((competition) => competition.isFeatured).sort((first, second) => first.displayOrder - second.displayOrder);
}

export function getPrimaryDataSource(competition: Competition) {
  return [...competition.dataSources].sort((first, second) => first.priority - second.priority)[0];
}
