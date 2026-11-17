import type { StatKey } from "@/lib/game/data";

const ORDER: StatKey[] = ["STR", "AGI", "END", "VIT", "PER", "FOC"];

export function RadarChart({ values }: { values: Record<StatKey, number> }) {
  const size = 300;
  const c = size / 2;
  const r = 105;
  const maxStat = Math.max(...ORDER.map((k) => values[k]));
  const max = Math.max(50, Math.ceil(maxStat / 25) * 25);
  const point = (i: number, f: number) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [c + Math.cos(a) * r * f, c + Math.sin(a) * r * f] as const;
  };
  const ring = (f: number) => ORDER.map((_, i) => point(i, f).join(",")).join(" ");
  const shape = ORDER.map((k, i) => point(i, Math.max(0.04, values[k] / max)).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[340px]" role="img" aria-label="Attribute radar chart">
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.25" />
        </radialGradient>
        <filter id="radar-glow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="var(--border)" strokeWidth={1} />
      ))}
      {ORDER.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--border)" strokeWidth={1} />;
      })}
      <polygon
        points={shape}
        fill="url(#radar-fill)"
        stroke="var(--accent)"
        strokeWidth={2}
        filter="url(#radar-glow)"
        style={{ transition: "all 0.6s ease" }}
      />
      {ORDER.map((k, i) => {
        const [x, y] = point(i, Math.max(0.04, values[k] / max));
        return <circle key={k} cx={x} cy={y} r={3.5} fill="var(--accent)" />;
      })}
      {ORDER.map((k, i) => {
        const [x, y] = point(i, 1.22);
        return (
          <g key={k}>
            <text x={x} y={y - 4} textAnchor="middle" fill="var(--muted-foreground)" fontSize="11" fontFamily="var(--font-display)" letterSpacing="2">
              {k}
            </text>
            <text x={x} y={y + 12} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="700" fontFamily="var(--font-display)">
              {values[k]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
