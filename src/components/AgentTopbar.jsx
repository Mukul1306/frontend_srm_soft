import React from "react";
import { Bell, User, Menu } from "lucide-react";

function AgentTopbar({ onMenuToggle }) {
  const agent = JSON.parse(localStorage.getItem("agent"));

  return (
    <div className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 md:px-8 flex items-center justify-between select-none shrink-0">
      {/* Left: Mobile Toggle + Greeting */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 rounded-xl bg-slate-100/80 text-slate-600 active:bg-slate-200 lg:hidden shrink-0 transition-colors"
          aria-label="Open Mobile Navigation"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight truncate">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400 font-bold tracking-wide uppercase truncate mt-0.5">
            {agent?.name || "System Agent"}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <button
          type="button"
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-95 group"
        >
          <Bell size={16} className="sm:size-[18px] group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
        </button>

        <button
          type="button"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-100 transition-all active:scale-95"
        >
          <User size={16} className="sm:size-[18px]" />
        </button>
      </div>
    </div>
  );
}

export default AgentTopbar;