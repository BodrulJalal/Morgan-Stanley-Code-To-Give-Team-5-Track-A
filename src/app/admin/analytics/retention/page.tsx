"use client";

import { Container, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { EngagementHeatmapAndRecurringSection } from "@/components/admin/EngagementHeatmapAndRecurringSection";
import { ParticipationDistributionSection } from "@/components/admin/ParticipationDistributionSection";
import { mockAdminMetrics } from "@/components/data/adminMockData";

export default function RetentionAnalyticsPage() {
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={2}>Retention Analytics</Title>
          <Text c="dimmed" fz="sm">
            Compare recurring vs one-time participation and monitor return behavior over time.
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <EngagementHeatmapAndRecurringSection
            metrics={mockAdminMetrics}
            showHeatmap={false}
            showRecurring
          />
          <ParticipationDistributionSection
            metrics={mockAdminMetrics}
            showHistogram={false}
            showFirstTimeReturning
          />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
