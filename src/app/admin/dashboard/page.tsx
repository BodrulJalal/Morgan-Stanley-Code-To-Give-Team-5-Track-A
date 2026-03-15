"use client";

import { Container, Stack, Text, Title } from "@mantine/core";
import { ZestyAdminAssistant } from "@/components/ZestyAdminAssistant";
import { ResourceNetworkSection } from "@/components/admin/ResourceNetworkSection";
import { VolunteerEngagementKpisSection } from "@/components/admin/VolunteerEngagementKpisSection";
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
              Overview of volunteer engagement and network status. Use See details for category
              analytics.
            </Text>
          </div>

          <ResourceNetworkSection
            eventsCount={mockEvents.length}
            coverageRatio={mockCoverageRatio}
            loading={false}
            error={null}
            stats={mockResourceStats}
          />
          <VolunteerEngagementKpisSection metrics={mockAdminMetrics} />
        </Stack>
      </Container>
      <ZestyAdminAssistant resourceStats={mockResourceStats} />
    </>
  );
}
