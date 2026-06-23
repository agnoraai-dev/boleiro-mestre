import Link from "next/link";
import { Trophy } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-white">
      <span className="grid size-10 place-items-center rounded-full bg-trophy text-ink">
        <Trophy className="size-5" aria-hidden="true" />
      </span>
      <span className="text-xl">Boleiro Mestre</span>
    </Link>
  );
}
