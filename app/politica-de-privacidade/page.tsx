import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Privacidade"
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <article className="rounded-3xl bg-white p-6 shadow-pitch">
        <h1 className="text-4xl font-black text-ink">Politica de Privacidade</h1>
        <div className="mt-6 grid gap-4 font-semibold leading-relaxed text-ink/70">
          <p>Coletamos email e identificador de usuario quando voce cria uma conta via Supabase Auth.</p>
          <p>Os palpites salvos ficam vinculados ao seu usuario e protegidos por politicas de seguranca em nivel de linha no Supabase.</p>
          <p>O componente de anuncios esta apenas preparado para AdSense. Anuncios reais devem ser ativados somente apos configurar o cliente e revisar consentimentos aplicaveis.</p>
        </div>
      </article>
    </section>
  );
}
