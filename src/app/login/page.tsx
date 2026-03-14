"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => {
    const value = searchParams.get("next");
    if (!value || !value.startsWith("/")) return "/";
    return value;
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const locationConsentPath = useMemo(
    () => `/location-consent?next=${encodeURIComponent(nextPath)}`,
    [nextPath]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    if (mode === "sign-in") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      setIsSubmitting(false);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(locationConsentPath);
      router.refresh();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
        },
      },
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (!data.session) {
      setNotice("Account created. Check your email to confirm, then sign in.");
      return;
    }

    router.push(locationConsentPath);
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-amber-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-yellow-200 bg-white p-6 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {mode === "sign-in"
              ? "Access your volunteer account."
              : "Join the volunteer network in seconds."}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("sign-in");
              setError(null);
              setNotice(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "sign-in"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("sign-up");
              setError(null);
              setNotice(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "sign-up"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "sign-up" && (
            <div>
              <label
                htmlFor="display-name"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Display name
              </label>
              <input
                id="display-name"
                type="text"
                autoComplete="name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-purple-500 transition focus:border-purple-400 focus:ring-2"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-purple-500 transition focus:border-purple-400 focus:ring-2"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-purple-500 transition focus:border-purple-400 focus:ring-2"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? mode === "sign-in"
                ? "Signing in..."
                : "Creating account..."
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          <Link href="/" className="font-medium text-purple-700 hover:text-purple-800">
            Back to events
          </Link>
        </div>
      </div>
    </main>
  );
}
