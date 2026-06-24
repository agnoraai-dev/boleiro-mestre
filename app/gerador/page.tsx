import type { Metadata } from "next";
import { AdBanner } from "@/components/AdBanner";
import { PredictionGenerator } from "@/components/PredictionGenerator";

export const metadata: Metadata = {
  title: "Gerador de Palpites"
};

export const dynamic = "force-dynamic";

export default function GeneratorPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-field">Palpites de futebol</p>
        <h1 className="mt-2 text-4xl font-black text-ink">Gere palpites para os próximos jogos</h1>
        <p className="mt-3 max-w-2xl font-semibold leading-relaxed text-ink/65">
          Escolha o campeonato, selecione uma partida ou monte um confronto e acompanhe o resultado previsto no seu bolão.
        </p>
      </div>
      <PredictionGenerator />
      <div className="mt-8">
        <AdBanner label="Espaço para conteúdo e parceiros" />
      </div>
    </section>
  );
}
