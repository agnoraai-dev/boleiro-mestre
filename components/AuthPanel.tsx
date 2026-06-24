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
      setMessage("A área de conta ainda não está ativa neste ambiente.");
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
    <div className="rounded-2xl bg-white p-6 shadow-pitch">
      {!isSupabaseConfigured ? (
        <div className="mb-5 rounded-lg bg-trophy/25 p-4 text-sm font-semibold text-field-dark">
          A área de conta está em preparação. Enquanto isso, você pode gerar palpites normalmente.
        </div>
      ) : null}
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-field-dark">
          E-mail
          <input
            className="rounded-lg border border-field-dark/15 px-4 py-3 text-ink outline-none ring-field/30 transition focus:ring-4"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            type="email"
            value={email}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-field-dark">
          Senha
          <input
            className="rounded-lg border border-field-dark/15 px-4 py-3 text-ink outline-none ring-field/30 transition focus:ring-4"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo de 6 caracteres"
            type="password"
            value={password}
          />
        </label>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-field px-5 py-3 font-black text-white transition hover:bg-field-dark disabled:opacity-60"
          disabled={loading}
          onClick={() => handleAuth("login")}
          type="button"
        >
          <LogIn className="size-5" aria-hidden="true" />
          Entrar
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-trophy px-5 py-3 font-black text-ink transition hover:bg-yellow-300 disabled:opacity-60"
          disabled={loading}
          onClick={() => handleAuth("signup")}
          type="button"
        >
          <UserPlus className="size-5" aria-hidden="true" />
          Criar conta
        </button>
      </div>
      {message ? <p className="mt-4 rounded-lg bg-field-dark/5 p-4 text-sm font-semibold text-field-dark">{message}</p> : null}
    </div>
  );
}
