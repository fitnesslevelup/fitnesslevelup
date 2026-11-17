import { describe, expect, it } from "vitest";
import { POSES, RIVALS, TOTAL_LEVELS } from "./data";
import {
  certifyPose,
  createState,
  levelInfo,
  logQuest,
  pointsPerQuest,
  rollover,
  xpNeeded,
  type GameState,
} from "./engine";

function clearDay(s: GameState) {
  for (const q of ["push", "core", "legs", "run"] as const) s = logQuest(s, q, 9999).state;
  return s;
}

describe("game rules", () => {
  it("has 26 levels across E-A (5 each) plus S, with 26 rivals and 21 poses", () => {
    expect(TOTAL_LEVELS).toBe(26);
    expect(RIVALS).toHaveLength(26);
    expect(POSES).toHaveLength(21);
    expect(levelInfo(0).label).toBe("E-1");
    expect(levelInfo(24).label).toBe("A-5");
    expect(levelInfo(25).label).toBe("S");
  });

  it("gives equal points for each quest, rising per sub-level", () => {
    const s = createState("2026-01-01");
    const a = logQuest(s, "push", 9999).events[0];
    const b = logQuest(s, "run", 9999).events[0];
    expect(a).toEqual({ type: "quest", quest: "push", points: 10 });
    expect(b).toEqual({ type: "quest", quest: "run", points: 10 });
    expect(pointsPerQuest(1)).toBeGreaterThan(pointsPerQuest(0));
  });

  it("clears a sub-level after 4 full days of all 4 quests", () => {
    let s = createState("2026-01-01");
    for (let d = 0; d < 3; d++) {
      s = clearDay(s);
      s = rollover(s, `2026-01-0${d + 2}`).state;
    }
    expect(s.levelIndex).toBe(0);
    s = clearDay(s);
    expect(s.levelIndex).toBe(1);
    expect(xpNeeded(0)).toBe(160);
  });

  it("grows streak and PER after a cleared day", () => {
    let s = clearDay(createState("2026-01-01"));
    expect(s.perPoints).toBe(1);
    s = rollover(s, "2026-01-02").state;
    expect(s.streak).toBe(2);
  });

  it("missing a day resets streak to 1 and drops PER", () => {
    let s = createState("2026-01-01");
    s = { ...s, streak: 7, perPoints: 10 };
    s = rollover(s, "2026-01-02").state;
    expect(s.streak).toBe(1);
    expect(s.perPoints).toBe(7);
  });

  it("freezes quests at 100% XP on a pose level until the pose is certified", () => {
    let s: GameState = { ...createState("2026-01-01"), levelIndex: 5, xp: xpNeeded(5) - pointsPerQuest(5) };
    s = logQuest(s, "push", 9999).state;
    expect(s.wall).toBe(true);
    expect(logQuest(s, "core", 9999).state.completed).toEqual(["push"]);
    const r = certifyPose(s);
    expect(r.state.levelIndex).toBe(6);
    expect(r.state.poses).toEqual([0]);
    expect(r.state.wall).toBe(false);
  });

  it("does not penalise days spent behind a level wall", () => {
    let s: GameState = { ...createState("2026-01-01"), wall: true, streak: 5, perPoints: 5 };
    s = rollover(s, "2026-01-03").state;
    expect(s.streak).toBe(5);
    expect(s.perPoints).toBe(5);
  });
});
