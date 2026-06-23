import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center" aria-label="Boleiro Mestre">
      <img
        alt="Boleiro Mestre"
        className="h-14 w-auto rounded-md object-contain"
        height={336}
        src="/boleiro-mestre-logo.png"
        width={366}
      />
    </Link>
  );
}
