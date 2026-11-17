export function Bar({ value, max, gold = false }: { value: number; max: number; gold?: boolean }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="bar-track" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className={gold ? "bar-fill-gold" : "bar-fill"} style={{ width: `${pct}%` }} />
    </div>
  );
}
