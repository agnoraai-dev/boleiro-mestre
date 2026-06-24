"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Goal } from "lucide-react";
import { activeCompetition } from "@/lib/competitions";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { SavedPrediction } from "@/types/prediction";

export function SavedPredictions() {
  const [items, setItems] = useState<SavedPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPredictions() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setMessage("Configure o Supabase para listar seus palpites salvos.");
        setLoading(false);
        return;
      }

      const userResult = await supabase.auth.getUser();
      if (!userResult.data.user) {
        setMessage("Entre na sua conta para ver os palpites que voce salvou.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("competition_id", activeCompetition.id)
        .order("created_at", { ascending: false });

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
    return <p className="rounded-3xl border border-emerald-800/55 bg-emerald-950/55 p-6 font-bold text-emerald-200 shadow-pitch">Buscando seus palpites da Copa no arquivo da concentracao...</p>;
  }

  if (message) {
    return (
      <div className="rounded-3xl border border-emerald-800/55 bg-emerald-950/55 p-6 shadow-pitch">
        <p className="font-bold text-emerald-200">{message}</p>
        <Link className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-trophy to-yellow-400 px-5 py-3 font-black text-emerald-950" href="/login">
          Ir para login
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-emerald-800/55 bg-emerald-950/55 p-6 shadow-pitch">
        <p className="font-bold text-emerald-200">Nenhum palpite da Copa salvo ainda.</p>
        <Link className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-trophy to-yellow-400 px-5 py-3 font-black text-emerald-950" href="/gerador">
          Criar primeiro palpite da Copa
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <article className="rounded-3xl border border-emerald-800/55 bg-slate-950/75 p-5 shadow-pitch" key={item.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/80 px-3 py-2 text-sm font-black text-trophy">
              <Goal className="size-4" aria-hidden="true" />
              {item.team_a} {item.score_a} x {item.score_b} {item.team_b}
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
              <CalendarDays className="size-4" aria-hidden="true" />
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.created_at))}
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-300">{item.commentary}</p>
        </article>
      ))}
    </div>
  );
}
