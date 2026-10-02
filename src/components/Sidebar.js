import React from "react";
import { Link, useLocation } from "react-router-dom"; // Added useLocation for exact active routing style highlights

import {
  FiGrid,
  FiUsers,
  FiCreditCard,
  FiFileText,
  FiSettings,
  FiHome,
  FiShield,
  FiBriefcase,
  FiPercent,

  FiLogOut,
  FiTrendingUp
} from "react-icons/fi";

function Sidebar() {
  const location = useLocation(); // Keeps track of what route is currently active to highlight it cleanly

  // A tiny internal helper to style links when they match the current page route
  const getNavLinkClass = (path) => {
    const baseClass = "flex items-center justify-between p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-150 group cursor-pointer";
    if (location.pathname === path) {
      return `${baseClass} bg-[#eff6ff] text-[#1e60ff]`;
    }
    return `${baseClass} text-[#64748b] hover:bg-[#f8fafc] hover:text-[#334155]`;
  };

  return (
    <div className="w-72 bg-white border-r border-[#e2e8f0] min-h-screen flex flex-col justify-between font-sans shrink-0 select-none">
      
      <div>
        {/* Top Branding Section */}
        <div className="p-6 border-b border-[#f1f5f9] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1e60ff] text-white flex items-center justify-center text-xl shadow-md shadow-blue-200">
            <FiShield className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#0f172a] tracking-tight leading-tight">
              SRM Finance
            </h1>
            <p className="text-[10px] font-extrabold text-[#94a3b8] tracking-widest uppercase mt-0.5">
              Society Cluster
            </p>
          </div>
        </div>

        {/* Navigation Blocks */}
        <div className="p-4 space-y-7">
          
          {/* Main Menu Section */}
          <div>
            <p className="text-[10px] font-black text-[#94a3b8] px-3 mb-3 uppercase tracking-widest">
              Main Menu
            </p>
            <ul className="space-y-1">
              <Link to="/dashboard" className="block">
                <li className={getNavLinkClass("/dashboard")}>
                  <div className="flex items-center gap-3">
                    <FiHome className="text-base stroke-[2]" />
                    <span>Dashboard</span>
                  </div>
                </li>
              </Link>

              <Link to="/societies" className="block">
                <li className={getNavLinkClass("/societies")}>
                  <div className="flex items-center gap-3">
                    <FiGrid className="text-base stroke-[2]" />
                    <span>Societies</span>
                  </div>
                </li>
              </Link>

              <Link to="/members" className="block">
                <li className={getNavLinkClass("/members")}>
                  <div className="flex items-center gap-3">
                    <FiUsers className="text-base stroke-[2]" />
                    <span>Members</span>
                  </div>
                </li>
              </Link>

              <Link to="/payments" className="block">
                <li className={getNavLinkClass("/payments")}>
                  <div className="flex items-center gap-3">
                    <FiCreditCard className="text-base stroke-[2]" />
                    <span>Payments</span>
                  </div>
                
                </li>
              </Link>

              <Link to="/loans" className="block">
                <li className={getNavLinkClass("/loans")}>
                  <div className="flex items-center gap-3">
                    <FiBriefcase className="text-base stroke-[2]" />
                    <span>Loans & Advances</span>
                  </div>
                </li>
              </Link>
            </ul>
          </div>

          {/* Administration Section */}
          <div>
            <p className="text-[10px] font-black text-[#94a3b8] px-3 mb-3 uppercase tracking-widest">
              Administration
            </p>
            <ul className="space-y-1">
              <Link to="/agent-management" className="block">
           
              </Link>

              <Link to="/penalty-rules" className="block">
             
              </Link>
              <Link to="/profit-loss" className="block">
  <li className={getNavLinkClass("/profit-loss")}>
    <div className="flex items-center gap-3">
      <FiTrendingUp className="text-base stroke-[2]" />
      <span>Society Profit & Loss</span>
    </div>
  </li>
</Link>


              <Link to="/reports" className="block">
                <li className={getNavLinkClass("/reports")}>
                  <div className="flex items-center gap-3">
                    <FiFileText className="text-base stroke-[2]" />
                    <span>Reports</span>
                  </div>
                </li>
              </Link>

              <Link to="/terms-and-conditions" className="block">
  <div className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-[#64748b] hover:text-[#334155] hover:bg-white border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer">
    <FiFileText className="text-base stroke-[2]" />
    <span className="uppercase tracking-wider">
      Terms & Conditions
    </span>
  </div>
</Link>

            </ul>
          </div>

        </div>
      </div>

      {/* Footer Area with Settings and Account Badge */}
      <div className="p-4 border-t border-[#f1f5f9] bg-[#f8fafc]/50 space-y-2">
        
        {/* Settings Button */}
        <Link to="/settings" className="block">
          <div className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-[#64748b] hover:text-[#334155] hover:bg-white border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer">
            <FiSettings className="text-base stroke-[2]" />
            <span className="uppercase tracking-wider">Settings</span>
          </div>
        </Link>




        {/* Active Account Identity Profile Row */}
        <div className="flex items-center justify-between p-2 mt-2 bg-white border border-[#e2e8f0] rounded-xl shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#1e60ff] text-white rounded-full flex items-center justify-center text-xs font-black tracking-wide shadow-sm">
              AD
            </div>
            <div className="truncate max-w-[130px]">
              <h3 className="text-xs font-black text-[#0f172a] tracking-tight truncate">
                Admin User
              </h3>
              <p className="text-[10px] font-medium text-[#94a3b8] truncate mt-0.5">
                admin@srmfinance.com
              </p>
            </div>
          </div>
          
          {/* Logout Action Vector */}
          <button className="text-[#94a3b8] hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all">
            <FiLogOut className="text-base stroke-[2.5]" />
          </button>
        </div>

      </div>

    </div>
  );
}

export default Sidebar;