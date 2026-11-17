import { createFileRoute } from "@tanstack/react-router";
import { Lock, Trophy } from "lucide-react";
import { Booting, PageTitle } from "@/components/system/Booting";
import { FIRST_WALL_LEVEL, POSES } from "@/lib/game/data";
import { levelInfo } from "@/lib/game/engine";
import { useGame } from "@/lib/game/store";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Boss Pose Gallery — ARISE Fitness System" },
      { name: "description", content: "Unlock all 21 elite calisthenics holds and movements, from Crow Pose to Full Planche." },
      { property: "og:title", content: "Boss Pose Gallery — ARISE Fitness System" },
      { property: "og:description", content: "Unlock all 21 elite calisthenics holds and movements, from Crow Pose to Full Planche." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const game = useGame();
  if (!game) return <Booting />;
  return (
    <div>
      <PageTitle kicker={`Trophy Gallery · ${game.poses.length} / ${POSES.length}`} title="Calisthenics Boss Poses" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {POSES.map((p, i) => {
          const unlocked = game.poses.includes(i);
          const level = levelInfo(i + FIRST_WALL_LEVEL).label;
          const isNext = game.levelIndex === i + FIRST_WALL_LEVEL;
          return (
            <div
              key={p.name}
              className={`system-panel flex flex-col p-4 ${unlocked ? "border-gold/60" : ""} ${!unlocked && !isNext ? "opacity-55" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xs text-muted-foreground">{level}</span>
                {unlocked ? <Trophy className="h-4 w-4 text-gold" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <p className={`mt-3 font-display text-sm font-bold leading-snug ${unlocked ? "text-gold text-glow-gold" : ""}`}>
                {unlocked || isNext ? p.name : "???"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {unlocked ? p.cue : isNext ? `Next wall · ${p.cue}` : `Unlocks at ${level}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
