export const RANKS = ["E", "D", "C", "B", "A", "S"] as const;
export type Rank = (typeof RANKS)[number];

export const TOTAL_LEVELS = 26;
/** First level index that ends in a Calisthenics Boss Pose wall (D-1). */
export const FIRST_WALL_LEVEL = 5;

export type QuestId = "push" | "core" | "legs" | "cross";
export const QUEST_IDS: QuestId[] = ["push", "core", "legs", "cross"];

/** From this level index (D-1) on, every sub-level unlocks a new version of each exercise. */
export const VARIATION_START_LEVEL = 5;

export type PhysicalStat = "STR" | "VIT" | "AGI" | "END";
export type StatKey = PhysicalStat | "PER" | "FOC";

export const QUEST_STAT: Record<QuestId, PhysicalStat> = {
  push: "STR",
  core: "VIT",
  legs: "AGI",
  cross: "END",
};

export const STAT_INFO: Record<StatKey, { name: string; perk: string }> = {
  STR: { name: "Strength", perk: "Pushing power & upper-body force" },
  VIT: { name: "Vitality", perk: "Core stability & injury resistance" },
  AGI: { name: "Agility", perk: "Leg power, balance & explosiveness" },
  END: { name: "Endurance", perk: "Oblique strength & core stamina" },
  PER: { name: "Perception", perk: "Discipline — grows with your streak" },
  FOC: { name: "Neural Focus", perk: "Body control — earned from Boss Poses" },
};

type RepDef = { base: number; step: number };

/** Rep targets per rank: base at sub-level 1, +step for each later sub-level. */
export const REPS_BY_RANK: Record<Rank, Record<QuestId, RepDef>> = {
  E: { push: { base: 20, step: 4 }, core: { base: 20, step: 4 }, legs: { base: 30, step: 5 }, cross: { base: 20, step: 4 } },
  D: { push: { base: 30, step: 4 }, core: { base: 30, step: 4 }, legs: { base: 40, step: 5 }, cross: { base: 30, step: 4 } },
  C: { push: { base: 40, step: 4 }, core: { base: 40, step: 4 }, legs: { base: 50, step: 5 }, cross: { base: 40, step: 4 } },
  B: { push: { base: 50, step: 5 }, core: { base: 50, step: 5 }, legs: { base: 60, step: 5 }, cross: { base: 50, step: 5 } },
  A: { push: { base: 60, step: 5 }, core: { base: 60, step: 5 }, legs: { base: 70, step: 5 }, cross: { base: 60, step: 5 } },
  S: { push: { base: 100, step: 0 }, core: { base: 100, step: 0 }, legs: { base: 100, step: 0 }, cross: { base: 100, step: 0 } },
};

/** Basic exercises used before new versions start unlocking. */
export const BASIC_EXERCISES: Record<QuestId, string> = {
  push: "Push-ups",
  core: "Sit-ups",
  legs: "Squats",
  cross: "Cross Crunches",
};

/** One new version per sub-level, in order, starting at VARIATION_START_LEVEL (D-1 … A-5, then S). */
export const EXERCISE_VARIATIONS: Record<QuestId, string[]> = {
  push: [
    "Wide Push-ups", "Diamond Push-ups", "Decline Push-ups", "Spiderman Push-ups", "Pike Push-ups",
    "Archer Push-ups", "Hindu Push-ups", "Clap Push-ups", "Typewriter Push-ups", "Decline Diamond Push-ups",
    "Staggered-Hand Push-ups", "Pseudo-Planche Push-ups", "Elevated Pike Push-ups", "Double-Clap Push-ups", "Assisted One-Arm Push-ups",
    "Wall Handstand Push-ups", "Superman Push-ups", "Behind-the-Back Clap Push-ups", "Negative One-Arm Push-ups", "Deficit Handstand Push-ups",
    "One-Arm Push-ups",
  ],
  core: [
    "Butterfly Sit-ups", "Reverse Crunches", "Lying Leg Raises", "V-Ups", "Jackknife Sit-ups",
    "Hollow Body Rocks", "Tuck-Ups", "Hanging Knee Raises", "Seated Leg Raises", "Decline Sit-ups",
    "Hanging Leg Raises", "Lying Windshield Wipers", "Toes-to-Bar", "Kneeling Ab Wheel Rollouts", "Tuck L-Sit Raises",
    "Dragon Flag Negatives", "Hanging Windshield Wipers", "Tuck Dragon Flags", "Strict Toes-to-Bar", "Standing Ab Wheel Rollouts",
    "Dragon Flags",
  ],
  legs: [
    "Sumo Squats", "Jump Squats", "Pause Squats", "Walking Lunges", "Split Squats",
    "Bulgarian Split Squats", "Cossack Squats", "Jumping Lunges", "Skater Squats", "Single-Leg Box Squats",
    "Shrimp Squats", "Sissy Squats", "Assisted Pistol Squats", "Jumping Bulgarian Split Squats", "Cossack Squat Jumps",
    "Pistol Squats", "Advanced Shrimp Squats", "Elevated Pistol Squats", "Nordic Curl Negatives", "Jumping Pistol Squats",
    "Dragon Pistol Squats",
  ],
  cross: [
    "Bicycle Crunches", "Standing Cross Crunches", "Russian Twists", "Heel Touches", "Plank Cross Crunches",
    "Mountain Climber Cross Crunches", "Oblique V-Ups", "Side Plank Crunches", "Twisting Sit-ups", "Spiderman Plank Crunches",
    "Feet-Up Russian Twists", "Hanging Oblique Knee Raises", "Side Plank Reach-Throughs", "V-Up Cross Twists", "Kneeling Ab Wheel Diagonals",
    "Hanging Oblique Leg Raises", "Side Plank Star Crunches", "Copenhagen Plank Crunches", "Hollow Body Cross Crunches", "Ab Wheel Diagonal Rollouts",
    "Hanging Cross Crunches",
  ],
};

export const RANK_TITLES: Record<Rank, { job: string; title: string }> = {
  E: { job: "None", title: "The Weakest Player" },
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
