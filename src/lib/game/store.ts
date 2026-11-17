import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { RIVALS } from "./data";
import {
  createState,
  levelInfo,
  rollover,
  todayKey,
  type GameEvent,
  type GameState,
  type Result,
} from "./engine";

const KEY = "arise-system-v1";
const BACKUP_KEY = "arise-system-v1-unreadable-backup";
let state: GameState | null = null;
let wallOpen = false;
let warnedSaveFail = false;
const listeners = new Set<() => void>();

/** Fill in any fields missing from an older or partial save instead of starting over. */
function normalize(raw: unknown): GameState | null {
  if (!raw || typeof raw !== "object") return null;
  const base = createState(todayKey());
  const r = raw as Partial<GameState>;
  return {
    ...base,
    ...r,
    statPoints: { ...base.statPoints, ...(r.statPoints ?? {}) },
    progress: { ...base.progress, ...(r.progress ?? {}) },
    poses: Array.isArray(r.poses) ? r.poses : [],
    completed: Array.isArray(r.completed) ? r.completed : [],
  };
}

function readSaved(): GameState | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return normalize(JSON.parse(raw));
  } catch {
    // Never silently wipe an unreadable save: keep a copy before starting fresh.
    localStorage.setItem(BACKUP_KEY, raw);
    return null;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    if (!warnedSaveFail) {
      warnedSaveFail = true;
      toast.error("[SYSTEM] Progress could not be saved", {
        description: "Your browser is blocking storage (private window or full storage). Use a normal window to keep progress.",
        duration: 10000,
      });
    }
  }
}

// Another open tab saved newer progress: adopt it so this tab never overwrites it with old data.
let listening = false;
function listenForOtherTabs() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try {
      const next = normalize(JSON.parse(e.newValue));
      if (next) {
        state = next;
        emit();
      }
    } catch {
      /* ignore */
    }
  });
}

function ensureLoaded(): GameState {
  if (state) return state;
  listenForOtherTabs();
  let loaded: GameState | null = null;
  try {
    loaded = readSaved();
  } catch {
    loaded = null;
  }
  state = loaded ?? createState(todayKey());
  const r = rollover(state, todayKey());
  state = r.state;
  persist();
  if (r.events.length) setTimeout(() => announce(r.events), 400);
  return state;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Returns null during SSR / before hydration. */
export function useGame(): GameState | null {
  return useSyncExternalStore(subscribe, ensureLoaded, () => null);
}

export function useWallOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => wallOpen,
    () => false,
  );
}

export function setWallOpen(open: boolean) {
  wallOpen = open;
  emit();
}

function latest(): GameState {
  // Re-read the saved copy before every change so a stale tab can't roll progress back.
  try {
    const saved = readSaved();
    if (saved) state = saved;
  } catch {
    /* storage blocked: keep in-memory state */
  }
  return ensureLoaded();
}

export function act(fn: (s: GameState) => Result) {
  const r = fn(latest());
  state = r.state;
  persist();
  emit();
  announce(r.events);
}

export function update(patch: Partial<GameState>) {
  state = { ...latest(), ...patch };
  persist();
  emit();
}

export function resetGame() {
  const name = ensureLoaded().name;
  state = createState(todayKey(), name);
  persist();
  emit();
  toast("[SYSTEM] Progress has been reset.");
}

export function checkDay() {
  act((s) => rollover(s, todayKey()));
}

function announce(events: GameEvent[]) {
  for (const e of events) {
    switch (e.type) {
      case "quest":
        toast.success(`Quest cleared  +${e.points} pts`);
        break;
      case "dayCleared":
        toast.success("[DAILY QUEST COMPLETE] Perception +1", {
          description: "All 4 quests cleared. Your streak will grow at midnight.",
        });
        break;
      case "levelUp":
        toast.success(`LEVEL UP — ${levelInfo(e.levelIndex).label}`, {
          description: `${RIVALS[e.levelIndex - 1]?.name ?? "Rival"} defeated.`,
        });
        break;
      case "wall":
        toast.warning(`[LEVEL WALL] Boss Pose: ${e.pose}`, {
          description: "Daily quests are frozen until you certify the pose.",
        });
        wallOpen = true;
        emit();
        break;
      case "pose":
        toast.success(`[NEURAL FOCUS] ${e.pose} unlocked`, { description: "Focus +5" });
        break;
      case "penalty":
        toast.error("[PENALTY] Daily quest missed", {
          description: "Streak reset to Day 1. Perception −3.",
        });
        break;
      case "streak":
        toast(`Streak — Day ${e.streak}`);
        break;
      case "complete":
        toast.success("[SYSTEM] You have become the Shadow Monarch.");
        break;
    }
  }
}
