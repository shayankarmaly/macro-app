import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isLoading, loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
      return;
    }

    if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isLoading, router, segments, session]);

  useEffect(() => {
    // Hide splash screen after fonts/assets load
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modals/voice-logging"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="modals/shortcuts"
          options={{
            headerShown: false,
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="modals/confirm-meal"
          options={{
            headerShown: false,
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
