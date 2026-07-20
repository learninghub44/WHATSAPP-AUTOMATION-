"use client";

import { Search, Bell } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-16 border-b border-line flex items-center justify-between px-6 gap-4 bg-paper sticky top-0 z-10">
      <div className="relative w-full max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          placeholder="Search conversations, contacts..."
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface text-sm text-ink placeholder:text-ink-faint outline-none focus:ring-2 focus:ring-signal/40"
        />
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <button
          className="relative p-2 rounded-lg hover:bg-surface text-ink-soft"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-signal-soft flex items-center justify-center text-xs font-medium text-signal-deep">
            CT
          </div>
        </div>
      </div>
    </header>
  );
}
