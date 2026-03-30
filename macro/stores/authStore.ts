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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,

  loadSession: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

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
    set({ session: data.session });
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
    set({ session: data.session });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
