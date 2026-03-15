"use client";

import { Container, Stack, Text, Title } from "@mantine/core";
import { ZestyAdminAssistant } from "@/components/ZestyAdminAssistant";
import { EngagementHeatmapAndRecurringSection } from "@/components/admin/EngagementHeatmapAndRecurringSection";
import { OrganizationBreakdownSection } from "@/components/admin/OrganizationBreakdownSection";
import { ResourceNetworkSection } from "@/components/admin/ResourceNetworkSection";
import { VolunteerEngagementKpisSection } from "@/components/admin/VolunteerEngagementKpisSection";
import { WeeklyEngagementTrendSection } from "@/components/admin/WeeklyEngagementTrendSection";
import {
  mockAdminMetrics,
  mockCoverageRatio,
  mockEvents,
  mockResourceStats,
} from "@/components/data/adminMockData";

export default function AdminDashboardPage() {
  return (
    <>
      <Container size="xl" py="md">
        <Stack gap="lg">
          <div>
            <Title order={2}>Dashboard</Title>
            <Text c="dimmed" fz="sm">
              Overview of volunteer engagement, event momentum, and organization participation.
            </Text>
          </div>

          <VolunteerEngagementKpisSection metrics={mockAdminMetrics} />
          <WeeklyEngagementTrendSection metrics={mockAdminMetrics} />
          <EngagementHeatmapAndRecurringSection metrics={mockAdminMetrics} />
          <OrganizationBreakdownSection metrics={mockAdminMetrics} />
          <ResourceNetworkSection
            eventsCount={mockEvents.length}
            coverageRatio={mockCoverageRatio}
            loading={false}
            error={null}
            stats={mockResourceStats}
          />
        </Stack>
      </Container>
      <ZestyAdminAssistant resourceStats={mockResourceStats} />
    </>
  );
}
