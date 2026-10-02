import React from "react";

function StatusBadge({
  status
}) {

  const normalized =
    (status || "ACTIVE")
      .toUpperCase();

  const styles = {

    ACTIVE:
      "bg-emerald-50 text-emerald-700 border-emerald-100",

    PAID:
      "bg-emerald-50 text-emerald-700 border-emerald-100",

    DUE:
      "bg-amber-50 text-amber-700 border-amber-100",

    OVERDUE:
      "bg-red-50 text-red-700 border-red-100",

    COMPLETED:
      "bg-blue-50 text-blue-700 border-blue-100",

    UPCOMING:
      "bg-blue-50 text-blue-700 border-blue-100"
  };

  return (
    <span className={`
      inline-flex
      items-center
      px-2.5
      py-1
      rounded-lg
      border
      text-[10px]
      font-bold
      uppercase
      tracking-wide
      ${styles[normalized] || styles.ACTIVE}
    `}>
      {normalized.replace("_", " ")}
    </span>
  );
}

export default StatusBadge;