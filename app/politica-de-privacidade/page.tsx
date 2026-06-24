import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade"
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <article className="rounded-3xl bg-white p-6 shadow-pitch">
        <h1 className="text-4xl font-black text-ink">Política de Privacidade</h1>
        <div className="mt-6 grid gap-4 font-semibold leading-relaxed text-ink/70">
          <p>Coletamos e-mail e identificador de usuário quando você cria uma conta.</p>
          <p>Os palpites salvos ficam vinculados ao seu perfil e são protegidos por controles de acesso da plataforma.</p>
          <p>Anúncios e parceiros de mídia, quando ativados, devem respeitar consentimentos e regras de privacidade aplicáveis.</p>
        </div>
      </article>
    </section>
  );
}
