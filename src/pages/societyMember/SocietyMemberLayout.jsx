import React, {
  useEffect,
  useState
} from "react";

import {
  Outlet
} from "react-router-dom";

import MemberHeader
  from "./components/MemberHeader";

import MemberBottomNav
  from "./components/MemberBottomNav";

import MemberSidebar
  from "./components/MemberSidebar";


function SocietyMemberLayout() {

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [member, setMember] =
    useState(null);


  useEffect(() => {

    try {

      const stored =
        localStorage.getItem(
          "societyMember"
        );

      if (stored) {

        setMember(
          JSON.parse(stored)
        );

      }

    } catch (error) {

      console.error(
        "Member storage error:",
        error
      );

    }

  }, []);


  return (
    <div className="
      min-h-screen
      bg-[#f6f8fb]
      text-slate-900
      font-sans
    ">

      <MemberHeader
        member={member}
        onMenuClick={() =>
          setSidebarOpen(true)
        }
      />


      <MemberSidebar
        open={sidebarOpen}
        member={member}
        onClose={() =>
          setSidebarOpen(false)
        }
      />


      {/* CONTENT */}

      <main className="
        w-full
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        lg:px-8
        pt-5
        pb-24
        md:pb-10
      ">

        <Outlet />

      </main>


      <MemberBottomNav />

    </div>
  );
}

export default SocietyMemberLayout;