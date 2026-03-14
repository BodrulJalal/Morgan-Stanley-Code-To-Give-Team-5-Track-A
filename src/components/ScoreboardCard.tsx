"use client";

import type { UserScore } from "@/types/events";

type ScoreboardCardProps = {
  scoreboard: UserScore[];
  currentUserId: string;
};

export function ScoreboardCard({
  scoreboard,
  currentUserId,
}: ScoreboardCardProps) {
  const rankedEntries = scoreboard.slice(0, 5);
  const currentUserRank =
    scoreboard.findIndex((entry) => entry.userId === currentUserId) + 1;
  const currentUser =
    scoreboard.find((entry) => entry.userId === currentUserId) ?? null;

  return (
    <section className="rounded-3xl border border-yellow-200/80 bg-gradient-to-br from-yellow-100 via-amber-50 to-white p-4 shadow-md ring-1 ring-yellow-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
            Community Scoreboard
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-800">
            Track your flyering impact
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Earn points by posting flyers and joining events.
          </p>
        </div>
        <div className="rounded-2xl bg-white/80 px-3 py-2 text-right shadow-sm ring-1 ring-yellow-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Your Rank
          </p>
          <p className="text-2xl font-black text-amber-700">
            #{currentUserRank || "-"}
          </p>
        </div>
      </div>

      {currentUser && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Points
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800">
              {currentUser.points}
            </p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Flyers Posted
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800">
              {currentUser.flyersPosted}
            </p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Events Joined
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800">
              {currentUser.eventsJoined}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {rankedEntries.map((entry, index) => {
          const isCurrentUser = entry.userId === currentUserId;
          return (
            <div
              key={entry.userId}
              className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm shadow-sm ring-1 ${
                isCurrentUser
                  ? "bg-amber-100/80 ring-amber-300"
                  : "bg-white/90 ring-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{entry.name}</p>
                  <p className="text-xs text-slate-500">
                    {entry.flyersPosted} flyers posted | {entry.eventsJoined} events joined
                  </p>
                </div>
              </div>
              <p className="text-base font-bold text-amber-700">{entry.points} pts</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
