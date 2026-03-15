"use client";

import {
  getVolunteerPoints,
  useVolunteerProgress,
} from "@/context/VolunteerProgressContext";

type VolunteerLeaderboardProps = {
  isExpanded: boolean;
  onToggle: () => void;
};

function getRankEmoji(rank: number): string {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank >= 4 && rank <= 10) return "🌟";
  return "✨";
}

function getScoreEmoji(score: number, rank: number): string {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";

  if (score >= 100) return "🌟";
  if (score >= 75) return "🔥";
  if (score >= 50) return "💪";
  if (score >= 25) return "🌱";
  return "✨";
}

export function VolunteerLeaderboard({
  isExpanded,
  onToggle,
}: VolunteerLeaderboardProps) {
  const {
    currentVolunteer,
    currentRank,
    visibleScoreboard,
    isAuthenticated,
  } = useVolunteerProgress();

  return (
    <div className="flex flex-col bg-amber-50 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-4 shadow-md overflow-hidden transition-all duration-300 w-full max-w-md gap-4">
      {/* Top summary section */}
      <div className="flex flex-row justify-between items-start w-full gap-4">
        <div className="flex flex-col flex-1 gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">
            Leaderboard
          </p>
          <p className="text-3xl font-black leading-none text-slate-900">
            {isAuthenticated && currentRank !== null ? `#${currentRank}` : "--"}
          </p>
          <div className="mt-1 text-[11px] text-slate-600">
            <p>
              Flyers posted:{" "}
              {isAuthenticated && currentVolunteer
                ? currentVolunteer.flyersPosted
                : "--"}
            </p>
            <p>
              Events joined:{" "}
              {isAuthenticated && currentVolunteer
                ? currentVolunteer.eventsJoined
                : "--"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition-colors hover:border-amber-400 hover:bg-amber-50"
          >
            {isExpanded ? "Hide Full Board" : "Full Board"}
          </button>

          <div className="rounded-xl bg-purple-600/90 px-3 py-1.5 text-white shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/80">
              Total points
            </p>
            <p className="text-lg font-bold text-right">
              {isAuthenticated && currentVolunteer
                ? getVolunteerPoints(currentVolunteer)
                : "--"}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom expanding list section */}
      {isExpanded ? (
        <div className="w-full mt-4 pt-4 border-t-2 border-slate-200 flex flex-col gap-3">
          <div className="flex justify-between w-full px-4 mb-2 text-sm font-bold text-slate-500 tracking-wider uppercase">
            <span>Rank &amp; Volunteer</span>
            <span>Score</span>
          </div>
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-3 pb-2 -mr-2">
            {visibleScoreboard.map((entry) => {
              const rank =
                visibleScoreboard.length > 7 && currentVolunteer?.id === entry.id && currentRank
                  ? currentRank
                  : visibleScoreboard.findIndex((item) => item.id === entry.id) + 1;
              const isCurrentVolunteer = !!currentVolunteer && entry.id === currentVolunteer.id;
              const score = getVolunteerPoints(entry);
              const scoreEmoji = getScoreEmoji(score, rank);
              const rankLabel =
                rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
              const rankEmoji = getRankEmoji(rank);
              const rankEmojiClass =
                rank === 1
                  ? "animate-bounce"
                  : rank === 2 || rank === 3
                    ? "animate-pulse"
                    : "animate-pulse opacity-70";
              return (
                <div
                  key={entry.id}
                  className={`flex justify-between items-center bg-white rounded-xl p-4 shadow-sm border border-slate-100 shrink-0 text-sm ${
                    isCurrentVolunteer ? "ring-2 ring-amber-300 bg-amber-50/80" : ""
                  } ${rank === 1 ? "shadow-amber-300 shadow-md" : ""}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-900">
                      {rankLabel}{" "}
                      <span className={`inline-block mr-1 ${rankEmojiClass}`}>
                        {rankEmoji}
                      </span>
                      {entry.name}
                      {isCurrentVolunteer ? " (You)" : ""}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {entry.flyersPosted} flyers · {entry.eventsJoined} events
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">
                    {score} <span className="ml-1 align-middle">{scoreEmoji}</span>
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
