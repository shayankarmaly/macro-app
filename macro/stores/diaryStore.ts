import { create } from "zustand";
import {
  MealEntry,
  Macros,
  MealType,
  ConfirmMealPayload,
  Food,
} from "@/types";
import {
  MOCK_TODAY_ENTRIES,
  MOCK_TOTALS,
  MOCK_GOALS,
} from "@/data/mockData";

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
  entries: MOCK_TODAY_ENTRIES, // Start with mock data
  totals: MOCK_TOTALS,
  goals: MOCK_GOALS,
  isLoading: false,
  error: null,
  pendingMeal: null,

  setDate: (date) => {
    set({ currentDate: date });
  },

  loadDiary: async (userId, date) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with real Supabase call
      // const entries = await getDiaryEntries(userId, date);
      const entries = MOCK_TODAY_ENTRIES;
      const totals = computeTotals(entries);
      set({ entries, totals, isLoading: false });
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

    // Optimistic update
    const newEntry: MealEntry = {
      id: Date.now().toString(),
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

    get().addEntry(newEntry);
    set({ pendingMeal: null });

    // TODO: persist to Supabase
    // await logMealEntry({ userId, foodId: newEntry.foodId, ... })
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
