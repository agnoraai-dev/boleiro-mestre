import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/Logo";

const navItems = [
  { href: "/gerador", label: "Gerador de palpites" },
  { href: "/meus-palpites", label: "Meu bolao" },
  { href: "/login", label: "Entrar" },
  { href: "/contato", label: "Contato" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-field-dark/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              className="rounded-full px-4 py-2 text-sm font-bold text-white/85 transition hover:bg-white/10 hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          className="grid size-10 place-items-center rounded-full bg-white/10 text-white md:hidden"
          href="/gerador"
          aria-label="Abrir gerador"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
