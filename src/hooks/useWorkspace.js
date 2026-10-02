import { useState, useEffect } from "react";

export default function useWorkspace() {

  const [workspace, setWorkspace] =
    useState(
      localStorage.getItem("workspace")
      || "society"
    );

  useEffect(() => {

    const current =
      localStorage.getItem("workspace")
      || "society";

    setWorkspace(current);

  }, []);

  return workspace;
}