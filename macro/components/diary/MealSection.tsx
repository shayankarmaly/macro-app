import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Colors } from "@/constants/colors";
import { FoodItem } from "@/components/diary/FoodItem";
import { MealEntry, MealType } from "@/types";
import { getMealLabel } from "@/data/mockData";

interface MealSectionProps {
  mealType: MealType;
  entries: MealEntry[];
  onAdd?: () => void;
  onEditEntry?: (entry: MealEntry) => void;
}

export function MealSection({
  mealType,
  entries,
  onAdd,
  onEditEntry,
}: MealSectionProps) {
  const totalCalories = entries.reduce(
    (sum, e) => sum + (e.macros?.calories ?? 0),
    0
  );
  const label = getMealLabel(mealType);
  const hasEntries = entries.length > 0;

  return (
    <View style={styles.section}>
      {/* Section header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={onAdd}
            style={styles.addBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>{label}</Text>
        </View>
        <Text style={styles.sectionCalories}>{totalCalories} kcal</Text>
      </View>

      {/* Food entries */}
      {hasEntries && (
        <View style={styles.card}>
          {entries.map((entry, idx) => (
            <React.Fragment key={entry.id}>
              <FoodItem entry={entry} onEdit={onEditEntry} />
              {idx < entries.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: {
    color: Colors.textOnPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "400",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  sectionCalories: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginHorizontal: 14,
  },
});
