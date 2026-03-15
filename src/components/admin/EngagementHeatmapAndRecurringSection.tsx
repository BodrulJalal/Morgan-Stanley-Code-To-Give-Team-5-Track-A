"use client";

import { Box, Card, Grid, Text, Title } from "@mantine/core";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PIE_COLORS } from "@/components/admin/engagementMetrics";
import type { AdminEngagementMetrics } from "@/types/adminDashboard";

type EngagementHeatmapAndRecurringSectionProps = {
  metrics: AdminEngagementMetrics;
};

export function EngagementHeatmapAndRecurringSection({
  metrics,
}: EngagementHeatmapAndRecurringSectionProps) {
  return (
    <Grid component="section" gutter="lg">
      <Grid.Col span={{ base: 12, lg: 6 }}>
        <Card radius="xl" withBorder shadow="sm" p="lg">
          <Title order={5} fz="xs" tt="uppercase" c="dimmed">
            Engagement Heatmap
          </Title>
          <Text mt={4} fz="sm" c="dimmed">
            Attendance concentration by day of week and time block.
          </Text>
          <Box mt="md" style={{ overflowX: "auto" }}>
            <Box miw={520}>
              <div className="mb-2 grid grid-cols-8 gap-2 text-[11px] font-medium text-slate-500">
                <span />
                {metrics.heatDays.map((day) => (
                  <span key={day} className="text-center">
                    {day}
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                {metrics.heatRows.map((row) => (
                  <div key={row} className="grid grid-cols-8 items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-500">{row}</span>
                    {metrics.heatDays.map((day) => {
                      const value =
                        metrics.heatmapData.find(
                          (cell) => cell.day === day && cell.hourBucket === row
                        )?.value ?? 0;
                      const alpha = Math.max(0.12, value / metrics.maxHeatValue);
                      return (
                        <div
                          key={`${day}-${row}`}
                          title={`${day} ${row}: ${value} engagement`}
                          className="h-8 rounded-md border border-slate-100"
                          style={{ backgroundColor: `rgba(124, 58, 237, ${alpha})` }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </Box>
          </Box>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 6 }}>
        <Card radius="xl" withBorder shadow="sm" p="lg">
          <Title order={5} fz="xs" tt="uppercase" c="dimmed">
            Recurring vs One-time Participation
          </Title>
          <Text mt={4} fz="sm" c="dimmed">
            Distinguishes retention from single-event attendance.
          </Text>
          {metrics.uniqueVolunteersCount === 0 ? (
            <Text mt="lg" fz="sm" c="dimmed">
              No attendee data yet.
            </Text>
          ) : (
            <Box mt="md" h={288}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.recurringBreakdown}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {metrics.recurringBreakdown.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Card>
      </Grid.Col>
    </Grid>
  );
}
