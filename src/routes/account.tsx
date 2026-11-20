import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Cloud, CloudOff, Loader2, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/system/Booting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { signOut, syncNow, useSyncInfo } from "@/lib/game/cloud-sync";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Cloud Save — ARISE Fitness System" },
      { name: "description", content: "Sign in to save your training online and continue on any device." },
      { property: "og:title", content: "Cloud Save — ARISE Fitness System" },
      { property: "og:description", content: "Sign in to save your training online and continue on any device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const sync = useSyncInfo();
  return (
    <div className="mx-auto max-w-md">
      <PageTitle kicker="Cloud Save" title="Train on Any Device" />
      {sync.status === "checking" ? (
        <div className="system-panel flex items-center justify-center p-10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : sync.status === "signed-out" ? (
        <AuthForm />
      ) : (
        <SignedIn />
      )}
    </div>
  );
}

function SignedIn() {
  const sync = useSyncInfo();
  const label =
    sync.status === "syncing"
      ? "Saving to the cloud…"
      : sync.status === "error"
        ? "Couldn't reach the cloud. Progress is safe on this device and will upload when you're back online."
        : "All progress is saved online.";
  return (
    <div className="system-panel space-y-5 p-6">
      <div>
        <p className="system-label">Signed in as</p>
        <p className="mt-1 break-all text-lg font-semibold">{sync.email}</p>
      </div>
      <div className="flex items-start gap-3 border border-border bg-muted/40 p-4 text-sm">
        {sync.status === "syncing" ? (
          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
        ) : sync.status === "error" ? (
          <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        ) : (
          <Cloud className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        )}
        <span>{label}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Sign in with this email on your phone, laptop or any browser and your level, stats, streak and poses follow you.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="system" className="flex-1" onClick={() => void syncNow()} disabled={sync.status === "syncing"}>
          <RefreshCw /> Sync now
        </Button>
        <Button variant="ghost" className="flex-1" onClick={() => void signOut()}>
          <LogOut /> Sign out
        </Button>
      </div>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("[SYSTEM] Signed in. Loading your progress…");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/account` },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your email and click the confirmation link, then sign in here. Your training on this device will be uploaded.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice("If that email has an account, a password reset link is on its way.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="system-panel p-6">
      <p className="text-sm text-muted-foreground">
        Your training is already saved on this device. Sign in to also save it online and continue on any device.
      </p>
      {notice && <p className="mt-4 border border-success/50 bg-success/10 p-3 text-sm">{notice}</p>}
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {mode !== "forgot" && (
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}
        <Button type="submit" variant="system" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
        </Button>
      </form>
      <div className="mt-4 flex flex-col items-center gap-2 text-sm">
        {mode === "signin" ? (
          <>
            <button type="button" className="text-primary hover:underline" onClick={() => setMode("signup")}>
              New player? Create an account
            </button>
            <button type="button" className="text-muted-foreground hover:underline" onClick={() => setMode("forgot")}>
              Forgot password?
            </button>
          </>
        ) : (
          <button type="button" className="text-primary hover:underline" onClick={() => setMode("signin")}>
            Already have an account? Sign in
          </button>
        )}
        <Link to="/" className="mt-2 text-muted-foreground hover:underline">
          Keep training without an account
        </Link>
      </div>
    </div>
  );
}
