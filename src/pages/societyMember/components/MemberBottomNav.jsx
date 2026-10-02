import React from "react";
import {
  Home,
  WalletCards,
  BookOpen,
  Landmark,
  UserRound
} from "lucide-react";
import { NavLink } from "react-router-dom";

function MemberBottomNav() {

  const items = [
    {
      label: "Home",
      path: "/society-member/dashboard",
      icon: Home
    },
    {
      label: "Saving",
      path: "/society-member/saving",
      icon: WalletCards
    },
    {
      label: "Passbook",
      path: "/society-member/passbook",
      icon: BookOpen
    },
    {
      label: "Loan",
      path: "/society-member/loan",
      icon: Landmark
    },
    {
      label: "Profile",
      path: "/society-member/profile",
      icon: UserRound
    }
  ];

  return (
    <nav className="
      fixed
      bottom-0
      left-0
      right-0
      z-50
      bg-white
      border-t
      border-slate-200
      md:hidden
    ">

      <div className="
        grid
        grid-cols-5
        h-[68px]
        px-1
        pb-[env(safe-area-inset-bottom)]
      ">

        {items.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex
                flex-col
                items-center
                justify-center
                gap-1
                min-w-0
                transition-colors
                ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400"
                }
              `}
            >

              {({ isActive }) => (
                <>
                  <div className={`
                    w-9
                    h-7
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    ${
                      isActive
                        ? "bg-blue-50"
                        : "bg-transparent"
                    }
                  `}>

                    <Icon
                      size={18}
                      strokeWidth={
                        isActive ? 2.4 : 2
                      }
                    />

                  </div>

                  <span className={`
                    text-[10px]
                    font-semibold
                    leading-none
                    ${
                      isActive
                        ? "text-blue-600"
                        : "text-slate-400"
                    }
                  `}>
                    {item.label}
                  </span>
                </>
              )}

            </NavLink>
          );
        })}

      </div>

    </nav>
  );
}

export default MemberBottomNav;