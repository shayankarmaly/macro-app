export const Colors = {
  // Backgrounds
  background: "#F0F2F5",
  card: "#FFFFFF",
  cardBorder: "#F3F4F6",

  // Primary brand
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  primaryLight: "#EFF6FF",

  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textOnPrimary: "#FFFFFF",

  // Macro colors
  energy: "#22C55E",
  energyBg: "#DCFCE7",
  energyTrack: "#D1FAE5",

  protein: "#EF4444",
  proteinBg: "#FEE2E2",
  proteinTrack: "#FECACA",

  carbs: "#3B82F6",
  carbsBg: "#DBEAFE",
  carbsTrack: "#BFDBFE",

  fat: "#F59E0B",
  fatBg: "#FEF3C7",
  fatTrack: "#FDE68A",

  // UI elements
  border: "#E5E7EB",
  divider: "#F3F4F6",
  placeholder: "#D1D5DB",
  inputBg: "#F9FAFB",

  // Shortcut pill background
  shortcutBg: "#EDE9FE",
  shortcutIcon: "#7C3AED",

  // Overlay / modal
  overlay: "rgba(0,0,0,0.5)",

  // Status
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",

  // Voice screen
  voicePrimary: "#3B82F6",
  voiceRipple1: "rgba(255,255,255,0.2)",
  voiceRipple2: "rgba(255,255,255,0.12)",
  voiceRipple3: "rgba(255,255,255,0.06)",
  voiceTranscriptBg: "rgba(255,255,255,0.15)",
} as const;

export type ColorKey = keyof typeof Colors;
