"use client";

import { Container, Loader, Stack, Text, Title } from "@mantine/core";
import { ZestyAdminAssistant } from "@/components/ZestyAdminAssistant";
import { ResourceNetworkSection } from "@/components/admin/ResourceNetworkSection";
import { VolunteerEngagementKpisSection } from "@/components/admin/VolunteerEngagementKpisSection";
import { useAdminData } from "@/context/AdminDataContext";

export default function AdminDashboardPage() {
  const { events, metrics, resourceStats, coverageRatio, loading, error } = useAdminData();

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
            eventsCount={events.length}
            coverageRatio={coverageRatio}
            loading={loading}
            error={error}
            stats={resourceStats}
          />
          {loading ? (
            <Loader size="sm" />
          ) : metrics ? (
            <VolunteerEngagementKpisSection metrics={metrics} />
          ) : null}
        </Stack>
      </Container>
      <ZestyAdminAssistant resourceStats={resourceStats ?? null} />
    </>
  );
}
