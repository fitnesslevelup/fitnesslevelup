import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Dumbbell, Gauge, Swords, Trophy } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { act, checkDay, setWallOpen, update, useGame, useWallOpen } from "@/lib/game/store";
import { certifyPose, levelInfo, poseForLevel } from "@/lib/game/engine";

const NAV = [
  { to: "/", label: "Status", icon: Gauge },
  { to: "/quests", label: "Quests", icon: Dumbbell },
  { to: "/rivals", label: "Rivals", icon: Swords },
  { to: "/gallery", label: "Poses", icon: Trophy },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const id = window.setInterval(checkDay, 30_000);
    const onVis = () => document.visibilityState === "visible" && checkDay();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-lg font-black tracking-[0.3em] text-primary text-glow">
            ARISE
          </Link>
          <nav className="hidden gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: true }}
                className="px-4 py-2 font-display text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary data-[status=active]:text-primary data-[status=active]:text-glow"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/90 backdrop-blur md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-1 py-3 font-display text-[10px] uppercase tracking-[0.15em] text-muted-foreground data-[status=active]:text-primary"
          >
            <n.icon className="h-5 w-5" />
            {n.label}
          </Link>
        ))}
      </nav>
      <AwakenDialog />
      <WallDialog />
      <Toaster position="top-center" theme="dark" />
    </div>
  );
}

function AwakenDialog() {
  const game = useGame();
  const [name, setName] = useState("");
  if (!game || game.name) return null;
  return (
    <Dialog open>
      <DialogContent className="system-panel border-primary/60 bg-popover [&>button]:hidden">
        <DialogHeader>
          <p className="system-label">[ Notification ]</p>
          <DialogTitle className="font-display text-xl text-primary text-glow">
            You have acquired the qualifications to be a Player.
          </DialogTitle>
          <DialogDescription>
            Your journey to S-Rank takes about 100 days. Enter your hunter name to accept.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) update({ name: name.trim().slice(0, 24) });
          }}
        >
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Hunter name"
            aria-label="Hunter name"
            className="h-11 font-display tracking-widest"
          />
          <Button type="submit" variant="system" size="lg" disabled={!name.trim()}>
            Accept
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function WallDialog() {
  const game = useGame();
  const open = useWallOpen();
  if (!game?.wall) return null;
  const pose = poseForLevel(game.levelIndex);
  if (!pose) return null;
  return (
    <Dialog open={open} onOpenChange={setWallOpen}>
      <DialogContent className="system-panel border-gold/60 bg-popover">
        <DialogHeader>
          <p className="system-label text-gold">[ Level Wall — {levelInfo(game.levelIndex).label} ]</p>
          <DialogTitle className="font-display text-2xl text-gold text-glow-gold">{pose.name}</DialogTitle>
          <DialogDescription className="text-base">
            You reached 100% XP. Have you mastered this Calisthenics Boss Pose?
          </DialogDescription>
        </DialogHeader>
        <div className="border border-border bg-muted/50 p-4 text-sm">
          <p className="system-label mb-1">Requirement</p>
          {pose.cue}
        </div>
        <p className="text-sm text-muted-foreground">
          Daily quests stay frozen until you certify. Missed days during a wall carry no penalty.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setWallOpen(false)}>
            Not yet — keep training
          </Button>
          <Button
            variant="gold"
            size="lg"
            onClick={() => {
              act(certifyPose);
              setWallOpen(false);
            }}
          >
            I can perform it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
