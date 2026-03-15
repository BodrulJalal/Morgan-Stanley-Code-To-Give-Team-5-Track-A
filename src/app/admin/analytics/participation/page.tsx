"use client";

import { Container, Stack, Text, Title } from "@mantine/core";
import { ParticipationDistributionSection } from "@/components/admin/ParticipationDistributionSection";
import { WeeklyEngagementTrendSection } from "@/components/admin/WeeklyEngagementTrendSection";
import { mockAdminMetrics } from "@/components/data/adminMockData";

export default function ParticipationAnalyticsPage() {
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={2}>Participation Analytics</Title>
          <Text c="dimmed" fz="sm">
            Deep-dive into volunteer participation volume, consistency, and frequency mix.
          </Text>
        </div>

        <WeeklyEngagementTrendSection metrics={mockAdminMetrics} />
        <ParticipationDistributionSection metrics={mockAdminMetrics} />
      </Stack>
    </Container>
  );
}
