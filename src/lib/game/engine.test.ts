import { describe, expect, it } from "vitest";
import { POSES, QUEST_IDS, RIVALS, TOTAL_LEVELS } from "./data";
import {
  certifyPose,
  poseForLevel,
  repairWall,
  createState,
  questFor,
  levelInfo,
  logQuest,
  pointsPerQuest,
  rollover,
  xpNeeded,
  type GameState,
} from "./engine";

function clearDay(s: GameState) {
  for (const q of ["push", "core", "legs", "cross"] as const) s = logQuest(s, q, 9999).state;
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

  it("gives equal points for each quest: 25 at E-Rank", () => {
    const s = createState("2026-01-01");
    expect(logQuest(s, "push", 9999).events[0]).toEqual({ type: "quest", quest: "push", points: 25 });
    expect(logQuest(s, "cross", 9999).events[0]).toEqual({ type: "quest", quest: "cross", points: 25 });
  });

  it("points per quest by rank: E 25, D 50, C 100, B 250, A 500, S 1000", () => {
    expect([0, 5, 10, 15, 20, 25].map(pointsPerQuest)).toEqual([25, 50, 100, 250, 500, 1000]);
    expect(pointsPerQuest(4)).toBe(25);
    expect(pointsPerQuest(24)).toBe(500);
  });

  it("reps start at 10 and rise by 2 each level up to 60 at S", () => {
    expect(questFor(0, "push").target).toBe(10);
    expect(questFor(4, "legs").target).toBe(18);
    expect(questFor(5, "core").target).toBe(20);
    expect(questFor(24, "cross").target).toBe(58);
    expect(questFor(25, "push").target).toBe(60);
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
    expect(xpNeeded(0)).toBe(400);
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
    let s: GameState = { ...createState("2026-01-01"), levelIndex: 4, xp: xpNeeded(4) - pointsPerQuest(4) };
    s = logQuest(s, "push", 9999).state;
    expect(s.wall).toBe(true);
    expect(logQuest(s, "core", 9999).state.completed).toEqual(["push"]);
    const r = certifyPose(s);
    expect(r.state.levelIndex).toBe(5);
    expect(r.state.poses).toEqual([0]);
    expect(r.events[0]).toEqual({ type: "pose", pose: "L-Sit" });
    expect(r.state.wall).toBe(false);
  });

  it("does not penalise days spent behind a level wall", () => {
    let s: GameState = { ...createState("2026-01-01"), wall: true, streak: 5, perPoints: 5 };
    s = rollover(s, "2026-01-03").state;
    expect(s.streak).toBe(5);
    expect(s.perPoints).toBe(5);
  });

  it("daily quests are push-ups, sit-ups, squats and cross crunches (no running)", () => {
    expect(QUEST_IDS).toEqual(["push", "core", "legs", "cross"]);
    expect(QUEST_IDS.map((id) => questFor(0, id).name).join(" ")).not.toMatch(/\brun(ning)?\b/i);
  });

  it("E-Rank keeps the normal exercises", () => {
    for (let i = 0; i < 5; i++) {
      expect(questFor(i, "push").name).toBe("Normal Push-Up");
      expect(questFor(i, "legs").name).toBe("Normal Squat");
      expect(questFor(i, "core").name).toBe("Normal Sit-Up");
      expect(questFor(i, "cross").name).toBe("Normal Cross Crunch");
    }
  });

  it("uses the exercise table for D to B ranks", () => {
    expect(QUEST_IDS.map((id) => questFor(5, id).name)).toEqual([
      "Shoulder Tap Push-Up", "Heel Touch (Penguin Crunch)", "Frog Squat", "Spiderman Plank Crunch",
    ]);
    expect(QUEST_IDS.map((id) => questFor(14, id).name)).toEqual([
      "Archer Push-Up", "Hollow Body Crunch", "Sissy Squat", "Bent-Knee Windshield Wiper",
    ]);
    expect(QUEST_IDS.map((id) => questFor(19, id).name)).toEqual([
      "Single-Arm Push-Up", "L-Sit Crunch", "Assisted Pistol Squat", "Lying Cross-Body Toe Touch",
    ]);
  });

  it("A-Rank and S-Rank all use the same master exercises", () => {
    for (let i = 20; i < TOTAL_LEVELS; i++) {
      expect(QUEST_IDS.map((id) => questFor(i, id).name)).toEqual([
        "Superman Push-Up", "Full Hollow Rock to V-Up", "Levitation Squat", "Hanging Oblique Knee Raise",
      ]);
    }
  });

  it("boss poses run from L-Sit at E-5 to Reverse Planche at A-5; E-1 to E-4 and S have none", () => {
    for (let i = 0; i < 4; i++) expect(poseForLevel(i)).toBeNull();
    expect(poseForLevel(4)?.name).toBe("L-Sit");
    expect(poseForLevel(5)?.name).toBe("Frogstand");
    expect(poseForLevel(19)?.name).toBe("Iron Cross");
    expect(poseForLevel(10)?.name).toBe("Handstand");
    expect(poseForLevel(24)?.name).toBe("Reverse Planche");
    expect(poseForLevel(25)).toBeNull();
  });

  it("clearing S-Rank finishes the journey without a wall", () => {
    let s: GameState = { ...createState("2026-01-01"), levelIndex: 25, xp: xpNeeded(25) - pointsPerQuest(25) };
    s = logQuest(s, "push", 9999).state;
    expect(s.wall).toBe(false);
    expect(s.levelIndex).toBe(26);
  });

  it("an old save frozen at S (no pose there now) is unfrozen", () => {
    const s: GameState = { ...createState("2026-01-01"), levelIndex: 25, wall: true };
    expect(repairWall(s).wall).toBe(false);
    const e5: GameState = { ...createState("2026-01-01"), levelIndex: 4, wall: true };
    expect(repairWall(e5).wall).toBe(true);
  });
});
