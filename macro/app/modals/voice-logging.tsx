import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Audio } from "expo-av";
import { Colors } from "@/constants/colors";
import { MealType, VoiceState } from "@/types";
import { useDiaryStore } from "@/stores/diaryStore";
import {
  parseVoiceTranscript,
  searchFoods,
  transcribeVoiceAudio,
} from "@/lib/api/foods";

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
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<string>(
    'Tap the mic to start (say: "2 servings grilled salmon")'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [suggestedMeal, setSuggestedMeal] = useState<{
    food: any;
    quantity: number;
    mealType: MealType;
  } | null>(null);
  const { setPendingMeal } = useDiaryStore();

  const openAiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  useEffect(() => {
    return () => {
      // Ensure recording is cleaned up if user closes the modal mid-recording.
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, [recording]);

  const deriveMealType = (): MealType => {
    const hour = new Date().getHours();
    if (hour < 11) return "breakfast";
    if (hour < 16) return "lunch";
    if (hour < 21) return "dinner";
    return "snacks";
  };

  const startListening = async () => {
    setErrorMessage(null);
    setSuggestedMeal(null);

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      setVoiceState("error");
      setErrorMessage("Microphone permission is required for voice logging.");
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setVoiceState("listening");
      setTranscript("Listening...");
    } catch {
      setVoiceState("error");
      setErrorMessage("Could not start recording.");
    }
  };

  const stopAndProcessRecording = async () => {
    if (!recording) return;

    setVoiceState("processing");

    try {
      await recording.stopAndUnloadAsync();
      const audioUri = recording.getURI();
      setRecording(null);

      if (!audioUri) {
        throw new Error("No audio captured.");
      }

      if (!openAiKey) {
        throw new Error("Missing OpenAI API key in .env.");
      }

      const spokenText = await transcribeVoiceAudio(audioUri, openAiKey);
      if (!spokenText) {
        throw new Error("Could not transcribe audio.");
      }
      setTranscript(spokenText);

      const parsed = await parseVoiceTranscript(spokenText, openAiKey);
      const quantity =
        parsed && Number.isFinite(parsed.quantity) && parsed.quantity > 0
          ? parsed.quantity
          : 1;
      const query = parsed?.name || spokenText;

      let foods = await searchFoods(query);
      if (!foods.length && query !== spokenText) {
        foods = await searchFoods(spokenText);
      }
      if (!foods.length) {
        throw new Error("No matching foods found.");
      }

      setSuggestedMeal({
        food: foods[0],
        quantity,
        mealType: deriveMealType(),
      });
      setVoiceState("done");
    } catch (err: any) {
      setVoiceState("error");
      setErrorMessage(err?.message ?? "Voice logging failed.");
    }
  };

  const handleCancel = () => {
    if (recording) {
      recording.stopAndUnloadAsync().catch(() => undefined);
    }
    router.back();
  };

  const handleDone = () => {
    if (voiceState !== "done" || !suggestedMeal) return;

    setPendingMeal({
      food: suggestedMeal.food,
      method: "voice",
      mealType: suggestedMeal.mealType,
      quantity: suggestedMeal.quantity,
    });

    router.push({
      pathname: "/modals/confirm-meal",
      params: {
        payload: JSON.stringify({
          food: suggestedMeal.food,
          method: "voice",
          mealType: suggestedMeal.mealType,
          quantity: suggestedMeal.quantity,
        }),
      },
    });
  };

  const handleMicPress = async () => {
    if (voiceState === "processing") return;
    if (voiceState === "done") {
      handleDone();
      return;
    }
    if (voiceState === "listening") {
      await stopAndProcessRecording();
      return;
    }
    await startListening();
  };

  const stateLabel =
    voiceState === "idle"
      ? "Ready"
      : voiceState === "listening"
      ? "Listening... Tap again to stop"
      : voiceState === "processing"
      ? "Processing..."
      : voiceState === "done"
      ? "Done! Tap to confirm"
      : "Voice logging error";

  const stateSubtitle =
    voiceState === "idle"
      ? "Speak naturally after tapping the mic"
      : voiceState === "listening"
      ? "Speak naturally"
      : voiceState === "processing"
      ? "Transcribing and matching food..."
      : voiceState === "done"
      ? "Review your meal below"
      : errorMessage ?? "Try again";

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
            onPress={handleMicPress}
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

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

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
  errorText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
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
