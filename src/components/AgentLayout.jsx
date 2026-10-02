import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AgentSidebar from "./AgentSidebar";
import AgentTopbar from "./AgentTopbar";

function AgentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar (Mobile Slide-out & Desktop Sticky) */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 shrink-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <AgentSidebar closeMobileMenu={closeSidebar} />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar handling mobile toggle button */}
        <AgentTopbar onMenuToggle={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AgentLayout;