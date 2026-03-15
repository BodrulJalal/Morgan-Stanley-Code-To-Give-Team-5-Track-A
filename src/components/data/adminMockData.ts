import { deriveAdminEngagementMetrics } from "@/components/admin/engagementMetrics";
import type {
  ResourceStats,
  VolunteerContact,
  WeeklyReportSummary,
} from "@/components/types/adminDashboard";
import type { FlyeringEvent } from "@/types/events";

const MAX_SPOTS = 20;

function atDayOffset(days: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function makeEvent(
  id: string,
  title: string,
  address: string,
  city: string,
  organizer: string,
  attendees: string[],
  startDayOffset: number,
  startHour: number
): FlyeringEvent {
  const start = atDayOffset(startDayOffset, startHour);
  const end = atDayOffset(startDayOffset, startHour + 2);

  return {
    id,
    title,
    description: `${title} community flyering push`,
    address,
    city,
    lat: 40.7128,
    lng: -74.006,
    start_time: start,
    end_time: end,
    organizer_name: organizer,
    created_by_user_id: null,
    attendees,
    spotsRemaining: Math.max(0, MAX_SPOTS - attendees.length),
  };
}

const TOTAL_UNIQUE_VOLUNTEERS = 350;
const RECURRING_VOLUNTEERS = 289;
const ONE_TIME_VOLUNTEERS = TOTAL_UNIQUE_VOLUNTEERS - RECURRING_VOLUNTEERS;
const PAST_EVENT_COUNT = 900;
const UPCOMING_EVENT_COUNT = 60;
const ORGANIZERS = [
  "Harlem Food Coalition",
  "Bronx Mutual Aid",
  "Queens Community Kitchen",
  "City Relief Network",
  "Brooklyn Hunger Helpers",
];
const CITIES = ["New York", "Bronx", "Queens", "Brooklyn"];
const STREETS = [
  "Lenox Ave",
  "Prospect Ave",
  "Roosevelt Ave",
  "Flatbush Ave",
  "Broadway",
  "Delancey St",
  "Bedford Ave",
  "Parsons Blvd",
];

const recurringPool = Array.from({ length: RECURRING_VOLUNTEERS }, (_, i) =>
  `u_${String(i + 1).padStart(3, "0")}`
);
const oneTimePool = Array.from({ length: ONE_TIME_VOLUNTEERS }, (_, i) =>
  `u_${String(RECURRING_VOLUNTEERS + i + 1).padStart(3, "0")}`
);

function rotatingRecurring(start: number, count: number): string[] {
  return Array.from(
    { length: count },
    (_, idx) => recurringPool[(start + idx) % recurringPool.length]
  );
}

function generatedEventMeta(index: number) {
  const city = CITIES[index % CITIES.length];
  const street = STREETS[index % STREETS.length];
  const organizer = ORGANIZERS[index % ORGANIZERS.length];
  const title = `${city} Outreach Wave #${index + 1}`;
  const address = `${100 + (index % 900)} ${street}`;
  return { city, street, organizer, title, address };
}

const pastEvents = Array.from({ length: PAST_EVENT_COUNT }, (_, i) => {
  const meta = generatedEventMeta(i);
  const attendees = rotatingRecurring(i * 5, 18);
  if (i < oneTimePool.length) {
    attendees.push(oneTimePool[i]);
  }
  return makeEvent(
    `evt_past_${String(i + 1).padStart(4, "0")}`,
    meta.title,
    meta.address,
    meta.city,
    meta.organizer,
    attendees,
    -((PAST_EVENT_COUNT - i) * 2),
    8 + (i % 10)
  );
});

const upcomingEvents = Array.from({ length: UPCOMING_EVENT_COUNT }, (_, i) => {
  const meta = generatedEventMeta(PAST_EVENT_COUNT + i);
  return makeEvent(
    `evt_upcoming_${String(i + 1).padStart(3, "0")}`,
    meta.title,
    meta.address,
    meta.city,
    meta.organizer,
    rotatingRecurring((PAST_EVENT_COUNT + i) * 7, 16),
    (i + 1) * 2,
    9 + (i % 8)
  );
});

export const mockEvents: FlyeringEvent[] = [...pastEvents, ...upcomingEvents];

export const mockResourceStats: ResourceStats = {
  total: 2400,
  pantries: 1700,
  kitchens: 520,
  openToday: 640,
  openThisWeek: 1105,
};

export const mockAdminMetrics = deriveAdminEngagementMetrics(mockEvents);
export const mockCoverageRatio = (
  (mockEvents.length / mockResourceStats.total) *
  100
).toFixed(2);

function statusFromDaysAgo(daysAgo: number): VolunteerContact["status"] {
  if (daysAgo <= 21) return "active";
  if (daysAgo <= 56) return "warm";
  return "inactive";
}

function contactNameForUser(userId: string): string {
  const num = Number(userId.replace("u_", "")) || 0;
  const first = [
    "Avery",
    "Jordan",
    "Taylor",
    "Morgan",
    "Riley",
    "Casey",
    "Cameron",
    "Parker",
    "Quinn",
    "Skyler",
  ];
  const last = [
    "Nguyen",
    "Patel",
    "Rivera",
    "Kim",
    "Morris",
    "Lopez",
    "Ali",
    "Jackson",
    "Chen",
    "Singh",
  ];
  return `${first[num % first.length]} ${last[(num * 3) % last.length]}`;
}

export const mockContacts: VolunteerContact[] = (() => {
  const attendanceCount = new Map<string, number>();
  const lastAttended = new Map<string, string>();

  for (const event of mockEvents) {
    for (const userId of event.attendees) {
      attendanceCount.set(userId, (attendanceCount.get(userId) ?? 0) + 1);
      const existing = lastAttended.get(userId);
      if (!existing || new Date(event.start_time) > new Date(existing)) {
        lastAttended.set(userId, event.start_time);
      }
    }
  }

  return [...attendanceCount.entries()]
    .map(([id, totalEventsAttended], idx) => {
      const lastDate = lastAttended.get(id) ?? new Date().toISOString();
      const daysAgo = Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000);
      return {
        id,
        name: contactNameForUser(id),
        email: `${id}@lemontree-volunteers.org`,
        phone: `+1 (555) 01${String(idx).padStart(2, "0")}`,
        neighborhood: ["Harlem", "Bronx", "Queens", "Brooklyn", "Midtown"][idx % 5],
        totalEventsAttended,
        lastAttendedDate: lastDate,
        status: statusFromDaysAgo(daysAgo),
      };
    })
    .sort((a, b) => b.totalEventsAttended - a.totalEventsAttended);
})();

export const mockWeeklyReports: WeeklyReportSummary[] = (() => {
  const buckets = mockAdminMetrics.weeklyBuckets.filter(
    (w) => w.eventCount > 0 || w.attendanceCount > 0
  );

  const result: WeeklyReportSummary[] = buckets.slice(-8).map((week) => {
    const weekStart = new Date(week.weekKey);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekEvents = mockEvents.filter((event) => {
      const d = new Date(event.start_time);
      return d >= weekStart && d <= weekEnd;
    });

    const orgAttendance = new Map<string, number>();
    for (const event of weekEvents) {
      orgAttendance.set(
        event.organizer_name,
        (orgAttendance.get(event.organizer_name) ?? 0) + (event.attendees?.length ?? 0)
      );
    }
    const topOrganization =
      [...orgAttendance.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const recurringSharePct =
      week.attendanceCount > 0
        ? Math.round((week.returningCount / week.attendanceCount) * 100)
        : 0;

    return {
      weekLabel: week.weekLabel,
      weekStartIso: weekStart.toISOString(),
      weekEndIso: weekEnd.toISOString(),
      totalAttendance: week.attendanceCount,
      uniqueVolunteers: week.uniqueVolunteerCount,
      totalEvents: week.eventCount,
      recurringSharePct,
      topOrganization,
    };
  });

  return result.reverse();
})();
