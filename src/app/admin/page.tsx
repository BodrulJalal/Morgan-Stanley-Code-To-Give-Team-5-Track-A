"use client";

import { useEffect, useState } from "react";
import { useEvents } from "@/context/EventsContext";
import { ZestyAdminAssistant } from "@/components/ZestyAdminAssistant";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataAssumptionsSection } from "@/components/admin/DataAssumptionsSection";
import {
  deriveAdminEngagementMetrics,
} from "@/components/admin/engagementMetrics";
import { EngagementHeatmapAndRecurringSection } from "@/components/admin/EngagementHeatmapAndRecurringSection";
import { OrganizationBreakdownSection } from "@/components/admin/OrganizationBreakdownSection";
import { ParticipationDistributionSection } from "@/components/admin/ParticipationDistributionSection";
import { PastEventsSection } from "@/components/admin/PastEventsSection";
import { ResourceNetworkSection } from "@/components/admin/ResourceNetworkSection";
import type { ResourceStats } from "@/components/admin/types";
import { UpcomingEventsSection } from "@/components/admin/UpcomingEventsSection";
import { VolunteerEngagementKpisSection } from "@/components/admin/VolunteerEngagementKpisSection";
import { WeeklyEngagementTrendSection } from "@/components/admin/WeeklyEngagementTrendSection";

const BASE = "https://platform.foodhelpline.org";

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

  const metrics = deriveAdminEngagementMetrics(events);

  const coverageRatio =
    stats && stats.total > 0
      ? ((events.length / stats.total) * 100).toFixed(2)
      : null;

  return (
    <>
      <div className="flex min-h-screen flex-col bg-amber-50">
        <AdminHeader title="Admin Dashboard" subtitle="Analytics & Network Overview" />

        <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
          <VolunteerEngagementKpisSection metrics={metrics} />
          <WeeklyEngagementTrendSection metrics={metrics} />
          <EngagementHeatmapAndRecurringSection metrics={metrics} />
          <OrganizationBreakdownSection metrics={metrics} />
          <ParticipationDistributionSection metrics={metrics} />
          <ResourceNetworkSection
            eventsCount={events.length}
            coverageRatio={coverageRatio}
            loading={loading}
            error={error}
            stats={stats}
          />
          <UpcomingEventsSection events={metrics.upcomingEvents} />
          <DataAssumptionsSection />
          <PastEventsSection events={metrics.pastEvents} />
        </main>
      </div>
      <ZestyAdminAssistant resourceStats={stats} />
    </>
  );
}
