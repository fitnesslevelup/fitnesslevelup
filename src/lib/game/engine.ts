import {
  FIRST_WALL_LEVEL,
  EXERCISES_BY_LEVEL,
  POINTS_BY_RANK,
  POSES,
  QUEST_IDS,
  QUEST_STAT,
  RANKS,
  REP_START,
  REP_STEP,
  RIVALS,
  TOTAL_LEVELS,
  type PhysicalStat,
  type QuestId,
  type Rank,
  type StatKey,
} from "./data";

export const QUESTS_PER_DAY = 4;
export const DAYS_PER_LEVEL = 4;
export const PER_PENALTY = 3;
export const FOCUS_BONUS = 5;
/** Quest points needed for +1 in a physical stat (keeps stats in balance with PER and Focus). */
export const STAT_POINTS_PER_LEVEL = 180;

export interface GameState {
  version: 1;
  name: string;
  levelIndex: number; // 0..25, 26 = all levels cleared
  xp: number;
  totalXp: number;
  statPoints: Record<PhysicalStat, number>;
  perPoints: number;
  poses: number[]; // pose indices unlocked
  streak: number; // current streak day, starts at 1
  bestStreak: number;
  daysCleared: number;
  currentDate: string;
  progress: Record<QuestId, number>;
  completed: QuestId[];
  dayCleared: boolean;
  wall: boolean;
}

export type GameEvent =
  | { type: "quest"; quest: QuestId; points: number }
  | { type: "dayCleared" }
  | { type: "levelUp"; levelIndex: number }
  | { type: "wall"; pose: string }
  | { type: "pose"; pose: string }
  | { type: "penalty" }
  | { type: "streak"; streak: number }
  | { type: "complete" };

export interface Result {
  state: GameState;
  events: GameEvent[];
}

export const emptyProgress = (): Record<QuestId, number> => ({ push: 0, core: 0, legs: 0, cross: 0 });

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const [ay = 0, am = 1, ad = 1] = a.split("-").map(Number);
  const [by = 0, bm = 1, bd = 1] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

export function createState(date: string, name = ""): GameState {
  return {
    version: 1,
    name,
    levelIndex: 0,
    xp: 0,
    totalXp: 0,
    statPoints: { STR: 0, VIT: 0, AGI: 0, END: 0 },
    perPoints: 0,
    poses: [],
    streak: 1,
    bestStreak: 1,
    daysCleared: 0,
    currentDate: date,
    progress: emptyProgress(),
    completed: [],
    dayCleared: false,
    wall: false,
  };
}

// ---------- level math ----------

export function isComplete(s: GameState) {
  return s.levelIndex >= TOTAL_LEVELS;
}

export function levelInfo(i: number): { rank: Rank; sub: number; label: string } {
  const idx = Math.min(i, TOTAL_LEVELS - 1);
  if (idx >= 25) return { rank: "S", sub: 1, label: "S" };
  const rank = RANKS[Math.floor(idx / 5)] ?? "E";
  const sub = (idx % 5) + 1;
  return { rank, sub, label: `${rank}-${sub}` };
}

/** Points per quest: equal for all 4 quests, set by rank (E 25 … S 1000). */
export function pointsPerQuest(levelIndex: number) {
  return POINTS_BY_RANK[levelInfo(levelIndex).rank];
}

/** XP to clear a sub-level = 4 full days × 4 quests. */
export function xpNeeded(levelIndex: number) {
  return pointsPerQuest(levelIndex) * QUESTS_PER_DAY * DAYS_PER_LEVEL;
}

export function totalXpToFinish() {
  let t = 0;
  for (let i = 0; i < TOTAL_LEVELS; i++) t += xpNeeded(i);
  return t;
}

export function poseForLevel(levelIndex: number) {
  if (levelIndex < FIRST_WALL_LEVEL || levelIndex >= TOTAL_LEVELS) return null;
  const index = levelIndex - FIRST_WALL_LEVEL;
  const pose = POSES[index];
  return pose ? { index, ...pose } : null;
}

export function rivalForLevel(levelIndex: number) {
  return RIVALS[Math.min(levelIndex, TOTAL_LEVELS - 1)] ?? RIVALS[0]!;
}

/** Exercise name for a quest at a level, straight from the level table. */
export function exerciseName(levelIndex: number, id: QuestId) {
  const list = EXERCISES_BY_LEVEL[id];
  const idx = Math.max(0, Math.min(levelIndex, list.length - 1));
  return list[idx] ?? list[0]!;
}

/** Reps per quest: 10 at E-1, +2 every level, 60 at S. */
export function repsFor(levelIndex: number) {
  return REP_START + REP_STEP * Math.max(0, Math.min(levelIndex, TOTAL_LEVELS - 1));
}

export function questFor(levelIndex: number, id: QuestId) {
  return { id, name: exerciseName(levelIndex, id), target: repsFor(levelIndex), stat: QUEST_STAT[id] };
}

export function stats(s: GameState): Record<StatKey, number> {
  const phys = (p: number) => 10 + Math.floor(p / STAT_POINTS_PER_LEVEL);
  return {
    STR: phys(s.statPoints.STR),
    VIT: phys(s.statPoints.VIT),
    AGI: phys(s.statPoints.AGI),
    END: phys(s.statPoints.END),
    PER: 10 + s.perPoints,
    FOC: 10 + FOCUS_BONUS * s.poses.length,
  };
}

// ---------- actions ----------

/** Advance to a new calendar day, applying streak growth or the missed-day penalty. */
export function rollover(s: GameState, date: string): Result {
  const gap = daysBetween(s.currentDate, date);
  if (gap <= 0) return { state: s, events: [] };
  const events: GameEvent[] = [];
  let { streak, perPoints } = s;

  if (s.dayCleared && gap === 1) {
    streak += 1;
    events.push({ type: "streak", streak });
  } else if (s.wall || isComplete(s)) {
    // Frozen behind a Level Wall (or finished): no penalty.
  } else {
    streak = 1;
    perPoints = Math.max(0, perPoints - PER_PENALTY);
    events.push({ type: "penalty" });
  }

  return {
    state: {
      ...s,
      streak,
      bestStreak: Math.max(s.bestStreak, streak),
      perPoints,
      currentDate: date,
      progress: emptyProgress(),
      completed: [],
      dayCleared: false,
    },
    events,
  };
}

/** A save frozen at a level that no longer has a Boss Pose is unfrozen; its next quest finishes the level. */
export function repairWall(s: GameState): GameState {
  return s.wall && !poseForLevel(s.levelIndex) ? { ...s, wall: false } : s;
}

export function canLog(s: GameState) {
  return !s.wall && !isComplete(s);
}

export function logQuest(s: GameState, id: QuestId, amount: number): Result {
  if (!canLog(s) || s.completed.includes(id)) return { state: s, events: [] };
  const q = questFor(s.levelIndex, id);
  const value = Math.min(q.target, (s.progress[id] ?? 0) + amount);
  let next: GameState = { ...s, progress: { ...s.progress, [id]: value } };
  const events: GameEvent[] = [];
  if (value < q.target) return { state: next, events };

  const points = pointsPerQuest(s.levelIndex);
  next = {
    ...next,
    xp: next.xp + points,
    totalXp: next.totalXp + points,
    statPoints: { ...next.statPoints, [q.stat]: next.statPoints[q.stat] + points },
    completed: [...next.completed, id],
  };
  events.push({ type: "quest", quest: id, points });

  if (QUEST_IDS.every((qid) => next.completed.includes(qid))) {
    next = {
      ...next,
      dayCleared: true,
      perPoints: next.perPoints + 1,
      daysCleared: next.daysCleared + 1,
    };
    events.push({ type: "dayCleared" });
  }

  if (next.xp >= xpNeeded(next.levelIndex)) {
    const pose = poseForLevel(next.levelIndex);
    if (pose) {
      next = { ...next, xp: xpNeeded(next.levelIndex), wall: true };
      events.push({ type: "wall", pose: pose.name });
    } else {
      next = { ...next, xp: 0, levelIndex: next.levelIndex + 1 };
      events.push({ type: "levelUp", levelIndex: next.levelIndex });
    }
  }
  return { state: next, events };
}

/** Player certifies they can perform the Boss Pose: unlock it and advance. */
export function certifyPose(s: GameState): Result {
  const pose = poseForLevel(s.levelIndex);
  if (!s.wall || !pose) return { state: s, events: [] };
  const levelIndex = s.levelIndex + 1;
  const events: GameEvent[] = [{ type: "pose", pose: pose.name }];
  events.push(levelIndex >= TOTAL_LEVELS ? { type: "complete" } : { type: "levelUp", levelIndex });
  return {
    state: {
      ...s,
      wall: false,
      xp: 0,
      levelIndex,
      poses: s.poses.includes(pose.index) ? s.poses : [...s.poses, pose.index],
    },
    events,
  };
}
