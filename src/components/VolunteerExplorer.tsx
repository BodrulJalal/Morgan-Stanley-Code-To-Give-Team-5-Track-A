"use client";

import { useCallback, useEffect, useState } from "react";
import { useEvents } from "@/context/EventsContext";
import { VolunteerMap } from "./VolunteerMap";
import { downloadAreaFlyer } from "@/lib/downloadFlyer";
import { ScoreboardCard } from "./ScoreboardCard";

const FLYER_TUTORIAL_IMAGE_SRC = "/modal-assets/Flyer Tutorial.png?v=20260314-2";

export function VolunteerExplorer() {
  const {
    events,
    currentUserId,
    scoreboard,
    recordEventJoined,
    recordFlyerPosted,
  } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    events[0]?.id ?? null
  );
  const [flyerLoading, setFlyerLoading] = useState(false);
  const [flyerError, setFlyerError] = useState<string | null>(null);
  const [flyerSuccess, setFlyerSuccess] = useState<string | null>(null);
  const [isScoreboardVisible, setIsScoreboardVisible] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;
  const currentUserRank =
    scoreboard.findIndex((entry) => entry.userId === currentUserId) + 1;
  const currentUserScore =
    scoreboard.find((entry) => entry.userId === currentUserId) ?? null;

  const handleSelectEvent = useCallback((event: (typeof events)[number] | null) => {
    setSelectedEventId(event?.id ?? null);
  }, []);

  const handleDownloadFlyer = useCallback(async () => {
    if (!selectedEvent) return;
    setIsDownloadModalOpen(true);
    setFlyerError(null);
    setFlyerSuccess(null);
    setFlyerLoading(true);
    const result = await downloadAreaFlyer(
      selectedEvent.lat,
      selectedEvent.lng,
      selectedEvent.title,
      currentUserId,
      { flyerLang: "en" }
    );
    setFlyerLoading(false);
    if (!result.ok) {
      setFlyerError(result.error);
      return;
    }
    const awarded = recordEventJoined(selectedEvent.id);
    setFlyerSuccess(
      awarded
        ? "Event joined. Your score has been updated."
        : "Flyer downloaded. This event was already counted toward your score."
    );
  }, [selectedEvent, currentUserId, recordEventJoined]);

  const handlePosterAdded = useCallback(() => {
    recordFlyerPosted();
    setIsPosterModalOpen(false);
  }, [recordFlyerPosted]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const shouldLockPage = isPosterModalOpen || isDownloadModalOpen;
    const previousOverflow = document.body.style.overflow;

    if (shouldLockPage) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPosterModalOpen, isDownloadModalOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-amber-50">
      <header className="flex shrink-0 items-center justify-between border-b border-yellow-200 bg-yellow-400 px-6 py-4 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-300 shadow-md">
            <span className="text-2xl" aria-hidden="true">
              🍋
            </span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
              Volunteer Flyering Hub
            </h1>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-800/80">
              Explore events · Download flyers · Climb the leaderboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/admin"
            className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-md transition-colors duration-200 hover:bg-white"
          >
            Admin Page (developmental, will be removed)
          </a>
          <a
            href="/organizer"
            className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700"
          >
            Open Organizer Hub
          </a>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6">
        <section className="rounded-3xl border border-yellow-200/80 bg-white/80 p-4 shadow-sm ring-1 ring-yellow-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                Your Progress
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-800">
                Scoreboard controls
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Open the leaderboard when you want to check your standing.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-amber-100 px-4 py-2 text-sm shadow-sm ring-1 ring-amber-200">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Current Rank
                </p>
                <p className="mt-1 font-bold text-slate-800">
                  #{currentUserRank || "-"}
                  {currentUserScore ? ` · ${currentUserScore.points} pts` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScoreboardVisible((visible) => !visible)}
                className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-slate-700"
              >
                {isScoreboardVisible ? "Hide scoreboard" : "Show scoreboard"}
              </button>
            </div>
          </div>
        </section>

        {isScoreboardVisible && (
          <ScoreboardCard scoreboard={scoreboard} currentUserId={currentUserId} />
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
          <section className="flex w-full flex-col rounded-3xl bg-white shadow-md ring-1 ring-slate-100 md:w-[380px]">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Upcoming flyering events
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Pick an event, open the map, and grab a local flyer.
              </p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {events.map((event) => {
                const isActive = event.id === selectedEventId;
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEventId(event.id)}
                    className={`w-full rounded-2xl border px-3 py-3 text-left text-sm shadow-sm transition-colors duration-150 ${
                      isActive
                        ? "border-purple-500 bg-purple-50/70"
                        : "border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                          {event.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {new Date(event.date).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                          {event.address}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-amber-700">
                          Hosted by {event.organizerName} · {event.spotsRemaining} spots left
                        </p>
                      </div>
                      <span
                        className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-300 text-base shadow-sm"
                        aria-hidden="true"
                      >
                        🍋
                      </span>
                    </div>
                  </button>
                );
              })}
              {events.length === 0 && (
                <p className="text-xs text-slate-500">
                  No events yet. Be the first to create one in the Organizer Hub.
                </p>
              )}
            </div>

            {selectedEvent && (
              <div className="border-t border-slate-100 px-4 py-3">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDownloadModalOpen(true)}
                    className="flex w-full items-center justify-center rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition-colors duration-200 hover:bg-purple-50"
                  >
                    View Instructions
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadFlyer}
                    disabled={flyerLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700 disabled:opacity-60"
                  >
                    {flyerLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      "Download Area Flyer"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPosterModalOpen(true)}
                    className="flex w-full items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md transition-colors duration-200 hover:bg-amber-400"
                  >
                    Poster Added
                  </button>
                </div>
                {flyerError && (
                  <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                    {flyerError}
                  </p>
                )}
                {flyerSuccess && (
                  <p className="mt-2 text-xs font-medium text-emerald-700" role="status">
                    {flyerSuccess}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="relative min-h-[360px] flex-1 rounded-3xl bg-green-900/5 p-3 shadow-inner ring-1 ring-green-800/10">
            <div className="absolute inset-3 rounded-3xl bg-stone-50 shadow-md ring-1 ring-green-900/10">
              <VolunteerMap
                events={events}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
              />
            </div>
          </section>
        </div>
      </main>

      {isPosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              Poster Check
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-800">
              Confirm poster upload
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you uploaded the flyer poster? Confirm your location and picture to add poster credit and award points.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsPosterModalOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePosterAdded}
                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md transition-colors duration-200 hover:bg-amber-400"
              >
                Yes, award points
              </button>
            </div>
          </div>
        </div>
      )}

      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/55 px-4 py-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 md:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-700">
                    Flyer Tutorial
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-800">
                    How to use your downloaded flyer
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Keep this guide open as a quick reference. Your flyer download and event join credit will happen in the background.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3 md:p-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <img
                    src={FLYER_TUTORIAL_IMAGE_SRC}
                    alt="Flyer tutorial guide"
                    className="h-auto w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
