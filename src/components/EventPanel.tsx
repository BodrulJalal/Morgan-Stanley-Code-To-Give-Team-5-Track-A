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
  const [lastCreated, setLastCreated] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const eventForFlyer = selectedEvent ?? lastCreated;

  const handleDownloadFlyer = useCallback(async () => {
    if (!eventForFlyer) return;
    const lat = eventForFlyer.lat;
    const lng = eventForFlyer.lng;
    const name = "title" in eventForFlyer ? eventForFlyer.title : eventForFlyer.name;
    const currentUserId = "demo-volunteer-123";
    setFlyerError(null);
    setFlyerLoading(true);
    const result = await downloadAreaFlyer(lat, lng, name, currentUserId);
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

        setLastCreated({ name: form.eventName.trim(), lat, lng });
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
    [form, initialForm, mapboxToken, onCreateEvent]
  );

  const showFlyerSection =
    selectedEvent || lastCreated || (form.eventName.trim() && form.date && form.description.trim());

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h2 className="text-lg font-semibold text-slate-800">Events &amp; Flyers</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedEvent ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">{selectedEvent.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {new Date(selectedEvent.date).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="text-sm text-slate-500">Organizer: {selectedEvent.organizerName}</p>
              <p className="text-sm text-slate-500">
                Spots: {selectedEvent.spotsRemaining > 0 ? `${selectedEvent.spotsRemaining} left` : "Full"}
              </p>
              <button
                type="button"
                onClick={onClearSelection}
                className="mt-2 text-sm text-amber-600 hover:underline"
              >
                Close details
              </button>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <h4 className="font-medium text-slate-800">Print-ready flyer</h4>
              <p className="mt-1 text-sm text-slate-600">
                Generate a localized PDF flyer for this event&apos;s area.
              </p>
              <button
                type="button"
                onClick={handleDownloadFlyer}
                disabled={flyerLoading}
                className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-amber-600 disabled:opacity-60"
              >
                {flyerLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating…
                  </>
                ) : (
                  "Download Area Flyer"
                )}
              </button>
              {flyerError && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {flyerError}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-slate-700">
                  Event name
                </label>
                <input
                  id="eventName"
                  type="text"
                  value={form.eventName}
                  onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))}
                  placeholder="e.g. Harlem Community Flyering"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label htmlFor="eventAddress" className="block text-sm font-medium text-slate-700">
                  Address
                </label>
                <input
                  id="eventAddress"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="e.g. 123 Main St, Brooklyn, NY"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  We&apos;ll automatically geocode this to coordinates using Mapbox.
                </p>
              </div>
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-slate-700">
                  Date &amp; time
                </label>
                <input
                  id="eventDate"
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label htmlFor="eventDescription" className="block text-sm font-medium text-slate-700">
                  Organizer description
                </label>
                <textarea
                  id="eventDescription"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Tell volunteers what this flyering action is about, who you’re trying to reach, and any instructions."
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">Description is required so volunteers know what to expect.</p>
              </div>
              <button
                type="submit"
                disabled={isGeocoding}
                className="w-full rounded-lg bg-amber-500 px-4 py-2 font-medium text-white shadow hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
              >
                {isGeocoding ? "Creating event…" : "Create event"}
              </button>
            </form>

            {formError && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {formError}
              </p>
            )}

            {lastCreated && !selectedEvent && (
              <p className="mt-3 text-sm text-green-700">Event created. You can generate a flyer below.</p>
            )}

            {showFlyerSection && !selectedEvent && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <h4 className="font-medium text-slate-800">Download My Flyer</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Generate a personalized PDF flyer for this event&apos;s location with your tracking link.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadFlyer}
                  disabled={flyerLoading}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-amber-600 disabled:opacity-60"
                >
                  {flyerLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Generating…
                    </>
                  ) : (
                    "Download Area Flyer"
                  )}
                </button>
                {flyerError && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {flyerError}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
