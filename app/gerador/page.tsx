import type { Metadata } from "next";
import { AdBanner } from "@/components/AdBanner";
import { PredictionGenerator } from "@/components/PredictionGenerator";

export const metadata: Metadata = {
  title: "Palpites da Copa"
};

export default function GeneratorPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-field">Palpites da Copa</p>
        <h1 className="mt-2 text-4xl font-black text-ink">Quem leva essa pelada de Copa?</h1>
        <p className="mt-3 max-w-2xl font-semibold leading-relaxed text-ink/65">
          No MVP, o gramado e da Copa do Mundo 2026. Por baixo do capô, o app ja separa tudo por competicao para receber outros campeonatos depois.
        </p>
      </div>
      <PredictionGenerator />
      <div className="mt-8">
        <AdBanner label="Banner futuro entre palpites e conteudo editorial" />
      </div>
    </section>
  );
}
