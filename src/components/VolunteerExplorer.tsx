"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { useEvents, type FlyeringEvent } from "@/context/EventsContext";
import { VolunteerMap } from "./VolunteerMap";
import { downloadAreaFlyer } from "@/lib/downloadFlyer";
import { supabase } from "@/lib/supabase/client";

export function VolunteerExplorer() {
  const { events, toggleJoin } = useEvents();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [flyerLoading, setFlyerLoading] = useState(false);
  const [flyerError, setFlyerError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const currentUserId = authUser?.id ?? "vol_123";

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      setAuthUser(data.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const selectedEvent: FlyeringEvent | null =
    events.find((e) => e.id === selectedEventId) ?? null;

  const handleSelectEvent = useCallback((event: FlyeringEvent | null) => {
    setSelectedEventId(event?.id ?? null);
  }, []);

  const handleDownloadFlyer = useCallback(async () => {
    if (!selectedEvent) return;
    setFlyerError(null);
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
    }
  }, [selectedEvent, currentUserId]);

  const handleToggleJoin = useCallback(
    (eventId: string) => {
      toggleJoin(eventId, currentUserId);
    },
    [toggleJoin, currentUserId]
  );

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-amber-50">
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
              Explore events · Download flyers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {authLoading ? (
            <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-md">
              Checking session...
            </span>
          ) : authUser ? (
            <>
              <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-md">
                Signed in as {authUser.email ?? "user"}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-md transition-colors duration-200 hover:bg-slate-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-md transition-colors duration-200 hover:bg-white"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/admin"
            className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-md transition-colors duration-200 hover:bg-white"
          >
            Admin Page (developmental, will be removed)
          </Link>
          <Link
            href="/organizer"
            className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700"
          >
            Create Event
          </Link>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row md:p-6">
        {/* Left sidebar: two-zone flex (detail stage + scrollable list) */}
        <section className="flex min-h-0 w-full flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-100 md:w-[380px] md:shrink-0">
          <div className="flex shrink-0 flex-col border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Upcoming flyering events
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Tap a lemon to see details and download a flyer.
            </p>
          </div>

          {/* Zone 1: Detail Stage (does not shrink) */}
          <div className="shrink-0 border-b-2 border-slate-100 px-4 pb-4 pt-3 mb-4">
            {selectedEvent ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <h3 className="text-base font-bold leading-snug text-slate-800">
                  {selectedEvent.title}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                  <span aria-hidden="true">👤</span>
                  <span className="font-medium">
                    {(selectedEvent.attendees?.length ?? 0)} Volunteers Joining
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleJoin(selectedEvent.id)}
                    className={`rounded-full px-6 py-2 text-sm font-bold shadow-md transition-colors duration-200 ${
                      selectedEvent.attendees?.includes(currentUserId)
                        ? "border border-green-300 bg-green-100 text-green-800 hover:bg-green-50"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {selectedEvent.attendees?.includes(currentUserId)
                      ? "Joined ✅"
                      : "Join Event"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadFlyer}
                    disabled={flyerLoading}
                    className="flex items-center justify-center gap-2 rounded-full bg-purple-600 px-6 py-2 text-sm font-bold text-white shadow-md transition-colors duration-200 hover:bg-purple-700 disabled:opacity-60"
                  >
                    {flyerLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating…
                      </>
                    ) : (
                      "Download Flyer 🖨️"
                    )}
                  </button>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {new Date(selectedEvent.date).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  {selectedEvent.organizerName && (
                    <p className="mt-0.5 text-xs text-slate-600">
                      Organizer:{" "}
                      <span className="font-medium text-slate-800">
                        {selectedEvent.organizerName}
                      </span>
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-600">{selectedEvent.address}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700">
                    {selectedEvent.description}
                  </p>
                  {flyerError && (
                    <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                      {flyerError}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-yellow-200 bg-amber-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-700">
                  🍋 Tap a lemon on the map or select an event below to see details
                  and join!
                </p>
              </div>
            )}
          </div>

          {/* Zone 2: Scrollable list (only this area scrolls) */}
          <div className="sidebar-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-8 pt-2">
            <div className="space-y-3">
              {events.map((event) => {
                const isActive = event.id === selectedEventId;
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEventId(event.id)}
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
                          {new Date(event.date).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">
                          {event.address}
                        </p>
                      </div>
                      <span
                        className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-300 text-base shadow-sm"
                        aria-hidden="true"
                      >
                        🍋
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {events.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-500">
                No events yet. Be the first to create one in the Organizer Hub.
              </p>
            )}
          </div>
        </section>

        {/* Map: fixed, no scroll, fills and centers in container */}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-green-900/5 p-3 shadow-inner ring-1 ring-green-800/10">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl bg-stone-50 shadow-md ring-1 ring-green-900/10">
            <VolunteerMap
              events={events}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

