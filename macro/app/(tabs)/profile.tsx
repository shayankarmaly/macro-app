import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useDiaryStore } from "@/stores/diaryStore";
import { MOCK_GOALS } from "@/data/mockData";

interface GoalRowProps {
  label: string;
  value: number;
  unit: string;
  color: string;
}

function GoalRow({ label, value, unit, color }: GoalRowProps) {
  return (
    <View style={styles.goalRow}>
      <View style={[styles.goalDot, { backgroundColor: color }]} />
      <Text style={styles.goalLabel}>{label}</Text>
      <Text style={styles.goalValue}>
        {value} {unit}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { goals } = useDiaryStore();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.userName}>Shayan</Text>
          <Text style={styles.userEmail}>shayan.karmaly@gmail.com</Text>
        </View>

        {/* Goals card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Goals</Text>
          <GoalRow
            label="Calories"
            value={goals.calories}
            unit="kcal"
            color={Colors.energy}
          />
          <View style={styles.cardDivider} />
          <GoalRow
            label="Protein"
            value={goals.protein}
            unit="g"
            color={Colors.protein}
          />
          <View style={styles.cardDivider} />
          <GoalRow
            label="Net Carbs"
            value={goals.carbs}
            unit="g"
            color={Colors.carbs}
          />
          <View style={styles.cardDivider} />
          <GoalRow
            label="Fat"
            value={goals.fat}
            unit="g"
            color={Colors.fat}
          />
        </View>

        {/* Settings card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          {["Edit Goals", "Notifications", "Units", "Privacy Policy"].map(
            (item, idx, arr) => (
              <React.Fragment key={item}>
                <TouchableOpacity style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>{item}</Text>
                  <Text style={styles.settingsChevron}>›</Text>
                </TouchableOpacity>
                {idx < arr.length - 1 && (
                  <View style={styles.cardDivider} />
                )}
              </React.Fragment>
            )
          )}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    gap: 16,
    paddingTop: 8,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 4,
  },
  avatarEmoji: { fontSize: 40 },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  goalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  goalLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  goalValue: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  settingsChevron: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  signOutBtn: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.protein,
  },
});
