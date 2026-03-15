"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useEvents, type FlyeringEvent } from "@/context/EventsContext";
import { useVolunteerProgress } from "@/context/VolunteerProgressContext";
import { VolunteerMap } from "./VolunteerMap";
import { VolunteerLeaderboard } from "./VolunteerLeaderboard";
import { FlyerTutorialModal } from "./FlyerTutorialModal";
import { PosterConfirmationModal } from "./PosterConfirmationModal";
import { downloadAreaFlyer } from "@/lib/downloadFlyer";

export function VolunteerExplorer() {
  const { events, loading, error, refetch, toggleJoin } = useEvents();
  const { awardFlyerPosted, adjustEventJoin } = useVolunteerProgress();
  // Placeholder until Supabase Auth is integrated; replace with session.user.id
  const currentUserId = "00000000-0000-0000-0000-000000000001";
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [flyerLoading, setFlyerLoading] = useState(false);
  const [flyerError, setFlyerError] = useState<string | null>(null);
  const [joinLoadingId, setJoinLoadingId] = useState<string | null>(null);
  const [scoreboardExpanded, setScoreboardExpanded] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [posterConfirmOpen, setPosterConfirmOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const futureEvents = events.filter((e) => new Date(e.start_time) > now);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return futureEvents;
    return futureEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.address?.toLowerCase().includes(q)) ||
        (e.description?.toLowerCase().includes(q)) ||
        (e.organizer_name?.toLowerCase().includes(q)) ||
        (e.city?.toLowerCase().includes(q))
    );
  }, [events, searchQuery]);

  const selectedEvent: FlyeringEvent | null =
    events.find((event) => event.id === selectedEventId) ?? null;
  const isSelectedEventJoined =
    selectedEvent?.attendees?.includes(currentUserId) ?? false;

  const handleSelectEvent = useCallback((event: FlyeringEvent | null) => {
    setSelectedEventId(event?.id ?? null);
    setStatusMessage(null);
  }, []);

  const handleFlyerDownload = useCallback(async () => {
    if (!selectedEvent) {
      return;
    }

    setFlyerError(null);
    setStatusMessage(null);
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

    setStatusMessage(`Flyer downloaded: ${result.filename}`);
  }, [selectedEvent, currentUserId]);

  const handleOpenTutorial = useCallback(() => {
    if (!selectedEvent) {
      return;
    }

    setFlyerError(null);
    setStatusMessage(null);
    setTutorialOpen(true);
  }, [selectedEvent]);

  const handleContinueFromTutorial = useCallback(async () => {
    setTutorialOpen(false);
    await handleFlyerDownload();
  }, [handleFlyerDownload]);

  const handleToggleJoin = useCallback(
    async (eventId: string) => {
      const event = events.find((item) => item.id === eventId);
      const wasJoined = event?.attendees?.includes(currentUserId) ?? false;

      setJoinLoadingId(eventId);
      try {
        await toggleJoin(eventId, currentUserId);
        adjustEventJoin(!wasJoined);
        setStatusMessage(
          wasJoined
            ? "You left the event and your event points were updated."
            : "You joined the event and earned event points."
        );
      } finally {
        setJoinLoadingId(null);
      }
    },
    [events, toggleJoin, currentUserId, adjustEventJoin]
  );

  const handleConfirmPosterAdded = useCallback(() => {
    awardFlyerPosted();
    setPosterConfirmOpen(false);
    setStatusMessage("Poster logged and flyer-posting points added.");
  }, [awardFlyerPosted]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-amber-50">
      <header className="flex shrink-0 items-center justify-between border-b border-yellow-200 bg-yellow-400 px-6 py-4 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-300 shadow-md">
            <span className="text-2xl" aria-hidden="true">
              Lemon
            </span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
              Volunteer Flyering Hub
            </h1>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-800/80">
              Explore events · Download flyers
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
            href="/messages"
            className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700"
          >
            Messages
          </a>
          <a
            href="/organizer"
            className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700"
          >
            Create Event
          </a>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row md:p-6">
        <section className="flex min-h-0 w-full flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-100 md:w-[380px] md:shrink-0">
          <div className="flex shrink-0 flex-col border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Upcoming flyering events
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Tap a map marker or event card to see details and download a flyer.
            </p>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events…"
              aria-label="Search events by title, address, organizer, or city"
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
            />
          </div>

          <div className="shrink-0 border-b border-slate-100 px-4 py-4">
            <VolunteerLeaderboard
              isExpanded={scoreboardExpanded}
              onToggle={() => setScoreboardExpanded((prev) => !prev)}
            />
          </div>

          {/* Zone 1: Detail Stage (does not shrink) */}
          <div className="shrink-0 border-b-2 border-slate-100 px-4 pb-4 pt-3 mb-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-amber-50/50 py-12">
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" aria-hidden />
                <p className="mt-3 text-sm font-medium text-slate-700">Loading events…</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-800" role="alert">{error}</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-2 text-xs font-semibold text-purple-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : selectedEvent ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <h3 className="text-base font-bold leading-snug text-slate-800">
                  {selectedEvent.title}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                  <span aria-hidden="true">People</span>
                  <span className="font-medium">
                    {(selectedEvent.attendees?.length ?? 0)} Volunteers Joining
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleJoin(selectedEvent.id)}
                    disabled={joinLoadingId === selectedEvent.id}
                    className={`rounded-full px-6 py-2 text-sm font-bold shadow-md transition-colors duration-200 disabled:opacity-70 ${
                      isSelectedEventJoined
                        ? "border border-green-300 bg-green-100 text-green-800 hover:bg-green-50"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {joinLoadingId === selectedEvent.id ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : isSelectedEventJoined ? (
                      "Joined ✅"
                    ) : (
                      "Join Event"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenTutorial}
                    disabled={flyerLoading}
                    className="rounded-full bg-purple-600 px-6 py-2 text-sm font-bold text-white shadow-md transition-colors duration-200 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {flyerLoading ? "Generating..." : "Download Area Flyer"}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenTutorial}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-50"
                  >
                    View Instructions
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusMessage(null);
                      setPosterConfirmOpen(true);
                    }}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-800 shadow-sm transition-colors duration-200 hover:bg-emerald-100"
                  >
                    Poster Added
                  </button>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {new Date(selectedEvent.start_time).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  {selectedEvent.organizer_name ? (
                    <p className="mt-0.5 text-xs text-slate-600">
                      Organizer:{" "}
                      <span className="font-medium text-slate-800">
                        {selectedEvent.organizer_name}
                      </span>
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-600">{selectedEvent.address}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700">
                    {selectedEvent.description}
                  </p>
                  {flyerError ? (
                    <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                      {flyerError}
                    </p>
                  ) : null}
                  {statusMessage ? (
                    <p className="mt-2 text-xs font-medium text-emerald-700" role="status">
                      {statusMessage}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-yellow-200 bg-amber-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Select an event from the map or list to see details, join, and track
                  your volunteer score.
                </p>
              </div>
            )}
          </div>

          <div className="sidebar-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-8 pt-2">
            {loading ? (
              <p className="py-4 text-center text-xs text-slate-500">Loading events…</p>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => {
                  const isActive = event.id === selectedEventId;
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => handleSelectEvent(event)}
                      className={`w-full rounded-2xl border px-3 py-2.5 text-left text-sm shadow-sm transition-colors duration-150 ${
                        isActive
                          ? "border-purple-500 bg-purple-50/70"
                          : "border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-slate-800">
                            {event.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {new Date(event.start_time).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">
                            {event.address}
                          </p>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          <span aria-hidden="true">👥</span>
                          {(event.attendees?.length ?? 0)}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-500">
                    {events.length === 0
                      ? "No events yet. Be the first to create one in the Organizer Hub."
                      : !events.some((e) => new Date(e.start_time) > new Date())
                        ? "No upcoming events right now."
                        : "No events match your search. Try a different term."}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-green-900/5 p-3 shadow-inner ring-1 ring-green-800/10">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl bg-stone-50 shadow-md ring-1 ring-green-900/10">
            <VolunteerMap
              events={filteredEvents}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
            />
          </div>
        </section>
      </main>

      <FlyerTutorialModal
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        onContinue={handleContinueFromTutorial}
        isDownloading={flyerLoading}
        eventTitle={selectedEvent?.title ?? "this event"}
      />
      <PosterConfirmationModal
        isOpen={posterConfirmOpen}
        onClose={() => setPosterConfirmOpen(false)}
        onConfirm={handleConfirmPosterAdded}
        eventTitle={selectedEvent?.title ?? "this event"}
      />
    </div>
  );
}
