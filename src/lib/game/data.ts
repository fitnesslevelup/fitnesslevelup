export const RANKS = ["E", "D", "C", "B", "A", "S"] as const;
export type Rank = (typeof RANKS)[number];

export const TOTAL_LEVELS = 26;
/** First level index that ends in a Calisthenics Boss Pose wall (D-1). */
export const FIRST_WALL_LEVEL = 5;

export type QuestId = "push" | "core" | "legs" | "run";
export const QUEST_IDS: QuestId[] = ["push", "core", "legs", "run"];

export type PhysicalStat = "STR" | "VIT" | "AGI" | "END";
export type StatKey = PhysicalStat | "PER" | "FOC";

export const QUEST_STAT: Record<QuestId, PhysicalStat> = {
  push: "STR",
  core: "VIT",
  legs: "AGI",
  run: "END",
};

export const STAT_INFO: Record<StatKey, { name: string; perk: string }> = {
  STR: { name: "Strength", perk: "Pushing power & upper-body force" },
  VIT: { name: "Vitality", perk: "Core stability & injury resistance" },
  AGI: { name: "Agility", perk: "Leg power, balance & explosiveness" },
  END: { name: "Endurance", perk: "Cardio capacity & recovery speed" },
  PER: { name: "Perception", perk: "Discipline — grows with your streak" },
  FOC: { name: "Neural Focus", perk: "Body control — earned from Boss Poses" },
};

type QuestDef = { name: string; base: number; step: number; unit: "reps" | "km" };

export const QUESTS_BY_RANK: Record<Rank, Record<QuestId, QuestDef>> = {
  E: {
    push: { name: "Push-ups", base: 20, step: 4, unit: "reps" },
    core: { name: "Sit-ups", base: 20, step: 4, unit: "reps" },
    legs: { name: "Squats", base: 30, step: 5, unit: "reps" },
    run: { name: "Run", base: 2, step: 0.2, unit: "km" },
  },
  D: {
    push: { name: "Diamond Push-ups", base: 30, step: 4, unit: "reps" },
    core: { name: "Lying Leg Raises", base: 30, step: 4, unit: "reps" },
    legs: { name: "Jump Squats", base: 40, step: 5, unit: "reps" },
    run: { name: "Run", base: 3, step: 0.3, unit: "km" },
  },
  C: {
    push: { name: "Archer Push-ups", base: 40, step: 4, unit: "reps" },
    core: { name: "Hanging Knee Raises", base: 40, step: 4, unit: "reps" },
    legs: { name: "Bulgarian Split Squats", base: 50, step: 5, unit: "reps" },
    run: { name: "Run", base: 5, step: 0.3, unit: "km" },
  },
  B: {
    push: { name: "Pseudo-Planche Push-ups", base: 50, step: 5, unit: "reps" },
    core: { name: "Toes-to-Bar", base: 50, step: 5, unit: "reps" },
    legs: { name: "Shrimp Squats", base: 60, step: 5, unit: "reps" },
    run: { name: "Run", base: 7, step: 0.2, unit: "km" },
  },
  A: {
    push: { name: "Clap Push-ups", base: 80, step: 5, unit: "reps" },
    core: { name: "Dragon Flag Negatives", base: 60, step: 5, unit: "reps" },
    legs: { name: "Pistol Squats", base: 80, step: 5, unit: "reps" },
    run: { name: "Run", base: 8, step: 0.4, unit: "km" },
  },
  S: {
    push: { name: "One-Arm Push-ups", base: 100, step: 0, unit: "reps" },
    core: { name: "Dragon Flags", base: 100, step: 0, unit: "reps" },
    legs: { name: "Pistol Squats", base: 100, step: 0, unit: "reps" },
    run: { name: "Run", base: 10, step: 0, unit: "km" },
  },
};

export const RANK_TITLES: Record<Rank, { job: string; title: string }> = {
  E: { job: "None", title: "The Weakest Hunter" },
  D: { job: "Awakened", title: "Dungeon Survivor" },
  C: { job: "Necromancer", title: "Wolf Slayer" },
  B: { job: "Necromancer", title: "Knight Killer" },
  A: { job: "Shadow Commander", title: "Demon Hunter" },
  S: { job: "Shadow Monarch", title: "One Who Overcame Adversity" },
};

/** One rival guards each of the 26 levels; clearing level i defeats RIVALS[i]. */
export const RIVALS: { name: string; epithet: string }[] = [
  { name: "Yoo Jin-Ho", epithet: "Loyal Vice-Master" },
  { name: "Lee Joo-Hee", epithet: "Gentle Healer" },
  { name: "Park Hee-Jin", epithet: "Raid Veteran" },
  { name: "Kim Sang-Shik", epithet: "Seasoned E-Rank" },
  { name: "Yoo Myung-Han", epithet: "Yujin Chairman" },
  { name: "Kang Tae-Shik", epithet: "Blade of Betrayal" },
  { name: "Song Chi-Yul", epithet: "Steel-Fist Mentor" },
  { name: "Hwang Dong-Suk", epithet: "White Tiger Striker" },
  { name: "Kim Chul", epithet: "Iron Tank" },
  { name: "Kargalgan", epithet: "High Orc Shaman" },
  { name: "Igris", epithet: "Blood-Red Commander" },
  { name: "Tusk", epithet: "High Orc Mage" },
  { name: "Vulcan", epithet: "Demon Castle Gatekeeper" },
  { name: "Baruka", epithet: "Ice Elf Chieftain" },
  { name: "Ma Dong-Wook", epithet: "Hunters Guild Tank" },
  { name: "Choi Jong-In", epithet: "Ultimate Hunter" },
  { name: "Baek Yoon-Ho", epithet: "White Tiger Master" },
  { name: "Cha Hae-In", epithet: "Sword Dancer" },
  { name: "Go Gun-Hee", epithet: "Association Chairman" },
  { name: "Beru", epithet: "Ant King" },
  { name: "Thomas Andre", epithet: "The Goliath" },
  { name: "Liu Zhigang", epithet: "Sword of China" },
  { name: "Christopher Reed", epithet: "Fire Sovereign" },
  { name: "Antares", epithet: "Monarch of Destruction" },
  { name: "Ashborn", epithet: "The First Shadow Monarch" },
  { name: "Statue of God", epithet: "Architect of the Double Dungeon" },
];

/** 21 Calisthenics Boss Poses, one per level from D-1 to S. */
export const POSES: { name: string; cue: string }[] = [
  { name: "Crow Pose", cue: "Knees on triceps, balance on hands for 15s." },
  { name: "Tuck L-Sit", cue: "Knees tucked, hips off the floor for 15s." },
  { name: "Wall Handstand", cue: "Chest-to-wall handstand held for 30s." },
  { name: "Skin the Cat", cue: "Controlled rotation on bar or rings, 3 reps." },
  { name: "Tuck Back Lever", cue: "Tucked, body horizontal facing down, 10s." },
  { name: "Full L-Sit", cue: "Legs straight and parallel to floor, 15s." },
  { name: "Tuck Front Lever", cue: "Tucked, back flat facing up, 10s." },
  { name: "Freestanding Handstand", cue: "No wall, hold a straight line for 15s." },
  { name: "Pistol Squat", cue: "One full rep per leg, no support." },
  { name: "Archer Pull-up", cue: "3 reps per side with the free arm straight." },
  { name: "Tuck Planche", cue: "Knees tucked, feet off floor, arms locked, 10s." },
  { name: "Muscle-up", cue: "One clean bar muscle-up, no kip." },
  { name: "Full Back Lever", cue: "Straight body horizontal facing down, 5s." },
  { name: "V-Sit", cue: "Legs raised above hip line, 10s." },
  { name: "Dragon Flag", cue: "Straight-body lowering from the shoulders, 3 reps." },
  { name: "Human Flag", cue: "Body held sideways on a pole, 5s." },
  { name: "Freestanding Handstand Push-up", cue: "One full rep, no wall." },
  { name: "Straddle Planche", cue: "Legs straddled, body horizontal, 5s." },
  { name: "One-Arm Pull-up", cue: "One clean rep from dead hang." },
  { name: "Full Front Lever", cue: "Straight body horizontal facing up, 5s." },
  { name: "Full Planche", cue: "Legs together, body horizontal on locked arms, 3s." },
];
