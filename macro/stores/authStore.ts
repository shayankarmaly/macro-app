import { create } from "zustand";
import { UserProfile } from "@/types";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;

  // Actions
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name ?? "",
    avatarUrl: data.avatar_url ?? undefined,
    goals: { calories: 2000, protein: 114, carbs: 183, fat: 71 },
    createdAt: data.created_at,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,

  loadSession: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const profile = await fetchUserProfile(data.session.user.id);

        set({
          session: data.session,
          user: profile ?? null,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  signInWithEmail: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const profile = data.session?.user?.id
      ? await fetchUserProfile(data.session.user.id)
      : null;

    set({ session: data.session, user: profile });
  },

  signUpWithEmail: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        goals: { calories: 2000, protein: 114, carbs: 183, fat: 71 },
      });
    }

    const profile = data.user?.id ? await fetchUserProfile(data.user.id) : null;
    set({ session: data.session, user: profile });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
