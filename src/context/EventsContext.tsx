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
import type { FlyeringEvent, NewFlyeringEvent, UserScore } from "@/types/events";

type EventsContextValue = {
  events: FlyeringEvent[];
  addEvent: (event: NewFlyeringEvent) => FlyeringEvent;
  currentUserId: string;
  scoreboard: UserScore[];
  recordEventJoined: (eventId: string) => boolean;
  recordFlyerPosted: () => void;
};

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

const STORAGE_KEY = "volunteer-flyering-events-v1";
const SCOREBOARD_STORAGE_KEY = "volunteer-scoreboard-v1";
const CURRENT_USER_ID = "demo-volunteer-123";
const CURRENT_USER_NAME = "You";
const POINTS_PER_EVENT_JOINED = 10;
const POINTS_PER_FLYER_POSTED = 15;

const INITIAL_EVENTS: FlyeringEvent[] = [
  {
    id: "evt-union-square",
    title: "Union Square Subway Flyers",
    description:
      "Hand out Lemontree food finder flyers at Union Square. We'll focus on commuters and nearby workers heading home.",
    address: "14th St - Union Square, New York, NY",
    lat: 40.7359,
    lng: -73.9911,
    date: "2026-03-20T17:30:00",
    organizerName: "Lemontree Team",
    spotsRemaining: 12,
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
    organizerName: "Neighborhood Captains",
    spotsRemaining: 8,
  },
  {
    id: "evt-grand-concourse",
    title: "Bronx Grand Concourse Outreach",
    description:
      "Table and flyer distribution near 149th St-Grand Concourse, focusing on weekend shoppers and families.",
    address: "149th St & Grand Concourse, Bronx, NY",
    lat: 40.8184,
    lng: -73.927,
    date: "2026-03-22T13:00:00",
    organizerName: "Food Access Partners",
    spotsRemaining: 10,
  },
];

const INITIAL_SCOREBOARD: UserScore[] = [
  {
    userId: CURRENT_USER_ID,
    name: CURRENT_USER_NAME,
    flyersPosted: 0,
    eventsJoined: 0,
    joinedEventIds: [],
    points: 0,
  },
  {
    userId: "volunteer-ana",
    name: "Ana",
    flyersPosted: 3,
    eventsJoined: 7,
    joinedEventIds: ["evt-ana-1", "evt-ana-2", "evt-ana-3", "evt-ana-4", "evt-ana-5", "evt-ana-6", "evt-ana-7"],
    points: 115,
  },
  {
    userId: "volunteer-malik",
    name: "Malik",
    flyersPosted: 4,
    eventsJoined: 6,
    joinedEventIds: [
      "evt-malik-1",
      "evt-malik-2",
      "evt-malik-3",
      "evt-malik-4",
      "evt-malik-5",
      "evt-malik-6",
    ],
    points: 120,
  },
  {
    userId: "volunteer-jules",
    name: "Jules",
    flyersPosted: 1,
    eventsJoined: 5,
    joinedEventIds: ["evt-jules-1", "evt-jules-2", "evt-jules-3", "evt-jules-4", "evt-jules-5"],
    points: 65,
  },
];

function sortScoreboard(entries: UserScore[]) {
  return [...entries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.eventsJoined !== a.eventsJoined) return b.eventsJoined - a.eventsJoined;
    return b.flyersPosted - a.flyersPosted;
  });
}

function normalizeScoreEntry(entry: UserScore): UserScore {
  return {
    userId: entry.userId,
    name: entry.name,
    flyersPosted: entry.flyersPosted ?? entry.postersAdded ?? 0,
    eventsJoined: entry.eventsJoined ?? entry.flyersDownloaded ?? 0,
    joinedEventIds: Array.isArray(entry.joinedEventIds) ? entry.joinedEventIds : [],
    points: entry.points ?? 0,
  };
}

function ensureCurrentUser(entries: UserScore[]) {
  const normalizedEntries = entries.map(normalizeScoreEntry);
  const hasCurrentUser = normalizedEntries.some((entry) => entry.userId === CURRENT_USER_ID);
  if (hasCurrentUser) {
    return sortScoreboard(normalizedEntries);
  }
  return sortScoreboard([...normalizedEntries, INITIAL_SCOREBOARD[0]]);
}

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<FlyeringEvent[]>(INITIAL_EVENTS);
  const [scoreboard, setScoreboard] = useState<UserScore[]>(() =>
    sortScoreboard(INITIAL_SCOREBOARD)
  );

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
        setEvents(parsed as FlyeringEvent[]);
      }
    } catch {
      // Ignore read errors and fall back to in-memory state.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Ignore write errors (for example, if storage is disabled).
    }
  }, [events]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(SCOREBOARD_STORAGE_KEY);
      if (!raw) {
        window.localStorage.setItem(
          SCOREBOARD_STORAGE_KEY,
          JSON.stringify(sortScoreboard(INITIAL_SCOREBOARD))
        );
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        setScoreboard(ensureCurrentUser(parsed as UserScore[]));
      }
    } catch {
      // Ignore read errors and fall back to in-memory state.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        SCOREBOARD_STORAGE_KEY,
        JSON.stringify(sortScoreboard(scoreboard))
      );
    } catch {
      // Ignore write errors (for example, if storage is disabled).
    }
  }, [scoreboard]);

  const updateCurrentUserScore = useCallback(
    (updater: (current: UserScore) => UserScore) => {
      setScoreboard((prev) => {
        const existing = prev.find((entry) => entry.userId === CURRENT_USER_ID) ?? INITIAL_SCOREBOARD[0];
        const next = updater(existing);
        const others = prev.filter((entry) => entry.userId !== CURRENT_USER_ID);
        return sortScoreboard([...others, next]);
      });
    },
    []
  );

  const addEvent = useCallback((event: NewFlyeringEvent): FlyeringEvent => {
    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newEvent: FlyeringEvent = {
      id,
      ...event,
      organizerName: event.organizerName ?? CURRENT_USER_NAME,
      spotsRemaining: event.spotsRemaining ?? 10,
    };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  }, []);

  const recordEventJoined = useCallback(
    (eventId: string) => {
      let awarded = false;
      updateCurrentUserScore((current) => {
        if (current.joinedEventIds.includes(eventId)) {
          return current;
        }
        awarded = true;
        return {
          ...current,
          eventsJoined: current.eventsJoined + 1,
          joinedEventIds: [...current.joinedEventIds, eventId],
          points: current.points + POINTS_PER_EVENT_JOINED,
        };
      });
      return awarded;
    },
    [updateCurrentUserScore]
  );

  const recordFlyerPosted = useCallback(() => {
    updateCurrentUserScore((current) => ({
      ...current,
      flyersPosted: current.flyersPosted + 1,
      points: current.points + POINTS_PER_FLYER_POSTED,
    }));
  }, [updateCurrentUserScore]);

  const value = useMemo<EventsContextValue>(
    () => ({
      events,
      addEvent,
      currentUserId: CURRENT_USER_ID,
      scoreboard,
      recordEventJoined,
      recordFlyerPosted,
    }),
    [events, addEvent, scoreboard, recordEventJoined, recordFlyerPosted]
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
