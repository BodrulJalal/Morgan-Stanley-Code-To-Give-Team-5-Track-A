# 🍋 Lemontree Hackathon Project

## 🛠 Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Maps:** Mapbox GL JS

## Volunteer Flyering Hub
- **Map:** NYC-centered map with flyering events as pins; click a pin for a popup with details and RSVP.
- **Right panel:** Create new events (name, lat/lng, date) and **Download Area Flyer** for any event/location. The flyer is generated via `GET https://platform.foodhelpline.org/api/resources.pdf?lat=…&lng=…&locationName=…` (returns PDF; 400/422 handled in UI).

## 🚀 Getting Started
1. `npm install`
2. **Environment:** Create a `.env.local` in the project root. Example:
   ```bash
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   - `NEXT_PUBLIC_API_URL` is the FastAPI backend base URL (defaults to `http://localhost:8000` if unset).
   - Get a Mapbox token from the keys channel in our discord server.
3. Run the backend (e.g. `uvicorn main:app --reload` from `backend/`) then `npm run dev`.

## 🤝 Contribution Rules
- **No pushing to `main`.**
- Create a feature branch: `git checkout -b feature/name`
- Open a Pull Request for review.
