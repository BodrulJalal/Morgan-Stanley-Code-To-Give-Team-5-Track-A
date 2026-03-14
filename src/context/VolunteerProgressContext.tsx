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

export type VolunteerScoreEntry = {
  id: string;
  name: string;
  flyersPosted: number;
  eventsJoined: number;
};

type VolunteerProgressContextValue = {
  scoreboard: VolunteerScoreEntry[];
  currentVolunteer: VolunteerScoreEntry;
  currentRank: number;
  awardFlyerPosted: () => void;
  adjustEventJoin: (joined: boolean) => void;
};

const CURRENT_VOLUNTEER_ID = "vol_123";
const STORAGE_KEY = "volunteer-progress-v1";

const DEFAULT_SCOREBOARD: VolunteerScoreEntry[] = [
  { id: CURRENT_VOLUNTEER_ID, name: "You", flyersPosted: 0, eventsJoined: 0 },
  { id: "vol_maya", name: "Maya", flyersPosted: 8, eventsJoined: 5 },
  { id: "vol_darius", name: "Darius", flyersPosted: 5, eventsJoined: 6 },
  { id: "vol_ana", name: "Ana", flyersPosted: 6, eventsJoined: 3 },
  { id: "vol_sofia", name: "Sofia", flyersPosted: 3, eventsJoined: 4 },
];

const FLYER_POINTS = 15;
const EVENT_POINTS = 10;

const VolunteerProgressContext = createContext<
  VolunteerProgressContextValue | undefined
>(undefined);

function sanitizeScoreboard(input: unknown): VolunteerScoreEntry[] {
  if (!Array.isArray(input)) {
    return DEFAULT_SCOREBOARD;
  }

  const entries = input
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as Partial<VolunteerScoreEntry>;
      if (typeof candidate.id !== "string" || typeof candidate.name !== "string") {
        return null;
      }

      return {
        id: candidate.id,
        name: candidate.name,
        flyersPosted:
          typeof candidate.flyersPosted === "number" && candidate.flyersPosted >= 0
            ? candidate.flyersPosted
            : 0,
        eventsJoined:
          typeof candidate.eventsJoined === "number" && candidate.eventsJoined >= 0
            ? candidate.eventsJoined
            : 0,
      };
    })
    .filter((entry): entry is VolunteerScoreEntry => entry !== null);

  const hasCurrentVolunteer = entries.some((entry) => entry.id === CURRENT_VOLUNTEER_ID);
  if (hasCurrentVolunteer) {
    return entries;
  }

  return DEFAULT_SCOREBOARD;
}

function scoreVolunteer(entry: VolunteerScoreEntry) {
  return entry.flyersPosted * FLYER_POINTS + entry.eventsJoined * EVENT_POINTS;
}

function getInitialScoreboard(): VolunteerScoreEntry[] {
  if (typeof window === "undefined") {
    return DEFAULT_SCOREBOARD;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SCOREBOARD;
    }

    return sanitizeScoreboard(JSON.parse(raw));
  } catch {
    return DEFAULT_SCOREBOARD;
  }
}

export function VolunteerProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [scoreboard, setScoreboard] =
    useState<VolunteerScoreEntry[]>(getInitialScoreboard);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scoreboard));
    } catch {
      // Ignore storage issues and continue with in-memory state.
    }
  }, [scoreboard]);

  const awardFlyerPosted = useCallback(() => {
    setScoreboard((prev) =>
      prev.map((entry) =>
        entry.id === CURRENT_VOLUNTEER_ID
          ? { ...entry, flyersPosted: entry.flyersPosted + 1 }
          : entry
      )
    );
  }, []);

  const adjustEventJoin = useCallback((joined: boolean) => {
    setScoreboard((prev) =>
      prev.map((entry) => {
        if (entry.id !== CURRENT_VOLUNTEER_ID) {
          return entry;
        }

        const nextEventsJoined = joined
          ? entry.eventsJoined + 1
          : Math.max(0, entry.eventsJoined - 1);

        return {
          ...entry,
          eventsJoined: nextEventsJoined,
        };
      })
    );
  }, []);

  const sortedScoreboard = useMemo(
    () =>
      [...scoreboard].sort((left, right) => {
        const pointDelta = scoreVolunteer(right) - scoreVolunteer(left);
        if (pointDelta !== 0) {
          return pointDelta;
        }

        const flyerDelta = right.flyersPosted - left.flyersPosted;
        if (flyerDelta !== 0) {
          return flyerDelta;
        }

        return left.name.localeCompare(right.name);
      }),
    [scoreboard]
  );

  const currentRank = useMemo(() => {
    const rankIndex = sortedScoreboard.findIndex(
      (entry) => entry.id === CURRENT_VOLUNTEER_ID
    );
    return rankIndex === -1 ? sortedScoreboard.length : rankIndex + 1;
  }, [sortedScoreboard]);

  const currentVolunteer =
    sortedScoreboard.find((entry) => entry.id === CURRENT_VOLUNTEER_ID) ??
    DEFAULT_SCOREBOARD[0];

  const value = useMemo(
    () => ({
      scoreboard: sortedScoreboard,
      currentVolunteer,
      currentRank,
      awardFlyerPosted,
      adjustEventJoin,
    }),
    [sortedScoreboard, currentVolunteer, currentRank, awardFlyerPosted, adjustEventJoin]
  );

  return (
    <VolunteerProgressContext.Provider value={value}>
      {children}
    </VolunteerProgressContext.Provider>
  );
}

export function useVolunteerProgress() {
  const context = useContext(VolunteerProgressContext);
  if (!context) {
    throw new Error(
      "useVolunteerProgress must be used within a VolunteerProgressProvider"
    );
  }

  return context;
}

export function getVolunteerPoints(entry: VolunteerScoreEntry) {
  return scoreVolunteer(entry);
}
