import type { Metadata } from "next";
import { AuthPanel } from "@/components/AuthPanel";

export const metadata: Metadata = {
  title: "Login e Cadastro"
};

export default function LoginPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
      <div>
        <p className="text-sm font-black uppercase text-field">Area do boleiro</p>
        <h1 className="mt-2 text-4xl font-black text-ink">Entre para salvar seus palpites da Copa</h1>
        <p className="mt-4 font-semibold leading-relaxed text-ink/65">
          Autenticacao preparada com Supabase Auth. Depois de entrar, seus palpites ficam guardados no Postgres com RLS por usuario e competicao.
        </p>
      </div>
      <AuthPanel />
    </section>
  );
}
