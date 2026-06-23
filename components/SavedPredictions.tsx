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
    return <p className="rounded-3xl bg-white p-6 font-bold text-field-dark shadow-pitch">Buscando seus palpites da Copa no arquivo da concentracao...</p>;
  }

  if (message) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-pitch">
        <p className="font-bold text-field-dark">{message}</p>
        <Link className="mt-4 inline-flex rounded-full bg-field px-5 py-3 font-black text-white" href="/login">
          Ir para login
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-pitch">
        <p className="font-bold text-field-dark">Nenhum palpite da Copa salvo ainda.</p>
        <Link className="mt-4 inline-flex rounded-full bg-trophy px-5 py-3 font-black text-ink" href="/gerador">
          Criar primeiro palpite da Copa
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <article className="rounded-3xl bg-white p-5 shadow-pitch" key={item.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-field/10 px-3 py-2 text-sm font-black text-field-dark">
              <Goal className="size-4" aria-hidden="true" />
              {item.team_a} {item.score_a} x {item.score_b} {item.team_b}
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60">
              <CalendarDays className="size-4" aria-hidden="true" />
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.created_at))}
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-ink/75">{item.commentary}</p>
        </article>
      ))}
    </div>
  );
}
