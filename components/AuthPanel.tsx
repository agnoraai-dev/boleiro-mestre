"use client";

import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth(mode: "login" | "signup") {
    setMessage("");
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setMessage("A área de conta ainda está em preparação.");
      return;
    }

    setLoading(true);
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(mode === "login" ? "Entrada confirmada. Já pode salvar seus palpites." : "Conta criada. Confira seu e-mail para concluir a confirmação, se necessário.");
  }

  return (
    <div className="rounded-3xl border border-emerald-800/55 bg-emerald-950/55 p-6 shadow-pitch">
      {!isSupabaseConfigured ? (
        <div className="mb-5 rounded-2xl border border-trophy/30 bg-trophy/15 p-4 text-sm font-semibold text-trophy">
          A área de conta está em preparação. Enquanto isso, você pode gerar palpites normalmente.
        </div>
      ) : null}
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-emerald-300">
          E-mail
          <input
            className="rounded-2xl border border-emerald-800/70 bg-slate-950/80 px-4 py-3 text-white outline-none ring-trophy/25 transition focus:border-trophy focus:ring-4"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            type="email"
            value={email}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-emerald-300">
          Senha
          <input
            className="rounded-2xl border border-emerald-800/70 bg-slate-950/80 px-4 py-3 text-white outline-none ring-trophy/25 transition focus:border-trophy focus:ring-4"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo de 6 caracteres"
            type="password"
            value={password}
          />
        </label>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-5 py-3 font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
          disabled={loading}
          onClick={() => handleAuth("login")}
          type="button"
        >
          <LogIn className="size-5" aria-hidden="true" />
          Entrar
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-trophy to-yellow-400 px-5 py-3 font-black text-emerald-950 transition hover:from-yellow-300 hover:to-trophy disabled:opacity-60"
          disabled={loading}
          onClick={() => handleAuth("signup")}
          type="button"
        >
          <UserPlus className="size-5" aria-hidden="true" />
          Criar conta
        </button>
      </div>
      {message ? <p className="mt-4 rounded-2xl border border-emerald-800/50 bg-slate-950/70 p-4 text-sm font-semibold text-emerald-200">{message}</p> : null}
    </div>
  );
}
