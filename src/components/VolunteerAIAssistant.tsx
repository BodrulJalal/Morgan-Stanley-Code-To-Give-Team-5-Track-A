"use client";

import { useState } from "react";

export function VolunteerAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // No API logic yet — just clear input for now
    setInputValue("");
  };

  return (
    <>
      {/* Chat panel above the button */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-40 flex w-[min(360px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-yellow-200 bg-white shadow-xl ring-1 ring-slate-200"
          role="dialog"
          aria-label="Zesty chat"
        >
          <div className="border-b border-slate-100 bg-amber-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Zesty
            </h2>
            <p className="mt-0.5 text-xs text-slate-600">
              Ask about events, flyers, or volunteering.
            </p>
          </div>
          <div className="min-h-[120px] flex-1 bg-slate-50/50 p-3">
            <p className="text-sm text-slate-700">Hi! Need some help? Ask Zesty! 🍋</p>
          </div>
          <form
            onSubmit={handleSend}
            className="flex gap-2 border-t border-slate-100 p-3"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message…"
              aria-label="Message"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating lemon button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-yellow-300 bg-yellow-400 text-2xl shadow-lg ring-2 ring-yellow-500/50 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-label={isOpen ? "Close Zesty" : "Open Zesty"}
        aria-expanded={isOpen}
      >
        <img src="/lemon-mascot.png" alt="Zesty" className="h-12 w-12 rounded-full object-cover" />
      </button>
    </>
  );
}
