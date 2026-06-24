type AdBannerProps = {
  label?: string;
};

export function AdBanner({ label = "Espaco para parceiros" }: AdBannerProps) {
  return (
    <aside className="relative flex min-h-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-emerald-700/45 bg-emerald-950/25 px-4 py-6 text-center text-sm font-bold text-emerald-300 shadow-sm">
      <span className="absolute right-3 top-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">Publicidade</span>
      <span>{label}</span>
    </aside>
  );
}
