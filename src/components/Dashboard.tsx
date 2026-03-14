"use client";

import { useState, useCallback } from "react";
import { VolunteerMap } from "./VolunteerMap";
import { EventPanel } from "./EventPanel";
import type { FlyeringEvent, NewEventFormData } from "@/types/events";

function generateId() {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function Dashboard() {
  const [events, setEvents] = useState<FlyeringEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  const handleSelectEvent = useCallback((event: FlyeringEvent | null) => {
    setSelectedEventId(event?.id ?? null);
  }, []);

  const handleRSVP = useCallback((event: FlyeringEvent) => {
    setSelectedEventId(event.id);
    if (event.spotsRemaining > 0) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, spotsRemaining: e.spotsRemaining - 1 } : e
        )
      );
    }
  }, []);

  const handleCreateEvent = useCallback((data: NewEventFormData) => {
    const newEvent: FlyeringEvent = {
      id: generateId(),
      title: data.eventName.trim(),
      address: data.address.trim(),
      description: data.description.trim(),
      lat: data.lat,
      lng: data.lng,
      date: data.date,
      organizerName: "You",
      spotsRemaining: 10,
    };
    setEvents((prev) => [newEvent, ...prev]);
    setSelectedEventId(newEvent.id);
  }, []);

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
              Find neighbors · Share flyers · Boost food access
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-purple-700 px-4 py-1.5 text-xs font-medium text-white shadow-md md:flex">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
          Live NYC pilot
        </div>
      </header>

      <main className="flex min-h-0 flex-1 gap-4 p-4 md:p-6">
        <section className="relative min-w-0 flex-1 min-h-[520px] rounded-3xl bg-green-900/5 p-3 shadow-inner ring-1 ring-green-800/10">
          <div className="absolute inset-3 rounded-3xl bg-stone-50 shadow-md ring-1 ring-green-900/10 transition-shadow duration-200 hover:shadow-lg">
            <VolunteerMap
              events={events}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
              onRSVP={handleRSVP}
            />
          </div>
        </section>
        <aside className="w-full shrink-0 md:w-[380px] h-full">
          <div className="h-full rounded-3xl bg-white/90 shadow-md ring-1 ring-yellow-200/80 overflow-y-auto">
            <EventPanel
              selectedEvent={selectedEvent}
              onClearSelection={() => setSelectedEventId(null)}
              onCreateEvent={handleCreateEvent}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
