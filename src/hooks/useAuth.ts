import { useCallback, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/database.types";

// ─── Singleton auth store ────────────────────────────────────────────
// Auth state and user profile are fetched and shared across all useAuth() consumers.

export interface AuthSnapshot {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

let snapshot: AuthSnapshot = { session: null, user: null, profile: null, loading: true };
const listeners: Set<() => void> = new Set();
let initialized = false;
let profileSubscriptionChannel: any = null;

function notifyListeners() {
  listeners.forEach((l) => l());
}

async function fetchUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[useAuth] Failed to fetch profile:", error.message);
      return null;
    }
    return data as Profile | null;
  } catch (err) {
    console.error("[useAuth] Error fetching profile:", err);
    return null;
  }
}

function setupProfileRealtime(userId: string) {
  if (profileSubscriptionChannel) {
    supabase.removeChannel(profileSubscriptionChannel);
    profileSubscriptionChannel = null;
  }

  profileSubscriptionChannel = supabase
    .channel(`public:profiles:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        console.log("[useAuth] Realtime profile update received:", payload);
        if (payload.new && typeof payload.new === "object") {
          snapshot = {
            ...snapshot,
            profile: payload.new as Profile,
          };
          notifyListeners();
        }
      }
    )
    .subscribe();
}

async function syncAuthState(session: Session | null) {
  if (!session?.user) {
    if (profileSubscriptionChannel) {
      supabase.removeChannel(profileSubscriptionChannel);
      profileSubscriptionChannel = null;
    }

    snapshot = {
      session: null,
      user: null,
      profile: null,
      loading: false,
    };
    notifyListeners();
    return;
  }

  // Set session & user immediately
  snapshot = {
    session,
    user: session.user,
    profile: snapshot.profile && snapshot.profile.id === session.user.id ? snapshot.profile : null,
    loading: false,
  };
  notifyListeners();

  // Setup realtime listener for instant status approval updates
  setupProfileRealtime(session.user.id);

  // Fetch complete profile with status
  const profile = await fetchUserProfile(session.user.id);
  snapshot = {
    session,
    user: session.user,
    profile,
    loading: false,
  };
  notifyListeners();
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
      syncAuthState(session);
    })
    .catch((err) => {
      console.error("[useAuth] getSession unexpected error:", err);
      syncAuthState(null);
    });

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(`[useAuth] onAuthStateChange: ${event}`, {
      userId: session?.user?.id,
      email: session?.user?.email,
    });
    syncAuthState(session);
  });
}

// ─── Non-hook access (for beforeLoad, etc.) ─────────────────────────
export function getAuthSnapshot(): AuthSnapshot {
  return snapshot;
}

// Cached server snapshot
const serverSnapshot: AuthSnapshot = Object.freeze({
  session: null,
  user: null,
  profile: null,
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
    await syncAuthState(data.session);
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
        await syncAuthState(data.session);
      }
      return data;
    },
    []
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await syncAuthState(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (snapshot.user) {
      const profile = await fetchUserProfile(snapshot.user.id);
      snapshot = { ...snapshot, profile };
      notifyListeners();
      return profile;
    }
    return null;
  }, []);

  const refreshSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    await syncAuthState(session);
    return session;
  }, []);

  const userStatus: "pending" | "approved" = state.profile?.status || "pending";
  const isApproved = userStatus === "approved";

  return {
    ...state,
    session: state.session,
    user: state.user,
    profile: state.profile,
    status: userStatus,
    isApproved,
    loading: state.loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    refreshSession,
  };
}
