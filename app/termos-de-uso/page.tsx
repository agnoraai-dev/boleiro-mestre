import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Termos de Uso"
};

export default function TermsPage() {
  return (
    <LegalPage title="Termos de Uso">
      <p>O Boleiro Mestre oferece palpites recreativos sobre jogos de futebol. As probabilidades e placares sao estimativas simplificadas e nao garantem resultados.</p>
      <p>O usuario concorda em usar o site apenas para entretenimento, sem tratar os palpites como recomendacao financeira, aposta ou orientacao profissional.</p>
      <p>Podemos ajustar funcionalidades, modelos de calculo e conteudo do site para melhorar a experiencia.</p>
    </LegalPage>
  );
}

function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <article className="rounded-3xl bg-white p-6 shadow-pitch">
        <h1 className="text-4xl font-black text-ink">{title}</h1>
        <div className="mt-6 grid gap-4 font-semibold leading-relaxed text-ink/70">{children}</div>
      </article>
    </section>
  );
}
