"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useEvents } from "@/context/EventsContext";
import Link from "next/link";

export default function GroupChatPage() {
  const { eventId } = useParams();
  const { events } = useEvents();
  const event = events.find((e) => e.id === eventId);
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const isOrganizer = event?.isOrganizer;

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, newMessage]);
      setNewMessage("");
    }
  };

  const sendTextBlast = () => {
    alert("Text blast sent to all participants!");
  };

  if (!event) {
    return <p>Event not found.</p>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-yellow-50">
      <header className="flex items-center justify-between bg-yellow-300 px-6 py-4 shadow-md">
        <Link
          href="/messages"
          className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-purple-700"
        >
          ← Back to Messages
        </Link>
        <h1 className="text-xl font-extrabold tracking-tight text-gray-800">
          {event.title} Chat
        </h1>
      </header>

      <main className="relative mx-auto flex h-[calc(100vh-8rem)] w-full max-w-3xl flex-col-reverse space-y-6 overflow-y-auto p-6">
        <div className="flex flex-col-reverse space-y-4 space-y-reverse">
          {messages.map((message, index) => (
            <div
              key={index}
              className="rounded-lg bg-white p-3 shadow-md"
            >
              {message}
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-yellow-50 p-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-300 p-2 shadow-sm"
            />
            <button
              onClick={sendMessage}
              className="rounded-lg bg-yellow-500 px-4 py-2 text-white shadow-md hover:bg-yellow-600"
            >
              Send
            </button>
          </div>
        </div>

        {isOrganizer && (
          <button
            onClick={sendTextBlast}
            className="mt-4 w-full rounded-lg bg-yellow-500 px-4 py-2 text-white shadow-md hover:bg-yellow-600"
          >
            Send Text Blast
          </button>
        )}
      </main>
    </div>
  );
}