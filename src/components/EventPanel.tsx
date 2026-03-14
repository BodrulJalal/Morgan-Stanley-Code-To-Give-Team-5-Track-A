"use client";

import { useState, useCallback } from "react";
import type { FlyeringEvent, NewEventFormData } from "@/types/events";
import { downloadAreaFlyer } from "@/lib/downloadFlyer";

type EventPanelProps = {
  selectedEvent: FlyeringEvent | null;
  onClearSelection: () => void;
  onCreateEvent?: (data: NewEventFormData) => void;
};

const initialForm: NewEventFormData = {
  eventName: "",
  address: "",
  lat: 40.7484,
  lng: -73.9857,
  date: "",
  description: "",
};

export function EventPanel({
  selectedEvent,
  onClearSelection,
  onCreateEvent,
}: EventPanelProps) {
  const [form, setForm] = useState<NewEventFormData>(initialForm);
  const [flyerLoading, setFlyerLoading] = useState(false);
  const [flyerError, setFlyerError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const eventForFlyer = selectedEvent ?? null;

  const handleDownloadFlyer = useCallback(async () => {
    if (!eventForFlyer) return;
    const lat = eventForFlyer.lat;
    const lng = eventForFlyer.lng;
    const name = eventForFlyer.title;
    const currentUserId = "demo-volunteer-123";
    setFlyerError(null);
    setFlyerLoading(true);
    const result = await downloadAreaFlyer(lat, lng, name, currentUserId, {
      flyerLang: "en",
    });
    setFlyerLoading(false);
    if (result.ok) {
      setFlyerError(null);
    } else {
      setFlyerError(result.error);
    }
  }, [eventForFlyer]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);

      if (
        !form.eventName.trim() ||
        !form.address.trim() ||
        !form.date.trim() ||
        !form.description.trim()
      ) {
        setFormError("Please fill in all required fields, including description.");
        return;
      }

      if (!mapboxToken) {
        setFormError(
          "Mapbox token is missing. Please add NEXT_PUBLIC_MAPBOX_TOKEN in .env.local to enable address geocoding."
        );
        return;
      }

      try {
        setIsGeocoding(true);
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

        const payload: NewEventFormData = {
          ...form,
          lat,
          lng,
        };

        onCreateEvent?.(payload);
        setForm(initialForm);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Address lookup failed. Please try again.";
        setFormError(message);
      } finally {
        setIsGeocoding(false);
      }
    },
    [form, mapboxToken, onCreateEvent]
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-yellow-200/80 bg-white shadow-md">
      <div className="border-b border-yellow-200/80 bg-yellow-100 px-4 py-3">
        <h2 className="text-lg font-bold text-slate-800">
          Events &amp; Flyers
        </h2>
        <p className="mt-0.5 text-xs text-slate-600">
          Host a flyering meetup and share localized food access flyers.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedEvent ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800">
                {selectedEvent.title}
              </h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {new Date(selectedEvent.date).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                Organizer: <span className="font-medium text-slate-800">{selectedEvent.organizerName}</span>
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {selectedEvent.spotsRemaining > 0 ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    {selectedEvent.spotsRemaining} spots left
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                    Fully booked
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={onClearSelection}
                className="mt-2 text-xs font-medium text-purple-700 hover:underline"
              >
                Close details
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-md">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-300 text-base shadow-sm">
                  🖨️
                </span>
                Print-ready flyer
              </h4>
              <p className="mt-1 text-xs text-slate-600">
                Generate a localized PDF flyer for this event&apos;s area.
              </p>
              <button
                type="button"
                onClick={handleDownloadFlyer}
                disabled={flyerLoading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700 disabled:opacity-60"
              >
                {flyerLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating…
                  </>
                ) : (
                  "Download My Flyer 🖨️"
                )}
              </button>
              {flyerError && (
                <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                  {flyerError}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="eventName" className="block text-xs font-semibold uppercase tracking-wide text-slate-800">
                  Event name
                </label>
                <input
                  id="eventName"
                  type="text"
                  value={form.eventName}
                  onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))}
                  placeholder="e.g. Harlem Community Flyering"
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
                />
              </div>
              <div>
                <label htmlFor="eventAddress" className="block text-xs font-semibold uppercase tracking-wide text-slate-800">
                  Address
                </label>
                <input
                  id="eventAddress"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="e.g. 123 Main St, Brooklyn, NY"
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  We&apos;ll automatically geocode this to coordinates using Mapbox.
                </p>
              </div>
              <div>
                <label htmlFor="eventDate" className="block text-xs font-semibold uppercase tracking-wide text-slate-800">
                  Date &amp; time
                </label>
                <input
                  id="eventDate"
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
                />
              </div>
              <div>
                <label htmlFor="eventDescription" className="block text-xs font-semibold uppercase tracking-wide text-slate-800">
                  Organizer description
                </label>
                <textarea
                  id="eventDescription"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Tell volunteers what this flyering action is about, who you’re trying to reach, and any instructions."
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Description is required so volunteers know what to expect.
                </p>
              </div>
              <button
                type="submit"
                disabled={isGeocoding}
                className="w-full rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-amber-50 disabled:opacity-70"
              >
                {isGeocoding ? "Creating event…" : "Create event"}
              </button>
            </form>

            {formError && (
              <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                {formError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
