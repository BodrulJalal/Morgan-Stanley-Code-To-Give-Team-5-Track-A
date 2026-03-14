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
};

type EventsContextValue = {
  events: FlyeringEvent[];
  addEvent: (event: Omit<FlyeringEvent, "id">) => FlyeringEvent;
  currentUserId: string;
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
  },
];

function readInitialEvents(): FlyeringEvent[] {
  if (typeof window === "undefined") return INITIAL_EVENTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return INITIAL_EVENTS;
    return parsed as FlyeringEvent[];
  } catch {
    return INITIAL_EVENTS;
  }
}

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<FlyeringEvent[]>(() => readInitialEvents());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // ignore write errors (e.g. storage full or disabled)
    }
  }, [events]);

  const addEvent = useCallback((event: Omit<FlyeringEvent, "id">): FlyeringEvent => {
    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newEvent: FlyeringEvent = { id, ...event };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  }, []);

  const value = useMemo<EventsContextValue>(
    () => ({
      events,
      addEvent,
      currentUserId: "demo-volunteer-123",
    }),
    [events, addEvent]
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

