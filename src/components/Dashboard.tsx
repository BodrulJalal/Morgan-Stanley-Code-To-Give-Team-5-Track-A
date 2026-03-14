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
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          Volunteer Flyering Hub
        </h1>
        <p className="text-sm text-slate-500">Find events · Create events · Download flyers</p>
      </header>

      <main className="flex min-h-0 flex-1 gap-4 p-4">
        <section className="relative min-w-0 flex-1 rounded-2xl bg-slate-200/60 p-3 shadow-inner">
          <div className="absolute inset-3 rounded-xl bg-slate-100 shadow-lg ring-1 ring-slate-300/80">
            <VolunteerMap
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
            onRSVP={handleRSVP}
          />
          </div>
        </section>
        <aside className="w-full shrink-0 md:w-[380px]">
          <EventPanel
            selectedEvent={selectedEvent}
            onClearSelection={() => setSelectedEventId(null)}
            onCreateEvent={handleCreateEvent}
          />
        </aside>
      </main>
    </div>
  );
}
