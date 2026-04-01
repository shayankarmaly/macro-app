import { create } from "zustand";
import {
  MealEntry,
  Macros,
  MealType,
  ConfirmMealPayload,
} from "@/types";
import { getDiaryEntries, getUserGoals, logMealEntry } from "@/lib/api/meals";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DiaryState {
  // Current date being viewed
  currentDate: string; // YYYY-MM-DD

  // Entries for current date
  entries: MealEntry[];

  // Daily totals (computed)
  totals: Macros;

  // User's macro goals
  goals: Macros;

  // Loading / error state
  isLoading: boolean;
  error: string | null;

  // Pending confirm meal payload (set before opening confirm modal)
  pendingMeal: ConfirmMealPayload | null;

  // Actions
  setDate: (date: string) => void;
  loadDiary: (userId: string, date: string) => Promise<void>;
  addEntry: (entry: MealEntry) => void;
  removeEntry: (entryId: string) => void;
  setPendingMeal: (payload: ConfirmMealPayload | null) => void;
  confirmPendingMeal: (userId: string) => Promise<void>;
  recomputeTotals: () => void;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function computeTotals(entries: MealEntry[]): Macros {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.macros?.calories ?? 0),
      protein: acc.protein + (e.macros?.protein ?? 0),
      carbs: acc.carbs + (e.macros?.carbs ?? 0),
      fat: acc.fat + (e.macros?.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useDiaryStore = create<DiaryState>((set, get) => ({
  currentDate: todayString(),
  entries: [],
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  goals: { calories: 2000, protein: 114, carbs: 183, fat: 71 },
  isLoading: false,
  error: null,
  pendingMeal: null,

  setDate: (date) => {
    set({ currentDate: date });
  },

  loadDiary: async (userId, date) => {
    set({ isLoading: true, error: null });
    try {
      const [entries, goals] = await Promise.all([
        getDiaryEntries(userId, date),
        getUserGoals(userId),
      ]);
      const totals = computeTotals(entries);
      set({ entries, totals, goals, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addEntry: (entry) => {
    set((state) => {
      const entries = [...state.entries, entry];
      return { entries, totals: computeTotals(entries) };
    });
  },

  removeEntry: (entryId) => {
    set((state) => {
      const entries = state.entries.filter((e) => e.id !== entryId);
      return { entries, totals: computeTotals(entries) };
    });
  },

  setPendingMeal: (payload) => {
    set({ pendingMeal: payload });
  },

  confirmPendingMeal: async (userId) => {
    const { pendingMeal } = get();
    if (!pendingMeal) return;

    const newEntry: MealEntry = {
      id: "",
      userId,
      food: pendingMeal.food,
      foodId: pendingMeal.food.id,
      mealType: pendingMeal.mealType,
      quantity: pendingMeal.quantity,
      loggedAt: new Date().toISOString(),
      method: pendingMeal.method,
      macros: {
        calories: pendingMeal.food.macros.calories * pendingMeal.quantity,
        protein: pendingMeal.food.macros.protein * pendingMeal.quantity,
        carbs: pendingMeal.food.macros.carbs * pendingMeal.quantity,
        fat: pendingMeal.food.macros.fat * pendingMeal.quantity,
      },
    };

    try {
      const persisted = await logMealEntry({
        userId,
        foodId: newEntry.foodId,
        mealType: newEntry.mealType,
        quantity: newEntry.quantity,
        method: newEntry.method,
      });

      get().addEntry({ ...newEntry, id: persisted.id });
      set({ pendingMeal: null, error: null });
    } catch (err: any) {
      set({ error: err.message ?? "Failed to save meal entry." });
    }
  },

  recomputeTotals: () => {
    const { entries } = get();
    set({ totals: computeTotals(entries) });
  },
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectEntriesByMeal = (mealType: MealType) => (state: DiaryState) =>
  state.entries.filter((e) => e.mealType === mealType);

export const selectMacroProgress =
  (key: keyof Macros) => (state: DiaryState) => {
    const current = state.totals[key];
    const goal = state.goals[key];
    return { current, goal, pct: Math.min(current / goal, 1) };
  };
