import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  LogOut,
  CreditCard,
  Building2,
  X,
  Clock,
  ChevronRight,
  ShieldCheck,
  Banknote,
  UserPlus,
  ListTodo,
} from "lucide-react";

function AgentSidebar({ closeMobileMenu }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("agent");
    navigate("/");
  };

const menus = [
  {
    title: "Dashboard",
    path: "/agent/dashboard",
    icon: LayoutDashboard,
  },

  {
    title: "Tasks",
    path: "/agent/tasks",
    icon: ListTodo,
  },

 

  {
    title: "Collection",
    path: "/agent/collection",
    icon: Banknote,
  },
 {
    title: "Member Register",
    path: "/agent/member-register",
    icon: UserPlus,
  },
  {
    title: "Savings",
    path: "/agent/members",
    icon: Users,
  },

  {
    title: "Loans",
    path: "/agent/loans",
    icon: CreditCard,
  },

  {
    title: "History",
    path: "/agent/history",
    icon: Wallet,
  },

  {
    title: "Attendance",
    path: "/agent/attendance",
    icon: Clock,
  },

  {
    title: "Terms & Conditions",
    path: "/agent/terms",
    icon: ShieldCheck,
  },
];
  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 size={18} />
          </div>
          <div>
            <h1 className="text-xs font-black text-slate-900 tracking-wider uppercase">
              SRM Finance
            </h1>
            <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mt-0.5">
              Agent Portal
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={closeMobileMenu}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Close Mobile Navigation"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Items Stack */}
      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all group relative ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20 lg:bg-blue-50/80 lg:text-blue-600 lg:shadow-xs lg:shadow-blue-100/50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={`${
                        isActive
                          ? "text-white lg:text-blue-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      } transition-colors`}
                    />
                    <span className="text-xs tracking-wide">{item.title}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`lg:hidden ${isActive ? "text-white/80" : "text-slate-300"}`}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/30 shrink-0">
        <button
          type="button"
          onClick={() => {
            closeMobileMenu();
            logout();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-all font-medium group"
        >
          <LogOut
            size={18}
            className="text-slate-400 group-hover:text-rose-500 transition-colors"
          />
          <span className="text-xs tracking-wide">System Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AgentSidebar;