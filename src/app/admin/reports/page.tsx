"use client";

import {
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { jsPDF } from "jspdf";
import { mockWeeklyReports } from "@/components/data/adminMockData";

function exportWeeklyReportPdf(index: number) {
  const row = mockWeeklyReports[index];
  if (!row) return;

  const pdf = new jsPDF();
  pdf.setFontSize(16);
  pdf.text("Lemontree Weekly Volunteer Engagement Report", 14, 18);
  pdf.setFontSize(11);
  pdf.text(`Week: ${row.weekLabel}`, 14, 30);
  pdf.text(
    `Range: ${new Date(row.weekStartIso).toLocaleDateString()} - ${new Date(row.weekEndIso).toLocaleDateString()}`,
    14,
    38
  );

  const lines = [
    `Total attendance: ${row.totalAttendance}`,
    `Unique volunteers: ${row.uniqueVolunteers}`,
    `Total events: ${row.totalEvents}`,
    `Recurring share: ${row.recurringSharePct}%`,
    `Top organization: ${row.topOrganization}`,
  ];

  let y = 52;
  for (const line of lines) {
    pdf.text(line, 14, y);
    y += 8;
  }

  pdf.save(`lemontree-weekly-report-${row.weekLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

export default function AdminReportsPage() {
  const thisWeek = mockWeeklyReports[0];

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={2}>Reports</Title>
          <Text c="dimmed" fz="sm">
            Weekly engagement summaries ready for review and PDF export.
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Card withBorder radius="xl" p="lg">
            <Group justify="space-between" mb="xs">
              <Text fw={600}>This Week&apos;s Report</Text>
              <Button
                size="xs"
                radius="md"
                color="orange"
                leftSection={<IconDownload size={14} />}
                onClick={() => exportWeeklyReportPdf(0)}
              >
                Export PDF
              </Button>
            </Group>
            {thisWeek ? (
              <Stack gap={4}>
                <Text fz="sm">Week: {thisWeek.weekLabel}</Text>
                <Text fz="sm">Total attendance: {thisWeek.totalAttendance}</Text>
                <Text fz="sm">Unique volunteers: {thisWeek.uniqueVolunteers}</Text>
                <Text fz="sm">Total events: {thisWeek.totalEvents}</Text>
                <Text fz="sm">Recurring share: {thisWeek.recurringSharePct}%</Text>
                <Text fz="sm">Top organization: {thisWeek.topOrganization}</Text>
              </Stack>
            ) : (
              <Text c="dimmed" fz="sm">
                No report data available.
              </Text>
            )}
          </Card>

          <Card withBorder radius="xl" p="lg">
            <Text fw={600} mb="xs">
              Report Notes
            </Text>
            <Text fz="sm" c="dimmed">
              Reports are generated from weekly event attendance, unique participation, retention share,
              and top contributing organizations.
            </Text>
          </Card>
        </SimpleGrid>

        <Card withBorder radius="xl" p="lg">
          <Text fw={600} mb="md">
            Weekly Summary History
          </Text>
          <Table striped withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Week</Table.Th>
                <Table.Th>Attendance</Table.Th>
                <Table.Th>Unique Volunteers</Table.Th>
                <Table.Th>Events</Table.Th>
                <Table.Th>Recurring Share</Table.Th>
                <Table.Th>Top Organization</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mockWeeklyReports.map((row, idx) => (
                <Table.Tr key={row.weekStartIso}>
                  <Table.Td>{row.weekLabel}</Table.Td>
                  <Table.Td>{row.totalAttendance}</Table.Td>
                  <Table.Td>{row.uniqueVolunteers}</Table.Td>
                  <Table.Td>{row.totalEvents}</Table.Td>
                  <Table.Td>{row.recurringSharePct}%</Table.Td>
                  <Table.Td>{row.topOrganization}</Table.Td>
                  <Table.Td>
                    <Button
                      size="compact-xs"
                      variant="light"
                      leftSection={<IconDownload size={12} />}
                      onClick={() => exportWeeklyReportPdf(idx)}
                    >
                      Export PDF
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </Stack>
    </Container>
  );
}
