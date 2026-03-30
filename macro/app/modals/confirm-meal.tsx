import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { ConfirmMealPayload, LogMethod, Macros } from "@/types";
import { useDiaryStore } from "@/stores/diaryStore";

// ─── Method Badge ─────────────────────────────────────────────────────────────

const METHOD_LABELS: Record<LogMethod, string> = {
  manual: "Logged via Manual",
  voice: "Logged via Voice",
  shortcut: "Logged via Shortcut",
  barcode: "Logged via Barcode",
};

function MethodBadge({ method }: { method: LogMethod }) {
  return (
    <View style={styles.badge}>
      <View style={styles.badgeDot} />
      <Text style={styles.badgeText}>{METHOD_LABELS[method]}</Text>
    </View>
  );
}

// ─── Macro Pill ───────────────────────────────────────────────────────────────

function MacroPill({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.macroPill, { backgroundColor: bg }]}>
      <Text style={[styles.macroPillLabel, { color }]}>{label}</Text>
      <Text style={[styles.macroPillValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ConfirmMealScreen() {
  const { payload } = useLocalSearchParams<{ payload: string }>();
  const { addEntry, confirmPendingMeal } = useDiaryStore();
  const [isLogging, setIsLogging] = useState(false);

  // Parse the payload
  let mealPayload: ConfirmMealPayload | null = null;
  try {
    mealPayload = JSON.parse(payload ?? "{}") as ConfirmMealPayload;
  } catch {
    mealPayload = null;
  }

  if (!mealPayload?.food) {
    return (
      <View style={styles.safe}>
        <Text style={{ color: Colors.textSecondary, textAlign: "center", marginTop: 40 }}>
          No meal data found.
        </Text>
      </View>
    );
  }

  const { food, method, quantity } = mealPayload;
  const macros: Macros = {
    calories: Math.round(food.macros.calories * quantity),
    protein: Math.round(food.macros.protein * quantity * 10) / 10,
    carbs: Math.round(food.macros.carbs * quantity * 10) / 10,
    fat: Math.round(food.macros.fat * quantity * 10) / 10,
  };

  // Show macro pills only for voice-logged items (like the Figma design)
  const showMacroPills = method === "voice";

  const handleConfirm = async () => {
    if (isLogging) return;
    setIsLogging(true);

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const newEntry = {
        id: Date.now().toString(),
        userId: "u1", // TODO: get from auth store
        food,
        foodId: food.id,
        mealType: mealPayload!.mealType,
        quantity,
        loggedAt: new Date().toISOString(),
        method,
        macros,
      };
      addEntry(newEntry);

      // Go back to diary, skipping the modal stack
      router.dismissAll();
    } catch (err) {
      Alert.alert("Error", "Could not log meal. Please try again.");
    } finally {
      setIsLogging(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleEditDetails = () => {
    // TODO: push to an edit form screen
    Alert.alert("Edit Details", "Edit details form coming soon!");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Meal</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Meal card */}
        <View style={styles.card}>
          <MethodBadge method={method} />

          {/* Food icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.foodEmoji}>{food.emoji}</Text>
          </View>

          {/* Food name */}
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.reviewText}>Review before logging</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Calories row */}
          <View style={styles.calRow}>
            <Text style={styles.calLabel}>Calories</Text>
            <Text style={styles.calValue}>{macros.calories} cal</Text>
          </View>

          {/* Macro pills (voice only) */}
          {showMacroPills && (
            <View style={styles.macroPills}>
              <MacroPill
                label="Protein"
                value={`${macros.protein}g`}
                color={Colors.protein}
                bg={Colors.proteinBg}
              />
              <MacroPill
                label="Carbs"
                value={`${macros.carbs}g`}
                color={Colors.carbs}
                bg={Colors.carbsBg}
              />
              <MacroPill
                label="Fat"
                value={`${macros.fat}g`}
                color={Colors.fat}
                bg={Colors.fatBg}
              />
            </View>
          )}
        </View>

        {/* Edit details link */}
        <TouchableOpacity style={styles.editLink} onPress={handleEditDetails}>
          <Text style={styles.editLinkIcon}>✏️</Text>
          <Text style={styles.editLinkText}>Edit details</Text>
        </TouchableOpacity>

        <View style={styles.flex1} />

        {/* Confirm button */}
        <TouchableOpacity
          style={[styles.confirmBtn, isLogging && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={isLogging}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>
            {isLogging ? "Logging..." : "Confirm & Log Meal"}
          </Text>
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  closeBtnText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerSpacer: { width: 36 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.carbsBg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 4,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  foodEmoji: {
    fontSize: 46,
  },
  foodName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  reviewText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    alignSelf: "stretch",
    marginVertical: 4,
  },
  calRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  calLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  calValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  macroPills: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "stretch",
    marginTop: 4,
  },
  macroPill: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    gap: 2,
  },
  macroPillLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  macroPillValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  editLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },
  editLinkIcon: {
    fontSize: 14,
  },
  editLinkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  flex1: { flex: 1, minHeight: 24 },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
});
