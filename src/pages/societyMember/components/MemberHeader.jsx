import React from "react";
import {
  Menu,
  Bell,
  Landmark
} from "lucide-react";

function MemberHeader({
  onMenuClick,
  member
}) {
  return (
    <header className="
      sticky
      top-0
      z-50
      h-16
      bg-white
      border-b
      border-slate-200
      px-4
      flex
      items-center
      justify-between
      shadow-[0_1px_8px_rgba(15,23,42,0.04)]
    ">

      <button
        type="button"
        onClick={onMenuClick}
        className="
          w-10 h-10
          flex items-center justify-center
          rounded-xl
          text-slate-600
          hover:bg-slate-100
          active:scale-95
          transition
        "
        aria-label="Open navigation"
      >
        <Menu size={21} strokeWidth={2} />
      </button>


      <div className="flex items-center gap-2.5">

        <div className="
          w-9 h-9
          rounded-xl
          bg-blue-600
          text-white
          flex items-center justify-center
          shadow-sm
        ">
          <Landmark
            size={17}
            strokeWidth={2.2}
          />
        </div>

        <div className="leading-none">

          <p className="
            text-sm
            font-extrabold
            tracking-tight
            text-slate-900
          ">
            SRM Finance
          </p>

          <p className="
            text-[9px]
            font-semibold
            tracking-[0.12em]
            uppercase
            text-slate-400
            mt-1
          ">
            Member Portal
          </p>

        </div>

      </div>


      <button
        type="button"
        className="
          relative
          w-10 h-10
          flex items-center justify-center
          rounded-xl
          text-slate-600
          hover:bg-slate-100
          active:scale-95
          transition
        "
        aria-label="Notifications"
      >
        <Bell
          size={20}
          strokeWidth={2}
        />

        <span className="
          absolute
          top-2
          right-2
          w-2 h-2
          rounded-full
          bg-red-500
          border-2
          border-white"
        />
      </button>

    </header>
  );
}

export default MemberHeader;