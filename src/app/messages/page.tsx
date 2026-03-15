"use client";

import Link from "next/link";
import { useEvents } from "@/context/EventsContext";
import { useState, useRef, useEffect } from "react";
import type { FlyeringEvent } from "@/types/events";

// ─── Mock messages (swap for real DB calls when ready) ───────────────────────
type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
};

const MOCK_MESSAGES: Record<string, Message[]> = {
  "evt-1": [
    { id: "m1", senderId: "maya", senderName: "Maya G.", text: "Hey everyone! Reminder that we're meeting at 125th & Malcolm X at 9am Saturday 🙌", timestamp: new Date(Date.now() - 1000 * 60 * 45) },
    { id: "m2", senderId: "james", senderName: "James L.", text: "Perfect, I'll bring extra bags and tape. Do we need more volunteers?", timestamp: new Date(Date.now() - 1000 * 60 * 38) },
    { id: "m3", senderId: "you", senderName: "You", text: "I can bring 2 friends! Also confirmed with the church — they'll have water for us.", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: "m4", senderId: "maya", senderName: "Maya G.", text: "Amazing, that's huge. We're at 12 volunteers now — enough for the whole block.", timestamp: new Date(Date.now() - 1000 * 60 * 22) },
  ],
  "evt-2": [
    { id: "m1", senderId: "james", senderName: "James L.", text: "Flyers are printed and ready! 200 copies.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26) },
    { id: "m2", senderId: "you", senderName: "You", text: "Great work James. I'll pick them up Friday evening.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25) },
  ],
  "evt-3": [
    { id: "m1", senderId: "sofia", senderName: "Sofia R.", text: "Can someone cover the north section of Delancey? I'm taking the south.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50) },
    { id: "m2", senderId: "you", senderName: "You", text: "I'll take north, no problem!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 49) },
    { id: "m3", senderId: "sofia", senderName: "Sofia R.", text: "Thank you! Let's sync again Sunday morning before we go.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(title: string) {
  return title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = [
  "bg-yellow-300 text-yellow-900",
  "bg-purple-100 text-purple-800",
  "bg-emerald-100 text-emerald-800",
  "bg-blue-100 text-blue-800",
  "bg-pink-100 text-pink-800",
  "bg-orange-100 text-orange-800",
];

function avatarColor(id: string) {
  const index = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = diff / (1000 * 60 * 60);
  if (hours < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (hours < 48) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatMessageTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function WorkspaceItem({
  event,
  isActive,
  unreadCount,
  onClick,
}: {
  event: FlyeringEvent;
  isActive: boolean;
  unreadCount: number;
  onClick: () => void;
}) {
  const initials = getInitials(event.title);
  const color = avatarColor(event.id);
  const lastMsg = MOCK_MESSAGES[event.id]?.at(-1);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-100 group
        ${isActive
          ? "bg-white border border-gray-200 shadow-sm"
          : "hover:bg-white/60 border border-transparent"
        }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${color}`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-800 truncate leading-tight">
          {event.title}
        </p>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">
          {lastMsg ? lastMsg.text : event.address}
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="flex-shrink-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full px-2 py-0.5">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isMe = msg.senderId === "you";
  return (
    <div className={`flex items-end gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
      {!isMe && (
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600 flex-shrink-0">
          {msg.senderName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
      )}
      <div className={`max-w-[65%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
        {!isMe && (
          <span className="text-[11px] text-gray-400 font-medium mb-1 ml-1">
            {msg.senderName}
          </span>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed
            ${isMe
              ? "bg-gray-900 text-white rounded-br-sm"
              : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
            }`}
        >
          {msg.text}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 mx-1 font-mono">
          {formatMessageTime(msg.timestamp)}
        </span>
      </div>
      {isMe && (
        <div className="w-7 h-7 rounded-full bg-yellow-300 flex items-center justify-center text-[10px] font-bold text-yellow-900 flex-shrink-0">
          N
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { events, loading } = useEvents();
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState<Record<string, number>>({ "evt-1": 3, "evt-6": 2, "evt-3": 1 });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeEvent = events.find((e) => e.id === activeEventId) ?? null;
  const activeMessages = activeEventId ? (messages[activeEventId] ?? []) : [];

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.address.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  function handleSelect(id: string) {
    setActiveEventId(id);
    setUnread((prev) => ({ ...prev, [id]: 0 }));
    inputRef.current?.focus();
  }

  function handleSend() {
    if (!input.trim() || !activeEventId) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: "you",
      senderName: "You",
      text: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => ({
      ...prev,
      [activeEventId]: [...(prev[activeEventId] ?? []), newMsg],
    }));
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-yellow-50 overflow-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between bg-yellow-400 px-5 h-[52px] flex-shrink-0">
        <span className="text-[18px] font-semibold text-gray-900 tracking-tight">
          <span className="inline-block w-6 h-6 bg-gray-900 rounded-full mr-2 align-middle mb-0.5" />
          Lemon
        </span>
        <Link
          href="/"
          className="rounded-full bg-purple-600 hover:bg-purple-700 transition-colors px-4 py-1.5 text-[12px] font-medium text-white"
        >
          ← Back to Explorer
        </Link>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-[280px] flex-shrink-0 bg-yellow-50 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex-shrink-0">
            <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-3">
              Your Workspaces
            </p>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces..."
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 outline-none focus:border-gray-300"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 scrollbar-hide">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse mx-1 mb-1" />
              ))
            ) : filteredEvents.length === 0 ? (
              <p className="text-[13px] text-gray-400 px-3 pt-4">No workspaces found.</p>
            ) : (
              filteredEvents.map((event) => (
                <WorkspaceItem
                  key={event.id}
                  event={event}
                  isActive={activeEventId === event.id}
                  unreadCount={unread[event.id] ?? 0}
                  onClick={() => handleSelect(event.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* ── Chat Panel ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          {activeEvent ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 h-[52px] border-b border-gray-100 flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold flex-shrink-0 ${avatarColor(activeEvent.id)}`}>
                  {getInitials(activeEvent.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 truncate leading-tight">
                    {activeEvent.title}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {activeEvent.address}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-gray-400 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {activeEvent.attendees.length} members
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-hide">
                <div className="flex items-center gap-3 my-2">
                  <hr className="flex-1 border-gray-100" />
                  <span className="text-[11px] text-gray-400">Today</span>
                  <hr className="flex-1 border-gray-100" />
                </div>
                {activeMessages.length === 0 ? (
                  <p className="text-center text-[13px] text-gray-400 pt-8">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  activeMessages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex items-end gap-2.5 px-4 py-3 border-t border-gray-100 flex-shrink-0">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeEvent.title.split(" ").slice(0, 2).join(" ")}…`}
                  rows={1}
                  className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 bg-gray-50 outline-none focus:border-gray-300 leading-relaxed max-h-28 overflow-y-auto scrollbar-hide"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="#1a1a1a" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-10">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-2xl mb-1">
                💬
              </div>
              <p className="text-[15px] font-medium text-gray-800">No workspace selected</p>
              <p className="text-[13px] text-gray-400 max-w-[220px] leading-relaxed">
                Pick a workspace on the left to start chatting with your team.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}