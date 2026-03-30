import { supabase } from "@/lib/supabase";
import { MealEntry, MealType, LogMethod, Macros } from "@/types";

// ─── Fetch diary entries for a given date ────────────────────────────────────

export async function getDiaryEntries(
  userId: string,
  date: string // YYYY-MM-DD
): Promise<MealEntry[]> {
  const { data, error } = await supabase
    .from("meal_entries")
    .select(
      `
      id,
      user_id,
      meal_type,
      quantity,
      logged_at,
      method,
      foods (
        id, name, emoji, serving_size, serving_unit,
        calories, protein, carbs, fat
      )
    `
    )
    .eq("user_id", userId)
    .gte("logged_at", `${date}T00:00:00`)
    .lte("logged_at", `${date}T23:59:59`)
    .order("logged_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    food: {
      id: row.foods.id,
      name: row.foods.name,
      emoji: row.foods.emoji,
      servingSize: row.foods.serving_size,
      servingUnit: row.foods.serving_unit,
      macros: {
        calories: row.foods.calories,
        protein: row.foods.protein,
        carbs: row.foods.carbs,
        fat: row.foods.fat,
      },
    },
    foodId: row.foods.id,
    mealType: row.meal_type as MealType,
    quantity: row.quantity,
    loggedAt: row.logged_at,
    method: row.method as LogMethod,
    macros: {
      calories: row.foods.calories * row.quantity,
      protein: row.foods.protein * row.quantity,
      carbs: row.foods.carbs * row.quantity,
      fat: row.foods.fat * row.quantity,
    },
  }));
}

// ─── Log a meal entry ─────────────────────────────────────────────────────────

export async function logMealEntry(params: {
  userId: string;
  foodId: string;
  mealType: MealType;
  quantity: number;
  method: LogMethod;
}): Promise<MealEntry> {
  const { data, error } = await supabase
    .from("meal_entries")
    .insert({
      user_id: params.userId,
      food_id: params.foodId,
      meal_type: params.mealType,
      quantity: params.quantity,
      method: params.method,
      logged_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

// ─── Delete a meal entry ──────────────────────────────────────────────────────

export async function deleteMealEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from("meal_entries")
    .delete()
    .eq("id", entryId);

  if (error) throw error;
}

// ─── Get user macro goals ─────────────────────────────────────────────────────

export async function getUserGoals(userId: string): Promise<Macros> {
  const { data, error } = await supabase
    .from("user_goals")
    .select("calories, protein, carbs, fat")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return {
    calories: data.calories,
    protein: data.protein,
    carbs: data.carbs,
    fat: data.fat,
  };
}

// ─── Get frequent foods (for shortcuts) ──────────────────────────────────────

export async function getFrequentFoods(userId: string, limit = 4) {
  const { data, error } = await supabase
    .from("meal_entries")
    .select(
      `
      food_id,
      foods (id, name, emoji, serving_size, serving_unit, calories, protein, carbs, fat),
      count
    `
    )
    .eq("user_id", userId)
    .order("count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
