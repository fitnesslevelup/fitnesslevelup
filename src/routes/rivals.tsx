import { createFileRoute } from "@tanstack/react-router";
import { Booting, PageTitle } from "@/components/system/Booting";
import { RANKS, RIVALS, type Rank } from "@/lib/game/data";
import { levelInfo } from "@/lib/game/engine";
import { useGame } from "@/lib/game/store";

export const Route = createFileRoute("/rivals")({
  head: () => ({
    meta: [
      { title: "Rival Board — ARISE Fitness System" },
      { name: "description", content: "Climb the 26-rival tier ladder from E-Rank to the Statue of God." },
      { property: "og:title", content: "Rival Board — ARISE Fitness System" },
      { property: "og:description", content: "Climb the 26-rival tier ladder from E-Rank to the Statue of God." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RivalsPage,
});

function RivalsPage() {
  const game = useGame();
  if (!game) return <Booting />;
  const tiers = [...RANKS].reverse() as Rank[];

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle kicker="1v1 Tier Ladder" title="Rival Board" />
      <div className="space-y-5">
        {tiers.map((rank) => {
          const rows = RIVALS.map((r, i) => ({ ...r, i })).filter((r) => levelInfo(r.i).rank === rank);
          return (
            <section key={rank} className="system-panel p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className={`font-display text-3xl font-black ${rank === "S" ? "text-gold text-glow-gold" : "text-accent text-glow"}`}>
                  {rank}
                </span>
                <span className="system-label">Rank tier</span>
              </div>
              <ul className="divide-y divide-border/60">
                {rows.map((r) => {
                  const defeated = game.levelIndex > r.i;
                  const current = game.levelIndex === r.i;
                  return (
                    <li
                      key={r.name}
                      className={`flex items-center gap-3 py-2.5 ${defeated ? "opacity-40" : ""} ${current ? "-mx-2 bg-primary/10 px-2" : ""}`}
                    >
                      <span className="w-10 font-display text-xs text-muted-foreground">{levelInfo(r.i).label}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate font-semibold ${defeated ? "line-through" : ""}`}>{r.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{r.epithet}</span>
                      </span>
                      {current && <span className="you-badge rounded-sm px-2 py-1 text-[0.65rem] font-bold tracking-widest">YOU</span>}
                      {defeated && <span className="system-label text-success">Defeated</span>}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
