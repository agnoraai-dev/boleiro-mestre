import type { Metadata } from "next";
import { SavedPredictions } from "@/components/SavedPredictions";

export const metadata: Metadata = {
  title: "Meu Bolao"
};

export default function MyPredictionsPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-field">Arquivo do boleiro</p>
        <h1 className="mt-2 text-4xl font-black text-ink">Meu bolao de palpites</h1>
        <p className="mt-3 font-semibold leading-relaxed text-ink/65">
          Acompanhe seus palpites por campeonato, jogo, placar previsto, favorito e confianca.
        </p>
      </div>
      <SavedPredictions />
    </section>
  );
}
