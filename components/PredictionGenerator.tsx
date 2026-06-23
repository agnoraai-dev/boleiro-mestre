"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Save, Shuffle } from "lucide-react";
import { activeCompetition } from "@/lib/competitions";
import { getMatchById, getMatchesByCompetitionId } from "@/lib/matches";
import { calculatePrediction, type PredictionResult } from "@/lib/prediction";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { getTeam, getTeamsByCompetitionId } from "@/lib/teams";
import { StatBar } from "@/components/StatBar";

export function PredictionGenerator() {
  const competition = activeCompetition;
  const competitionTeams = useMemo(() => getTeamsByCompetitionId(competition.id), [competition.id]);
  const competitionMatches = useMemo(() => getMatchesByCompetitionId(competition.id), [competition.id]);
  const firstMatch = competitionMatches[0];
  const [selectedMatchId, setSelectedMatchId] = useState(firstMatch?.id ?? "custom");
  const [teamA, setTeamA] = useState(firstMatch?.homeTeamName ?? competitionTeams[0]?.name ?? "Brasil");
  const [teamB, setTeamB] = useState(firstMatch?.awayTeamName ?? competitionTeams[1]?.name ?? "Argentina");
  const [prediction, setPrediction] = useState<PredictionResult>(() =>
    calculatePrediction(
      getTeam(firstMatch?.homeTeamName ?? "Brasil", competition.id),
      getTeam(firstMatch?.awayTeamName ?? "Argentina", competition.id),
      competition.slug,
      firstMatch?.id
    )
  );
  const [loadingAi, setLoadingAi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const availableTeamB = useMemo(() => competitionTeams.filter((team) => team.name !== teamA), [competitionTeams, teamA]);

  useEffect(() => {
    if (teamA === teamB) {
      setTeamB(availableTeamB[0]?.name ?? competitionTeams[1]?.name ?? "Argentina");
    }
  }, [availableTeamB, competitionTeams, teamA, teamB]);

  function selectMatch(matchId: string) {
    setSelectedMatchId(matchId);
    const match = getMatchById(matchId);
    if (match) {
      setTeamA(match.homeTeamName);
      setTeamB(match.awayTeamName);
    }
  }

  async function generatePrediction() {
    setMessage("");
    const basePrediction = calculatePrediction(
      getTeam(teamA, competition.id),
      getTeam(teamB, competition.id),
      competition.slug,
      selectedMatchId === "custom" ? undefined : selectedMatchId
    );
    setPrediction(basePrediction);
    setLoadingAi(true);

    try {
      const response = await fetch("/api/ai-commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePrediction)
      });
      const data = (await response.json()) as { commentary?: string };
      if (data.commentary) {
        setPrediction({ ...basePrediction, commentary: data.commentary });
      }
    } catch {
      setPrediction(basePrediction);
    } finally {
      setLoadingAi(false);
    }
  }

  function randomizeTeams() {
    const firstIndex = Math.floor(Math.random() * competitionTeams.length);
    let secondIndex = Math.floor(Math.random() * competitionTeams.length);
    if (secondIndex === firstIndex) {
      secondIndex = (secondIndex + 1) % competitionTeams.length;
    }
    setSelectedMatchId("custom");
    setTeamA(competitionTeams[firstIndex].name);
    setTeamB(competitionTeams[secondIndex].name);
  }

  async function savePrediction() {
    setMessage("");
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Configure o Supabase para salvar palpites.");
      return;
    }

    setSaving(true);
    const userResult = await supabase.auth.getUser();
    if (!userResult.data.user) {
      setSaving(false);
      setMessage("Faca login para guardar esse palpite no vestiario.");
      return;
    }

    const { error } = await supabase.from("predictions").insert({
      user_id: userResult.data.user.id,
      competition_id: prediction.competitionId,
      match_id: prediction.matchId ?? null,
      team_a_id: prediction.teamAId,
      team_b_id: prediction.teamBId,
      team_a: prediction.teamA,
      team_b: prediction.teamB,
      score_a: prediction.scoreA,
      score_b: prediction.scoreB,
      probability_a: prediction.probabilityA,
      probability_draw: prediction.probabilityDraw,
      probability_b: prediction.probabilityB,
      commentary: prediction.commentary
    });
    setSaving(false);

    setMessage(error ? error.message : "Palpite da Copa salvo. Pode comemorar sem tirar a camisa.");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl bg-white p-6 shadow-pitch">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-field">{competition.shortName}</p>
            <h2 className="text-2xl font-black text-ink">Jogos da Copa</h2>
          </div>
          <button
            aria-label="Sortear times"
            className="grid size-11 place-items-center rounded-full bg-field-dark text-white transition hover:bg-field"
            onClick={randomizeTeams}
            type="button"
          >
            <Shuffle className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-field-dark">
            Partida
            <select
              className="rounded-2xl border border-field-dark/15 bg-white px-4 py-3 text-ink outline-none ring-field/30 transition focus:ring-4"
              onChange={(event) => selectMatch(event.target.value)}
              value={selectedMatchId}
            >
              {competitionMatches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.homeTeamName} x {match.awayTeamName} - {match.stage}
                </option>
              ))}
              <option value="custom">Montar confronto</option>
            </select>
          </label>
          <TeamSelect
            label="Time da casa"
            onChange={(value) => {
              setSelectedMatchId("custom");
              setTeamA(value);
            }}
            value={teamA}
            options={competitionTeams.map((team) => team.name)}
          />
          <TeamSelect
            label="Visitante"
            onChange={(value) => {
              setSelectedMatchId("custom");
              setTeamB(value);
            }}
            value={teamB}
            options={availableTeamB.map((team) => team.name)}
          />
        </div>
        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-trophy px-5 py-4 font-black text-ink transition hover:bg-yellow-300"
          onClick={generatePrediction}
          type="button"
        >
          <Bot className="size-5" aria-hidden="true" />
          Gerar palpite da Copa
        </button>
      </div>

      <div className="rounded-3xl bg-field-dark p-6 text-white shadow-pitch">
        <p className="text-sm font-black uppercase text-trophy">Palpite da Copa</p>
        <div className="mt-4 grid gap-4 rounded-3xl bg-white/10 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <TeamScore name={prediction.teamA} score={prediction.scoreA} />
          <span className="text-center text-2xl font-black text-trophy">x</span>
          <TeamScore name={prediction.teamB} score={prediction.scoreB} alignRight />
        </div>
        <div className="mt-6 grid gap-4 rounded-3xl bg-white p-5">
          <StatBar label={`Vitoria ${prediction.teamA}`} value={prediction.probabilityA} />
          <StatBar label="Empate" value={prediction.probabilityDraw} />
          <StatBar label={`Vitoria ${prediction.teamB}`} value={prediction.probabilityB} />
        </div>
        <p className="mt-5 rounded-3xl bg-white/10 p-5 text-base font-semibold leading-relaxed">
          {loadingAi ? "Chamando o comentarista da cabine..." : prediction.commentary}
        </p>
        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 font-black text-field-dark transition hover:bg-trophy disabled:opacity-60"
          disabled={saving}
          onClick={savePrediction}
          type="button"
        >
          <Save className="size-5" aria-hidden="true" />
          Salvar palpite
        </button>
        {message ? <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm font-bold text-white">{message}</p> : null}
      </div>
    </section>
  );
}

function TeamSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-field-dark">
      {label}
      <select
        className="rounded-2xl border border-field-dark/15 bg-white px-4 py-3 text-ink outline-none ring-field/30 transition focus:ring-4"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TeamScore({ name, score, alignRight = false }: { name: string; score: number; alignRight?: boolean }) {
  return (
    <div className={alignRight ? "text-left sm:text-right" : ""}>
      <p className="text-lg font-black">{name}</p>
      <p className="text-6xl font-black text-trophy">{score}</p>
    </div>
  );
}
