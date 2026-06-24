import type { Metadata } from "next";
import { SavedPredictions } from "@/components/SavedPredictions";

export const metadata: Metadata = {
  title: "Historico de Palpites da Copa"
};

export default function MyPredictionsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-widest text-trophy">Arquivo do boleiro</p>
        <h1 className="mt-2 text-4xl font-black text-white">Meu historico de palpites da Copa</h1>
        <p className="mt-3 font-semibold leading-relaxed text-slate-300">
          Seus palpites salvos da Copa aparecem aqui quando o Supabase estiver configurado e voce estiver logado.
        </p>
      </div>
      <SavedPredictions />
    </section>
  );
}
