"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { FlyeringEvent, EventWithAttendeesRow } from "@/types/events";

const MAX_SPOTS = 20;

function mapRowToEvent(row: EventWithAttendeesRow): FlyeringEvent {
  const attendees = (row.event_attendees ?? []).map((a) => a.user_id);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    address: row.address,
    city: row.city,
    lat: row.lat,
    lng: row.lng,
    start_time: row.start_time,
    end_time: row.end_time,
    organizer_name: row.organizer_name,
    created_by_user_id: row.created_by_user_id,
    attendees,
    spotsRemaining: Math.max(0, MAX_SPOTS - attendees.length),
  };
}

type EventsContextValue = {
  events: FlyeringEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleJoin: (eventId: string, userId: string) => Promise<void>;
};

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<FlyeringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*, event_attendees(user_id)")
        .order("start_time", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setEvents([]);
        return;
      }

      const rows = (data ?? []) as EventWithAttendeesRow[];
      setEvents(rows.map(mapRowToEvent));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load events";
      setError(message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const toggleJoin = useCallback(async (eventId: string, userId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    const isJoined = event.attendees.includes(userId);

    if (isJoined) {
      const { error: deleteError } = await supabase
        .from("event_attendees")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("event_attendees")
        .insert({ event_id: eventId, user_id: userId });

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }
    await refetch();
  }, [events, refetch]);

  const value = useMemo<EventsContextValue>(
    () => ({
      events,
      loading,
      error,
      refetch,
      toggleJoin,
    }),
    [events, loading, error, refetch, toggleJoin]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return ctx;
}

export type { FlyeringEvent };
