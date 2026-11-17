import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Flame, Lock, Swords } from "lucide-react";
import { Bar } from "@/components/system/Bar";
import { Booting } from "@/components/system/Booting";
import { RadarChart } from "@/components/system/RadarChart";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { QUEST_IDS, RANK_TITLES, STAT_INFO, TOTAL_LEVELS, type StatKey } from "@/lib/game/data";
import {
  isComplete,
  levelInfo,
  pointsPerQuest,
  poseForLevel,
  questFor,
  rivalForLevel,
  stats,
  totalXpToFinish,
  xpNeeded,
} from "@/lib/game/engine";
import { resetGame, setWallOpen, useGame } from "@/lib/game/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Status Window — ARISE Fitness System" },
      { name: "description", content: "Your hunter status: level, rank, attributes, streak and next rival." },
      { property: "og:title", content: "Status Window — ARISE Fitness System" },
      { property: "og:description", content: "Your hunter status: level, rank, attributes, streak and next rival." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StatusPage,
});

const STAT_ORDER: StatKey[] = ["STR", "AGI", "END", "VIT", "PER", "FOC"];

function StatusPage() {
  const game = useGame();
  if (!game) return <Booting />;

  const done = isComplete(game);
  const info = levelInfo(game.levelIndex);
  const titles = RANK_TITLES[info.rank];
  const s = stats(game);
  const needed = xpNeeded(game.levelIndex);
  const total = totalXpToFinish();
  const rival = rivalForLevel(game.levelIndex);
  const pose = poseForLevel(game.levelIndex);
  const questsLeft = QUEST_IDS.length - game.completed.length;

  return (
    <div className="space-y-6">
      {game.wall && (
        <button
          onClick={() => setWallOpen(true)}
          className="system-panel flex w-full items-center gap-3 border-gold/60 p-4 text-left"
        >
          <Lock className="h-5 w-5 shrink-0 text-gold" />
          <span>
            <span className="font-display text-sm tracking-widest text-gold">LEVEL WALL ACTIVE</span>
            <span className="block text-sm text-muted-foreground">
              Certify the {pose?.name} to continue. Tap to open.
            </span>
          </span>
        </button>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Holographic data block */}
        <section className="system-panel overflow-hidden p-6">
          <div className="scanline" />
          <p className="system-label">[ Status ]</p>
          <div className="mt-4 flex items-end gap-5">
            <div className="text-center">
              <p className="font-display text-6xl font-black leading-none text-primary text-glow">
                {Math.min(game.levelIndex + 1, TOTAL_LEVELS)}
              </p>
              <p className="system-label mt-1">Level</p>
            </div>
            <div className="min-w-0 flex-1 space-y-1 pb-1 text-sm">
              <Row k="Name" v={game.name || "—"} />
              <Row k="Job" v={done ? "Shadow Monarch" : titles.job} />
              <Row k="Title" v={done ? "Monarch of Shadows" : titles.title} />
            </div>
            <div className="text-center">
              <p
                className={`font-display text-5xl font-black leading-none ${info.rank === "S" ? "text-gold text-glow-gold" : "text-accent text-glow"}`}
              >
                {info.rank}
              </p>
              <p className="system-label mt-1">Rank</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="system-label">Sub-level {done ? "MAX" : info.label}</span>
                <span className="font-display text-xs">
                  {done ? "COMPLETE" : `${game.xp} / ${needed} pts`}
                </span>
              </div>
              <Bar value={done ? 1 : game.xp} max={done ? 1 : needed} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="system-label">Journey to S-Rank</span>
                <span className="font-display text-xs">
                  {Math.round((game.totalXp / total) * 100)}%
                </span>
              </div>
              <Bar value={game.totalXp} max={total} gold />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Mini label="Streak" value={`Day ${game.streak}`} icon={<Flame className="h-4 w-4 text-gold" />} />
            <Mini label="Days cleared" value={String(game.daysCleared)} />
            <Mini label="Pts / quest" value={done ? "—" : `+${pointsPerQuest(game.levelIndex)}`} />
          </div>

          {!done && (
            <ul className="mt-6 space-y-2">
              <li className="system-label">Today's quests</li>
              {QUEST_IDS.map((id) => {
                const q = questFor(game.levelIndex, id);
                const ok = game.completed.includes(id);
                return (
                  <li key={id} className="flex items-center gap-3 border-b border-border/60 pb-1.5 text-sm">
                    <span className={`flex h-4 w-4 items-center justify-center border ${ok ? "border-success bg-success/20 text-success" : "border-border"}`}>
                      {ok && <Check className="h-3 w-3" />}
                    </span>
                    <span className={`flex-1 ${ok ? "text-muted-foreground line-through" : ""}`}>{q.name}</span>
                    <span className="font-display text-xs text-muted-foreground">
                      {q.target}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Hexagon radar */}
        <section className="system-panel flex flex-col items-center p-6">
          <p className="system-label self-start">[ Attributes ]</p>
          <RadarChart values={s} />
          <ul className="mt-2 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            {STAT_ORDER.map((k) => (
              <li key={k} className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-1">
                <span>
                  <span className="font-display text-xs tracking-widest text-accent">{k}</span>{" "}
                  <span className="text-xs text-muted-foreground">{STAT_INFO[k].perk}</span>
                </span>
                <span className="font-display text-sm">{s[k]}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="system-panel p-5">
          <p className="system-label">[ Daily Quest ]</p>
          <p className="mt-2 font-display text-2xl">
            {game.completed.length} <span className="text-muted-foreground">/ 4</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {done
              ? "All levels cleared."
              : game.wall
                ? "Frozen behind the Level Wall."
                : questsLeft === 0
                  ? "Cleared for today. Come back tomorrow."
                  : `${questsLeft} quest${questsLeft > 1 ? "s" : ""} left today.`}
          </p>
          <Button asChild variant="system" className="mt-4 w-full">
            <Link to="/quests">Open quests</Link>
          </Button>
        </section>
        <section className="system-panel p-5">
          <p className="system-label">[ Current Rival ]</p>
          <p className="mt-2 flex items-center gap-2 font-display text-lg">
            <Swords className="h-4 w-4 text-destructive" />
            {done ? "None remain" : rival.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{done ? "You stand alone at the top." : rival.epithet}</p>
          <Button asChild variant="system" className="mt-4 w-full">
            <Link to="/rivals">Rival board</Link>
          </Button>
        </section>
        <section className="system-panel p-5">
          <p className="system-label">[ Next Boss Pose ]</p>
          <p className="mt-2 font-display text-lg text-gold">
            {pose ? pose.name : done ? "All 21 mastered" : "Unlocks at D-1"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {pose ? pose.cue : done ? "Your gallery is complete." : "E-Rank levels clear without a wall."}
          </p>
          <Button asChild variant="gold" className="mt-4 w-full">
            <Link to="/gallery">Trophy gallery</Link>
          </Button>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Reset progress
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="system-panel bg-popover">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Reset all progress?</AlertDialogTitle>
              <AlertDialogDescription>
                Your level, stats, streak and poses on this device will return to E-1. This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={resetGame} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <p className="flex gap-2 truncate">
      <span className="system-label w-12 shrink-0 pt-0.5">{k}</span>
      <span className="truncate font-semibold">{v}</span>
    </p>
  );
}

function Mini({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="border border-border bg-muted/40 px-2 py-3">
      <p className="flex items-center justify-center gap-1 font-display text-base">
        {icon}
        {value}
      </p>
      <p className="system-label mt-1 text-[0.6rem]">{label}</p>
    </div>
  );
}
