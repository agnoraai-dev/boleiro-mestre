type StatBarProps = {
  label: string;
  value: number;
};

export function StatBar({ label, value }: StatBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold text-ink">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-field-dark/10">
        <div className="h-full rounded-full bg-field" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
