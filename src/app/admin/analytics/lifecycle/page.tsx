"use client";

import { Container, Loader, Stack, Text, Title } from "@mantine/core";
import { EngagementHeatmapAndRecurringSection } from "@/components/admin/EngagementHeatmapAndRecurringSection";
import { PastEventsSection } from "@/components/admin/PastEventsSection";
import { UpcomingEventsSection } from "@/components/admin/UpcomingEventsSection";
import { useAdminData } from "@/context/AdminDataContext";

export default function LifecycleAnalyticsPage() {
  const { metrics, loading } = useAdminData();

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={2}>Lifecycle Analytics</Title>
          <Text c="dimmed" fz="sm">
            Explore event lifecycle timing and engagement intensity patterns.
          </Text>
        </div>

        {loading || !metrics ? (
          <Loader size="sm" />
        ) : (
          <>
            <EngagementHeatmapAndRecurringSection
              metrics={metrics}
              showHeatmap
              showRecurring={false}
            />
            <UpcomingEventsSection events={metrics.upcomingEvents.slice(0, 8)} />
            <PastEventsSection events={metrics.pastEvents.slice(0, 8)} />
          </>
        )}
      </Stack>
    </Container>
  );
}
