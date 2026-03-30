import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { MacroProgressCard } from "@/components/diary/MacroProgressCard";
import { MealSection } from "@/components/diary/MealSection";
import { useDiaryStore } from "@/stores/diaryStore";
import { MealEntry, MealType, ConfirmMealPayload } from "@/types";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];

export default function DiaryScreen() {
  const { totals, goals, entries, currentDate } = useDiaryStore();

  // Format the date label (e.g. "Saturday, Mar 28")
  const dateLabel = new Date(currentDate + "T12:00:00").toLocaleDateString(
    "en-US",
    { weekday: "long", month: "short", day: "numeric" }
  );

  const entriesByMeal = useCallback(
    (mealType: MealType) => entries.filter((e) => e.mealType === mealType),
    [entries]
  );

  const handleAddMeal = (mealType: MealType) => {
    // Navigate to food search / manual add
    // For now, opens shortcuts as the quick entry point
    router.push("/modals/shortcuts");
  };

  const handleEditEntry = (entry: MealEntry) => {
    router.push({
      pathname: "/modals/confirm-meal",
      params: {
        payload: JSON.stringify({
          food: entry.food,
          method: entry.method,
          mealType: entry.mealType,
          quantity: entry.quantity,
          entryId: entry.id,
          isEdit: true,
        } as ConfirmMealPayload & { entryId: string; isEdit: boolean }),
      },
    });
  };

  const handleVoice = () => {
    router.push("/modals/voice-logging");
  };

  const handleShortcuts = () => {
    router.push("/modals/shortcuts");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Diary</Text>
        <View style={styles.headerRight}>
          <Text style={styles.moonIcon}>🌙</Text>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Macro Progress Card ─────────────────────── */}
        <MacroProgressCard totals={totals} goals={goals} />

        {/* ── Search + Action Buttons ─────────────────── */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search foods or add meal..."
              placeholderTextColor={Colors.textMuted}
              returnKeyType="search"
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleVoice}>
              <Text style={styles.actionBtnIcon}>🎙️</Text>
              <Text style={styles.actionBtnText}>Voice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnRight]}
              onPress={handleShortcuts}
            >
              <Text style={styles.actionBtnIcon}>✨</Text>
              <Text style={styles.actionBtnText}>Shortcuts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Meal Sections ───────────────────────────── */}
        {MEAL_TYPES.map((mealType) => (
          <MealSection
            key={mealType}
            mealType={mealType}
            entries={entriesByMeal(mealType)}
            onAdd={() => handleAddMeal(mealType)}
            onEditEntry={handleEditEntry}
          />
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  moonIcon: {
    fontSize: 18,
  },
  dateLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingTop: 4,
  },
  searchSection: {
    paddingHorizontal: 16,
    gap: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderRadius: 22,
    paddingVertical: 10,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  actionBtnRight: {},
  actionBtnIcon: {
    fontSize: 16,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  bottomSpacer: {
    height: 40,
  },
});
