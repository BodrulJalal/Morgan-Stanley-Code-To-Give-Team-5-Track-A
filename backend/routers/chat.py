from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import dict
import os

from auth import get_current_user_id

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") 

if not (SUPABASE_URL or SUPABASE_SERVICE_KEY):
	raise RuntimeError ("Missing Supbase URL or Service Key in .env file")

supabase: Client = create_client (SUPABASE_URL, SUPABASE_SERVICE_KEY)


# For each event UUID, there is a list of websocket connections

class ConnectionManager: 
	def __init__ (self): 
		self.rooms: dict[str, list[WebSocket]] = {}
