"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Goal, Trophy } from "lucide-react";
import { getCompetitionById } from "@/lib/competitions";
import { getMatchById } from "@/lib/matches";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { getTeam } from "@/lib/teams";
import type { SavedPrediction } from "@/types/prediction";

export function SavedPredictions() {
  const [items, setItems] = useState<SavedPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPredictions() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setMessage("A area de conta ainda nao esta ativa neste ambiente.");
        setLoading(false);
        return;
      }

      const userResult = await supabase.auth.getUser();
      if (!userResult.data.user) {
        setMessage("Entre na sua conta para ver os palpites que voce salvou.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from("predictions").select("*").order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setItems((data ?? []) as SavedPrediction[]);
      }
      setLoading(false);
    }

    loadPredictions();
  }, []);

  if (loading) {
    return <p className="rounded-lg bg-white p-6 font-bold text-field-dark shadow-pitch">Buscando seus palpites salvos...</p>;
  }

  if (message) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-pitch">
        <p className="font-bold text-field-dark">{message}</p>
        <Link className="mt-4 inline-flex rounded-full bg-field px-5 py-3 font-black text-white" href="/login">
          Ir para minha conta
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-pitch">
        <p className="font-bold text-field-dark">Nenhum palpite salvo ainda.</p>
        <Link className="mt-4 inline-flex rounded-full bg-trophy px-5 py-3 font-black text-ink" href="/gerador">
          Criar primeiro palpite
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-field-dark/10 bg-white shadow-pitch">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-field-dark/10 px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase text-field">Tabela do bolao</p>
          <h2 className="text-2xl font-black text-ink">Meus palpites</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-field/10 px-3 py-2 text-sm font-black text-field-dark">
          <Trophy className="size-4" aria-hidden="true" />
          {items.length} {items.length === 1 ? "palpite" : "palpites"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left">
          <thead className="bg-field-dark text-xs font-black uppercase text-white">
            <tr>
              <th className="px-5 py-3">Data</th>
              <th className="px-5 py-3">Campeonato</th>
              <th className="px-5 py-3">Jogo</th>
              <th className="px-5 py-3">Placar</th>
              <th className="px-5 py-3">Favorito</th>
              <th className="px-5 py-3">Confianca</th>
              <th className="px-5 py-3">Comentario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-field-dark/10">
            {items.map((item) => (
              <PredictionRow item={item} key={item.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PredictionRow({ item }: { item: SavedPrediction }) {
  const match = item.match_id ? getMatchById(item.match_id) : undefined;
  const competition = getCompetitionById(item.competition_id);
  const homeTeam = getTeam(item.team_a, item.competition_id);
  const awayTeam = getTeam(item.team_b, item.competition_id);
  const confidence = Math.max(item.probability_a, item.probability_draw, item.probability_b);
  const favorite =
    item.probability_draw >= item.probability_a && item.probability_draw >= item.probability_b
      ? "Empate"
      : item.probability_a > item.probability_b
        ? item.team_a
        : item.team_b;

  return (
    <tr className="align-top transition hover:bg-field/5">
      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-ink/65">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="size-4 text-field" aria-hidden="true" />
          {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.created_at))}
        </span>
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <span className="rounded-full bg-field-dark/10 px-3 py-1.5 text-xs font-black text-field-dark">
          {competition?.shortName ?? "Futebol"}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-black text-ink">
          <TeamChip flag={homeTeam.flag} name={item.team_a} />
          <span className="text-field-dark">x</span>
          <TeamChip flag={awayTeam.flag} name={item.team_b} />
        </div>
        <p className="mt-2 text-xs font-bold text-ink/50">{match ? `${match.stage} - ${match.city}` : "Confronto montado"}</p>
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-trophy px-3 py-2 text-sm font-black text-ink">
          <Goal className="size-4" aria-hidden="true" />
          {item.score_a} x {item.score_b}
        </span>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-field-dark">{favorite}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-field-dark/10">
            <div className="h-full rounded-full bg-field" style={{ width: `${confidence}%` }} />
          </div>
          <span className="text-sm font-black text-ink">{confidence}%</span>
        </div>
      </td>
      <td className="max-w-sm px-5 py-4 text-sm font-semibold leading-relaxed text-ink/70">{item.commentary}</td>
    </tr>
  );
}

function TeamChip({ flag, name }: { flag: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-field/10 px-3 py-1.5 text-field-dark">
      <span aria-hidden="true">{flag}</span>
      {name}
    </span>
  );
}
