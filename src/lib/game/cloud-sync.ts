import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { GameState } from "./engine";
import {
  adoptState,
  getState,
  hasUnsyncedChanges,
  markSynced,
  normalize,
  setLocalChangeListener,
} from "./store";
import { chooseCopy } from "./sync-rules";

export type SyncStatus = "signed-out" | "syncing" | "synced" | "error";
type SyncInfo = { status: SyncStatus; email: string | null; lastSynced: number | null };

let info: SyncInfo = { status: "signed-out", email: null, lastSynced: null };
let userId: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let started = false;
let syncing = false;
const listeners = new Set<() => void>();

function set(patch: Partial<SyncInfo>) {
  info = { ...info, ...patch };
  listeners.forEach((l) => l());
}

export function useSyncInfo(): SyncInfo {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => info,
    () => info,
  );
}

async function fetchCloud(): Promise<{ ok: boolean; state: GameState | null }> {
  if (!userId) return { ok: false, state: null };
  const { data, error } = await supabase
    .from("player_progress")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("Loading cloud progress failed", error);
    return { ok: false, state: null };
  }
  return { ok: true, state: data ? normalize(data.state) : null };
}

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void push(), 800);
}

async function push(): Promise<boolean> {
  if (!userId) return false;
  // Never upload while we're still deciding which copy is newest.
  if (syncing) {
    schedulePush();
    return false;
  }
  set({ status: "syncing" });
  const { error } = await supabase.from("player_progress").upsert({
    user_id: userId,
    state: getState() as unknown as Json,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("Saving cloud progress failed", error);
    set({ status: "error" });
    return false;
  }
  markSynced();
  set({ status: "synced", lastSynced: Date.now() });
  return true;
}

/** Bring this device and the cloud into agreement. */
export async function syncNow() {
  if (!userId || syncing) return;
  syncing = true;
  set({ status: "syncing" });
  try {
    const cloud = await fetchCloud();
    if (!cloud.ok) {
      set({ status: "error" });
      return;
    }
    if (chooseCopy(getState(), cloud.state, hasUnsyncedChanges()) === "upload") {
      syncing = false;
      await push();
    } else {
      adoptState(cloud.state);
      markSynced();
      set({ status: "synced", lastSynced: Date.now() });
    }
  } finally {
    syncing = false;
  }
}

function handleSession(session: Session | null) {
  const nextId = session?.user.id ?? null;
  if (nextId === userId) return;
  userId = nextId;
  if (!nextId) {
    set({ status: "signed-out", email: null, lastSynced: null });
    return;
  }
  set({ email: session?.user.email ?? null });
  void syncNow();
}

/** Call once on the client. Safe to call again. */
export function startCloudSync() {
  if (started || typeof window === "undefined") return;
  started = true;

  setLocalChangeListener(() => {
    if (userId) schedulePush();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN" && event !== "SIGNED_OUT") return;
    // Defer so auth callbacks never run database calls inside the auth lock.
    setTimeout(() => handleSession(session), 0);
  });
  void supabase.auth.getSession().then(({ data }) => handleSession(data.session));

  // Pick up progress made on another device, and retry anything saved while offline.
  window.addEventListener("online", () => void syncNow());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void syncNow();
  });
}

export async function signOut() {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
    await push();
  }
  await supabase.auth.signOut();
}
