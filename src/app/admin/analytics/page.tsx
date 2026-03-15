"use client";

import { Container, Stack, Text, Title } from "@mantine/core";
import { EngagementHeatmapAndRecurringSection } from "@/components/admin/EngagementHeatmapAndRecurringSection";
import { OrganizationBreakdownSection } from "@/components/admin/OrganizationBreakdownSection";
import { ParticipationDistributionSection } from "@/components/admin/ParticipationDistributionSection";
import { WeeklyEngagementTrendSection } from "@/components/admin/WeeklyEngagementTrendSection";
import { mockAdminMetrics } from "@/components/data/adminMockData";

export default function AdminAnalyticsOverviewPage() {
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={2}>Analytics</Title>
          <Text c="dimmed" fz="sm">
            Full engagement analytics dashboard with all core charts in one digestible view.
          </Text>
        </div>

        <WeeklyEngagementTrendSection metrics={mockAdminMetrics} />
        <EngagementHeatmapAndRecurringSection metrics={mockAdminMetrics} />
        <ParticipationDistributionSection metrics={mockAdminMetrics} />
        <OrganizationBreakdownSection metrics={mockAdminMetrics} />
      </Stack>
    </Container>
  );
}
