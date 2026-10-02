import React, { useState } from "react";
import {
  FiSearch,
  FiBell,
  FiChevronDown
} from "react-icons/fi";


function Topbar() {

  const [isDropdownOpen, setIsDropdownOpen] =
    useState(false);

  const [workspace, setWorkspace] =
    useState(
      localStorage.getItem("workspace")
      || "society"
    );

  const switchWorkspace = (type) => {

    localStorage.setItem(
      "workspace",
      type
    );
  if (type === "society") {

    window.location.href = "/dashboard";

  }
    setWorkspace(type);

    setIsDropdownOpen(false);

    if (type === "daily") {

    window.location.href = "/daily/dashboard";


    }

  };

  return (
    <div className="bg-white border-b border-[#e2e8f0] px-8 py-3.5 flex justify-between items-center w-full font-sans select-none">

      {/* Search Box */}

      <div className="relative w-[400px]">

        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] text-base" />

        <input
          type="text"
          placeholder="Search members, societies..."
          className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-2.5 pl-11 pr-4 text-xs font-medium text-[#334155] placeholder-[#94a3b8] outline-none focus:border-blue-500 focus:bg-white transition-all"
        />

      </div>

      {/* Right Controls */}

      <div className="flex items-center gap-4">

        {/* Notification */}

        <button className="relative w-10 h-10 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] flex items-center justify-center text-lg hover:bg-slate-50 transition-all">

          <FiBell className="stroke-[2.2]" />

          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#1e60ff] ring-2 ring-white"></span>

        </button>

        {/* Workspace Dropdown */}

        <div className="relative">

          <div
            onClick={() =>
              setIsDropdownOpen(
                !isDropdownOpen
              )
            }
            className="flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-2xl pl-3 pr-4 py-1.5 shadow-sm hover:border-slate-300 transition-all cursor-pointer"
          >

            <div className="w-8 h-8 rounded-xl bg-[#1e60ff] text-white flex items-center justify-center font-black text-xs shadow-sm">

              {workspace === "society"
                ? "S"
                : "D"}

            </div>

            <div className="text-left">

              <h3 className="text-xs font-black text-[#0f172a] tracking-tight uppercase">

                {workspace === "society"
                  ? "Society Group"
                  : "Daily Saving"}

              </h3>

              <p className="text-[9px] font-bold text-[#94a3b8] tracking-widest uppercase mt-0.5">

                Workspace Modes

              </p>

            </div>

            <FiChevronDown className="text-[#64748b] text-xs ml-2 stroke-[2.5]" />

          </div>

          {isDropdownOpen && (

            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">

              <div className="px-4 py-3 border-b font-bold text-sm text-slate-700">
                Switch Workspace
              </div>

              <button
                onClick={() =>
                  switchWorkspace(
                    "society"
                  )
                }
                className="w-full text-left px-4 py-3 hover:bg-slate-50 font-medium"
              >
                Society Group Hub
              </button>

              <button
                onClick={() =>
                  switchWorkspace(
                    "daily"
                  )
                }
                className="w-full text-left px-4 py-3 hover:bg-slate-50 font-medium"
              >
                Finance Group Hub
              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Topbar;