from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import events, users

app = FastAPI(title="API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(events.users, prefix="/api/users", tags=["users"])

@app.get("/")
async def root():
    return {"status": "ok", "message": "api is up"}
