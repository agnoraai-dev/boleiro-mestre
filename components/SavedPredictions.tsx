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
    return <p className="rounded-3xl border border-emerald-800/55 bg-emerald-950/55 p-6 font-bold text-emerald-200 shadow-pitch">Buscando seus palpites salvos...</p>;
  }

  if (message) {
    return (
      <div className="rounded-3xl border border-emerald-800/55 bg-emerald-950/55 p-6 shadow-pitch">
        <p className="font-bold text-emerald-200">{message}</p>
        <Link className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-trophy to-yellow-400 px-5 py-3 font-black text-emerald-950" href="/login">
          Ir para minha conta
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-emerald-800/55 bg-emerald-950/55 p-6 shadow-pitch">
        <p className="font-bold text-emerald-200">Nenhum palpite salvo ainda.</p>
        <Link className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-trophy to-yellow-400 px-5 py-3 font-black text-emerald-950" href="/gerador">
          Criar primeiro palpite
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-800/55 bg-slate-950/75 shadow-pitch">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/70 px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-trophy">Tabela do bolao</p>
          <h2 className="text-2xl font-black text-white">Meus palpites</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-900/80 px-3 py-2 text-sm font-black text-trophy">
          <Trophy className="size-4" aria-hidden="true" />
          {items.length} {items.length === 1 ? "palpite" : "palpites"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left">
          <thead className="bg-emerald-950 text-xs font-black uppercase text-emerald-100">
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
          <tbody className="divide-y divide-emerald-900/70">
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
    <tr className="align-top transition hover:bg-emerald-900/25">
      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-400">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="size-4 text-trophy" aria-hidden="true" />
          {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.created_at))}
        </span>
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <span className="rounded-full bg-emerald-900/80 px-3 py-1.5 text-xs font-black text-emerald-200">
          {competition?.shortName ?? "Futebol"}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-black text-white">
          <TeamChip flag={homeTeam.flag} name={item.team_a} />
          <span className="text-trophy">x</span>
          <TeamChip flag={awayTeam.flag} name={item.team_b} />
        </div>
        <p className="mt-2 text-xs font-bold text-slate-500">{match ? `${match.stage} - ${match.city}` : "Confronto montado"}</p>
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-trophy px-3 py-2 text-sm font-black text-emerald-950">
          <Goal className="size-4" aria-hidden="true" />
          {item.score_a} x {item.score_b}
        </span>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-emerald-200">{favorite}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-emerald-950">
            <div className="h-full rounded-full bg-trophy" style={{ width: `${confidence}%` }} />
          </div>
          <span className="text-sm font-black text-white">{confidence}%</span>
        </div>
      </td>
      <td className="max-w-sm px-5 py-4 text-sm font-semibold leading-relaxed text-slate-300">{item.commentary}</td>
    </tr>
  );
}

function TeamChip({ flag, name }: { flag: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-900/50 px-3 py-1.5 text-emerald-100">
      <span aria-hidden="true">{flag}</span>
      {name}
    </span>
  );
}
