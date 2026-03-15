# Backend (FastAPI + Supabase)

## Run

```bash
pip install -r requirements.txt
# Create backend/.env from .env.example and set SUPABASE_URL + SUPABASE_SERVICE_KEY
python -m uvicorn main:app --reload
```

## Create event & Join event

Create event and Join/Leave event **require the Supabase service_role key** in `backend/.env` as `SUPABASE_SERVICE_KEY`. The anon key only has read access under Row Level Security (RLS); writes will be denied.

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings** → **API**.
2. Copy the **service_role** key (secret, not the anon key).
3. In `backend/.env` set: `SUPABASE_SERVICE_KEY=<paste service_role key>`.
4. Restart the backend.

You do **not** need to be logged in as a user in the app. The backend uses the service role to perform writes on behalf of the app; the frontend still sends a placeholder user id for “who created” / “who joined” until you add real auth.
