"use client";

import { useState, useCallback } from "react";
import { useEvents, type FlyeringEvent } from "@/context/EventsContext";
import { VolunteerMap } from "./VolunteerMap";
import { downloadAreaFlyer } from "@/lib/downloadFlyer";

export function VolunteerExplorer() {
  const { events, currentUserId } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    events[0]?.id ?? null
  );
  const [flyerLoading, setFlyerLoading] = useState(false);
  const [flyerError, setFlyerError] = useState<string | null>(null);

  const selectedEvent: FlyeringEvent | null =
    events.find((e) => e.id === selectedEventId) ?? null;

  const handleSelectEvent = useCallback((event: FlyeringEvent | null) => {
    setSelectedEventId(event?.id ?? null);
  }, []);

  const handleDownloadFlyer = useCallback(async () => {
    if (!selectedEvent) return;
    setFlyerError(null);
    setFlyerLoading(true);
    const result = await downloadAreaFlyer(
      selectedEvent.lat,
      selectedEvent.lng,
      selectedEvent.title,
      currentUserId,
      { flyerLang: "en" }
    );
    setFlyerLoading(false);
    if (!result.ok) {
      setFlyerError(result.error);
    }
  }, [selectedEvent, currentUserId]);

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
              Volunteer Flyering Hub
            </h1>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-800/80">
              Explore events · Download flyers
            </p>
          </div>
        </div>
        <a
          href="/organizer"
          className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700"
        >
          Open Organizer Hub
        </a>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:flex-row md:p-6">
        {/* Events list */}
        <section className="flex w-full flex-col rounded-3xl bg-white shadow-md ring-1 ring-slate-100 md:w-[380px]">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Upcoming flyering events
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Tap a lemon to see details and download a flyer.
            </p>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {events.map((event) => {
              const isActive = event.id === selectedEventId;
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left text-sm shadow-sm transition-colors duration-150 ${
                    isActive
                      ? "border-purple-500 bg-purple-50/70"
                      : "border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        {event.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {new Date(event.date).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                        {event.address}
                      </p>
                    </div>
                    <span
                      className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-300 text-base shadow-sm"
                      aria-hidden="true"
                    >
                      🍋
                    </span>
                  </div>
                </button>
              );
            })}
            {events.length === 0 && (
              <p className="text-xs text-slate-500">
                No events yet. Be the first to create one in the Organizer Hub.
              </p>
            )}
          </div>

          {selectedEvent && (
            <div className="border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={handleDownloadFlyer}
                disabled={flyerLoading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700 disabled:opacity-60"
              >
                {flyerLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating…
                  </>
                ) : (
                  "Download Area Flyer 🖨️"
                )}
              </button>
              {flyerError && (
                <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                  {flyerError}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Map */}
        <section className="relative min-h-[360px] flex-1 rounded-3xl bg-green-900/5 p-3 shadow-inner ring-1 ring-green-800/10">
          <div className="absolute inset-3 rounded-3xl bg-stone-50 shadow-md ring-1 ring-green-900/10">
            <VolunteerMap
              events={events}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

