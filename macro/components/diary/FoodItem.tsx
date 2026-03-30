import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { MealEntry } from "@/types";

interface FoodItemProps {
  entry: MealEntry;
  onEdit?: (entry: MealEntry) => void;
}

export function FoodItem({ entry, onEdit }: FoodItemProps) {
  const time = new Date(entry.loggedAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <View style={styles.container}>
      {/* Emoji icon */}
      <View style={styles.iconWrapper}>
        <Text style={styles.emoji}>{entry.food.emoji}</Text>
      </View>

      {/* Name + time */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {entry.food.name}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>

      {/* Calories + edit */}
      <View style={styles.right}>
        <Text style={styles.calories}>{entry.macros.calories}</Text>
        <Text style={styles.kcalUnit}>kcal</Text>
        {onEdit && (
          <TouchableOpacity
            onPress={() => onEdit(entry)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.editBtn}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  right: {
    alignItems: "flex-end",
    gap: 2,
  },
  calories: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  kcalUnit: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  editBtn: {
    marginTop: 4,
  },
  editIcon: {
    fontSize: 14,
  },
});
