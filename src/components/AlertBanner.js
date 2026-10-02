import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

function AlertBanner({ onViewAll }) {
  return (
    <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <FiAlertTriangle className="text-red-600 text-2xl shrink-0" />
        <p className="text-red-700 font-medium">
          <span className="font-bold">Attention Required:</span>  Overdue payment records detected. Please check member payment statuses.
        </p>
      </div>

      <button
        onClick={onViewAll}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition shrink-0"
      >
        View All
      </button>
    </div>
  );
}

export default AlertBanner;