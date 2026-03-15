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
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/lib/api";

export type VolunteerScoreEntry = {
  id: string;
  name: string;
  flyersPosted: number;
  eventsJoined: number;
};

type VolunteerProgressContextValue = {
  scoreboard: VolunteerScoreEntry[];
  currentVolunteer: VolunteerScoreEntry | null;
  currentRank: number | null;
  visibleScoreboard: VolunteerScoreEntry[];
  isAuthenticated: boolean;
  isProfileLoading: boolean;
  awardFlyerPosted: () => void;
  adjustEventJoin: (joined: boolean) => void;
};

const STORAGE_KEY = "volunteer-progress-v1";
const SAMPLE_VOLUNTEER_IDS = new Set([
  "vol_maya",
  "vol_darius",
  "vol_ana",
  "vol_sofia",
  "vol_jamal",
  "vol_nina",
  "vol_leo",
  "vol_zoe",
]);

const DEFAULT_SCOREBOARD: VolunteerScoreEntry[] = [
  { id: "vol_maya", name: "Maya", flyersPosted: 8, eventsJoined: 5 },
  { id: "vol_darius", name: "Darius", flyersPosted: 7, eventsJoined: 6 },
  { id: "vol_ana", name: "Ana", flyersPosted: 6, eventsJoined: 4 },
  { id: "vol_sofia", name: "Sofia", flyersPosted: 5, eventsJoined: 4 },
  { id: "vol_jamal", name: "Jamal", flyersPosted: 4, eventsJoined: 5 },
  { id: "vol_nina", name: "Nina", flyersPosted: 4, eventsJoined: 3 },
  { id: "vol_leo", name: "Leo", flyersPosted: 3, eventsJoined: 4 },
  { id: "vol_zoe", name: "Zoe", flyersPosted: 2, eventsJoined: 3 },
];

const FLYER_POINTS = 15;
const EVENT_POINTS = 10;

const VolunteerProgressContext = createContext<
  VolunteerProgressContextValue | undefined
>(undefined);

function sanitizeScoreboard(input: unknown): VolunteerScoreEntry[] {
  if (!Array.isArray(input)) {
    return [];
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
    .filter(
      (entry): entry is VolunteerScoreEntry =>
        entry !== null && !SAMPLE_VOLUNTEER_IDS.has(entry.id)
    );

  return entries;
}

function scoreVolunteer(entry: VolunteerScoreEntry) {
  return entry.flyersPosted * FLYER_POINTS + entry.eventsJoined * EVENT_POINTS;
}

function getInitialScoreboard(): VolunteerScoreEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return sanitizeScoreboard(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function VolunteerProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const [profileNameByUserId, setProfileNameByUserId] = useState<
    Record<string, string>
  >({});
  const [currentVolunteerStats, setCurrentVolunteerStats] =
    useState<VolunteerScoreEntry[]>(getInitialScoreboard);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentVolunteerStats));
    } catch {
      // Ignore storage issues and continue with in-memory state.
    }
  }, [currentVolunteerStats]);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      return;
    }

    getUserProfile(user.id)
      .then((profile) => {
        if (cancelled) {
          return;
        }
        const name = profile.display_name?.trim() || "Anonymous";
        setProfileNameByUserId((prev) =>
          prev[user.id] === name ? prev : { ...prev, [user.id]: name }
        );
      })
      .catch(() => {
        if (!cancelled) {
          setProfileNameByUserId((prev) =>
            prev[user.id] === "Anonymous"
              ? prev
              : { ...prev, [user.id]: "Anonymous" }
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const currentVolunteerName = user
    ? profileNameByUserId[user.id] ?? "Anonymous"
    : "Anonymous";
  const isProfileLoading = !!user && profileNameByUserId[user.id] === undefined;

  const awardFlyerPosted = useCallback(() => {
    if (!user) {
      return;
    }
    setCurrentVolunteerStats((prev) => {
      const existing = prev.find((entry) => entry.id === user.id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === user.id
            ? { ...entry, flyersPosted: entry.flyersPosted + 1 }
            : entry
        );
      }

      return [
        ...prev,
        {
          id: user.id,
          name: currentVolunteerName,
          flyersPosted: 1,
          eventsJoined: 0,
        },
      ];
    });
  }, [user, currentVolunteerName]);

  const adjustEventJoin = useCallback((joined: boolean) => {
    if (!user) {
      return;
    }
    setCurrentVolunteerStats((prev) => {
      const existing = prev.find((entry) => entry.id === user.id);
      if (!existing) {
        return [
          ...prev,
          {
            id: user.id,
            name: currentVolunteerName,
            flyersPosted: 0,
            eventsJoined: joined ? 1 : 0,
          },
        ];
      }

      return prev.map((entry) => {
        if (entry.id !== user.id) {
          return entry;
        }

        const nextEventsJoined = joined
          ? entry.eventsJoined + 1
          : Math.max(0, entry.eventsJoined - 1);

        return {
          ...entry,
          eventsJoined: nextEventsJoined,
        };
      });
    });
  }, [user, currentVolunteerName]);

  const mergedScoreboard = useMemo(() => {
    if (!user) {
      return DEFAULT_SCOREBOARD;
    }

    const existingCurrentVolunteer = currentVolunteerStats.find(
      (entry) => entry.id === user.id
    );

    const currentVolunteerEntry: VolunteerScoreEntry =
      existingCurrentVolunteer ?? {
        id: user.id,
        name: currentVolunteerName,
        flyersPosted: 0,
        eventsJoined: 0,
      };

    const otherEntries = currentVolunteerStats.filter((entry) => entry.id !== user.id);

    return [...DEFAULT_SCOREBOARD, ...otherEntries, currentVolunteerEntry];
  }, [currentVolunteerName, currentVolunteerStats, user]);

  const sortedScoreboard = useMemo(
    () =>
      [...mergedScoreboard].sort((left, right) => {
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
    [mergedScoreboard]
  );

  const currentRank = useMemo(() => {
    if (!user) {
      return null;
    }
    const rankIndex = sortedScoreboard.findIndex(
      (entry) => entry.id === user.id
    );
    return rankIndex === -1 ? null : rankIndex + 1;
  }, [sortedScoreboard, user]);

  const currentVolunteer = useMemo(() => {
    if (!user) {
      return null;
    }
    return (
      sortedScoreboard.find((entry) => entry.id === user.id) ?? {
        id: user.id,
        name: currentVolunteerName,
        flyersPosted: 0,
        eventsJoined: 0,
      }
    );
  }, [currentVolunteerName, sortedScoreboard, user]);

  const visibleScoreboard = useMemo(() => {
    if (!user || currentRank === null || currentRank <= 7) {
      return sortedScoreboard.slice(0, 7);
    }

    return [
      ...sortedScoreboard.slice(0, 7),
      currentVolunteer ?? sortedScoreboard[7],
    ];
  }, [currentRank, currentVolunteer, sortedScoreboard, user]);

  const value = useMemo(
    () => ({
      scoreboard: sortedScoreboard,
      currentVolunteer,
      currentRank,
      visibleScoreboard,
      isAuthenticated: !!user,
      isProfileLoading: authLoading || isProfileLoading,
      awardFlyerPosted,
      adjustEventJoin,
    }),
    [
      sortedScoreboard,
      currentVolunteer,
      currentRank,
      visibleScoreboard,
      user,
      authLoading,
      isProfileLoading,
      awardFlyerPosted,
      adjustEventJoin,
    ]
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
