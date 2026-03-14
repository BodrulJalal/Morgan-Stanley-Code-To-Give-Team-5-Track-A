"use client";

import { useCallback, useState } from "react";
import Map, { Marker, Popup, type MarkerEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { FlyeringEvent } from "@/types/events";

const NYC_CENTER = { longitude: -73.9857, latitude: 40.7484 };
const INITIAL_ZOOM = 10;

type VolunteerMapProps = {
  events: FlyeringEvent[];
  selectedEventId: string | null;
  onSelectEvent: (event: FlyeringEvent | null) => void;
  onRSVP?: (event: FlyeringEvent) => void;
};

function EventPin({ hasSpots }: { hasSpots: boolean }) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow-md transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="View event"
    >
      <span
        className={`h-2 w-2 rounded-full ${hasSpots ? "bg-green-600" : "bg-gray-500"}`}
        title={hasSpots ? "Spots available" : "Full"}
      />
    </button>
  );
}

export function VolunteerMap({
  events,
  selectedEventId,
  onSelectEvent,
  onRSVP,
}: VolunteerMapProps) {
  const [popupEventId, setPopupEventId] = useState<string | null>(null);

  const handleMarkerClick = useCallback(
    (e: MarkerEvent<MouseEvent>, event: FlyeringEvent) => {
      e.originalEvent?.stopPropagation();
      setPopupEventId(event.id);
      onSelectEvent(event);
    },
    [onSelectEvent]
  );

  const handleClosePopup = useCallback(() => {
    setPopupEventId(null);
    onSelectEvent(null);
  }, [onSelectEvent]);

  const popupEvent = events.find((e) => e.id === popupEventId) ?? null;

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!mapboxToken) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-slate-100 p-8 text-center">
        <p className="text-slate-600">
          Add <code className="rounded bg-slate-200 px-1">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{" "}
          <code className="rounded bg-slate-200 px-1">.env.local</code> to load the map.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 shadow-inner">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          ...NYC_CENTER,
          zoom: INITIAL_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        styleDiffing={false}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            longitude={event.lng}
            latitude={event.lat}
            anchor="center"
            onClick={(e) => handleMarkerClick(e, event)}
          >
            <EventPin hasSpots={event.spotsRemaining > 0} />
          </Marker>
        ))}

        {popupEvent && (
          <Popup
            key={popupEvent.id}
            longitude={popupEvent.lng}
            latitude={popupEvent.lat}
            onClose={handleClosePopup}
            closeButton
            closeOnClick={false}
            anchor="bottom"
            className="volunteer-event-popup"
          >
            <div className="min-w-[200px] p-1">
              <h3 className="font-semibold text-slate-900">{popupEvent.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {new Date(popupEvent.date).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="text-sm text-slate-500">by {popupEvent.organizerName}</p>
              <p className="mt-1 text-xs text-slate-500">{popupEvent.address}</p>
              <p className="mt-1 line-clamp-3 text-xs text-slate-600">
                {popupEvent.description}
              </p>
              <p className="mt-1 text-sm">
                {popupEvent.spotsRemaining > 0 ? (
                  <span className="text-green-700">{popupEvent.spotsRemaining} spots left</span>
                ) : (
                  <span className="text-amber-700">Fully booked</span>
                )}
              </p>
              {onRSVP && popupEvent.spotsRemaining > 0 && (
                <button
                  type="button"
                  onClick={() => onRSVP(popupEvent)}
                  className="mt-3 w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white shadow hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                >
                  RSVP
                </button>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
