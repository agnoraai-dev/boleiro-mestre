import type { Metadata } from "next";
import { AuthPanel } from "@/components/AuthPanel";

export const metadata: Metadata = {
  title: "Minha Conta"
};

export default function LoginPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
      <div>
        <p className="text-sm font-black uppercase text-field">Área do boleiro</p>
        <h1 className="mt-2 text-4xl font-black text-ink">Entre para salvar seus palpites</h1>
        <p className="mt-4 font-semibold leading-relaxed text-ink/65">
          Guarde seu histórico, organize os palpites por campeonato e acompanhe suas escolhas em uma tabela única.
        </p>
      </div>
      <AuthPanel />
    </section>
  );
}
