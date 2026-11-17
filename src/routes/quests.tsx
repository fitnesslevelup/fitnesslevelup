import { createFileRoute } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { Bar } from "@/components/system/Bar";
import { Booting, PageTitle } from "@/components/system/Booting";
import { Button } from "@/components/ui/button";
import { QUEST_IDS, type QuestId } from "@/lib/game/data";
import { canLog, isComplete, levelInfo, logQuest, pointsPerQuest, poseForLevel, questFor } from "@/lib/game/engine";
import { act, setWallOpen, useGame } from "@/lib/game/store";

export const Route = createFileRoute("/quests")({
  head: () => ({
    meta: [
      { title: "Daily Quest — ARISE Fitness System" },
      { name: "description", content: "Complete your 4 daily calisthenics quests to earn points and level up." },
      { property: "og:title", content: "Daily Quest — ARISE Fitness System" },
      { property: "og:description", content: "Complete your 4 daily calisthenics quests to earn points and level up." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuestsPage,
});

function QuestsPage() {
  const game = useGame();
  if (!game) return <Booting />;
  const info = levelInfo(game.levelIndex);
  const active = canLog(game);
  const pose = poseForLevel(game.levelIndex);

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle kicker={`Daily Quest · ${isComplete(game) ? "MAX" : info.label}`} title="Preparations to Become Powerful" />

      {game.wall && (
        <div className="system-panel mb-6 flex flex-col gap-3 border-gold/60 p-4 sm:flex-row sm:items-center">
          <Lock className="h-5 w-5 shrink-0 text-gold" />
          <p className="flex-1 text-sm">
            <span className="font-display tracking-widest text-gold">QUESTS FROZEN.</span> Certify the{" "}
            <b>{pose?.name}</b> to unlock the next sub-level.
          </p>
          <Button variant="gold" onClick={() => setWallOpen(true)}>
            Certify pose
          </Button>
        </div>
      )}

      {isComplete(game) ? (
        <div className="system-panel p-8 text-center">
          <p className="font-display text-2xl text-gold text-glow-gold">ALL LEVELS CLEARED</p>
          <p className="mt-2 text-muted-foreground">You have reached the summit. The System has nothing left to ask.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {QUEST_IDS.map((id) => (
            <QuestCard key={id} id={id} />
          ))}
        </div>
      )}

      <div className="mt-6 space-y-1 text-center text-sm text-muted-foreground">
        <p>
          Each quest grants <b className="text-foreground">+{pointsPerQuest(game.levelIndex)} pts</b>. Clear all 4 for
          Perception +1.
        </p>
        {active && (
          <p className="text-destructive">
            WARNING: Failing to complete the daily quest resets your streak to Day 1 and lowers Perception.
          </p>
        )}
      </div>
    </div>
  );
}

function QuestCard({ id }: { id: QuestId }) {
  const game = useGame()!;
  const q = questFor(game.levelIndex, id);
  const value = game.progress[id];
  const done = game.completed.includes(id);
  const locked = !canLog(game);
  const steps = [5, 10];
  const fmt = (n: number) => `${n}`;

  return (
    <div className={`system-panel p-5 transition-opacity ${done ? "border-success/60" : ""} ${locked && !done ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="system-label">{q.stat} quest</p>
          <h2 className="mt-1 text-lg font-bold">{q.name}</h2>
        </div>
        <p className="font-display text-xl">
          <span className={done ? "text-success" : "text-primary text-glow"}>{fmt(value)}</span>
          <span className="text-sm text-muted-foreground"> / {fmt(q.target)}</span>
        </p>
      </div>
      <div className="mt-3">
        <Bar value={value} max={q.target} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {done ? (
          <p className="flex items-center gap-2 font-display text-xs tracking-widest text-success">
            <Check className="h-4 w-4" /> COMPLETE
          </p>
        ) : (
          <>
            {steps.map((s) => (
              <Button key={s} variant="system" size="sm" disabled={locked} onClick={() => act((st) => logQuest(st, id, s))}>
                +{s}
              </Button>
            ))}
            <Button variant="system" size="sm" disabled={locked} onClick={() => act((st) => logQuest(st, id, q.target))}>
              Mark done
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
