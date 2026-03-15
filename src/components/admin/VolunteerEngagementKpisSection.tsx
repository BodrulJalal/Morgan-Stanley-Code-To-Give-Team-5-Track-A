"use client";

import { Box, Card, Group, SimpleGrid, Text, Title } from "@mantine/core";
import { RECENT_WEEK_COUNT, TREND_WINDOW_WEEKS } from "@/components/admin/engagementMetrics";
import { StatCard } from "@/components/admin/StatCard";
import type { AdminEngagementMetrics } from "@/components/types/adminDashboard";

type VolunteerEngagementKpisSectionProps = {
  metrics: AdminEngagementMetrics;
};

export function VolunteerEngagementKpisSection({
  metrics,
}: VolunteerEngagementKpisSectionProps) {
  return (
    <Box
      component="section"
      p="lg"
      style={{
        background: "var(--mantine-color-yellow-1)",
        borderRadius: "var(--mantine-radius-xl)",
      }}
    >
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Card
          withBorder
          radius="lg"
          p="md"
          bg="yellow.0"
          style={{ borderColor: "var(--mantine-color-yellow-3)" }}
        >
          <Group justify="space-between" mb="xs">
            <Title order={6} fz="sm">
              Participation Footprint
            </Title>
            <Text fz="xs" c="violet.6" fw={600}>
              See details
            </Text>
          </Group>
          <SimpleGrid cols={1} spacing="xs">
            <StatCard
              label="Total volunteer engagement"
              value={metrics.totalAttendance.toLocaleString()}
              sub="all attendance records"
            />
            <StatCard
              label="Unique volunteers"
              value={metrics.uniqueVolunteersCount.toLocaleString()}
            />
          </SimpleGrid>
        </Card>

        <Card
          withBorder
          radius="lg"
          p="md"
          bg="yellow.0"
          style={{ borderColor: "var(--mantine-color-yellow-3)" }}
        >
          <Group justify="space-between" mb="xs">
            <Title order={6} fz="sm">
              Event Lifecycle
            </Title>
            <Text fz="xs" c="violet.6" fw={600}>
              See details
            </Text>
          </Group>
          <SimpleGrid cols={1} spacing="xs">
            <StatCard label="Upcoming events" value={metrics.upcomingEvents.length} />
            <StatCard label="Past events" value={metrics.pastEvents.length} />
          </SimpleGrid>
        </Card>

        <Card
          withBorder
          radius="lg"
          p="md"
          bg="yellow.0"
          style={{ borderColor: "var(--mantine-color-yellow-3)" }}
        >
          <Group justify="space-between" mb="xs">
            <Title order={6} fz="sm">
              Momentum & Retention
            </Title>
            <Text fz="xs" c="violet.6" fw={600}>
              See details
            </Text>
          </Group>
          <SimpleGrid cols={1} spacing="xs">
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
      </SimpleGrid>
    </Box>
  );
}
