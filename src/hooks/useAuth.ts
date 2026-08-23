import { useCallback, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

// ─── Singleton auth store ────────────────────────────────────────────
// Auth state is fetched ONCE and shared across all useAuth() consumers.
// Subsequent calls to useAuth() read from this in-memory cache instantly
// (no async re-check), eliminating the flash-of-broken-state on navigation.

export interface AuthSnapshot {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

let snapshot: AuthSnapshot = { session: null, user: null, loading: true };
const listeners: Set<() => void> = new Set();
let initialized = false;

function setSnapshot(session: Session | null) {
  snapshot = {
    session,
    user: session?.user ?? null,
    loading: false,
  };
  listeners.forEach((l) => l());
}

function getSnapshot(): AuthSnapshot {
  return snapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Initialize once on first import (client-side only)
if (typeof window !== "undefined" && !initialized) {
  initialized = true;

  // Get initial session
  supabase.auth
    .getSession()
    .then(({ data: { session }, error }) => {
      if (error) {
        console.error("[useAuth] getSession error:", error);
      }
      setSnapshot(session);
    })
    .catch((err) => {
      console.error("[useAuth] getSession unexpected error:", err);
      setSnapshot(null);
    });

  // Listen for auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, INITIAL_SESSION)
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(`[useAuth] onAuthStateChange event: ${event}`, {
      userId: session?.user?.id,
      email: session?.user?.email,
    });
    setSnapshot(session);
  });
}

// ─── Non-hook access (for beforeLoad, etc.) ─────────────────────────
// Returns the current auth snapshot synchronously. Safe to call outside
// of React components (e.g. in TanStack Router's beforeLoad).
export function getAuthSnapshot(): AuthSnapshot {
  return snapshot;
}

// Cached server snapshot to avoid React's "getServerSnapshot should be cached" warning
const serverSnapshot: AuthSnapshot = Object.freeze({
  session: null,
  user: null,
  loading: true,
});

export function useAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setSnapshot(data.session);
    return data;
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata?: { full_name?: string; phone?: string }
    ) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;
      if (data.session) {
        setSnapshot(data.session);
      }
      return data;
    },
    []
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSnapshot(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSnapshot(session);
    return session;
  }, []);

  return {
    ...state,
    session: state.session,
    user: state.user,
    loading: state.loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
}
