import { Food, MealEntry, ShortcutItem, YesterdayMeal, Macros } from "@/types";

// ─── Mock Goals ─────────────────────────────────────────────────────────────

export const MOCK_GOALS: Macros = {
  calories: 2000,
  protein: 114,
  carbs: 183,
  fat: 71.3,
};

// ─── Mock Foods ─────────────────────────────────────────────────────────────

export const MOCK_FOODS: Food[] = [
  {
    id: "f1",
    name: "Oatmeal with berries",
    emoji: "🍲",
    servingSize: 1,
    servingUnit: "bowl",
    macros: { calories: 320, protein: 12, carbs: 54, fat: 6 },
  },
  {
    id: "f2",
    name: "Grilled chicken salad",
    emoji: "🥗",
    servingSize: 1,
    servingUnit: "plate",
    macros: { calories: 425, protein: 42, carbs: 18, fat: 16 },
  },
  {
    id: "f3",
    name: "Greek yogurt & honey",
    emoji: "🍯",
    servingSize: 1,
    servingUnit: "cup",
    macros: { calories: 180, protein: 15, carbs: 22, fat: 3 },
  },
  {
    id: "f4",
    name: "Protein shake",
    emoji: "🥤",
    servingSize: 1,
    servingUnit: "shake",
    macros: { calories: 250, protein: 30, carbs: 18, fat: 5 },
  },
  {
    id: "f5",
    name: "Grilled salmon with roasted vegetables and quinoa",
    emoji: "🐟",
    servingSize: 1,
    servingUnit: "plate",
    macros: { calories: 520, protein: 45, carbs: 38, fat: 18 },
  },
  {
    id: "f6",
    name: "Turkey sandwich",
    emoji: "🥪",
    servingSize: 1,
    servingUnit: "sandwich",
    macros: { calories: 380, protein: 28, carbs: 42, fat: 10 },
  },
  {
    id: "f7",
    name: "Yogurt",
    emoji: "🫙",
    servingSize: 1,
    servingUnit: "cup",
    macros: { calories: 350, protein: 14, carbs: 48, fat: 8 },
  },
];

// ─── Mock Diary Entries (Today) ──────────────────────────────────────────────

export const MOCK_TODAY_ENTRIES: MealEntry[] = [
  {
    id: "e1",
    userId: "u1",
    food: MOCK_FOODS[0],
    foodId: "f1",
    mealType: "breakfast",
    quantity: 1,
    loggedAt: new Date().toISOString().replace("T", " ").split(".")[0],
    method: "shortcut",
    macros: MOCK_FOODS[0].macros,
  },
  {
    id: "e2",
    userId: "u1",
    food: MOCK_FOODS[1],
    foodId: "f2",
    mealType: "lunch",
    quantity: 1,
    loggedAt: new Date().toISOString().replace("T", " ").split(".")[0],
    method: "manual",
    macros: MOCK_FOODS[1].macros,
  },
  {
    id: "e3",
    userId: "u1",
    food: MOCK_FOODS[2],
    foodId: "f3",
    mealType: "snacks",
    quantity: 1,
    loggedAt: new Date().toISOString().replace("T", " ").split(".")[0],
    method: "voice",
    macros: MOCK_FOODS[2].macros,
  },
];

// Totals from mock entries: 925 cal, 69 protein, 94 carbs, 25 fat (approx from screenshot)
export const MOCK_TOTALS: Macros = {
  calories: 925,
  protein: 68.7,
  carbs: 85.2,
  fat: 35.8,
};

// ─── Mock Shortcuts ──────────────────────────────────────────────────────────

export const MOCK_SHORTCUTS: ShortcutItem[] = [
  {
    id: "s1",
    food: MOCK_FOODS[0],
    frequency: "Every morning",
    lastLoggedAt: "2024-03-28T08:30:00Z",
    totalLogs: 42,
  },
  {
    id: "s2",
    food: MOCK_FOODS[1],
    frequency: "3x this week",
    lastLoggedAt: "2024-03-28T12:45:00Z",
    totalLogs: 18,
  },
  {
    id: "s3",
    food: MOCK_FOODS[2],
    frequency: "5x this week",
    lastLoggedAt: "2024-03-28T15:00:00Z",
    totalLogs: 31,
  },
  {
    id: "s4",
    food: MOCK_FOODS[3],
    frequency: "Daily",
    lastLoggedAt: "2024-03-28T07:00:00Z",
    totalLogs: 56,
  },
];

// ─── Mock Yesterday's Meals ──────────────────────────────────────────────────

export const MOCK_YESTERDAY_MEALS: YesterdayMeal[] = [
  {
    id: "y1",
    food: MOCK_FOODS[0],
    loggedAt: "8:30 AM",
    macros: MOCK_FOODS[0].macros,
  },
  {
    id: "y2",
    food: MOCK_FOODS[5],
    loggedAt: "12:30 PM",
    macros: MOCK_FOODS[5].macros,
  },
  {
    id: "y3",
    food: MOCK_FOODS[4],
    loggedAt: "7:00 PM",
    macros: MOCK_FOODS[4].macros,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getMealLabel(type: string): string {
  const map: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",
  };
  return map[type] ?? type;
}
