import { deriveAdminEngagementMetrics } from "@/components/admin/engagementMetrics";
import type { ResourceStats } from "@/types/adminDashboard";
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

export const mockEvents: FlyeringEvent[] = [
  makeEvent(
    "evt_001",
    "Upper Manhattan Pantry Outreach",
    "210 W 122nd St",
    "New York",
    "Harlem Food Coalition",
    ["u_01", "u_02", "u_03", "u_04", "u_05"],
    -70,
    10
  ),
  makeEvent(
    "evt_002",
    "Bronx Evening Resource Blitz",
    "320 E 149th St",
    "Bronx",
    "Bronx Mutual Aid",
    ["u_02", "u_06", "u_07", "u_08", "u_09", "u_10"],
    -63,
    18
  ),
  makeEvent(
    "evt_003",
    "Queens Pantry Awareness Walk",
    "89-14 Parsons Blvd",
    "Queens",
    "Queens Community Kitchen",
    ["u_01", "u_03", "u_07", "u_11"],
    -56,
    11
  ),
  makeEvent(
    "evt_004",
    "Downtown Resource Flyer Drive",
    "55 Broadway",
    "New York",
    "City Relief Network",
    ["u_04", "u_05", "u_06", "u_12", "u_13"],
    -49,
    14
  ),
  makeEvent(
    "evt_005",
    "Brooklyn Weekend Street Team",
    "101 Flatbush Ave",
    "Brooklyn",
    "Brooklyn Hunger Helpers",
    ["u_01", "u_02", "u_14", "u_15", "u_16", "u_17"],
    -42,
    9
  ),
  makeEvent(
    "evt_006",
    "Elmhurst Multilingual Outreach",
    "82-17 Broadway",
    "Queens",
    "Queens Community Kitchen",
    ["u_03", "u_08", "u_09", "u_10", "u_18"],
    -35,
    16
  ),
  makeEvent(
    "evt_007",
    "South Bronx Pantry Pop-up Push",
    "715 E 138th St",
    "Bronx",
    "Bronx Mutual Aid",
    ["u_02", "u_06", "u_07", "u_19"],
    -28,
    13
  ),
  makeEvent(
    "evt_008",
    "Sunset Park Family Outreach",
    "4501 4th Ave",
    "Brooklyn",
    "Brooklyn Hunger Helpers",
    ["u_01", "u_11", "u_12", "u_13", "u_14"],
    -21,
    10
  ),
  makeEvent(
    "evt_009",
    "Midtown Lunch-Hour Flyers",
    "6th Ave & W 42nd St",
    "New York",
    "City Relief Network",
    ["u_04", "u_05", "u_06", "u_15", "u_16", "u_20"],
    -14,
    12
  ),
  makeEvent(
    "evt_010",
    "Lower East Side Evening Run",
    "175 Delancey St",
    "New York",
    "Harlem Food Coalition",
    ["u_01", "u_02", "u_03", "u_07", "u_21"],
    -7,
    19
  ),
  makeEvent(
    "evt_011",
    "Astoria Pantry Awareness Team",
    "31-12 30th Ave",
    "Queens",
    "Queens Community Kitchen",
    ["u_03", "u_08", "u_09", "u_10", "u_22", "u_23"],
    3,
    11
  ),
  makeEvent(
    "evt_012",
    "Harlem Saturday Outreach Sprint",
    "245 Lenox Ave",
    "New York",
    "Harlem Food Coalition",
    ["u_01", "u_02", "u_04", "u_05", "u_24"],
    10,
    9
  ),
  makeEvent(
    "evt_013",
    "Canarsie Pantry Street Canvass",
    "901 E 92nd St",
    "Brooklyn",
    "Brooklyn Hunger Helpers",
    ["u_11", "u_12", "u_13", "u_14", "u_25"],
    17,
    15
  ),
];

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
