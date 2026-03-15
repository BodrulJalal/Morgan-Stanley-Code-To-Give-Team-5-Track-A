"use client";

import Link from "next/link";
import { useEvents } from "@/context/EventsContext";

export default function MessagesLandingPage() {
  const { events } = useEvents();

  return (
    <div className="flex min-h-screen flex-col bg-yellow-50">
      <header className="flex items-center justify-between bg-yellow-300 px-6 py-4 shadow-md">
        <h1 className="text-xl font-extrabold tracking-tight text-gray-800">
          Messages
        </h1>
        <Link
          href="/"
          className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-purple-700"
        >
          ← Back to Explorer
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-6 p-6 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide relative">
        <h2 className="text-lg font-semibold text-gray-800">Your Group Chats</h2>
        <div className="flex flex-col space-y-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/messages/${event.id}`}
              className="block w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md hover:bg-yellow-100"
            >
              <h3 className="text-sm font-bold text-gray-800">{event.title}</h3>
              <p className="text-xs text-gray-600">{event.address}</p>
            </Link>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <span className="animate-bounce text-gray-500">⌄</span>
        </div>
      </main>
    </div>
  );
}