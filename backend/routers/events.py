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
