"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Save, Shuffle } from "lucide-react";
import { activeCompetition } from "@/lib/competitions";
import { getMatchById, getMatchesByCompetitionId } from "@/lib/matches";
import { calculatePrediction, type PredictionResult } from "@/lib/prediction";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { getTeam, getTeamsByCompetitionId } from "@/lib/teams";
import { StatBar } from "@/components/StatBar";

const teamBadges: Record<string, string> = {
  Alemanha: "ALE",
  Argentina: "ARG",
  Brasil: "BRA",
  Espanha: "ESP",
  Franca: "FRA",
  Holanda: "HOL",
  Inglaterra: "ING",
  Italia: "ITA",
  Japao: "JAP",
  Mexico: "MEX",
  Portugal: "POR",
  Uruguai: "URU"
};

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
      <div className="relative overflow-hidden rounded-3xl border border-emerald-800/55 bg-emerald-950/55 p-6 shadow-pitch">
        <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-emerald-500 via-trophy to-emerald-500" />
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-trophy">{competition.shortName}</p>
            <h2 className="text-2xl font-black text-white">Jogos da Copa</h2>
          </div>
          <button
            aria-label="Sortear times"
            className="grid size-11 place-items-center rounded-2xl border border-emerald-700/60 bg-slate-950/70 text-trophy transition hover:border-trophy hover:bg-emerald-900"
            onClick={randomizeTeams}
            type="button"
          >
            <Shuffle className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="grid gap-4">
          <label className="grid gap-2 text-xs font-black uppercase tracking-widest text-emerald-300">
            Partida
            <select
              className="rounded-2xl border border-emerald-800/60 bg-slate-950/80 px-4 py-3 text-sm font-bold text-white outline-none ring-trophy/25 transition focus:border-trophy focus:ring-4"
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
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
            <TeamSelect
              label="Casa"
              onChange={(value) => {
                setSelectedMatchId("custom");
                setTeamA(value);
              }}
              value={teamA}
              options={competitionTeams.map((team) => team.name)}
            />
            <div className="flex flex-col items-center justify-center gap-2 pt-6">
              <span className="text-xl font-black italic text-trophy">VS</span>
              <span className="h-10 w-px bg-emerald-800/70" />
            </div>
            <TeamSelect
              label="Fora"
              onChange={(value) => {
                setSelectedMatchId("custom");
                setTeamB(value);
              }}
              value={teamB}
              options={availableTeamB.map((team) => team.name)}
            />
          </div>
        </div>
        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-trophy to-yellow-400 px-5 py-4 text-xs font-black uppercase tracking-wider text-emerald-950 shadow-lg shadow-yellow-400/15 transition active:scale-[0.99] hover:from-yellow-300 hover:to-trophy disabled:opacity-70"
          disabled={loadingAi}
          onClick={generatePrediction}
          type="button"
        >
          <Bot className="size-5" aria-hidden="true" />
          {loadingAi ? "O Mestre esta estudando a tatica..." : "Gerar palpite da Copa"}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border-2 border-trophy/85 bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 text-white shadow-pitch">
        <div className="absolute -bottom-10 -right-8 text-8xl font-black text-white/5">BM</div>
        <p className="text-sm font-black uppercase tracking-widest text-trophy">Sentenca do Mestre</p>
        <div className="mt-4 grid gap-4 rounded-3xl border border-emerald-800/70 bg-slate-950/55 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <TeamScore name={prediction.teamA} score={prediction.scoreA} />
          <span className="text-center text-2xl font-black italic text-trophy">X</span>
          <TeamScore name={prediction.teamB} score={prediction.scoreB} alignRight />
        </div>
        <div className="mt-6 grid gap-4 rounded-3xl bg-white p-5">
          <StatBar label={`Vitoria ${prediction.teamA}`} value={prediction.probabilityA} />
          <StatBar label="Empate" value={prediction.probabilityDraw} />
          <StatBar label={`Vitoria ${prediction.teamB}`} value={prediction.probabilityB} />
        </div>
        <p className="relative mt-5 rounded-3xl border border-emerald-800/60 bg-slate-950/70 p-5 text-base font-semibold leading-relaxed">
          <span className="absolute -top-3 left-5 rounded-md bg-trophy px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-950">Comentario da IA</span>
          {loadingAi ? "Chamando o comentarista da cabine..." : prediction.commentary}
        </p>
        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-700 bg-emerald-800/85 px-5 py-4 font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
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
    <label className="grid gap-2 rounded-2xl border border-emerald-800/60 bg-slate-950/70 p-3 text-center text-xs font-black uppercase tracking-widest text-emerald-300">
      <span>{label}</span>
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-900/80 text-sm text-trophy shadow-inner shadow-black/40">
        {teamBadges[value] ?? value.slice(0, 3).toUpperCase()}
      </span>
      <select
        className="w-full rounded-xl border border-emerald-800/70 bg-slate-900 px-2 py-2 text-center text-xs font-black normal-case tracking-normal text-white outline-none ring-trophy/25 transition focus:border-trophy focus:ring-4"
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
    <div className={`rounded-2xl bg-slate-950/70 p-4 text-center ${alignRight ? "sm:text-right" : "sm:text-left"}`}>
      <p className="text-xs font-black uppercase tracking-widest text-emerald-300">{teamBadges[name] ?? name.slice(0, 3).toUpperCase()}</p>
      <p className="mt-1 text-lg font-black">{name}</p>
      <p className="text-6xl font-black text-trophy">{score}</p>
    </div>
  );
}
