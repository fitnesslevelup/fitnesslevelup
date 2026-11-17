export function Booting() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="system-label animate-pulse">[ System loading… ]</p>
    </div>
  );
}

export function PageTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="system-label">[ {kicker} ]</p>
      <h1 className="mt-1 text-2xl font-black text-primary text-glow md:text-3xl">{title}</h1>
    </div>
  );
}
