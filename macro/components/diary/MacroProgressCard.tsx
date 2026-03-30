import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Macros } from "@/types";

interface MacroRowProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  trackColor: string;
}

function MacroRow({ label, current, goal, unit, color, trackColor }: MacroRowProps) {
  const pct = Math.min(current / goal, 1);
  const displayPct = Math.round(pct * 100);

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <View style={styles.rowRight}>
          <Text style={[styles.macroValues]}>
            <Text style={styles.currentValue}>
              {current.toFixed(1)}
            </Text>
            <Text style={styles.divider}> / </Text>
            <Text style={styles.goalValue}>
              {goal.toFixed(1)} {unit}
            </Text>
          </Text>
          <Text style={[styles.pctBadge, { color }]}>{displayPct}%</Text>
        </View>
      </View>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            { width: `${displayPct}%` as any, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

interface MacroProgressCardProps {
  totals: Macros;
  goals: Macros;
}

export function MacroProgressCard({ totals, goals }: MacroProgressCardProps) {
  return (
    <View style={styles.card}>
      <MacroRow
        label="Energy"
        current={totals.calories}
        goal={goals.calories}
        unit="kcal"
        color={Colors.energy}
        trackColor={Colors.energyTrack}
      />
      <MacroRow
        label="Protein"
        current={totals.protein}
        goal={goals.protein}
        unit="g"
        color={Colors.protein}
        trackColor={Colors.proteinTrack}
      />
      <MacroRow
        label="Net Carbs"
        current={totals.carbs}
        goal={goals.carbs}
        unit="g"
        color={Colors.carbs}
        trackColor={Colors.carbsTrack}
      />
      <MacroRow
        label="Fat"
        current={totals.fat}
        goal={goals.fat}
        unit="g"
        color={Colors.fat}
        trackColor={Colors.fatTrack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    gap: 6,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  macroValues: {
    fontSize: 13,
  },
  currentValue: {
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  divider: {
    color: Colors.textMuted,
  },
  goalValue: {
    color: Colors.textSecondary,
  },
  pctBadge: {
    fontSize: 13,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },
  track: {
    height: 7,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});
