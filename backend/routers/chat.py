from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Annotated
from pydantic import BaseModel
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
		self.rooms: Dict[str, list[WebSocket]] = {}

	async def connect (self, room_id: str, ws: WebSocket):
		await ws.accept()

		if room_id not in self.rooms:
			self.rooms[room_id] = []
		
		self.rooms[room_id].append(ws)

	def disconnect (self, room_id: str, ws: WebSocket):
		self.rooms[room_id].remove(ws)

	async def broadcast (self, room_id: str, message: dict):
		for conn in self.rooms.get(room_id, []):
			await conn.send_json(message)


conn_manager = ConnectionManager()


class SendMessageBody(BaseModel):
	content: str


@router.get("/{room_id}/messages")
def get_messages (room_id: str, limit: int = 75):
	result = (
		supabase.table("messages")
		.select("*, profiles(display_name)")
		.eq("room_id", room_id)
		.order("sent_at", desc=False)
		.limit(limit)
		.execute()
	)

	return {"messages": result.data}


@router.post("/{room_id}/messages", status_code=201)
def post_message(
	room_id: str,
	body: SendMessageBody,
	user_id: Annotated[str, Depends(get_current_user_id)],
):
	result = (
		supabase.table("messages")
		.insert({"room_id": room_id, "user_id": user_id, "content": body.content.strip()})
		.execute()
	)
	if not result.data:
		from fastapi import HTTPException
		raise HTTPException(status_code=500, detail="Failed to insert message")
	return result.data[0]

@router.websocket("/ws/{room_id}")
async def chat (ws: WebSocket, room_id: str, user_id: str):

	await conn_manager.connect(room_id, ws)

	history = (
		supabase.table("messages")
		.select("*, profiles(display_name)")
		.eq("room_id", room_id)
		.order("sent_at", desc=False)
		.limit(50)
		.execute()
	)

	await ws.send_json({"type": "history", "messages": history.data})

	try:
		while True:
			data = await ws.receive_json()

			# 1. Save to DB
			result = supabase.table("messages").insert({
				"room_id": room_id,
				"user_id": user_id,
				"content": data["content"]
			}).execute()

			new_message = result.data[0]

			# 2. Broadcast to everyone in the room including sender
			await conn_manager.broadcast(room_id, {
				"type": "message",
				"message": new_message
			})

	except WebSocketDisconnect:
		conn_manager.disconnect(room_id, ws)


