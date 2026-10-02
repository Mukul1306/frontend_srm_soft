import React from "react";
import { Outlet } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import UserNavbar from "../components/UserNavbar";

function UserLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
  <UserNavbar />
      {/* Main Content */}
      <main className="pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

    </div>
  );
}

export default UserLayout;