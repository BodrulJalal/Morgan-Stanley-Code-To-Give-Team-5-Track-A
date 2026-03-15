"use client";

import { Card, SimpleGrid, Text, Title } from "@mantine/core";
import { RECENT_WEEK_COUNT, TREND_WINDOW_WEEKS } from "@/components/admin/engagementMetrics";
import { StatCard } from "@/components/admin/StatCard";
import type { AdminEngagementMetrics } from "@/types/adminDashboard";

type VolunteerEngagementKpisSectionProps = {
  metrics: AdminEngagementMetrics;
};

export function VolunteerEngagementKpisSection({
  metrics,
}: VolunteerEngagementKpisSectionProps) {
  return (
    <Card component="section" radius="xl" withBorder shadow="sm" p="lg">
      <Title order={5} fz="xs" tt="uppercase" c="dimmed" mb="sm">
        Volunteer Engagement Summary
      </Title>
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        <StatCard
          label="Total volunteer engagement"
          value={metrics.totalAttendance.toLocaleString()}
          sub="all attendance records"
        />
        <StatCard
          label="Unique volunteers ever attended"
          value={metrics.uniqueVolunteersCount.toLocaleString()}
        />
        <StatCard label="Upcoming events" value={metrics.upcomingEvents.length} />
        <StatCard label="Past events" value={metrics.pastEvents.length} />
        <StatCard
          label="Recurring volunteers"
          value={metrics.recurringVolunteers.toLocaleString()}
        />
        <StatCard
          label="One-time volunteers"
          value={metrics.oneTimeVolunteers.toLocaleString()}
        />
        <StatCard
          label="Avg participation / week"
          value={metrics.avgParticipationPerWeek.toFixed(1)}
          sub={`Based on last ${RECENT_WEEK_COUNT} weeks`}
        />
        <StatCard
          label="Engagement trend"
          value={`${metrics.attendanceDeltaPct >= 0 ? "+" : ""}${metrics.attendanceDeltaPct.toFixed(1)}%`}
          color={
            metrics.attendanceDeltaPct > 0
              ? "var(--mantine-color-green-6)"
              : metrics.attendanceDeltaPct < 0
                ? "var(--mantine-color-red-6)"
                : "var(--mantine-color-gray-9)"
          }
          sub={`Last ${TREND_WINDOW_WEEKS} weeks vs previous ${TREND_WINDOW_WEEKS} (${metrics.trendDirection})`}
        />
      </SimpleGrid>
    </Card>
  );
}
