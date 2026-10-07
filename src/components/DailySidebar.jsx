import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCreditCard,
  FiBriefcase,
  FiUserPlus,
  FiBell,
  FiFileText,
  FiLogOut,
  FiShield,
  FiGrid,
  FiDollarSign,
  FiAlertTriangle,
  FiClock,
  FiAlertCircle,
  FiCheckSquare
} from "react-icons/fi";

function DailySidebar() {
  const location = useLocation();

  const menuClass = (path) => {
    const active = location.pathname === path;

    return `
      flex items-center gap-3
      px-4 py-3
      rounded-xl
      transition-all duration-200
      font-medium
      text-[15px]
      ${
        active
          ? "bg-emerald-50 text-emerald-600 font-semibold border-l-4 border-emerald-600 rounded-l-none"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }
    `;
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col justify-between select-none shadow-sm">
      
      {/* Top Fixed Header / Logo */}
      <div className="p-5 border-b border-slate-200 flex items-center gap-4 shrink-0 bg-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
          <FiShield className="text-white text-xl" />
        </div>
        <div>
          <h1 className="font-black text-xl text-slate-900 leading-tight">
            SRM Finance
          </h1>
          <p className="text-emerald-600 text-xs font-bold tracking-wider uppercase">
            Daily Saving Hub
          </p>
        </div>
      </div>

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8 custom-scrollbar">
        
        {/* Main Menu */}
        <section>
          <p className="text-slate-400 text-xs font-black tracking-widest uppercase mb-4 px-1">
            Main Menu
          </p>
          <nav className="space-y-1.5">
            <Link to="/daily/dashboard" className={menuClass("/daily/dashboard")}>
              <FiHome className="text-lg" />
              <span>Dashboard</span>
            </Link>

            <Link to="/daily-saving" className={menuClass("/daily-saving")}>
              <FiGrid className="text-lg" />
              <span>Areas & Fields</span>
            </Link>

            <Link to="/daily/members" className={menuClass("/daily/members")}>
              <FiUsers className="text-lg" />
              <span>Members</span>
            </Link>

            <Link to="/daily/collections" className={menuClass("/daily/collections")}>
              <FiCreditCard className="text-lg" />
              <span>Savings & Advances</span>
            </Link>

            <Link to="/daily/loansdashboard" className={menuClass("/daily/loansdashboard")}>
              <FiBriefcase className="text-lg" />
              <span>Loans & Advances</span>
            </Link>

            <Link to="/daily/penalty-management" className={menuClass("/daily/penalty-management")}>
              <FiAlertCircle className="text-lg" />
              <span>Penalty Management</span>
            </Link>
          </nav>
        </section>

        {/* Administration Menu */}
        <section>
          <p className="text-slate-400 text-xs font-black tracking-widest uppercase mb-4 px-1">
            Administration
          </p>
          <nav className="space-y-1.5">
            <Link to="/daily/agents" className={menuClass("/daily/agents")}>
              <FiUserPlus className="text-lg" />
              <span>Agent Management</span>
            </Link>

            <Link
  to="/daily/tasks"
  className={menuClass("/daily/tasks")}
>
  <FiCheckSquare className="text-lg" />
  <span>Task Management</span>
</Link>

    <Link
  to="/daily/salary"
  className={menuClass("/daily/salary")}
>
  <FiDollarSign />
  Salary Management
</Link>
<Link
  to="/daily/attendance"
  className={menuClass("/daily/attendance")}
>
  <FiClock />
  Attendance
</Link>
            <Link to="/daily/penalty" className={menuClass("/daily/penalty")}>
              <FiAlertTriangle className="text-lg" />
              <span>Penalty Control</span>
            </Link>

            <Link to="/daily/notifications" className={menuClass("/daily/notifications")}>
              <FiBell className="text-lg" />
              <span>Notifications</span>
            </Link>

            <Link to="/daily/daily-reports" className={menuClass("/daily/daily-reports")}>
              <FiFileText className="text-lg" />
              <span>Reports</span>
            </Link>

            <Link to="/daily/profit-loss" className={menuClass("/daily/profit-loss")}>
              <FiDollarSign className="text-lg" />
              <span>Profit & Loss</span>
            </Link>
          </nav>
        </section>

      </div>

      {/* Fixed Footer */}
      <div className="border-t border-slate-200 p-5 shrink-0 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              DS
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-slate-900 text-sm truncate">
                Daily Supervisor
              </h3>
              <p className="text-xs text-slate-500 truncate">
                daily@srmfinance.com
              </p>
            </div>
          </div>

          <button 
            type="button" 
            aria-label="Logout"
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>

    </aside>
  );
}

export default DailySidebar;