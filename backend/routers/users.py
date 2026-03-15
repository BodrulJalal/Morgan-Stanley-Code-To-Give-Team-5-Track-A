# User related stuff

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client
import os

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") 

if not (SUPABASE_URL or SUPABASE_SERVICE_KEY):
	raise RuntimeError ("Missing Supbase URL or Service Key in .env file")

supabase: Client = create_client (SUPABASE_URL, SUPABASE_SERVICE_KEY)
 
router = APIRouter()
 
 
class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


@router.get("/{user_id}")
def get_profile(user_id: str):
	result = (
		supabase.table("profiles")
		.select("*")
		.eq("id", user_id)
		.single()
		.execute()

	) 

	if not result.data:
		raise HTTPException (status_code=404, detail="Resource (profile) not found")

	return result.data
		
