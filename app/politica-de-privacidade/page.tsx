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
          <p>Coletamos email e identificador de usuario quando voce cria uma conta.</p>
          <p>Os palpites salvos ficam vinculados ao seu perfil e sao protegidos por controles de acesso da plataforma.</p>
          <p>Anuncios e parceiros de midia, quando ativados, devem respeitar consentimentos e regras de privacidade aplicaveis.</p>
        </div>
      </article>
    </section>
  );
}
