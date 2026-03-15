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
import {
  getEvents,
  joinEvent,
  leaveEvent,
  type ApiEventRow,
  type ApiError,
} from "@/lib/api";
import type { FlyeringEvent } from "@/types/events";

const MAX_SPOTS = 20;

function mapRowToEvent(row: ApiEventRow): FlyeringEvent {
  const attendees = (row.event_attendees ?? []).map((a) => a.user_id);
  const lng = row.lng ?? row.long ?? 0;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    address: row.address,
    city: row.city ?? "",
    lat: row.lat,
    lng,
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
      const { events: rows } = await getEvents({ upcoming_only: false });
      setEvents((rows ?? []).map(mapRowToEvent));
    } catch (err) {
      const apiErr = err as ApiError;
      const message =
        apiErr?.message ?? (err instanceof Error ? err.message : "Failed to load events");
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
    // Never call join when already in attendees (prevent double-join)
    if (isJoined) {
      try {
        await leaveEvent(eventId, userId);
        await refetch();
      } catch (err) {
        const apiErr = err as ApiError;
        setError(
          apiErr?.message ??
            (err instanceof Error ? err.message : "Failed to leave event")
        );
      }
      return;
    }
    try {
      await joinEvent(eventId, userId);
      await refetch();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(
        apiErr?.message ??
          (err instanceof Error ? err.message : "Failed to update attendance")
      );
    }
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
