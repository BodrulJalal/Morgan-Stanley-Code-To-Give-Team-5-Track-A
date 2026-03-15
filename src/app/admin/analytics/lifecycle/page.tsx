"use client";

import { Container, Stack, Text, Title } from "@mantine/core";
import { EngagementHeatmapAndRecurringSection } from "@/components/admin/EngagementHeatmapAndRecurringSection";
import { PastEventsSection } from "@/components/admin/PastEventsSection";
import { UpcomingEventsSection } from "@/components/admin/UpcomingEventsSection";
import { mockAdminMetrics } from "@/components/data/adminMockData";

export default function LifecycleAnalyticsPage() {
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={2}>Lifecycle Analytics</Title>
          <Text c="dimmed" fz="sm">
            Explore event lifecycle timing and engagement intensity patterns.
          </Text>
        </div>

        <EngagementHeatmapAndRecurringSection
          metrics={mockAdminMetrics}
          showHeatmap
          showRecurring={false}
        />
        <UpcomingEventsSection events={mockAdminMetrics.upcomingEvents.slice(0, 8)} />
        <PastEventsSection events={mockAdminMetrics.pastEvents.slice(0, 8)} />
      </Stack>
    </Container>
  );
}
