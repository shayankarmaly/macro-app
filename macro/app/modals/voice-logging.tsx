import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { VoiceState } from "@/types";
import { useDiaryStore } from "@/stores/diaryStore";
import { MOCK_FOODS } from "@/data/mockData";

// ─── Ripple animation ────────────────────────────────────────────────────────

function RippleCircle({
  delay,
  size,
  opacity,
}: {
  delay: number;
  size: number;
  opacity: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const animScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });
  const animOpacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [opacity, opacity * 0.6, 0],
  });

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `rgba(255,255,255,${opacity})`,
          transform: [{ scale: animScale }],
          opacity: animOpacity,
        },
      ]}
    />
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function VoiceLoggingScreen() {
  const [voiceState, setVoiceState] = useState<VoiceState>("listening");
  const [transcript, setTranscript] = useState<string>(
    "Grilled salmon with roasted vegetables"
  );
  const { setPendingMeal } = useDiaryStore();

  // Simulate voice processing after 3 seconds (demo mode)
  useEffect(() => {
    if (voiceState === "listening") {
      const timer = setTimeout(() => {
        setVoiceState("processing");
        setTimeout(() => {
          setVoiceState("done");
          setTranscript("Grilled salmon with roasted vegetables and quinoa");
        }, 1200);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [voiceState]);

  const handleCancel = () => {
    router.back();
  };

  const handleDone = () => {
    if (voiceState !== "done") return;

    // Map transcript to a food (in real app, call parseVoiceTranscript + searchFoods)
    const matchedFood = MOCK_FOODS.find((f) =>
      f.name.toLowerCase().includes("salmon")
    ) ?? MOCK_FOODS[0];

    setPendingMeal({
      food: matchedFood,
      method: "voice",
      mealType: "dinner",
      quantity: 1,
    });

    router.push({
      pathname: "/modals/confirm-meal",
      params: {
        payload: JSON.stringify({
          food: matchedFood,
          method: "voice",
          mealType: "dinner",
          quantity: 1,
        }),
      },
    });
  };

  const stateLabel =
    voiceState === "listening"
      ? "Listening..."
      : voiceState === "processing"
      ? "Processing..."
      : "Done! Tap to confirm";

  const stateSubtitle =
    voiceState === "listening"
      ? "Speak naturally"
      : voiceState === "processing"
      ? "Matching food..."
      : "Review your meal below";

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* Close button */}
        <View style={styles.topRow}>
          <View style={styles.spacer} />
          <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Microphone area */}
        <View style={styles.micContainer}>
          {/* Ripple rings */}
          {voiceState === "listening" && (
            <>
              <RippleCircle delay={0} size={200} opacity={0.12} />
              <RippleCircle delay={400} size={160} opacity={0.18} />
              <RippleCircle delay={800} size={120} opacity={0.25} />
            </>
          )}

          {/* Mic button */}
          <TouchableOpacity
            onPress={voiceState === "done" ? handleDone : undefined}
            style={[
              styles.micBtn,
              voiceState === "done" && styles.micBtnDone,
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.micIcon}>🎙️</Text>
          </TouchableOpacity>
        </View>

        {/* State label */}
        <Text style={styles.stateLabel}>{stateLabel}</Text>
        <Text style={styles.stateSubtitle}>{stateSubtitle}</Text>

        {/* Transcript card */}
        <View style={styles.transcriptCard}>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>

        {/* Example hint */}
        <Text style={styles.exampleText}>
          Example: "Grilled chicken with broccoli" or "Large coffee with milk"
        </Text>

        {/* Cancel button */}
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  safe: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 8,
    marginBottom: 20,
  },
  spacer: { flex: 1 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  micContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  ripple: {
    position: "absolute",
  },
  micBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  micBtnDone: {
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  micIcon: {
    fontSize: 44,
  },
  stateLabel: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
    letterSpacing: -0.3,
  },
  stateSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    marginBottom: 24,
  },
  transcriptCard: {
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  transcriptText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 26,
  },
  exampleText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  cancelBtn: {
    marginTop: "auto",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
