import { NextResponse } from "next/server";
import { activeCompetition, getCompetitionBySlug, getPrimaryDataSource } from "@/lib/competitions";
import { getMatchesByCompetitionId } from "@/lib/matches";

function parseDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("competition") ?? activeCompetition.slug;
  const competition = getCompetitionBySlug(slug) ?? activeCompetition;
  const dateFrom = parseDate(searchParams.get("dateFrom"));
  const dateTo = parseDate(searchParams.get("dateTo"));
  const source = getPrimaryDataSource(competition);

  const matches = getMatchesByCompetitionId(competition.id).filter((match) => {
    const startsAt = new Date(match.startsAt);
    return (!dateFrom || startsAt >= dateFrom) && (!dateTo || startsAt <= dateTo);
  });

  return NextResponse.json({
    competition: {
      id: competition.id,
      slug: competition.slug,
      name: competition.name,
      season: competition.seasonLabel,
      source
    },
    calendarWindows: competition.calendarWindows,
    matches
  });
}
