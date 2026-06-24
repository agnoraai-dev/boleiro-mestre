import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-emerald-900/80 bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-slate-400 md:grid-cols-[1fr_auto]">
        <p>
          Boleiro Mestre gera palpites recreativos. Futebol tem surpresa, zebra e bola na trave. Use como entretenimento.
        </p>
        <div className="flex flex-wrap gap-4 font-semibold text-emerald-300">
          <Link href="/termos-de-uso">Termos</Link>
          <Link href="/politica-de-privacidade">Privacidade</Link>
          <Link href="/contato">Contato</Link>
        </div>
      </div>
    </footer>
  );
}
