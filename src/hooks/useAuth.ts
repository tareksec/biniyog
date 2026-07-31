import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

// ─── Singleton auth store ────────────────────────────────────────────
// Auth state is fetched ONCE and shared across all useAuth() consumers.
// Subsequent calls to useAuth() read from this in-memory cache instantly
// (no async re-check), eliminating the flash-of-broken-state on navigation.

interface AuthSnapshot {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

let snapshot: AuthSnapshot = { session: null, user: null, loading: true };
let listeners: Set<() => void> = new Set();
let initialized = false;

function emitChange() {
  // Create new reference so useSyncExternalStore detects the change
  snapshot = { ...snapshot };
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
  supabase.auth.getSession().then(({ data: { session } }) => {
    snapshot.session = session;
    snapshot.user = session?.user ?? null;
    snapshot.loading = false;
    emitChange();
  });

  // Listen for auth state changes (login, logout, token refresh)
  supabase.auth.onAuthStateChange((_event, session) => {
    snapshot.session = session;
    snapshot.user = session?.user ?? null;
    snapshot.loading = false;
    emitChange();
  });
}

// ─── Non-hook access (for beforeLoad, etc.) ─────────────────────────
// Returns the current auth snapshot synchronously. Safe to call outside
// of React components (e.g. in TanStack Router's beforeLoad).
export function getAuthSnapshot(): AuthSnapshot {
  return snapshot;
}

// ─── Hook ────────────────────────────────────────────────────────────

// Cached server snapshot to avoid React's "getServerSnapshot should be cached" warning
const serverSnapshot: AuthSnapshot = Object.freeze({
  session: null,
  user: null,
  loading: true,
});

export function useAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    [],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  return { ...state, signIn, signOut };
}
