import React from "react";

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
  subtitle
}) {

  const styles = {
    blue: {
      icon: "bg-blue-50 text-blue-600"
    },
    green: {
      icon: "bg-emerald-50 text-emerald-600"
    },
    amber: {
      icon: "bg-amber-50 text-amber-600"
    },
    red: {
      icon: "bg-red-50 text-red-600"
    }
  };

  const style =
    styles[tone] || styles.blue;

  return (
    <div className="
      bg-white
      border
      border-slate-200
      rounded-2xl
      p-4
      min-w-0
      shadow-[0_2px_10px_rgba(15,23,42,0.03)]
    ">

      <div className="
        flex
        items-start
        justify-between
        gap-3
      ">

        <div className="min-w-0">

          <p className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.08em]
            text-slate-400
          ">
            {label}
          </p>

          <h3 className="
            text-xl
            sm:text-2xl
            font-extrabold
            text-slate-900
            tracking-tight
            mt-1
            truncate
          ">
            {value}
          </h3>

          {subtitle && (
            <p className="
              text-[11px]
              font-medium
              text-slate-400
              mt-1
              truncate
            ">
              {subtitle}
            </p>
          )}

        </div>


        <div className={`
          w-10
          h-10
          shrink-0
          rounded-xl
          flex
          items-center
          justify-center
          ${style.icon}
        `}>

          <Icon
            size={18}
            strokeWidth={2.1}
          />

        </div>

      </div>

    </div>
  );
}

export default SummaryCard;