import { NextResponse } from "next/server";
import { getCompetitionBySlug } from "@/lib/competitions";
import { buildFallbackCommentary } from "@/lib/prediction";
import { getTeam } from "@/lib/teams";

type CommentaryPayload = {
  competitionId: string;
  competitionSlug: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  probabilityA: number;
  probabilityDraw: number;
  probabilityB: number;
  tuningSummary?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as CommentaryPayload;
  const competition = getCompetitionBySlug(payload.competitionSlug);
  const competitionId = competition?.id ?? payload.competitionId;
  const fallback = buildFallbackCommentary(
    getTeam(payload.teamA, competitionId),
    getTeam(payload.teamB, competitionId),
    payload.scoreA,
    payload.scoreB,
    payload.tuningSummary
  );

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ commentary: fallback });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "Você é um comentarista brasileiro de futebol. Gere um comentário curto, descontraído, sem incentivar apostas e sem prometer resultado."
          },
          {
            role: "user",
            content: `Competição: ${competition?.name ?? payload.competitionSlug}. Jogo: ${payload.teamA} ${payload.scoreA} x ${payload.scoreB} ${payload.teamB}. Probabilidades: ${payload.teamA} ${payload.probabilityA}%, empate ${payload.probabilityDraw}%, ${payload.teamB} ${payload.probabilityB}%. ${payload.tuningSummary ?? ""}`
          }
        ],
        max_output_tokens: 120
      })
    });

    if (!response.ok) {
      return NextResponse.json({ commentary: fallback });
    }

    const data = (await response.json()) as { output_text?: string };
    return NextResponse.json({ commentary: data.output_text?.trim() || fallback });
  } catch {
    return NextResponse.json({ commentary: fallback });
  }
}
