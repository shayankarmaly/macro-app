// ─── Macro Nutrients ────────────────────────────────────────────────────────

export interface Macros {
  calories: number;
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
}

export interface MacroGoals extends Macros {
  userId: string;
}

// ─── Food ───────────────────────────────────────────────────────────────────

export interface Food {
  id: string;
  name: string;
  emoji: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  macros: Macros;
  barcode?: string;
}

// ─── Meal Entry ─────────────────────────────────────────────────────────────

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export type LogMethod = "manual" | "voice" | "shortcut" | "barcode";

export interface MealEntry {
  id: string;
  userId: string;
  food: Food;
  foodId: string;
  mealType: MealType;
  quantity: number;
  loggedAt: string;   // ISO string
  method: LogMethod;
  macros: Macros;     // computed from food * quantity
}

// ─── Diary ──────────────────────────────────────────────────────────────────

export interface DailyDiary {
  date: string;       // YYYY-MM-DD
  entries: MealEntry[];
  totals: Macros;
  goals: Macros;
}

export interface MealSection {
  type: MealType;
  label: string;
  entries: MealEntry[];
  totalCalories: number;
}

// ─── Shortcuts ──────────────────────────────────────────────────────────────

export interface ShortcutItem {
  id: string;
  food: Food;
  frequency: string;        // "Every morning", "3x this week", "Daily"
  lastLoggedAt: string;
  totalLogs: number;
}

export interface YesterdayMeal {
  id: string;
  food: Food;
  loggedAt: string;         // "8:30 AM"
  macros: Macros;
}

// ─── Voice Logging ──────────────────────────────────────────────────────────

export type VoiceState = "idle" | "listening" | "processing" | "done" | "error";

export interface VoiceResult {
  transcript: string;
  parsedFood?: Partial<Food & { quantity: number }>;
  confidence: number;
}

// ─── Confirm Meal ───────────────────────────────────────────────────────────

export interface ConfirmMealPayload {
  food: Food;
  method: LogMethod;
  mealType: MealType;
  quantity: number;
  overrideMacros?: Partial<Macros>;
}

// ─── User / Auth ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  goals: Macros;
  createdAt: string;
}

// ─── Navigation ─────────────────────────────────────────────────────────────

export type RootStackParamList = {
  "(tabs)": undefined;
  "modals/voice-logging": undefined;
  "modals/shortcuts": undefined;
  "modals/confirm-meal": { payload: string }; // JSON stringified ConfirmMealPayload
  "modals/edit-meal": { entryId: string };
};
