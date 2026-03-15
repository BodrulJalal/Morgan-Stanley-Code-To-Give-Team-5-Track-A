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

4. To run the backend, make sure you have the proper keys in a local env file. 
   Then follow the commands below, be in the same folder as the hidden .git dir.
   ```
	cd backend     			  # Should be in this dir for requirements.txt file
	python3 -m venv .venv     # Ease of use for development
	pip -r requirements.txt   # Gets the required dependencies
    uvicorn main:app --reload # Starts the server on localhost:8000
   ```
	Accessing http://127.0.0.1:8000/docs gives access to a really useful view of 
	the currently available endpoints. This can be used to test out behavior 
	of get requests and also post requests (note that post requests do modify 
	the database so use carefully!)

## 🤝 Contribution Rules
- **No pushing to `main`.**
- Create a feature branch: `git checkout -b feature/name`
- Open a Pull Request for review.
