import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contato"
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <article className="rounded-3xl bg-white p-6 shadow-pitch">
        <div className="grid size-12 place-items-center rounded-full bg-field text-white">
          <Mail className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-4xl font-black text-ink">Contato</h1>
        <p className="mt-4 max-w-2xl font-semibold leading-relaxed text-ink/70">
          Quer falar sobre parceria, bug ou aquela corneta construtiva? Envie uma mensagem para contato@boleiromestre.com.br.
        </p>
        <form className="mt-6 grid gap-4">
          <input className="rounded-2xl border border-field-dark/15 px-4 py-3 outline-none ring-field/30 focus:ring-4" placeholder="Seu nome" />
          <input className="rounded-2xl border border-field-dark/15 px-4 py-3 outline-none ring-field/30 focus:ring-4" placeholder="Seu e-mail" type="email" />
          <textarea className="min-h-36 rounded-2xl border border-field-dark/15 px-4 py-3 outline-none ring-field/30 focus:ring-4" placeholder="Mensagem" />
          <button className="rounded-full bg-field px-6 py-4 font-black text-white transition hover:bg-field-dark" type="button">
            Enviar mensagem
          </button>
        </form>
      </article>
    </section>
  );
}
