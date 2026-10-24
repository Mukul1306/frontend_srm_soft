import React from "react";
import { Navigate } from "react-router-dom";

// Redirect stale links to the standard member list.
function DailyMemberRequests() {
  return <Navigate to="/daily/members" replace />;
}

export default DailyMemberRequests;
