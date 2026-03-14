"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LocationConsentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const value = searchParams.get("next");
    if (!value || !value.startsWith("/")) return "/";
    return value;
  }, [searchParams]);

  const handleContinue = () => {
    router.push(nextPath);
    router.refresh();
  };

  const handleEnableLocation = () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location services are not available in this browser.");
      return;
    }

    setIsRequesting(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsRequesting(false);
        handleContinue();
      },
      () => {
        setIsRequesting(false);
        setError("Location permission was not granted. You can continue without it.");
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-amber-50 px-4 py-12">
      <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-yellow-200 bg-white p-6 shadow-xl">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
          Enable location?
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We use your location to better suggest nearby flyering events and resources.
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={handleEnableLocation}
            disabled={isRequesting}
            className="w-full rounded-full bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRequesting ? "Requesting..." : "Enable location"}
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Not now
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          <Link href={nextPath} className="font-medium text-purple-700 hover:text-purple-800">
            Skip and continue
          </Link>
        </p>
      </section>
    </main>
  );
}
