import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";

export default function HomePage() {
  return (
    <>
      <section className="bg-emerald-950/70 text-white">
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl content-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-700/60 bg-emerald-900/60 px-4 py-2 text-sm font-black text-trophy shadow-lg shadow-emerald-950/30">
              <Trophy className="size-4" aria-hidden="true" />
              Copa 2026, resenha e palpite em um so lugar
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-none tracking-normal sm:text-6xl lg:text-7xl">
              Boleiro Mestre
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-relaxed text-white/82">
              Veja Jogos da Copa, escolha o confronto, receba probabilidades simplificadas, placar provavel e um comentario no clima de mesa redonda brasileira.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-trophy to-yellow-400 px-6 py-4 font-black uppercase tracking-wide text-emerald-950 shadow-lg shadow-yellow-400/15 transition hover:from-yellow-300 hover:to-trophy" href="/gerador">
                Gerar palpite da Copa
                <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
              <Link className="inline-flex items-center rounded-full border border-white/20 px-6 py-4 font-black text-white transition hover:bg-white/10" href="/meus-palpites">
                Meu historico da Copa
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-emerald-700/50 bg-emerald-950/55 p-5 shadow-pitch">
            <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-emerald-500 via-trophy to-emerald-500" />
            <div className="rounded-3xl bg-slate-950/70 p-6">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-3xl border border-emerald-800/60 bg-emerald-950/50 p-5 text-white">
                <div className="rounded-2xl bg-slate-950/80 p-4 text-center">
                  <p className="text-sm font-black text-emerald-300">Brasil</p>
                  <p className="text-6xl font-black text-trophy">2</p>
                </div>
                <span className="text-2xl font-black italic text-trophy">VS</span>
                <div className="rounded-2xl bg-slate-950/80 p-4 text-center">
                  <p className="text-sm font-black text-emerald-300">Argentina</p>
                  <p className="text-6xl font-black text-trophy">1</p>
                </div>
              </div>
              <div className="mt-5 rounded-3xl border border-emerald-800/60 bg-slate-950/80 p-5 text-white">
                <p className="font-black text-trophy">Comentario da cabine</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-white/85">
                  Jogo pegado, camisa pesada e chance de gol ate no grito da torcida. Aqui o palpite sai com fundamento e uma pitada de resenha.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <AdBanner />
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
        {[
          { icon: Sparkles, title: "IA na resenha", text: "Rota server-side pronta para gerar comentarios com modelo de IA." },
          { icon: ShieldCheck, title: "Login com Supabase", text: "Auth e Postgres preparados para salvar palpites por usuario e competicao." },
          { icon: Trophy, title: "Feito para Vercel", text: "App Router, env vars e estrutura pronta para deploy." }
        ].map((item) => (
          <article className="rounded-3xl border border-emerald-800/45 bg-slate-950/75 p-6 shadow-pitch" key={item.title}>
            <item.icon className="size-8 text-trophy" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black text-white">{item.title}</h2>
            <p className="mt-2 font-semibold leading-relaxed text-slate-300">{item.text}</p>
          </article>
        ))}
      </section>
    </>
  );
}
