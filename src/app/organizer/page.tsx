"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";
import { useEvents } from "@/context/EventsContext";

export default function OrganizerPage() {
  const { addEvent } = useEvents();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    address: "",
    date: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!form.title.trim() || !form.address.trim() || !form.date.trim() || !form.description.trim()) {
        setError("Please fill in all fields before submitting.");
        return;
      }

      if (!mapboxToken) {
        setError(
          "Mapbox token is missing. Please add NEXT_PUBLIC_MAPBOX_TOKEN in .env.local to enable address geocoding."
        );
        return;
      }

      try {
        setIsSubmitting(true);
        const query = encodeURIComponent(form.address.trim());
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}&limit=1`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Geocoding failed (${res.status})`);
        }
        const data = await res.json();
        const first = data?.features?.[0];
        if (!first || !Array.isArray(first.center) || first.center.length < 2) {
          throw new Error("Could not find that address. Please try a more specific location.");
        }
        const [lng, lat] = first.center;

        addEvent({
          title: form.title.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
          lat,
          lng,
          date: form.date,
        });

        router.push("/");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Address lookup failed. Please try again.";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, addEvent, mapboxToken, router]
  );

  return (
    <div className="flex min-h-screen flex-col bg-amber-50">
      <header className="flex shrink-0 items-center justify-between border-b border-yellow-200 bg-yellow-400 px-6 py-4 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-300 shadow-md">
            <span className="text-2xl" aria-hidden="true">
              🍋
            </span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
              Organizer Hub
            </h1>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-800/80">
              Create a new flyering event
            </p>
          </div>
        </div>
        <a
          href="/"
          className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700"
        >
          Back to Explorer
        </a>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 md:px-6">
        <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            New flyering event
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Share where volunteers should meet, when, and what the action is about.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-800"
              >
                Event name
              </label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Harlem Community Flyering"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-800"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="e.g. 14th Street – Union Square, New York, NY"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                We&apos;ll geocode this into coordinates using Mapbox.
              </p>
            </div>
            <div>
              <label
                htmlFor="date"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-800"
              >
                Date &amp; time
              </label>
              <input
                id="date"
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-800"
              >
                Organizer description
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Tell volunteers what this flyering action is about, who you’re trying to reach, and any instructions."
                rows={3}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Description is required so volunteers know what to expect.
              </p>
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700 disabled:opacity-70"
            >
              {isSubmitting ? "Creating event…" : "Create event"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

