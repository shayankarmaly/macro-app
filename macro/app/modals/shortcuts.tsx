import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { MOCK_SHORTCUTS, MOCK_YESTERDAY_MEALS } from "@/data/mockData";
import { ShortcutItem, YesterdayMeal } from "@/types";
import { useDiaryStore } from "@/stores/diaryStore";

// ─── Shortcut Row ─────────────────────────────────────────────────────────────

function ShortcutRow({
  item,
  onPress,
}: {
  item: ShortcutItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.emojiCircle}>
        <Text style={styles.rowEmoji}>{item.food.emoji}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>
          {item.food.name}
        </Text>
        <Text style={styles.rowSub}>{item.frequency}</Text>
      </View>
      <Text style={styles.rowCal}>{item.food.macros.calories}</Text>
      <Text style={styles.rowCalUnit}>{"\n"}kcal</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Yesterday Row ────────────────────────────────────────────────────────────

function YesterdayRow({
  item,
  onPress,
}: {
  item: YesterdayMeal;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.emojiCircle, styles.emojiCircleBlue]}>
        <Text style={styles.rowEmoji}>{item.food.emoji}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>
          {item.food.name}
        </Text>
        <Text style={styles.rowSub}>{item.loggedAt}</Text>
      </View>
      <Text style={styles.rowCal}>{item.macros.calories}</Text>
      <Text style={styles.rowCalUnit}>{"\n"}kcal</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ShortcutsScreen() {
  const { setPendingMeal } = useDiaryStore();

  const handleSelectShortcut = (item: ShortcutItem) => {
    setPendingMeal({
      food: item.food,
      method: "shortcut",
      mealType: "breakfast", // default; user can change in confirm screen
      quantity: 1,
    });
    router.push({
      pathname: "/modals/confirm-meal",
      params: {
        payload: JSON.stringify({
          food: item.food,
          method: "shortcut",
          mealType: "breakfast",
          quantity: 1,
        }),
      },
    });
  };

  const handleSelectYesterday = (item: YesterdayMeal) => {
    setPendingMeal({
      food: item.food,
      method: "shortcut",
      mealType: "breakfast",
      quantity: 1,
    });
    router.push({
      pathname: "/modals/confirm-meal",
      params: {
        payload: JSON.stringify({
          food: item.food,
          method: "shortcut",
          mealType: "breakfast",
          quantity: 1,
        }),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quick Shortcuts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Most Frequent */}
        <View style={styles.sectionHeader}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.sectionTitle}>Most Frequent</Text>
        </View>

        <View style={styles.card}>
          {MOCK_SHORTCUTS.map((item, idx) => (
            <React.Fragment key={item.id}>
              <ShortcutRow
                item={item}
                onPress={() => handleSelectShortcut(item)}
              />
              {idx < MOCK_SHORTCUTS.length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Yesterday's Meals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.clockIcon}>🕐</Text>
          <Text style={styles.sectionTitle}>Yesterday's Meals</Text>
        </View>

        <View style={styles.card}>
          {MOCK_YESTERDAY_MEALS.map((item, idx) => (
            <React.Fragment key={item.id}>
              <YesterdayRow
                item={item}
                onPress={() => handleSelectYesterday(item)}
              />
              {idx < MOCK_YESTERDAY_MEALS.length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>

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
    paddingHorizontal: 16,
    gap: 10,
    paddingTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  starIcon: { fontSize: 16 },
  clockIcon: { fontSize: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  emojiCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.shortcutBg,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiCircleBlue: {
    backgroundColor: Colors.carbsBg,
  },
  rowEmoji: {
    fontSize: 24,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  rowSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  rowCal: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  rowCalUnit: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: "right",
    marginTop: -12,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textMuted,
    marginLeft: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginHorizontal: 14,
  },
  bottomSpacer: { height: 32 },
});
