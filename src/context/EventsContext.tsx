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
  toggleJoin: (eventId: string, userId: string) => void;
};

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

const STORAGE_KEY = "volunteer-flyering-events-v1";
const SCOREBOARD_STORAGE_KEY = "volunteer-flyering-scoreboard-v1";

const CURRENT_USER_ID = "current-user";
const CURRENT_USER_NAME = "You";

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

const INITIAL_SCOREBOARD: UserScore[] = [
  {
    userId: CURRENT_USER_ID,
    name: CURRENT_USER_NAME,
    points: 0,
    flyersPosted: 0,
    eventsJoined: 0,
  },
];

function sortScoreboard(scoreboard: UserScore[]) {
  return [...scoreboard].sort((a, b) => b.points - a.points);
}

function ensureCurrentUser(scoreboard: UserScore[]) {
  const hasCurrentUser = scoreboard.some((entry) => entry.userId === CURRENT_USER_ID);
  if (hasCurrentUser) {
    return sortScoreboard(scoreboard);
  }
  return sortScoreboard([...scoreboard, INITIAL_SCOREBOARD[0]]);
}

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<FlyeringEvent[]>(INITIAL_EVENTS);
  const [scoreboard, setScoreboard] = useState<UserScore[]>(
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
        const existing =
          prev.find((entry) => entry.userId === CURRENT_USER_ID) ?? INITIAL_SCOREBOARD[0];
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
      attendees: [],
      organizerName: event.organizerName ?? CURRENT_USER_NAME,
      spotsRemaining: event.spotsRemaining ?? 10,
      ...event,
    };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  }, []);

  const recordEventJoined = useCallback(
    (eventId: string): boolean => {
      let joined = false;

      setEvents((prev) =>
        prev.map((event) => {
          if (event.id !== eventId) return event;

          const attendees = Array.isArray(event.attendees) ? event.attendees : [];
          if (attendees.includes(CURRENT_USER_ID)) {
            return event;
          }

          if ((event.spotsRemaining ?? 0) <= 0) {
            return event;
          }

          joined = true;

          return {
            ...event,
            attendees: [...attendees, CURRENT_USER_ID],
            spotsRemaining: Math.max((event.spotsRemaining ?? 1) - 1, 0),
          };
        })
      );

      if (joined) {
        updateCurrentUserScore((current) => ({
          ...current,
          points: current.points + 25,
          eventsJoined: (current.eventsJoined ?? 0) + 1,
        }));
      }

      return joined;
    },
    [updateCurrentUserScore]
  );

  const recordFlyerPosted = useCallback(() => {
    updateCurrentUserScore((current) => ({
      ...current,
      points: current.points + 10,
      flyersPosted: (current.flyersPosted ?? 0) + 1,
    }));
  }, [updateCurrentUserScore]);

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
          spotsRemaining: isJoined
            ? (event.spotsRemaining ?? 0) + 1
            : Math.max((event.spotsRemaining ?? 1) - 1, 0),
        };
      })
    );
  }, []);

  const value = useMemo<EventsContextValue>(
    () => ({
      events,
      addEvent,
      currentUserId: CURRENT_USER_ID,
      scoreboard,
      recordEventJoined,
      recordFlyerPosted,
      toggleJoin,
    }),
    [events, addEvent, scoreboard, recordEventJoined, recordFlyerPosted, toggleJoin]
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
