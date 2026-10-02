import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Wallet,
  BookOpen,
  Landmark,
  User,
  FileText,
  Phone,
  LogOut,
  ChevronRight,
  Building2,
  Shield,
  CircleHelp,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function UserNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Safely parse localStorage
  const member = React.useMemo(() => {
    try {
      const stored = localStorage.getItem("member");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Error reading member data:", e);
      return null;
    }
  }, []);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const logout = () => {
    localStorage.removeItem("member");
    localStorage.removeItem("role");
    navigate("/");
  };

  const navLinks = [
    { text: "Dashboard", link: "/user/dashboard", icon: <Home size={18} /> },
    { text: "Saving", link: "/user/saving", icon: <Wallet size={18} /> },
    { text: "Passbook", link: "/user/passbook", icon: <BookOpen size={18} /> },
    { text: "Loan", link: "/user/loan", icon: <Landmark size={18} /> },
    { text: "Profile", link: "/user/profile", icon: <User size={18} /> },
    
  ];


const secondaryLinks = [
  {
    text: "Terms & Conditions",
    link: "/user/terms",
    icon: <FileText size={18} />,
  },
  {
    text: "Contact Us",
    link: "/user/contact",
    icon: <Phone size={18} />,
  },
  {
    text: "About SRM Finance",
    link: "/user/about",
    icon: <Building2 size={18} />,
  },
  {
    text: "Privacy Policy",
    link: "/user/privacy",
    icon: <Shield size={18} />,
  },
  {
    text: "Help & FAQ",
    link: "/user/help",
    icon: <CircleHelp size={18} />,
  },
];

  return (
    <>
      {/* Main Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-blue-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Portal Info */}
          <Link to="/user/dashboard" className="flex items-center gap-2 group">
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight leading-tight group-hover:text-blue-100 transition">
                SRM Finance
              </h1>
              <p className="text-[10px] sm:text-xs text-blue-200 tracking-wider font-medium uppercase">
                Member Portal
              </p>
            </div>
          </Link>

          {/* Desktop & Tablet Navigation (Shown on md screens and above) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.link;
              return (
                <Link
                  key={item.link}
                  to={item.link}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-white/15 text-white shadow-inner"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right border-r border-blue-600/60 pr-4">
              <p className="text-xs font-bold leading-none text-white">
                {member?.memberName || "Member"}
              </p>
              <p className="text-[10px] text-blue-200 mt-1">
                ID: {member?.memberId || "-"}
              </p>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 bg-blue-800 hover:bg-rose-600 text-white rounded-xl transition shadow-sm flex items-center justify-center"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Menu Toggle (Shown on screens smaller than md) */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 rounded-xl text-white hover:bg-blue-600 transition"
            aria-label="Open Navigation Menu"
          >
            <Menu size={26} />
          </button>

        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Mobile Header Profile Summary */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white p-5 flex items-center justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg mb-2">
              {member?.memberName ? member.memberName.charAt(0).toUpperCase() : "M"}
            </div>
            <h2 className="font-bold text-base leading-tight truncate max-w-[180px]">
              {member?.memberName || "Member Name"}
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              ID: {member?.memberId || "-"}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 text-blue-100 hover:text-white rounded-lg hover:bg-white/10 transition"
            aria-label="Close Navigation Menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Menu
          </p>

          {navLinks.map((item) => (
            <DrawerItem
              key={item.link}
              icon={item.icon}
              text={item.text}
              link={item.link}
              active={location.pathname === item.link}
              onClick={() => setOpen(false)}
            />
          ))}

          <hr className="my-4 border-slate-100" />

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Support & Info
          </p>

          {secondaryLinks.map((item) => (
            <DrawerItem
              key={item.link}
              icon={item.icon}
              text={item.text}
              link={item.link}
              active={location.pathname === item.link}
              onClick={() => setOpen(false)}
            />
          ))}
        </div>

        {/* Mobile Logout Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition text-sm"
          >
            <LogOut size={18} />
            Logout Account
          </button>
        </div>
      </aside>
    </>
  );
}

// Drawer Link Item Component
function DrawerItem({ icon, text, link, active, onClick }) {
  return (
    <Link
      to={link}
      onClick={onClick}
      className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition text-sm font-semibold ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-blue-700" : "text-slate-400"}>
          {icon}
        </span>
        <span>{text}</span>
      </div>
      <ChevronRight
        size={16}
        className={active ? "text-blue-700" : "text-slate-300"}
      />
    </Link>
  );
}

export default UserNavbar;