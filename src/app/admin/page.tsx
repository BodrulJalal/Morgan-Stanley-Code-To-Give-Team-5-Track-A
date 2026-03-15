"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEvents } from "@/context/EventsContext";
import { ZestyAdminAssistant } from "@/components/ZestyAdminAssistant";

const BASE = "https://platform.foodhelpline.org";

type ResourceStats = {
  total: number;
  pantries: number;
  kitchens: number;
  openToday: number;
  openThisWeek: number;
};

async function fetchCount(params: Record<string, string>): Promise<number> {
  const qs = new URLSearchParams({ take: "1", ...params });
  const res = await fetch(`${BASE}/api/resources?${qs}`);
  const raw = await res.json();
  return (raw.json?.count ?? 0) as number;
}

function todayRange(): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return `${start.toISOString()}/${end.toISOString()}`;
}

function weekRange(): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);
  return `${start.toISOString()}/${end.toISOString()}`;
}

function StatCard({
  label,
  value,
  sub,
  color = "text-slate-800",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-amber-50/60 p-4 ring-1 ring-slate-100">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  );
}

export default function AdminDashboard() {
  const { events } = useEvents();
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [total, pantries, kitchens, openToday, openThisWeek] =
          await Promise.all([
            fetchCount({}),
            fetchCount({ resourceTypeId: "FOOD_PANTRY" }),
            fetchCount({ resourceTypeId: "SOUP_KITCHEN" }),
            fetchCount({ occurrencesWithin: todayRange() }),
            fetchCount({ occurrencesWithin: weekRange() }),
          ]);
        setStats({ total, pantries, kitchens, openToday, openThisWeek });
      } catch {
        setError("Failed to load resource data from Lemontree API.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const now = new Date();
  const upcomingEvents = events
    .filter((e) => new Date(e.start_time) > now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const pastEvents = events
    .filter((e) => new Date(e.start_time) <= now)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  const coverageRatio =
    stats && stats.total > 0
      ? ((events.length / stats.total) * 100).toFixed(2)
      : null;

  return (
    <>
      <div className="flex min-h-screen flex-col bg-amber-50">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-yellow-200 bg-yellow-400 px-6 py-4 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-300 shadow-md">
              <span className="text-2xl" aria-hidden="true">
                🍋
              </span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
                Admin Dashboard
              </h1>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-800/80">
                Analytics &amp; Network Overview
              </p>
            </div>
          </div>
          <Link
            href="/hub"
            className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700"
          >
            ← Back to Explorer
          </Link>
        </header>

        <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
          {/* Flyering Activity */}
          <section className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-100">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Flyering Activity
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Total Events" value={events.length} />
              <StatCard
                label="Upcoming"
                value={upcomingEvents.length}
                />
              <StatCard label="Past Events" value={pastEvents.length} />
              <StatCard
                label="Network Coverage"
                value={coverageRatio != null ? `${coverageRatio}%` : "—"}
                sub="flyering events vs total resources"
              />
            </div>
          </section>

          {/* Resource Network */}
          <section className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-100">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Lemontree Resource Network
            </h2>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" aria-hidden />
                Loading resource data…
              </div>
            ) : error ? (
              <p className="text-sm font-medium text-red-500">{error}</p>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard
                  label="Total Resources"
                  value={stats.total.toLocaleString()}
                />
                <StatCard
                  label="Food Pantries"
                  value={stats.pantries.toLocaleString()}
                />
                <StatCard
                  label="Soup Kitchens"
                  value={stats.kitchens.toLocaleString()}
                />
                <StatCard
                  label="Open Today"
                  value={stats.openToday.toLocaleString()}
                />
                <StatCard
                  label="Open This Week"
                  value={stats.openThisWeek.toLocaleString()}
                />
              </div>
            ) : null}
          </section>

          {/* Upcoming Flyering Events */}
          <section className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-100">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Upcoming Flyering Events
            </h2>
            {upcomingEvents.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-yellow-200 bg-amber-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-500">No upcoming events.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm transition-colors hover:border-purple-200 hover:bg-purple-50/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{event.address}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(event.start_time).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <span className="ml-3 shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      <span aria-hidden="true">👥</span>
                      {event.attendees?.length ?? 0}/20
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <section className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-100">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Past Flyering Events
              </h2>
              <div className="space-y-2">
                {pastEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-amber-50/40 px-3 py-2.5 shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-500">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">{event.address}</p>
                    </div>
                    <div className="ml-3 shrink-0 text-right text-xs text-slate-400">
                      {new Date(event.start_time).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      <ZestyAdminAssistant resourceStats={stats} />
    </>
  );
}
