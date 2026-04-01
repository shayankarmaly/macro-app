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

export default function SignUpScreen() {
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (isSubmitting) return;

    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Fill out all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signUpWithEmail(email.trim(), password, name.trim());
    } catch (err: any) {
      setError(err?.message ?? "Could not create account.");
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Set up your Macro Tracker profile.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
          />

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

          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            style={styles.input}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleSignUp}
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Sign in</Text>
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

