export type Competition = {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  isActive: boolean;
};

export const competitions: Competition[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Copa do Mundo 2026",
    slug: "copa-do-mundo-2026",
    shortName: "Copa 2026",
    isActive: true
  }
];

export const activeCompetition = competitions.find((competition) => competition.isActive) ?? competitions[0];

export function getCompetitionBySlug(slug: string) {
  return competitions.find((competition) => competition.slug === slug);
}
