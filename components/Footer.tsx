import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-field-dark/10 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-ink/70 md:grid-cols-[1fr_auto]">
        <p>
          Boleiro Mestre gera palpites recreativos. Futebol tem surpresa, zebra e bola na trave. Use como entretenimento.
        </p>
        <div className="flex flex-wrap gap-4 font-semibold text-field-dark">
          <Link href="/termos-de-uso">Termos</Link>
          <Link href="/politica-de-privacidade">Privacidade</Link>
          <Link href="/contato">Contato</Link>
        </div>
      </div>
    </footer>
  );
}
