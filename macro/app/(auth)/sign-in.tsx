import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/authStore";

export default function SignInScreen() {
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (isSubmitting) return;

    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signInWithEmail(email.trim(), password);
    } catch (err: any) {
      setError(err?.message ?? "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue tracking.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            style={styles.input}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleSignIn}
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New here?</Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Create account</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    gap: 24,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  footerText: {
    color: Colors.textSecondary,
  },
  footerLink: {
    color: Colors.primaryDark,
    fontWeight: "700",
  },
});

