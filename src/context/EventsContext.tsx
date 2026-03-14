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

export type FlyeringEvent = {
  id: string;
  title: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  date: string;
  attendees: string[];
   organizerName: string;
   spotsRemaining: number;
};

type EventsContextValue = {
  events: FlyeringEvent[];
  addEvent: (
    event: Omit<FlyeringEvent, "id" | "attendees" | "organizerName" | "spotsRemaining">
  ) => FlyeringEvent;
  toggleJoin: (eventId: string, userId: string) => void;
};

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

const STORAGE_KEY = "volunteer-flyering-events-v1";

const INITIAL_EVENTS: FlyeringEvent[] = [
  {
    id: "evt-union-square",
    title: "Union Square Subway Flyers",
    description:
      "Hand out Lemontree food finder flyers at Union Square. We’ll focus on commuters and nearby workers heading home.",
    address: "14th St – Union Square, New York, NY",
    lat: 40.7359,
    lng: -73.9911,
    date: "2026-03-20T17:30:00",
    attendees: [],
    organizerName: "Neighborhood organizer",
    spotsRemaining: 8,
  },
  {
    id: "evt-jackson-heights",
    title: "Jackson Heights Community Walk",
    description:
      "Door-to-door flyering around 74th St / Roosevelt, connecting immigrant families with nearby pantries.",
    address: "37-53 74th St, Jackson Heights, NY",
    lat: 40.7463,
    lng: -73.891,
    date: "2026-03-21T11:00:00",
    attendees: [],
    organizerName: "Neighborhood organizer",
    spotsRemaining: 12,
  },
  {
    id: "evt-grand-concourse",
    title: "Bronx Grand Concourse Outreach",
    description:
      "Table and flyer distribution near 149th St–Grand Concourse, focusing on weekend shoppers and families.",
    address: "149th St & Grand Concourse, Bronx, NY",
    lat: 40.8184,
    lng: -73.927,
    date: "2026-03-22T13:00:00",
    attendees: [],
    organizerName: "Neighborhood organizer",
    spotsRemaining: 10,
  },
];

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<FlyeringEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const withAttendees = (parsed as Partial<FlyeringEvent>[]).map((event) => ({
          attendees: [],
          organizerName: "Neighborhood organizer",
          spotsRemaining: 10,
          ...event,
          attendees: Array.isArray(event.attendees) ? event.attendees : [],
          organizerName: event.organizerName ?? "Neighborhood organizer",
          spotsRemaining:
            typeof event.spotsRemaining === "number" ? event.spotsRemaining : 10,
        }));
        setEvents(withAttendees as FlyeringEvent[]);
      }
    } catch {
      // ignore read errors and fall back to in-memory state
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // ignore write errors (e.g. storage full or disabled)
    }
  }, [events]);

  const addEvent = useCallback(
    (
      event: Omit<FlyeringEvent, "id" | "attendees" | "organizerName" | "spotsRemaining">
    ): FlyeringEvent => {
    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newEvent: FlyeringEvent = {
        id,
        attendees: [],
        organizerName: "Neighborhood organizer",
        spotsRemaining: 10,
        ...event,
      };
      setEvents((prev) => [newEvent, ...prev]);
      return newEvent;
    },
    []
  );

  const toggleJoin = useCallback((eventId: string, userId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;
        const attendees = Array.isArray(event.attendees) ? event.attendees : [];
        const isJoined = attendees.includes(userId);
        const nextAttendees = isJoined
          ? attendees.filter((id) => id !== userId)
          : [...attendees, userId];
        return {
          ...event,
          attendees: nextAttendees,
        };
      })
    );
  }, []);

  const value = useMemo<EventsContextValue>(
    () => ({
      events,
      addEvent,
      toggleJoin,
    }),
    [events, addEvent, toggleJoin]
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

