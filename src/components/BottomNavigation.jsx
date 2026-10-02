import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  PiggyBank,
  BookOpen,
  Landmark,
  User
} from "lucide-react";

function BottomNavigation() {

  const menus = [

    {
      name: "Home",
      path: "/user/dashboard",
      icon: Home
    },

    {
      name: "Saving",
      path: "/user/saving",
      icon: PiggyBank
    },

    {
      name: "Passbook",
      path: "/user/passbook",
      icon: BookOpen
    },

    {
      name: "Loan",
      path: "/user/loan",
      icon: Landmark
    },

    {
      name: "Profile",
      path: "/user/profile",
      icon: User
    }

  ];

  return (

    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">

      <div className="max-w-md mx-auto flex justify-around items-center h-16">

        {menus.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center text-xs transition-all ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-500"
                }`
              }
            >

              {({ isActive }) => (

                <>

                  <div
                    className={`p-2 rounded-full transition-all ${
                      isActive
                        ? "bg-blue-100"
                        : ""
                    }`}
                  >

                    <Icon size={22} />

                  </div>

                  <span className="mt-1">

                    {item.name}

                  </span>

                </>

              )}

            </NavLink>

          );

        })}

      </div>

    </div>

  );

}

export default BottomNavigation;