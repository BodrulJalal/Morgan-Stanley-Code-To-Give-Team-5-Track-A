from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") 

if not (SUPABASE_URL or SUPABASE_SERVICE_KEY):
	raise RuntimeError ("Missing Supbase URL or Service Key in .env file")

supabase: Client = create_client (SUPABASE_URL, SUPABASE_SERVICE_KEY)


class EventCreate(BaseModel): 
	title: str
	description: Optional[str] = None
	address: str
	city: Optional[str] = None
	lat: float
	long: float
	start_time: datetime
	end_time: datetime
	organizer_name: str
	created_by_user_id: Optional[str] = None


class EventUpdate(BaseModel):
	title: Optional[str] = None
	description: Optional[str] = None
	address: Optional[str] = None
	lat: Optional[float] = None
	long: Optional[float] = None
	start_time: Optional[datetime] = None
	end_time: Optional[datetime] = None
	organizer_name: Optional[str] = None


class AttendeeAdd(BaseModel):
	user_id: str


@router.get("")
def list_events (
	city: Optional[str] = Query(None, description="Filter by name"),
	date: Optional[str] = Query(None, description="Filter by the date (YYYY-MM-DD)"), 
	upcoming_only: bool = Query(False, description = "Gets events that haven't ended yet"),

): 

	query = supabase.table("events").select(
		"*, profiles!events_created_by_user_id_fkey(display_name, avatar_url), event_attendees(user_id)"
	)

	if city: 
		query = query.ilike("city", f"%{city}%")

	if date:
		query = query.gte("start_time", f"{date}T00:00:00").lte("start_time", f"{date}T23:59:59")

	if upcoming_only:
		now = datetime.utcnow().isoformat()
		query = query.gte("end_time", now)

	result = query.order("start_time", desc=False).execute()
	return {"events": result.data, "count": len(result.data)}

@router.get("/{event_id}")
def get_event (event_id: str):
	
	result = (
		supabase.table("events")
		.select("*, profiles(display_name, avatar_url), event_attendees(user_id)")
		.eq("id", event_id)
		.single()
		.execute()

	)

	if not result.data:
		raise HTTPException(status_code=404, detail="Resource (event) not found")

	return result.data

def _is_rls_error(e: Exception) -> bool:
	msg = (getattr(e, "message", None) or str(e)).lower()
	return "row-level security" in msg or "policy" in msg or "permission" in msg or "rlspolicy" in msg


@router.post("", status_code=201)
def create_event(event: EventCreate):
	payload = event.model_dump(exclude_none=True)
	# DB column is "lng"; Pydantic uses "long"
	if "long" in payload:
		payload["lng"] = payload.pop("long")
	payload["start_time"] = event.start_time.isoformat()
	payload["end_time"] = event.end_time.isoformat()

	try:
		result = supabase.table("events").insert(payload).execute()
	except Exception as e:
		if _is_rls_error(e):
			raise HTTPException(
				status_code=403,
				detail="Create event denied. Use the Supabase service_role key in backend/.env (Dashboard → Settings → API) so the backend can write to the database.",
			)
		raise HTTPException(status_code=400, detail=str(e))
	if not result.data:
		raise HTTPException(status_code=500, detail="Failed to create (event)")
	return result.data[0]


@router.post("/{event_id}/attendees", status_code=201)
def add_attendee(event_id: str, body: AttendeeAdd):
	row = {"event_id": event_id, "user_id": body.user_id}
	try:
		# Upsert so "already joined" is a no-op instead of 400
		result = supabase.table("event_attendees").upsert(row, on_conflict="event_id, user_id").execute()
	except Exception as e:
		if _is_rls_error(e):
			raise HTTPException(
				status_code=403,
				detail="Join event denied. Use the Supabase service_role key in backend/.env (Dashboard → Settings → API) so the backend can write to the database.",
			)
		raise HTTPException(status_code=400, detail=str(e))
	# Upsert may return 0 rows if event_id/user_id are invalid (e.g. FK)
	if not result.data:
		raise HTTPException(status_code=400, detail="Invalid event or user id.")
	return result.data[0] if isinstance(result.data, list) else result.data


@router.delete("/{event_id}/attendees/{user_id}")
def remove_attendee(event_id: str, user_id: str):
	try:
		supabase.table("event_attendees").delete().eq("event_id", event_id).eq("user_id", user_id).execute()
	except Exception as e:
		if _is_rls_error(e):
			raise HTTPException(
				status_code=403,
				detail="Leave event denied. Use the Supabase service_role key in backend/.env (Dashboard → Settings → API).",
			)
		raise HTTPException(status_code=400, detail=str(e))
	return {"ok": True}

