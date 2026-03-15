"use client";

import { useEffect, useState } from "react";
import {
  getVolunteerPoints,
  useVolunteerProgress,
} from "@/context/VolunteerProgressContext";

type VolunteerLeaderboardProps = {
  isExpanded: boolean;
  onToggle: () => void;
};

export function VolunteerLeaderboard({
  isExpanded,
  onToggle,
}: VolunteerLeaderboardProps) {
  const { scoreboard, currentVolunteer, currentRank } = useVolunteerProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">
            Your standing
          </p>
          <div className="mt-1.5 flex items-end gap-2">
            <div>
              <p className="text-2xl font-black text-slate-900">
                {mounted ? `#${currentRank}` : "--"}
              </p>
              <p className="text-[11px] text-slate-500">Rank stays visible</p>
            </div>
            <div className="rounded-xl bg-purple-600/90 px-3 py-1.5 text-white shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/80">
                Total points
              </p>
              <p className="text-lg font-bold">
                {mounted ? getVolunteerPoints(currentVolunteer) : "--"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-600">
            Flyers posted: {mounted ? currentVolunteer.flyersPosted : "--"} ·
            Events joined: {mounted ? currentVolunteer.eventsJoined : "--"}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition-colors hover:border-amber-400 hover:bg-amber-50"
        >
          {isExpanded ? "Hide Full Board" : "Full Board"}
        </button>
      </div>

      {isExpanded && mounted ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="grid grid-cols-[auto,1fr,auto] gap-3 border-b border-slate-100 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Rank</span>
            <span>Volunteer</span>
            <span>Score</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {scoreboard.map((entry, index) => {
              const isCurrentVolunteer = entry.id === currentVolunteer.id;
              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-[auto,1fr,auto] items-center gap-3 px-4 py-3 text-sm ${
                    isCurrentVolunteer
                      ? "bg-amber-50/80"
                      : "border-t border-slate-100 bg-white"
                  }`}
                >
                  <span className="font-bold text-slate-900">#{index + 1}</span>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {entry.name}
                      {isCurrentVolunteer ? " (You)" : ""}
                    </p>
                    <p className="text-xs text-slate-500">
                      {entry.flyersPosted} flyers · {entry.eventsJoined} events
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">
                    {getVolunteerPoints(entry)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
