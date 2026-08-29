import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { GrammarCompletion, LearningSession, ProgressItem } from "../types/Progress";
import { getProgressSnapshot, replaceProgressSnapshot, clearPendingProgressSync, exportProgress, clearLocalProgress, notifyProgressSnapshotChanged } from "../utils/progressRepository";
import { mergeProgressSnapshots } from "../utils/progressSync";
import { isSupabaseConfigured, supabase } from "../services/supabaseClient";

export type SyncStatus = "offline" | "idle" | "syncing" | "synced" | "error";

interface AccountContextValue {
  configured: boolean;
  user: User | null;
  username: string | null;
  syncStatus: SyncStatus;
  lastSyncedAt?: number;
  error?: string;
  createAccount: (input: { username: string; recoveryEmail: string; password: string; inviteKey: string }) => Promise<{ error?: string }>;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
  exportAccountData: () => void;
  deleteCloudAccount: () => Promise<{ error?: string }>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

const toItemRow = (userId: string, item: ProgressItem) => ({
  user_id: userId,
  domain: item.domain,
  item_id: item.itemId,
  correct: item.correct,
  incorrect: item.incorrect,
  streak: item.streak,
  mastery_score: item.masteryScore,
  mastered: item.mastered ?? false,
  last_trained_at: item.lastTrainedAt ? new Date(item.lastTrainedAt).toISOString() : null,
  mastered_at: item.masteredAt ? new Date(item.masteredAt).toISOString() : null,
});

const fromItemRow = (row: Record<string, unknown>): ProgressItem => ({
  domain: row.domain as ProgressItem["domain"],
  itemId: String(row.item_id),
  correct: Number(row.correct ?? 0),
  incorrect: Number(row.incorrect ?? 0),
  streak: Number(row.streak ?? 0),
  masteryScore: Number(row.mastery_score ?? 0),
  mastered: row.mastered === undefined
    ? Number(row.mastery_score ?? 0) >= 100
    : Boolean(row.mastered),
  lastTrainedAt: row.last_trained_at ? Date.parse(String(row.last_trained_at)) : undefined,
  masteredAt: row.mastered_at ? Date.parse(String(row.mastered_at)) : undefined,
});

const toSessionRow = (userId: string, session: LearningSession) => ({
  id: session.id,
  user_id: userId,
  domain: session.domain,
  mode: session.mode,
  source: session.source ?? null,
  started_at: new Date(session.startedAt).toISOString(),
  completed_at: new Date(session.completedAt).toISOString(),
  total: session.total,
  correct: session.correct,
  incorrect: session.incorrect,
  accuracy: session.accuracy,
});

const fromSessionRow = (row: Record<string, unknown>): LearningSession => ({
  id: String(row.id),
  domain: row.domain as LearningSession["domain"],
  mode: String(row.mode),
  source: row.source ? String(row.source) : undefined,
  startedAt: Date.parse(String(row.started_at)),
  completedAt: Date.parse(String(row.completed_at)),
  total: Number(row.total ?? 0),
  correct: Number(row.correct ?? 0),
  incorrect: Number(row.incorrect ?? 0),
  accuracy: Number(row.accuracy ?? 0),
});

const toGrammarCompletionRow = (userId: string, completion: GrammarCompletion) => ({
  user_id: userId,
  track_id: completion.trackId,
  lesson_id: completion.lessonId,
  part_id: completion.partId,
  completed_at: new Date(completion.completedAt).toISOString(),
});

const fromGrammarCompletionRow = (row: Record<string, unknown>): GrammarCompletion => {
  const completedAt = Date.parse(String(row.completed_at ?? ""));
  return {
    trackId: String(row.track_id),
    lessonId: String(row.lesson_id),
    partId: String(row.part_id),
    completedAt: Number.isFinite(completedAt) ? completedAt : 0,
  };
};

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isSupabaseConfigured ? "idle" : "offline");
  const [lastSyncedAt, setLastSyncedAt] = useState<number>();
  const [error, setError] = useState<string>();

  const loadUsername = useCallback(async (nextUser: User | null) => {
    if (!supabase || !nextUser) { setUsername(null); return; }
    const { data } = await supabase.from("profiles").select("username").eq("user_id", nextUser.id).maybeSingle();
    setUsername(typeof data?.username === "string" ? data.username : null);
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user ?? null); void loadUsername(data.user ?? null); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      void loadUsername(nextUser);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [loadUsername]);

  const createAccount = useCallback(async ({ username: requestedUsername, recoveryEmail, password, inviteKey }: { username: string; recoveryEmail: string; password: string; inviteKey: string }) => {
    if (!supabase) return { error: "auth.errors.notConfigured" };
    setError(undefined);
    const normalizedUsername = requestedUsername.trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,24}$/.test(normalizedUsername)) return { error: "auth.errors.invalidUsername" };
    if (password.length < 8) return { error: "auth.errors.passwordLength" };
    if (!recoveryEmail.trim() || !inviteKey.trim()) return { error: "auth.errors.required" };
    const { error: functionError } = await supabase.functions.invoke("create-account", { body: { username: normalizedUsername, recoveryEmail: recoveryEmail.trim(), password, inviteKey: inviteKey.trim() } });
    if (functionError) {
      let serverCode = "";
      const response = (functionError as { context?: unknown }).context;
      if (response instanceof Response) {
        try {
          const payload = await response.clone().json() as { error?: string };
          serverCode = payload.error ?? "";
        } catch { /* Keep the generic message when the response is not JSON. */ }
      }
      if (serverCode === "username_taken") return { error: "auth.errors.usernameTaken" };
      if (serverCode === "invite_invalid_or_used") return { error: "auth.errors.invalidKey" };
      if (serverCode === "database_not_ready") return { error: "auth.errors.databaseNotReady" };
      return { error: "auth.errors.createFailed" };
    }
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: recoveryEmail.trim(), password });
    if (signInError || !data.user) return { error: "auth.errors.signInAfterCreate" };
    setUser(data.user);
    await loadUsername(data.user);
    return {};
  }, [loadUsername]);

  const login = useCallback(async (requestedUsername: string, password: string) => {
    if (!supabase) return { error: "auth.errors.notConfigured" };
    setError(undefined);
    const normalizedUsername = requestedUsername.trim().toLowerCase();
    if (!normalizedUsername || !password) return { error: "auth.errors.invalidLogin" };
    const { data: email, error: lookupError } = await supabase.rpc("resolve_username_email", { p_username: normalizedUsername });
    if (lookupError || typeof email !== "string" || !email) return { error: "auth.errors.invalidLogin" };
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !sessionData.user) return { error: "auth.errors.invalidLogin" };
    setUser(sessionData.user);
    await loadUsername(sessionData.user);
    return {};
  }, [loadUsername]);

  const signOut = useCallback(async () => { if (supabase) await supabase.auth.signOut(); setUser(null); setUsername(null); setSyncStatus(isSupabaseConfigured ? "idle" : "offline"); }, []);

  const syncNow = useCallback(async () => {
    if (!supabase || !user) return;
    setSyncStatus("syncing");
    setError(undefined);
    const local = getProgressSnapshot();
    const [itemsResponse, sessionsResponse, grammarCompletionsResponse, settingsResponse] = await Promise.all([
      supabase.from("progress_items").select("*").eq("user_id", user.id),
      supabase.from("learning_sessions").select("*").eq("user_id", user.id),
      supabase.from("grammar_completions").select("*").eq("user_id", user.id),
      supabase.from("user_settings").select("settings").eq("user_id", user.id).maybeSingle(),
    ]);
    if (itemsResponse.error || sessionsResponse.error || grammarCompletionsResponse.error || settingsResponse.error) { setSyncStatus("error"); setError(itemsResponse.error?.message ?? sessionsResponse.error?.message ?? grammarCompletionsResponse.error?.message ?? settingsResponse.error?.message); return; }
    const merged = mergeProgressSnapshots(local, (itemsResponse.data ?? []).map((row) => fromItemRow(row as Record<string, unknown>)), (sessionsResponse.data ?? []).map((row) => fromSessionRow(row as Record<string, unknown>)), (grammarCompletionsResponse.data ?? []).map((row) => fromGrammarCompletionRow(row as Record<string, unknown>)));
    const itemRows = Object.values(merged.items).map((item) => toItemRow(user.id, item));
    const sessionRows = Object.values(merged.sessions).map((session) => toSessionRow(user.id, session));
    const grammarCompletionRows = Object.values(merged.grammarCompletions).map((completion) => toGrammarCompletionRow(user.id, completion));
    const localSettings = window.localStorage.getItem("app_settings");
    const settingsPayload = localSettings ? JSON.parse(localSettings) as Record<string, unknown> : (settingsResponse.data?.settings as Record<string, unknown> | undefined) ?? {};
    if (!localSettings && settingsResponse.data?.settings) window.localStorage.setItem("app_settings", JSON.stringify(settingsResponse.data.settings));
    const [itemUpsert, sessionUpsert, grammarCompletionUpsert, settingsUpsert] = await Promise.all([supabase.from("progress_items").upsert(itemRows, { onConflict: "user_id,domain,item_id" }), supabase.from("learning_sessions").upsert(sessionRows, { onConflict: "id" }), supabase.from("grammar_completions").upsert(grammarCompletionRows, { onConflict: "user_id,track_id,lesson_id,part_id" }), supabase.from("user_settings").upsert({ user_id: user.id, settings: settingsPayload, updated_at: new Date().toISOString() }, { onConflict: "user_id" })]);
    if (itemUpsert.error || sessionUpsert.error || grammarCompletionUpsert.error || settingsUpsert.error) { setSyncStatus("error"); setError(itemUpsert.error?.message ?? sessionUpsert.error?.message ?? grammarCompletionUpsert.error?.message ?? settingsUpsert.error?.message); return; }
    replaceProgressSnapshot(merged, { emitChange: false });
    clearPendingProgressSync();
    notifyProgressSnapshotChanged();
    setLastSyncedAt(Date.now());
    setSyncStatus("synced");
  }, [user]);

  useEffect(() => { if (user) void syncNow(); }, [syncNow, user]);
  useEffect(() => {
    const handleOnline = () => { if (user) void syncNow(); };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncNow, user]);
  useEffect(() => {
    if (!user) return undefined;
    let timer: number | undefined;
    const scheduleSync = () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => { void syncNow(); }, 1200);
    };
    window.addEventListener("kana-progress-updated", scheduleSync);
    window.addEventListener("focus", scheduleSync);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("kana-progress-updated", scheduleSync);
      window.removeEventListener("focus", scheduleSync);
    };
  }, [syncNow, user]);

  const exportAccountData = useCallback(() => {
    const blob = new Blob([JSON.stringify(exportProgress(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `kana-progress-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  }, []);

  const deleteCloudAccount = useCallback(async () => {
    if (!supabase || !user) return { error: "No active account." };
    const { error: functionError } = await supabase.functions.invoke("delete-account");
    if (functionError) {
      const { error: rpcError } = await supabase.rpc("delete_my_account_data");
      if (rpcError) return { error: rpcError.message };
    }
    clearLocalProgress();
    await supabase.auth.signOut();
    setUser(null);
    setUsername(null);
    return {};
  }, [user]);

  const value = useMemo(() => ({ configured: isSupabaseConfigured, user, username, syncStatus, lastSyncedAt, error, createAccount, login, signOut, syncNow, exportAccountData, deleteCloudAccount }), [createAccount, deleteCloudAccount, error, exportAccountData, lastSyncedAt, login, signOut, syncNow, syncStatus, user, username]);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccount must be used within AccountProvider");
  return context;
};
