import React from "react";
import {
  X,
  Home,
  WalletCards,
  BookOpen,
  Landmark,
  UserRound,
  ShieldCheck,
  Phone,
  Info,
  HelpCircle,
  LockKeyhole,
  LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function MemberSidebar({
  open,
  onClose,
  member
}) {

  const navigate = useNavigate();

  const logout = () => {

    localStorage.removeItem(
      "societyMemberToken"
    );

    localStorage.removeItem(
      "societyMember"
    );

    localStorage.removeItem(
      "role"
    );

    navigate("/");

  };


  const mainItems = [
    {
      label: "Dashboard",
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


  const supportItems = [
    {
      label: "Terms & Conditions",
      path: "/society-member/terms",
      icon: ShieldCheck
    },
    {
      label: "Contact Us",
      path: "/society-member/contact",
      icon: Phone
    },
    {
      label: "About SRM Finance",
      path: "/society-member/about",
      icon: Info
    },
    {
      label: "Help & FAQ",
      path: "/society-member/support",
      icon: HelpCircle
    },
    {
      label: "Change Password",
      path: "/society-member/change-password",
      icon: LockKeyhole
    }
  ];


  return (
    <>
      {/* BACKDROP */}

      <div
        onClick={onClose}
        className={`
          fixed
          inset-0
          z-[60]
          bg-slate-950/35
          backdrop-blur-[2px]
          transition-opacity
          md:hidden
          ${
            open
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          }
        `}
      />


      {/* SIDEBAR */}

      <aside className={`
        fixed
        top-0
        bottom-0
        left-0
        z-[70]
        w-[290px]
        max-w-[85vw]
        bg-white
        shadow-2xl
        transition-transform
        duration-300
        md:hidden
        ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}>

        {/* HEADER */}

        <div className="
          px-5
          pt-5
          pb-4
          border-b
          border-slate-100
        ">

          <div className="
            flex
            items-start
            justify-between
            gap-3
          ">

            <div className="
              min-w-0
            ">

              <p className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-blue-600
              ">
                SRM Finance
              </p>

              <h2 className="
                text-lg
                font-extrabold
                text-slate-900
                truncate
                mt-1
              ">
                {member?.name || "Member"}
              </h2>

              <p className="
                text-xs
                font-medium
                text-slate-400
                mt-1
              ">
                ID: {member?.memberId || "--"}
              </p>

            </div>


            <button
              type="button"
              onClick={onClose}
              className="
                w-9
                h-9
                rounded-xl
                flex
                items-center
                justify-center
                text-slate-400
                hover:bg-slate-100
              "
            >
              <X size={19} />
            </button>

          </div>

        </div>


        {/* NAVIGATION */}

        <div className="
          p-4
          overflow-y-auto
          h-[calc(100%-190px)]
        ">

          <p className="
            px-3
            mb-2
            text-[10px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-slate-400
          ">
            Main Menu
          </p>

          <div className="space-y-1">

            {mainItems.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-xl
                    text-sm
                    font-semibold
                    transition
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >

                  <Icon
                    size={18}
                    strokeWidth={2}
                  />

                  {item.label}

                </NavLink>
              );

            })}

          </div>


          <p className="
            px-3
            mt-7
            mb-2
            text-[10px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-slate-400
          ">
            Support & Info
          </p>

          <div className="space-y-1">

            {supportItems.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-xl
                    text-sm
                    font-semibold
                    transition
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >

                  <Icon size={17} />

                  {item.label}

                </NavLink>
              );

            })}

          </div>

        </div>


        {/* LOGOUT */}

        <div className="
          absolute
          bottom-0
          left-0
          right-0
          p-4
          border-t
          border-slate-100
          bg-white
        ">

          <button
            type="button"
            onClick={logout}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              py-3
              rounded-xl
              bg-red-50
              text-red-600
              text-sm
              font-bold
            "
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </aside>
    </>
  );
}

export default MemberSidebar;