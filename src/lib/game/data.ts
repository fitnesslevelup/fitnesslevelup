export const RANKS = ["E", "D", "C", "B", "A", "S"] as const;
export type Rank = (typeof RANKS)[number];

export const TOTAL_LEVELS = 26;
/** First level index that ends in a Calisthenics Boss Pose wall (E-5). Walls run E-5 … A-5; S has none. */
export const FIRST_WALL_LEVEL = 4;

export type QuestId = "push" | "core" | "legs" | "cross";
export const QUEST_IDS: QuestId[] = ["push", "core", "legs", "cross"];

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

/** Reps per quest: 10 at E-1, +2 every level (D-1 = 20 … A-5 = 58, S = 60). Same target for all 4 quests. */
export const REP_START = 10;
export const REP_STEP = 2;

/** Points per quest by rank (equal for all 4 quests). */
export const POINTS_BY_RANK: Record<Rank, number> = { E: 25, D: 50, C: 100, B: 250, A: 500, S: 1000 };

export const RANK_NAMES: Record<Rank, string> = {
  E: "The Awakening",
  D: "The Striker",
  C: "The Vanguard",
  B: "The Elite Knight",
  A: "The National Hunter",
  S: "The Shadow Monarch",
};

const E5 = (name: string) => [name, name, name, name, name];
const A_AND_S = (name: string) => [name, name, name, name, name, name];

/** Exercise for every level, index 0 (E-1) … 25 (S). */
export const EXERCISES_BY_LEVEL: Record<QuestId, string[]> = {
  push: [
    ...E5("Normal Push-Up"),
    "Shoulder Tap Push-Up", "Spiderman Push-Up", "Decline Push-Up", "Diamond Push-Up", "Medicine Ball Push-Up",
    "Stability Ball Push-Up (Hands On)", "Stability Ball Push-Up (Feet On)", "TRX Push-Up", "Fingertip Push-Up", "Archer Push-Up",
    "Hindu Push-Up", "Dive Bomber Push-Up", "Pseudo Planche Push-Up", "Plyometric / Clap Push-Up", "Single-Arm Push-Up",
    ...A_AND_S("Superman Push-Up"),
  ],
  legs: [
    ...E5("Normal Squat"),
    "Frog Squat", "Curtsy Lunge Squat", "Cossack Squat", "Surfer Squat", "Bulgarian Split Squat",
    "Skater Squat", "Tuck Jump Squat", "Single-Leg Bench Squat", "Shrimp Squat", "Sissy Squat",
    "Jumping Lunge Squat", "Deck Squat (Rolling)", "180-Degree Jump Squat", "Dragon Squat", "Assisted Pistol Squat",
    ...A_AND_S("Levitation Squat"),
  ],
  core: [
    ...E5("Normal Sit-Up"),
    "Heel Touch (Penguin Crunch)", "Tuck Crunch", "Suitcase Crunch", "Sprinter Sit-Up", "V-Up",
    "Alternating V-Up", "Starfish Sit-Up", "Jackknife Sit-Up", "Lemon Squeezer", "Hollow Body Crunch",
    "Slow Negative Sit-Up", "Bicycle Sit-Up", "Oblique V-Up", "Straddle V-Up", "L-Sit Crunch",
    ...A_AND_S("Full Hollow Rock to V-Up"),
  ],
  cross: [
    ...E5("Normal Cross Crunch"),
    "Spiderman Plank Crunch", "Side Plank Crunch", "Alternating Toe Touch", "Reverse Bicycle Crunch", "Starfish Crunch",
    "Side V-Up", "Corkscrew Crunch", "Plank Knee-to-Elbow", "Cross-Body Mountain Climber", "Bent-Knee Windshield Wiper",
    "Straight-Leg Windshield Wiper", "X-Man Crunch", "Oblique Jackknife", "Tornado Crunch", "Lying Cross-Body Toe Touch",
    ...A_AND_S("Hanging Oblique Knee Raise"),
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

/** 21 Calisthenics Boss Poses, one per level from E-5 to A-5. */
export const POSES: { name: string; cue: string }[] = [
  { name: "L-Sit", cue: "Legs straight and parallel to the floor, hips up, 10s." },
  { name: "Frogstand", cue: "Knees resting on elbows, balance on your hands for 15s." },
  { name: "Elbow Lever", cue: "Body horizontal, balanced on bent elbows, 10s." },
  { name: "Headstand", cue: "Tripod headstand, legs straight overhead, 30s." },
  { name: "Back Lever", cue: "Body horizontal facing down on bar or rings, 5s." },
  { name: "Muscle-Up", cue: "One clean bar muscle-up, no kip." },
  { name: "Handstand", cue: "Freestanding straight-line handstand, 15s." },
  { name: "Human Flag", cue: "Body held sideways on a pole, 5s." },
  { name: "Dragon Flag", cue: "Straight-body lowering from the shoulders, 3 reps." },
  { name: "Front Lever", cue: "Straight body horizontal facing up, 5s." },
  { name: "V-Sit", cue: "Legs raised above hip line, 10s." },
  { name: "One-Arm Pull-Up", cue: "One clean rep from dead hang." },
  { name: "Pistol Squat", cue: "One full rep per leg, no support." },
  { name: "Archer Push-Up", cue: "3 reps per side with the free arm straight." },
  { name: "One-Arm Push-Up", cue: "One full rep per arm, no knees down." },
  { name: "Iron Cross", cue: "Arms straight out to the sides on rings, body vertical, 3s." },
  { name: "Full Planche", cue: "Legs together, body horizontal on locked arms, 3s." },
  { name: "Maltese", cue: "Planche with arms wide, body near hand height, 3s." },
  { name: "Victorian", cue: "Body horizontal facing up with arms pressed back, 2s." },
  { name: "Manna", cue: "Legs straight forward, hips pushed behind your hands, 3s." },
  { name: "Reverse Planche", cue: "Body horizontal facing up, held on straight arms behind you, 3s." },
];
