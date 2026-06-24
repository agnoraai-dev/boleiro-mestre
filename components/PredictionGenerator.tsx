"use client";

import { useMemo, useState } from "react";
import { Bot, CalendarDays, Database, MapPin, Save, SlidersHorizontal, Trophy } from "lucide-react";
import { activeCompetition, getCompetitionById, getFeaturedCompetitions, getPrimaryDataSource, type Competition } from "@/lib/competitions";
import { getMatchById, getMatchesByCompetitionId, getUpcomingMatchesByCompetitionId, type Match } from "@/lib/matches";
import { calculatePrediction, defaultPredictionTuning, type GameRhythm, type PredictionResult, type PredictionTuning } from "@/lib/prediction";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { getTeam, type Team } from "@/lib/teams";
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

const rhythmOptions: Array<{ value: GameRhythm; label: string }> = [
  { value: "balanced", label: "Equilibrado" },
  { value: "open", label: "Aberto" },
  { value: "locked", label: "Truncado" }
];

function formatSignedValue(value: number) {
  if (value === 0) {
    return "Neutro";
  }

  return value > 0 ? `+${value}` : `${value}`;
}

function getInitialMatch(competition: Competition) {
  const competitionMatches = getMatchesByCompetitionId(competition.id);
  return getUpcomingMatchesByCompetitionId(competition.id, 1)[0] ?? competitionMatches[0];
}

function buildMatchPrediction(competition: Competition, match: Match | undefined, tuning: PredictionTuning) {
  if (!match) {
    return null;
  }

  return calculatePrediction(
    getTeam(match.homeTeamName, competition.id),
    getTeam(match.awayTeamName, competition.id),
    competition.slug,
    match.id,
    tuning
  );
}

export function PredictionGenerator() {
  const competitionOptions = useMemo(() => getFeaturedCompetitions(), []);
  const initialMatch = useMemo(() => getInitialMatch(activeCompetition), []);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(activeCompetition.id);
  const competition = getCompetitionById(selectedCompetitionId) ?? activeCompetition;
  const competitionMatches = useMemo(() => getMatchesByCompetitionId(competition.id), [competition.id]);
  const upcomingMatches = useMemo(() => getUpcomingMatchesByCompetitionId(competition.id, 8), [competition.id]);
  const featuredMatches = upcomingMatches.length > 0 ? upcomingMatches : competitionMatches.slice(0, 8);
  const [selectedMatchId, setSelectedMatchId] = useState(initialMatch?.id ?? "");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [tuning, setTuning] = useState<PredictionTuning>(defaultPredictionTuning);
  const [loadingAi, setLoadingAi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedMatch = useMemo(() => (selectedMatchId ? getMatchById(selectedMatchId) : undefined), [selectedMatchId]);
  const primarySource = getPrimaryDataSource(competition);
  const activeCalendarWindow = competition.calendarWindows.find((window) => window.status === "active") ?? competition.calendarWindows[0];

  function selectCompetition(competitionId: string) {
    const nextCompetition = getCompetitionById(competitionId) ?? activeCompetition;
    const nextMatch = getInitialMatch(nextCompetition);
    setSelectedCompetitionId(nextCompetition.id);
    setSelectedMatchId(nextMatch?.id ?? "");
    setPrediction(null);
    setMessage("");
  }

  function selectMatch(matchId: string) {
    const match = getMatchById(matchId);
    if (!match) {
      setSelectedMatchId("");
      setPrediction(null);
      setMessage("Selecione uma partida real da agenda.");
      return;
    }

    setSelectedMatchId(match.id);
    setPrediction(null);
    setMessage("");
  }

  function updateTuning<Key extends keyof PredictionTuning>(key: Key, value: PredictionTuning[Key]) {
    setTuning((current) => ({ ...current, [key]: value }));
    setPrediction(null);
    setMessage("");
  }

  async function generatePrediction() {
    setMessage("");
    if (!selectedMatch) {
      setMessage("Selecione uma partida real da agenda para gerar o palpite.");
      return;
    }

    const basePrediction = buildMatchPrediction(competition, selectedMatch, tuning);
    if (!basePrediction) {
      setMessage("Não foi possível gerar o palpite para essa partida.");
      return;
    }

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

  async function savePrediction() {
    setMessage("");
    if (!prediction) {
      setMessage("Gere um palpite para uma partida real antes de salvar.");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setMessage("A área de conta ainda está em preparação.");
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

    setMessage(error ? error.message : "Palpite salvo no seu bolão.");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-800/55 bg-emerald-950/55 p-5 shadow-pitch sm:p-6">
        <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-emerald-500 via-trophy to-emerald-500" />
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-trophy">{competition.shortName}</p>
            <h2 className="text-2xl font-black text-white">Agenda de jogos</h2>
          </div>
        </div>
        <label className="mb-5 grid gap-2 text-xs font-black uppercase tracking-widest text-emerald-300">
          Campeonato
          <select
            className="rounded-2xl border border-emerald-800/60 bg-slate-950/80 px-4 py-3 text-sm font-bold normal-case tracking-normal text-white outline-none ring-trophy/25 transition focus:border-trophy focus:ring-4"
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
              <MatchCard key={match.id} match={match} onSelect={() => selectMatch(match.id)} selected={selectedMatchId === match.id} />
            ))
          ) : (
            <CalendarNotice competition={competition} sourceLabel={primarySource?.label ?? "fonte externa"} windowLabel={activeCalendarWindow?.label} />
          )}
        </div>
        {competitionMatches.length > 0 ? (
          <label className="grid gap-2 text-xs font-black uppercase tracking-widest text-emerald-300">
            Partida real
            <select
              className="rounded-2xl border border-emerald-800/60 bg-slate-950/80 px-4 py-3 text-sm font-bold normal-case tracking-normal text-white outline-none ring-trophy/25 transition focus:border-trophy focus:ring-4"
              onChange={(event) => selectMatch(event.target.value)}
              value={selectedMatchId}
            >
              {competitionMatches.map((match) => (
                <option key={match.id} value={match.id}>
                  {getTeam(match.homeTeamName, competition.id).flag} {match.homeTeamName} x {getTeam(match.awayTeamName, competition.id).flag}{" "}
                  {match.awayTeamName} - {match.stage}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {selectedMatch ? <PredictionTuningPanel tuning={tuning} onUpdate={updateTuning} /> : null}
        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-trophy to-yellow-400 px-5 py-4 text-xs font-black uppercase tracking-wider text-emerald-950 shadow-lg shadow-yellow-400/15 transition hover:from-yellow-300 hover:to-trophy active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={!selectedMatch || loadingAi}
          onClick={generatePrediction}
          type="button"
        >
          <Bot className="size-5" aria-hidden="true" />
          {loadingAi ? "Gerando análise..." : "Gerar palpite"}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border-2 border-trophy/85 bg-gradient-to-br from-emerald-900 to-emerald-950 p-5 text-white shadow-pitch sm:p-6">
        <div className="absolute -bottom-10 -right-8 text-8xl font-black text-white/5">BM</div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-trophy">Palpite do jogo</p>
            <h2 className="mt-1 text-2xl font-black">Bolão organizado</h2>
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
              Fonte prevista: {primarySource?.label ?? "catálogo de jogos"}
            </span>
          </div>
        )}
        {selectedMatch && !prediction ? (
          <div className="mt-4 grid gap-4 rounded-3xl border border-emerald-800/70 bg-slate-950/55 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <FixtureTeam team={getTeam(selectedMatch.homeTeamName, competition.id)} />
            <span className="text-center text-2xl font-black italic text-trophy">X</span>
            <FixtureTeam team={getTeam(selectedMatch.awayTeamName, competition.id)} alignRight />
          </div>
        ) : null}
        {prediction ? (
          <>
            <div className="mt-4 grid gap-4 rounded-3xl border border-emerald-800/70 bg-slate-950/55 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <TeamScore team={getTeam(prediction.teamA, competition.id)} score={prediction.scoreA} />
              <span className="text-center text-2xl font-black italic text-trophy">X</span>
              <TeamScore team={getTeam(prediction.teamB, competition.id)} score={prediction.scoreB} alignRight />
            </div>
            <div className="mt-6 grid gap-4 rounded-3xl bg-white p-5">
              <StatBar label={`Vitória ${prediction.teamA}`} value={prediction.probabilityA} />
              <StatBar label="Empate" value={prediction.probabilityDraw} />
              <StatBar label={`Vitória ${prediction.teamB}`} value={prediction.probabilityB} />
            </div>
            <p className="relative mt-5 rounded-3xl border border-emerald-800/60 bg-slate-950/70 p-5 text-base font-semibold leading-relaxed">
              <span className="absolute -top-3 left-5 rounded-md bg-trophy px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-950">
                Comentário da IA
              </span>
              {loadingAi ? "Preparando análise da partida..." : prediction.commentary}
            </p>
            <button
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-700 bg-emerald-800/85 px-5 py-4 font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving || loadingAi}
              onClick={savePrediction}
              type="button"
            >
              <Save className="size-5" aria-hidden="true" />
              Salvar palpite
            </button>
          </>
        ) : (
          <p className="mt-4 rounded-3xl border border-emerald-800/60 bg-slate-950/70 p-5 text-base font-semibold leading-relaxed">
            {selectedMatch
              ? "Palpite ainda não gerado. Ajuste as variáveis e gere a previsão para liberar placar, probabilidades e comentário do bolão."
              : "Escolha um campeonato com partidas reais carregadas para liberar o placar previsto, as probabilidades e o comentário do bolão."}
          </p>
        )}
        {message ? <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm font-bold text-white">{message}</p> : null}
      </div>
    </section>
  );
}

function CalendarNotice({ competition, sourceLabel, windowLabel }: { competition: Competition; sourceLabel: string; windowLabel?: string }) {
  return (
    <div className="rounded-2xl border border-emerald-800/60 bg-slate-950/70 p-4 sm:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-emerald-300">Calendário preparado</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
            {competition.shortName} está no catálogo de competições. Assim que a agenda real for importada pela fonte de dados, os cards aparecerão aqui.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-900/70 px-3 py-2 text-xs font-black text-trophy">
          <Database className="size-4" aria-hidden="true" />
          {sourceLabel}
        </span>
      </div>
      {windowLabel ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-400">
          <span>{windowLabel}</span>
          <span>
            {calendarDateFormatter.format(new Date(competition.startsAt))} - {calendarDateFormatter.format(new Date(competition.endsAt))}
          </span>
        </div>
      ) : null}
    </div>
  );
}

type TuningUpdater = <Key extends keyof PredictionTuning>(key: Key, value: PredictionTuning[Key]) => void;

function PredictionTuningPanel({ tuning, onUpdate }: { tuning: PredictionTuning; onUpdate: TuningUpdater }) {
  return (
    <div className="mt-5 border-t border-emerald-800/70 pt-5">
      <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-300">
        <SlidersHorizontal className="size-4 text-trophy" aria-hidden="true" />
        Ajustes do palpite
      </div>
      <div className="grid gap-4">
        <SliderControl
          label="Momento do mandante"
          max={10}
          min={-10}
          onChange={(value) => onUpdate("homeMomentum", value)}
          value={tuning.homeMomentum}
          valueLabel={formatSignedValue(tuning.homeMomentum)}
        />
        <SliderControl
          label="Momento do visitante"
          max={10}
          min={-10}
          onChange={(value) => onUpdate("awayMomentum", value)}
          value={tuning.awayMomentum}
          valueLabel={formatSignedValue(tuning.awayMomentum)}
        />
        <SliderControl
          label="Mando de campo"
          max={10}
          min={0}
          onChange={(value) => onUpdate("homeAdvantage", value)}
          value={tuning.homeAdvantage}
          valueLabel={`${tuning.homeAdvantage}/10`}
        />
        <div className="grid gap-2">
          <span className="text-sm font-bold text-emerald-300">Ritmo provável</span>
          <div className="grid grid-cols-3 rounded-2xl border border-emerald-800/60 bg-slate-950/70 p-1" role="group" aria-label="Ritmo provável">
            {rhythmOptions.map((option) => (
              <button
                aria-pressed={tuning.gameRhythm === option.value}
                className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                  tuning.gameRhythm === option.value ? "bg-trophy text-emerald-950 shadow-sm" : "text-emerald-200 hover:bg-emerald-900/80"
                }`}
                key={option.value}
                onClick={() => onUpdate("gameRhythm", option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  label,
  max,
  min,
  onChange,
  value,
  valueLabel
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
  valueLabel: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-emerald-300">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-black text-trophy">{valueLabel}</span>
      </span>
      <input
        className="h-2 w-full accent-trophy"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
    </label>
  );
}

function MatchCard({ match, selected, onSelect }: { match: Match; selected: boolean; onSelect: () => void }) {
  const homeTeam = getTeam(match.homeTeamName, match.competitionId);
  const awayTeam = getTeam(match.awayTeamName, match.competitionId);

  return (
    <button
      className={`min-w-0 overflow-hidden rounded-2xl border p-4 text-left transition hover:border-trophy hover:bg-emerald-900/45 ${
        selected ? "border-trophy bg-emerald-900/70 ring-2 ring-trophy/15" : "border-emerald-800/60 bg-slate-950/60"
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-xs font-black uppercase text-slate-400">
        <span className="min-w-0 leading-tight">{match.stage}</span>
        <span className="whitespace-nowrap text-right leading-tight">{matchDateFormatter.format(new Date(match.startsAt))}</span>
      </div>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <CompactTeam team={homeTeam} />
        <span className="text-sm font-black text-trophy">x</span>
        <CompactTeam team={awayTeam} alignRight />
      </div>
      <p className="mt-3 flex min-w-0 items-center gap-2 text-xs font-bold text-slate-400">
        <MapPin className="size-3.5 shrink-0 text-trophy" aria-hidden="true" />
        <span className="min-w-0 truncate">{match.city}</span>
      </p>
    </button>
  );
}

function CompactTeam({ team, alignRight = false }: { team: Team; alignRight?: boolean }) {
  return (
    <div className={`min-w-0 ${alignRight ? "text-right" : ""}`}>
      <span className="block text-2xl leading-none" aria-hidden="true">
        {team.flag}
      </span>
      <p className="mt-1 min-w-0 break-words text-sm font-black leading-tight text-white" title={team.name}>
        {team.name}
      </p>
    </div>
  );
}

function FixtureTeam({ team, alignRight = false }: { team: Team; alignRight?: boolean }) {
  return (
    <div className={`rounded-2xl bg-slate-950/70 p-4 text-center ${alignRight ? "sm:text-right" : "sm:text-left"}`}>
      <p className="text-xs font-black uppercase tracking-widest text-emerald-300">{team.code}</p>
      <p className="mt-1 text-lg font-black">
        <span aria-hidden="true">{team.flag}</span> {team.name}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-300">Aguardando palpite</p>
    </div>
  );
}

function TeamScore({ team, score, alignRight = false }: { team: Team; score: number; alignRight?: boolean }) {
  return (
    <div className={`rounded-2xl bg-slate-950/70 p-4 text-center ${alignRight ? "sm:text-right" : "sm:text-left"}`}>
      <p className="text-xs font-black uppercase tracking-widest text-emerald-300">{team.code}</p>
      <p className="mt-1 text-lg font-black">
        <span aria-hidden="true">{team.flag}</span> {team.name}
      </p>
      <p className="text-6xl font-black text-trophy">{score}</p>
    </div>
  );
}
