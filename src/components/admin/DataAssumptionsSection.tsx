"use client";

import { Card, List, Text, ThemeIcon, Title } from "@mantine/core";

export function DataAssumptionsSection() {
  return (
    <Card component="section" radius="xl" withBorder shadow="sm" p="lg">
      <Title order={5} fz="xs" tt="uppercase" c="dimmed" mb="sm">
        Data Assumptions
      </Title>
      <List spacing="xs" size="sm" icon={<ThemeIcon size={16} radius="xl">•</ThemeIcon>}>
        <List.Item>
          <Text fz="sm">
            Engagement is measured from event attendee records (`event_attendees`).
          </Text>
        </List.Item>
        <List.Item>
          <Text fz="sm">Organization participation is grouped by `organizer_name` on each event.</Text>
        </List.Item>
        <List.Item>
          <Text fz="sm">
          First-time vs returning trend is inferred by the first observed event attendance timestamp
          per volunteer.
          </Text>
        </List.Item>
        <List.Item>
          <Text fz="sm">
          This dashboard does not include flyer-post confirmations yet because flyer actions are
          currently stored client-side only.
          </Text>
        </List.Item>
      </List>
    </Card>
  );
}
