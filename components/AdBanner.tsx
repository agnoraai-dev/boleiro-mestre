type AdBannerProps = {
  label?: string;
};

export function AdBanner({ label = "Espaço para parceiros" }: AdBannerProps) {
  return (
    <aside className="flex min-h-24 items-center justify-center rounded-2xl border border-dashed border-field/40 bg-white/80 px-4 py-6 text-center text-sm font-semibold text-field-dark shadow-sm">
      {label}
    </aside>
  );
}
