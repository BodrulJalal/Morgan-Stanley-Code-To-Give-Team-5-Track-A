"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useEvents } from "@/context/EventsContext";

function toDatetimeLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export default function OrganizerPage() {
  const { addEvent } = useEvents();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    address: "",
    date: "",
    description: "",
    organization: "",
  });
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgmentError, setAcknowledgmentError] = useState<string | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const [minDatetime, setMinDatetime] = useState("");
  const [maxDatetime, setMaxDatetime] = useState("");
  useEffect(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    setMinDatetime(toDatetimeLocal(now));
    const maxDate = new Date(now);
    maxDate.setFullYear(maxDate.getFullYear() + 10);
    setMaxDatetime(toDatetimeLocal(maxDate));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setAcknowledgmentError(null);

      if (!acknowledged) {
        setAcknowledgmentError("Please acknowledge that you will supply the materials to continue.");
        return;
      }

      if (!form.title.trim() || !form.address.trim() || !form.date.trim() || !form.description.trim()) {
        setError("Please fill in all required fields, including description.");
        return;
      }

      const eventDate = new Date(form.date);
      if (eventDate <= new Date()) {
        setError("Event date and time must be in the future.");
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
          organization: form.organization.trim() || undefined,
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
    [form, acknowledged, addEvent, mapboxToken, router]
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
        <Link
          href="/"
          className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700"
        >
          Back to Explorer
        </Link>
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
                min={minDatetime || undefined}
                max={maxDatetime || undefined}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Event must be in the future.
              </p>
            </div>
            <div>
              <label
                htmlFor="organization"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-800"
              >
                Affiliated Organization (Optional)
              </label>
              <input
                id="organization"
                type="text"
                value={form.organization}
                onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                placeholder="e.g. Lincoln High Eco Club, Local Food Pantry"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
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

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-3 py-3">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => {
                    setAcknowledged(e.target.checked);
                    setAcknowledgmentError(null);
                  }}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-purple-600 focus:ring-2 focus:ring-purple-500/70 focus:ring-offset-0"
                />
                <span>
                  I acknowledge that I am responsible for printing and supplying all flyers and materials for this event.
                </span>
              </label>
              {acknowledgmentError && (
                <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                  {acknowledgmentError}
                </p>
              )}
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !acknowledged}
              className="mt-2 w-full rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-amber-50"
            >
              {isSubmitting ? "Creating event…" : "Submit Event"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

