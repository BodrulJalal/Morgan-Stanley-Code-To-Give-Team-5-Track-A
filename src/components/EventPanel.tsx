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
  lat: 40.7484,
  lng: -73.9857,
  date: "",
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

  const eventForFlyer = selectedEvent ?? lastCreated;

  const handleDownloadFlyer = useCallback(async () => {
    if (!eventForFlyer) return;
    const lat = eventForFlyer.lat;
    const lng = eventForFlyer.lng;
    const name = "title" in eventForFlyer ? eventForFlyer.title : eventForFlyer.name;
    setFlyerError(null);
    setFlyerLoading(true);
    const result = await downloadAreaFlyer(lat, lng, name);
    setFlyerLoading(false);
    if (result.ok) {
      setFlyerError(null);
    } else {
      setFlyerError(result.error);
    }
  }, [eventForFlyer]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.eventName.trim() || !form.date.trim()) return;
      setLastCreated({ name: form.eventName.trim(), lat: form.lat, lng: form.lng });
      onCreateEvent?.(form);
      setForm(initialForm);
    },
    [form, onCreateEvent]
  );

  const showFlyerSection = selectedEvent || lastCreated || (form.eventName.trim() && form.date);

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
                <label className="block text-sm font-medium text-slate-700">Location (coordinates)</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={(e) => setForm((f) => ({ ...f, lat: Number(e.target.value) }))}
                    placeholder="Lat"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <input
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={(e) => setForm((f) => ({ ...f, lng: Number(e.target.value) }))}
                    placeholder="Lng"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">NYC default: 40.7484, -73.9857</p>
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
              <button
                type="submit"
                className="w-full rounded-lg bg-amber-500 px-4 py-2 font-medium text-white shadow hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
              >
                Create event
              </button>
            </form>

            {lastCreated && !selectedEvent && (
              <p className="mt-3 text-sm text-green-700">Event created. You can generate a flyer below.</p>
            )}

            {showFlyerSection && !selectedEvent && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <h4 className="font-medium text-slate-800">Download Area Flyer</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Generate a localized PDF for the event location.
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
