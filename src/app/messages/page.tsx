"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useEvents } from "@/context/EventsContext";
import type { FlyeringEvent } from "@/types/events";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
};

type Photo = {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  uploadedAt: Date;
};

type Tab = "chat" | "photos";

// ─── Mock data ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-yellow-300 text-yellow-900",
  "bg-purple-100 text-purple-800",
  "bg-emerald-100 text-emerald-800",
  "bg-blue-100 text-blue-800",
  "bg-pink-100 text-pink-800",
  "bg-orange-100 text-orange-800",
] as const;

const INITIAL_UNREAD: Record<string, number> = {
  "evt-1": 3,
  "evt-6": 2,
  "evt-3": 1,
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

// Mock photos use Unsplash source URLs — swap for real uploaded URLs when ready.
const MOCK_PHOTOS: Record<string, Photo[]> = {
  "evt-1": [
    { id: "p1", url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80", caption: "Volunteers lined up and ready to go!", uploadedBy: "Maya G.", uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { id: "p2", url: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&q=80", caption: "Flyers distributed on Malcolm X Blvd", uploadedBy: "James L.", uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: "p3", url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80", caption: "The whole crew after a great morning 🙌", uploadedBy: "You", uploadedAt: new Date(Date.now() - 1000 * 60 * 90) },
    { id: "p4", url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80", caption: "Community members picking up info packs", uploadedBy: "Maya G.", uploadedAt: new Date(Date.now() - 1000 * 60 * 60) },
  ],
  "evt-3": [
    { id: "p1", url: "https://images.unsplash.com/photo-1593113630400-ea4288922559?w=600&q=80", caption: "Starting the walk on Delancey", uploadedBy: "Sofia R.", uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 10) },
    { id: "p2", url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&q=80", caption: "Posting flyers in apartment lobbies", uploadedBy: "You", uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 9) },
  ],
};

// ─── Utils ────────────────────────────────────────────────────────────────────

function getInitials(title: string): string {
  return title.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function avatarColor(id: string): string {
  const index = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatPhotoDate(date: Date): string {
  return date.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── WorkspaceItem ────────────────────────────────────────────────────────────

function WorkspaceItem({ event, isActive, unreadCount, lastMessage, onClick }: {
  event: FlyeringEvent;
  isActive: boolean;
  unreadCount: number;
  lastMessage: Message | undefined;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-100
        ${isActive ? "bg-white border border-gray-200 shadow-sm" : "hover:bg-white/60 border border-transparent"}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarColor(event.id)}`}>
        {getInitials(event.title)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-800 truncate leading-tight">{event.title}</p>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">
          {lastMessage ? lastMessage.text : event.address}
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

// ─── EventDetailsBanner ───────────────────────────────────────────────────────

function EventDetailsBanner({ event }: { event: FlyeringEvent }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="border-b border-gray-100 bg-yellow-50 flex-shrink-0">
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-2.5 text-left hover:bg-yellow-100/60 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 8 3zm-.5 2v4l3 1.5.5-.87-2.5-1.25V5H7.5z"/>
          </svg>
          <span className="text-[12px] font-medium text-yellow-800 truncate">
            {formatEventDate(event.start_time)} · {event.address}
          </span>
        </div>
        <svg className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-3 transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`}
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </button>
      {!collapsed && (
        <div className="px-5 pb-3 grid grid-cols-2 gap-x-6 gap-y-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Organizer</p>
            <p className="text-[12px] text-gray-700">{event.organizer_name}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Spots remaining</p>
            <p className="text-[12px] text-gray-700">{event.spotsRemaining} open</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">About</p>
            <p className="text-[12px] text-gray-600 leading-relaxed">{event.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isMe = msg.senderId === "you";
  return (
    <div className={`flex items-end gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
      {!isMe && (
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600 flex-shrink-0">
          {msg.senderName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
      )}
      <div className={`max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        {!isMe && <span className="text-[11px] text-gray-400 font-medium mb-1 ml-1">{msg.senderName}</span>}
        <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed
          ${isMe ? "bg-gray-900 text-white rounded-br-sm" : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"}`}>
          {msg.text}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 mx-1 font-mono">{formatMessageTime(msg.timestamp)}</span>
      </div>
      {isMe && (
        <div className="w-7 h-7 rounded-full bg-yellow-300 flex items-center justify-center text-[10px] font-bold text-yellow-900 flex-shrink-0">N</div>
      )}
    </div>
  );
}

// ─── PhotoGrid ────────────────────────────────────────────────────────────────

function PhotoGrid({ eventId, photos, onAddPhotos }: {
  eventId: string;
  photos: Photo[];
  onAddPhotos: (eventId: string, newPhotos: Photo[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!validFiles.length) return;

    const newPhotos: Photo[] = validFiles.map((file) => ({
      id: `uploaded-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      caption: file.name.replace(/\.[^.]+$/, ""),
      uploadedBy: "You",
      uploadedAt: new Date(),
    }));
    onAddPhotos(eventId, newPhotos);
  }, [eventId, onAddPhotos]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      {/* Upload strip */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`mx-5 mt-4 mb-5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-6 gap-2 transition-colors cursor-pointer
          ${isDragging ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-gray-50 hover:border-yellow-300 hover:bg-yellow-50/50"}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-yellow-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
          </svg>
        </div>
        <p className="text-[13px] font-medium text-gray-700">Add photos from the event</p>
        <p className="text-[11px] text-gray-400">Drag & drop or click to browse</p>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
      </div>

      {/* Empty state */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 pt-4 pb-10 text-center px-10">
          <p className="text-[13px] text-gray-400">No photos yet — be the first to share one!</p>
        </div>
      ) : (
        <div className="px-5 pb-6">
          {/* Photo count */}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </p>

          {/* Masonry-ish grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setLightbox(photo)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-end p-2.5">
                  <p className="text-white text-[11px] font-medium leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.url} alt={lightbox.caption} className="w-full max-h-[60vh] object-cover" />
            <div className="px-5 py-4">
              <p className="text-[14px] font-medium text-gray-900 mb-1">{lightbox.caption}</p>
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-gray-400">Uploaded by <span className="text-gray-600 font-medium">{lightbox.uploadedBy}</span></p>
                <p className="text-[11px] text-gray-400 font-mono">{formatPhotoDate(lightbox.uploadedAt)}</p>
              </div>
            </div>
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { events, loading } = useEvents();
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [photos, setPhotos] = useState<Record<string, Photo[]>>(MOCK_PHOTOS);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState<Record<string, number>>(INITIAL_UNREAD);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeEvent = events.find((e) => e.id === activeEventId) ?? null;
  const activeMessages = activeEventId ? (messages[activeEventId] ?? []) : [];
  const activePhotos = activeEventId ? (photos[activeEventId] ?? []) : [];

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.address.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (activeTab === "chat") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeTab]);

  // Reset tab to chat when switching workspaces
  useEffect(() => { setActiveTab("chat"); }, [activeEventId]);

  function handleSelect(id: string) {
    setActiveEventId(id);
    setUnread((prev) => ({ ...prev, [id]: 0 }));
    setTimeout(() => inputRef.current?.focus(), 50);
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
    setMessages((prev) => ({ ...prev, [activeEventId]: [...(prev[activeEventId] ?? []), newMsg] }));
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const handleAddPhotos = useCallback((eventId: string, newPhotos: Photo[]) => {
    setPhotos((prev) => ({ ...prev, [eventId]: [...(prev[eventId] ?? []), ...newPhotos] }));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-yellow-50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between bg-yellow-400 px-5 h-[52px] flex-shrink-0">
        <span className="text-[18px] font-semibold text-gray-900 tracking-tight">
          <span className="inline-block w-6 h-6 bg-gray-900 rounded-full mr-2 align-middle mb-0.5" />
          Lemon
        </span>
        <Link href="/" className="rounded-full bg-purple-600 hover:bg-purple-700 transition-colors px-4 py-1.5 text-[12px] font-medium text-white">
          ← Back to Explorer
        </Link>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-[280px] flex-shrink-0 bg-yellow-50 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex-shrink-0">
            <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-3">Your Workspaces</p>
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
                  lastMessage={messages[event.id]?.at(-1)}
                  onClick={() => handleSelect(event.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Chat panel */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          {activeEvent ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 h-[52px] border-b border-gray-100 flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold flex-shrink-0 ${avatarColor(activeEvent.id)}`}>
                  {getInitials(activeEvent.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 truncate leading-tight">{activeEvent.title}</p>
                  <p className="text-[11px] text-gray-400 truncate">{activeEvent.city}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-gray-400 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {activeEvent.attendees.length} members
                </div>
              </div>

              {/* Pinned event details banner */}
              <EventDetailsBanner event={activeEvent} />

              {/* Tab bar */}
              <div className="flex border-b border-gray-100 flex-shrink-0 px-5">
                {(["chat", "photos"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative py-2.5 mr-6 text-[13px] font-medium transition-colors
                      ${activeTab === tab ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {tab === "chat" ? "Chat" : (
                      <span className="flex items-center gap-1.5">
                        Photos
                        {activePhotos.length > 0 && (
                          <span className="bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full px-1.5 py-0.5">
                            {activePhotos.length}
                          </span>
                        )}
                      </span>
                    )}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-yellow-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "chat" ? (
                <>
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-hide">
                    <div className="flex items-center gap-3 my-2">
                      <hr className="flex-1 border-gray-100" />
                      <span className="text-[11px] text-gray-400">Today</span>
                      <hr className="flex-1 border-gray-100" />
                    </div>
                    {activeMessages.length === 0 ? (
                      <p className="text-center text-[13px] text-gray-400 pt-8">No messages yet. Say hello!</p>
                    ) : (
                      activeMessages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
                    )}
                    <div ref={bottomRef} />
                  </div>
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
                <PhotoGrid
                  eventId={activeEvent.id}
                  photos={activePhotos}
                  onAddPhotos={handleAddPhotos}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-10">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-2xl mb-1">💬</div>
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