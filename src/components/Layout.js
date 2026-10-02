import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import DailySidebar from "./DailySidebar";
import Topbar from "./Topbar";

function Layout() {

  const workspace =
    localStorage.getItem("workspace")
    || "society";

  return (

    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc]">

      {
        workspace === "daily"
        ? <DailySidebar />
        : <Sidebar />
      }

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">

          <Outlet />

        </main>

      </div>

    </div>

  );

}

export default Layout;