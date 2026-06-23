"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, CalendarDays, Database, MapPin, Save, Shuffle, Trophy } from "lucide-react";
import { activeCompetition, getCompetitionById, getFeaturedCompetitions, getPrimaryDataSource, type Competition } from "@/lib/competitions";
import { getMatchById, getMatchesByCompetitionId, getUpcomingMatchesByCompetitionId, type Match } from "@/lib/matches";
import { calculatePrediction, type PredictionResult } from "@/lib/prediction";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { getTeam, getTeamsByCompetitionId, type Team } from "@/lib/teams";
import { StatBar } from "@/components/StatBar";

const matchDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

const calendarDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short"
});

function buildInitialPrediction(competition: Competition) {
  const competitionMatches = getMatchesByCompetitionId(competition.id);
  const firstMatch = getUpcomingMatchesByCompetitionId(competition.id, 1)[0] ?? competitionMatches[0];
  const competitionTeams = getTeamsByCompetitionId(competition.id);
  const firstTeam = getTeam(firstMatch?.homeTeamName ?? competitionTeams[0]?.name ?? "Brasil", competition.id);
  const secondTeam = getTeam(firstMatch?.awayTeamName ?? competitionTeams[1]?.name ?? "Argentina", competition.id);

  return {
    match: firstMatch,
    teamA: firstTeam.name,
    teamB: secondTeam.name,
    prediction: calculatePrediction(firstTeam, secondTeam, competition.slug, firstMatch?.id)
  };
}

export function PredictionGenerator() {
  const competitionOptions = useMemo(() => getFeaturedCompetitions(), []);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(activeCompetition.id);
  const competition = getCompetitionById(selectedCompetitionId) ?? activeCompetition;
  const competitionTeams = useMemo(() => getTeamsByCompetitionId(competition.id), [competition.id]);
  const competitionMatches = useMemo(() => getMatchesByCompetitionId(competition.id), [competition.id]);
  const upcomingMatches = useMemo(() => getUpcomingMatchesByCompetitionId(competition.id, 8), [competition.id]);
  const featuredMatches = upcomingMatches.length > 0 ? upcomingMatches : competitionMatches.slice(0, 8);
  const initial = useMemo(() => buildInitialPrediction(competition), [competition]);
  const [selectedMatchId, setSelectedMatchId] = useState(initial.match?.id ?? "custom");
  const [teamA, setTeamA] = useState(initial.teamA);
  const [teamB, setTeamB] = useState(initial.teamB);
  const [prediction, setPrediction] = useState<PredictionResult>(() => initial.prediction);
  const [loadingAi, setLoadingAi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const availableTeamB = useMemo(() => competitionTeams.filter((team) => team.name !== teamA), [competitionTeams, teamA]);
  const selectedMatch = useMemo(() => (selectedMatchId === "custom" ? undefined : getMatchById(selectedMatchId)), [selectedMatchId]);
  const predictionTeamA = getTeam(prediction.teamA, competition.id);
  const predictionTeamB = getTeam(prediction.teamB, competition.id);
  const primarySource = getPrimaryDataSource(competition);
  const activeCalendarWindow = competition.calendarWindows.find((window) => window.status === "active") ?? competition.calendarWindows[0];

  useEffect(() => {
    if (teamA === teamB) {
      setTeamB(availableTeamB[0]?.name ?? competitionTeams[1]?.name ?? teamB);
    }
  }, [availableTeamB, competitionTeams, teamA, teamB]);

  function selectCompetition(competitionId: string) {
    const nextCompetition = getCompetitionById(competitionId) ?? activeCompetition;
    const nextInitial = buildInitialPrediction(nextCompetition);
    setSelectedCompetitionId(nextCompetition.id);
    setSelectedMatchId(nextInitial.match?.id ?? "custom");
    setTeamA(nextInitial.teamA);
    setTeamB(nextInitial.teamB);
    setPrediction(nextInitial.prediction);
    setMessage("");
  }

  function selectMatch(matchId: string) {
    setSelectedMatchId(matchId);
    const match = getMatchById(matchId);
    if (match) {
      setTeamA(match.homeTeamName);
      setTeamB(match.awayTeamName);
      setPrediction(calculatePrediction(getTeam(match.homeTeamName, competition.id), getTeam(match.awayTeamName, competition.id), competition.slug, match.id));
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
    if (competitionTeams.length < 2) {
      return;
    }

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
      setMessage("A area de conta ainda nao esta ativa neste ambiente.");
      return;
    }

    setSaving(true);
    const userResult = await supabase.auth.getUser();
    if (!userResult.data.user) {
      setSaving(false);
      setMessage("Entre na sua conta para guardar esse palpite.");
      return;
    }

    const { error } = await supabase.from("predictions").insert({
      user_id: userResult.data.user.id,
      competition_id: prediction.competitionId,
      match_id: prediction.matchId ?? null,
      team_a_id: null,
      team_b_id: null,
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

    setMessage(error ? error.message : "Palpite salvo no seu bolao.");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl bg-white p-5 shadow-pitch sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-field">{competition.shortName}</p>
            <h2 className="text-2xl font-black text-ink">Agenda de jogos</h2>
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
        <label className="mb-5 grid gap-2 text-sm font-bold text-field-dark">
          Campeonato
          <select
            className="rounded-lg border border-field-dark/15 bg-white px-4 py-3 text-ink outline-none ring-field/30 transition focus:ring-4"
            onChange={(event) => selectCompetition(event.target.value)}
            value={selectedCompetitionId}
          >
            {competitionOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.shortName} - {item.seasonLabel}
              </option>
            ))}
          </select>
        </label>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {featuredMatches.length > 0 ? (
            featuredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onSelect={() => selectMatch(match.id)}
                selected={selectedMatchId === match.id}
              />
            ))
          ) : (
            <CalendarNotice competition={competition} sourceLabel={primarySource?.label ?? "fonte externa"} windowLabel={activeCalendarWindow?.label} />
          )}
        </div>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-field-dark">
            Partida
            <select
              className="rounded-lg border border-field-dark/15 bg-white px-4 py-3 text-ink outline-none ring-field/30 transition focus:ring-4"
              onChange={(event) => selectMatch(event.target.value)}
              value={selectedMatchId}
            >
              {competitionMatches.map((match) => (
                <option key={match.id} value={match.id}>
                  {getTeam(match.homeTeamName, competition.id).flag} {match.homeTeamName} x {getTeam(match.awayTeamName, competition.id).flag}{" "}
                  {match.awayTeamName} - {match.stage}
                </option>
              ))}
              <option value="custom">Montar confronto</option>
            </select>
          </label>
          <TeamSelect
            label="Mandante"
            onChange={(value) => {
              setSelectedMatchId("custom");
              setTeamA(value);
            }}
            value={teamA}
            options={competitionTeams}
          />
          <TeamSelect
            label="Visitante"
            onChange={(value) => {
              setSelectedMatchId("custom");
              setTeamB(value);
            }}
            value={teamB}
            options={availableTeamB}
          />
        </div>
        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-trophy px-5 py-4 font-black text-ink transition hover:bg-yellow-300"
          onClick={generatePrediction}
          type="button"
        >
          <Bot className="size-5" aria-hidden="true" />
          Gerar palpite
        </button>
      </div>

      <div className="rounded-2xl bg-field-dark p-5 text-white shadow-pitch sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-trophy">Palpite do jogo</p>
            <h2 className="mt-1 text-2xl font-black">Bolao organizado</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-black text-white">
            <Trophy className="size-4 text-trophy" aria-hidden="true" />
            {selectedMatch ? selectedMatch.group : competition.shortName}
          </div>
        </div>
        {selectedMatch ? (
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-white/80">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-trophy" aria-hidden="true" />
              {matchDateFormatter.format(new Date(selectedMatch.startsAt))}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-trophy" aria-hidden="true" />
              {selectedMatch.venue}
            </span>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-white/80">
            <span className="inline-flex items-center gap-2">
              <Database className="size-4 text-trophy" aria-hidden="true" />
              Fonte prevista: {primarySource?.label ?? "catalogo de jogos"}
            </span>
          </div>
        )}
        <div className="mt-4 grid gap-4 rounded-xl bg-white/10 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <TeamScore team={predictionTeamA} score={prediction.scoreA} />
          <span className="text-center text-2xl font-black text-trophy">x</span>
          <TeamScore team={predictionTeamB} score={prediction.scoreB} alignRight />
        </div>
        <div className="mt-6 grid gap-4 rounded-xl bg-white p-5">
          <StatBar label={`Vitoria ${prediction.teamA}`} value={prediction.probabilityA} />
          <StatBar label="Empate" value={prediction.probabilityDraw} />
          <StatBar label={`Vitoria ${prediction.teamB}`} value={prediction.probabilityB} />
        </div>
        <p className="mt-5 rounded-xl bg-white/10 p-5 text-base font-semibold leading-relaxed">
          {loadingAi ? "Preparando analise do confronto..." : prediction.commentary}
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

function CalendarNotice({ competition, sourceLabel, windowLabel }: { competition: Competition; sourceLabel: string; windowLabel?: string }) {
  return (
    <div className="rounded-lg border border-field-dark/10 bg-field/5 p-4 sm:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-field-dark">Calendario preparado</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-ink/65">
            {competition.shortName} esta no catalogo de competicoes. Quando a agenda vier da fonte de dados, os cards aparecem aqui automaticamente.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-field-dark">
          <Database className="size-4" aria-hidden="true" />
          {sourceLabel}
        </span>
      </div>
      {windowLabel ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-ink/60">
          <span>{windowLabel}</span>
          <span>
            {calendarDateFormatter.format(new Date(competition.startsAt))} - {calendarDateFormatter.format(new Date(competition.endsAt))}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function MatchCard({ match, selected, onSelect }: { match: Match; selected: boolean; onSelect: () => void }) {
  const homeTeam = getTeam(match.homeTeamName, match.competitionId);
  const awayTeam = getTeam(match.awayTeamName, match.competitionId);

  return (
    <button
      className={`rounded-lg border p-4 text-left transition hover:border-field hover:bg-field/5 ${
        selected ? "border-field bg-field/10 ring-2 ring-field/15" : "border-field-dark/10 bg-white"
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center justify-between gap-3 text-xs font-black uppercase text-ink/55">
        <span>{match.stage}</span>
        <span>{matchDateFormatter.format(new Date(match.startsAt))}</span>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <CompactTeam team={homeTeam} />
        <span className="text-sm font-black text-field-dark">x</span>
        <CompactTeam team={awayTeam} alignRight />
      </div>
      <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-ink/60">
        <MapPin className="size-3.5 text-field" aria-hidden="true" />
        {match.city}
      </p>
    </button>
  );
}

function CompactTeam({ team, alignRight = false }: { team: Team; alignRight?: boolean }) {
  return (
    <div className={alignRight ? "text-right" : ""}>
      <span className="text-2xl" aria-hidden="true">
        {team.flag}
      </span>
      <p className="mt-1 truncate text-sm font-black text-ink">{team.name}</p>
    </div>
  );
}

function TeamSelect({ label, value, options, onChange }: { label: string; value: string; options: Team[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-field-dark">
      {label}
      <select
        className="rounded-lg border border-field-dark/15 bg-white px-4 py-3 text-ink outline-none ring-field/30 transition focus:ring-4"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.id} value={option.name}>
            {option.flag} {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function TeamScore({ team, score, alignRight = false }: { team: Team; score: number; alignRight?: boolean }) {
  return (
    <div className={alignRight ? "text-left sm:text-right" : ""}>
      <p className="text-lg font-black">
        <span aria-hidden="true">{team.flag}</span> {team.name}
      </p>
      <p className="text-6xl font-black text-trophy">{score}</p>
    </div>
  );
}
