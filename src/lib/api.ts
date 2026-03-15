/**
 * REST API client for the FastAPI backend.
 * In the browser we use relative /api/* so Next.js rewrites proxy to the backend.
 * On the server we use NEXT_PUBLIC_API_URL (default: http://localhost:8000).
 */

import { supabase } from "@/lib/supabase";

function getBaseUrl(): string {
  // Use full backend URL everywhere so the browser sends requests directly to the backend.
  // That way the Authorization header is always sent (Next.js rewrites may not forward it).
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

function apiUrl(path: string): string {
  const base = getBaseUrl();
  if (!base) return path; // relative path for proxy
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : "/" + path}`;
}

export type ApiError = { message: string; status?: number; detail?: unknown };

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? (body as { detail: unknown }).detail
        : String(body || res.statusText);
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg?: string }) => d?.msg ?? JSON.stringify(d)).join(", ")
          : JSON.stringify(detail);
    const err: ApiError = { message, status: res.status, detail };
    throw err;
  }

  return body as T;
}

/** Get headers with Bearer token for authenticated requests. Throws if not logged in. */
async function authHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated. Please log in.");
  }
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

export type ListEventsParams = {
  city?: string;
  date?: string; // YYYY-MM-DD
  upcoming_only?: boolean;
};

/** Raw event row as returned by the API (may use lng or long from DB) */
export interface ApiEventRow {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city?: string;
  lat: number;
  lng?: number;
  long?: number;
  start_time: string;
  end_time: string;
  organizer_name: string;
  created_by_user_id: string | null;
  event_attendees?: { user_id: string }[] | null;
}

export interface ListEventsResponse {
  events: ApiEventRow[];
  count: number;
}

export async function getEvents(
  params?: ListEventsParams
): Promise<ListEventsResponse> {
  const path = "/api/events";
  const url = new URL(path, getBaseUrl() || "http://localhost:3000");
  if (params?.city) url.searchParams.set("city", params.city);
  if (params?.date) url.searchParams.set("date", params.date);
  if (params?.upcoming_only !== undefined)
    url.searchParams.set("upcoming_only", String(params.upcoming_only));
  const fetchUrl = getBaseUrl() ? url.toString() : url.pathname + url.search;

  const res = await fetch(fetchUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handleResponse<ListEventsResponse>(res);
}

export interface CreateEventBody {
  title: string;
  description?: string | null;
  address: string;
  city?: string | null;
  lat: number;
  long: number; // backend expects "long"
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  organizer_name: string;
  created_by_user_id?: string | null;
}

export async function createEvent(body: CreateEventBody): Promise<ApiEventRow> {
  const headers = await authHeaders();
  const { created_by_user_id: _omit, ...payload } = body as CreateEventBody & { created_by_user_id?: string | null };
  const res = await fetch(apiUrl("/api/events"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<ApiEventRow>(res);
}

export interface UserProfile {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const res = await fetch(apiUrl(`/api/users/${encodeURIComponent(userId)}`), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handleResponse<UserProfile>(res);
}

export async function joinEvent(eventId: string): Promise<{ event_id: string; user_id: string }> {
  const headers = await authHeaders();
  const res = await fetch(apiUrl(`/api/events/${encodeURIComponent(eventId)}/attendees`), {
    method: "POST",
    headers,
    body: "{}",
  });
  return handleResponse<{ event_id: string; user_id: string }>(res);
}

export async function leaveEvent(eventId: string): Promise<{ ok: boolean }> {
  const headers = await authHeaders();
  const res = await fetch(
    apiUrl(`/api/events/${encodeURIComponent(eventId)}/attendees/me`),
    { method: "DELETE", headers }
  );
  return handleResponse<{ ok: boolean }>(res);
}
