"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEvents } from "@/context/EventsContext";

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
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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
    <div className="flex min-h-screen flex-col bg-amber-50">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-yellow-200 bg-yellow-400 px-6 py-4 shadow-md">
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
          href="/"
          className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-purple-700"
        >
          ← Back to Explorer
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-10 p-6">
        {/* Flyering Activity */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Flyering Activity
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Events" value={events.length} />
            <StatCard
              label="Upcoming"
              value={upcomingEvents.length}
              color="text-purple-600"
            />
            <StatCard label="Past Events" value={pastEvents.length} />
            <StatCard
              label="Network Coverage"
              value={coverageRatio != null ? `${coverageRatio}%` : "—"}
              sub="flyering events vs total resources"
              color="text-yellow-600"
            />
          </div>
        </section>

        {/* Resource Network */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Lemontree Resource Network
          </h2>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              Loading resource data…
            </div>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard
                label="Total Resources"
                value={stats.total.toLocaleString()}
              />
              <StatCard
                label="Food Pantries"
                value={stats.pantries.toLocaleString()}
                color="text-green-600"
              />
              <StatCard
                label="Soup Kitchens"
                value={stats.kitchens.toLocaleString()}
                color="text-orange-500"
              />
              <StatCard
                label="Open Today"
                value={stats.openToday.toLocaleString()}
                color="text-blue-600"
              />
              <StatCard
                label="Open This Week"
                value={stats.openThisWeek.toLocaleString()}
                color="text-indigo-600"
              />
            </div>
          ) : null}
        </section>

        {/* Upcoming Flyering Events */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Upcoming Flyering Events
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-slate-400">No upcoming events.</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {event.address}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {new Date(event.start_time).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    <br />
                    {new Date(event.start_time).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Past Flyering Events
            </h2>
            <div className="space-y-2">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/60 px-5 py-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {event.address}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
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
  );
}
