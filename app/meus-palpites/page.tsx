import type { Metadata } from "next";
import { SavedPredictions } from "@/components/SavedPredictions";

export const metadata: Metadata = {
  title: "Meu Bolão"
};

export default function MyPredictionsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-widest text-trophy">Arquivo do boleiro</p>
        <h1 className="mt-2 text-4xl font-black text-white">Meu bolão de palpites</h1>
        <p className="mt-3 font-semibold leading-relaxed text-slate-300">
          Acompanhe seus palpites por campeonato, jogo, placar previsto, favorito e confiança.
        </p>
      </div>
      <SavedPredictions />
    </section>
  );
}
