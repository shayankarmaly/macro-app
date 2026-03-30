import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

// ─── Custom Tab Icon ──────────────────────────────────────────────────────────

function TabIcon({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={tabStyles.container}>
      <Text style={[tabStyles.emoji, focused && tabStyles.emojiActive]}>
        {emoji}
      </Text>
      <Text
        style={[
          tabStyles.label,
          focused ? tabStyles.labelActive : tabStyles.labelInactive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 2,
    paddingTop: 4,
  },
  emoji: {
    fontSize: 22,
    opacity: 0.55,
  },
  emojiActive: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
  },
  labelActive: {
    color: Colors.primary,
  },
  labelInactive: {
    color: Colors.textMuted,
  },
});

// ─── Tab Layout ───────────────────────────────────────────────────────────────

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: Colors.border,
          height: Platform.OS === "ios" ? 82 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 6,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📖" label="Diary" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔍" label="Explore" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
