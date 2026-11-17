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
let state: GameState | null = null;
let wallOpen = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked */
  }
}

function ensureLoaded(): GameState {
  if (state) return state;
  let loaded: GameState | null = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) loaded = JSON.parse(raw) as GameState;
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

export function act(fn: (s: GameState) => Result) {
  const r = fn(ensureLoaded());
  state = r.state;
  persist();
  emit();
  announce(r.events);
}

export function update(patch: Partial<GameState>) {
  state = { ...ensureLoaded(), ...patch };
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
