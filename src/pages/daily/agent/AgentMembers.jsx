import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Search,
  ShieldCheck,
  Users,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  Ban,
  X,
  Calendar,
  Building2,
  Phone,
  User,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://finance-project-0qqk.onrender.com/api/daily";

// ============================================================
// SORT HELPERS
// Newest saving/member record always appears first.
// Priority:
// 1. Saving/account createdAt
// 2. Member createdAt
// 3. Saving/account startDate
// 4. MongoDB ObjectId timestamp
// ============================================================
const getCreatedTime = (item) => {
  const member = item?.member || {};

  const candidates = [
    item?.createdAt,
    member?.createdAt,
    item?.startDate,
  ];

  for (const value of candidates) {
    if (!value) continue;

    const time = new Date(value).getTime();

    if (!Number.isNaN(time)) {
      return time;
    }
  }

  // MongoDB ObjectId contains the record creation timestamp.
  const ids = [
    item?._id,
    member?._id,
  ];

  for (const id of ids) {
    if (
      typeof id === "string" &&
      /^[a-fA-F0-9]{24}$/.test(id)
    ) {
      return parseInt(id.substring(0, 8), 16) * 1000;
    }
  }

  return 0;
};

const sortNewestFirst = (list) => {
  return [...list].sort(
    (a, b) => getCreatedTime(b) - getCreatedTime(a)
  );
};


const AGENT_MEMBERS_CACHE_KEY = "agentMembersPortfolioCache";
const AGENT_MEMBERS_SCROLL_KEY = "agentMembersScrollY";
const AGENT_MEMBERS_RETURN_KEY = "agentMembersReturningFromCollection";

function readAgentMembersCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(AGENT_MEMBERS_CACHE_KEY) || "null");
    return {
      members: Array.isArray(cached?.members) ? cached.members : [],
    };
  } catch {
    return { members: [] };
  }
}

const SLOW_LOAD_HINT_MS = 6000;

function AgentMembers() {
  const navigate = useNavigate();

  // 1. Synchronously initialize cache
  const initialCacheRef = useRef(null);
  if (initialCacheRef.current === null) {
    initialCacheRef.current = readAgentMembersCache();
  }

  const [members, setMembers] = useState(() => initialCacheRef.current.members);
  const [loading, setLoading] = useState(() => initialCacheRef.current.members.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);
  const [loadError, setLoadError] = useState(false);
const membersRef = useRef([]);

useEffect(() => {
  membersRef.current = members;
}, [members]);

  // Saving State
  const [showSavingModal, setShowSavingModal] = useState(false);
  const [savingSubmitting, setSavingSubmitting] = useState(false);
  const [selectedSavingMember, setSelectedSavingMember] = useState(null);
const [savingForm, setSavingForm] = useState({
  member: "",
  collectionType: "FIXED",
    fixedAmount: "",
    durationDays: "",
    startDate: "",
    endDate: "",
    graceDays: "0",
    penaltyType: "PERCENTAGE",
    penaltyValue: "",
    nomineeName: "",
    nomineeMobile: "",
  });



  // Registered members for modal
  const [registeredMembers, setRegisteredMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [loadingRegisteredMembers, setLoadingRegisteredMembers] = useState(false);

 const registeredSearchText = memberSearch.trim().toLowerCase();

const filteredRegisteredMembers = registeredMembers.filter((member) => {
  if (!registeredSearchText) return true;

  const name = String(member?.memberName || "").toLowerCase();
  const memberId = String(member?.memberId || "").toLowerCase();
  const mobile = String(member?.mobile || "").toLowerCase();
  const accountId = String(member?._id || "").toLowerCase();

  return (
    name.includes(registeredSearchText) ||
    memberId.includes(registeredSearchText) ||
    mobile.includes(registeredSearchText) ||
    accountId.includes(registeredSearchText)
  );
});

  const [search, setSearch] = useState(
    () => sessionStorage.getItem("agentMembersSearch") || ""
  );

  const slowHintTimer = useRef(null);
  const loadingRequest = useRef(false);
  const returningFromCollectionRef = useRef(
    sessionStorage.getItem(AGENT_MEMBERS_RETURN_KEY) === "1"
  );

  // Load Members
  const loadMembers = useCallback(async () => {
    if (loadingRequest.current) return;

    const localAgent = localStorage.getItem("agent");

    if (!localAgent) {
      setMembers([]);
      setLoading(false);
      setRefreshing(false);
      setLoadError(true);
      return;
    }

    let agent;
    try {
      agent = JSON.parse(localAgent);
    } catch (error) {
      console.error("Invalid agent data in localStorage:", error);
      setMembers([]);
      setLoading(false);
      setRefreshing(false);
      setLoadError(true);
      return;
    }

    if (!agent?._id) {
      console.error("Agent ID not found.");
      setMembers([]);
      setLoading(false);
      setRefreshing(false);
      setLoadError(true);
      return;
    }

    loadingRequest.current = true;
    const hasExistingData = membersRef.current.length > 0;

    if (hasExistingData) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setLoadError(false);
    setShowSlowHint(false);

    if (slowHintTimer.current) {
      clearTimeout(slowHintTimer.current);
      slowHintTimer.current = null;
    }

    slowHintTimer.current = setTimeout(() => {
      setShowSlowHint(true);
    }, SLOW_LOAD_HINT_MS);

    try {
      const res = await axios.get(
        `${API_BASE}/agent-collection-members/${agent._id}`,
        {
          timeout: 90000,
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          params: { _t: Date.now() },
        }
      );

     const freshMembers = Array.isArray(res.data?.members)
  ? res.data.members
  : [];

// Only ACTIVE saving accounts should appear in Agent portfolio
const activeMembers = freshMembers.filter(
  (member) =>
    String(member?.status || "").toUpperCase() === "ACTIVE"
);

const sortedMembers = sortNewestFirst(activeMembers);

setMembers(sortedMembers);

      setLoadError(false);

      try {
        const existingCache = readAgentMembersCache();
        sessionStorage.setItem(
          AGENT_MEMBERS_CACHE_KEY,
          JSON.stringify({
            // Cache the sorted order too.
            members: sortedMembers,
          })
        );
      } catch (cacheError) {
        console.warn("Could not cache agent portfolio:", cacheError);
      }

    } catch (error) {
      console.error("Error loading agent members:", error);
      if (!hasExistingData) {
        setMembers([]);
        setLoadError(true);
      }
  } finally {
      loadingRequest.current = false;
      setLoading(false);
      setRefreshing(false);
      setShowSlowHint(false);

      if (slowHintTimer.current) {
        clearTimeout(slowHintTimer.current);
        slowHintTimer.current = null;
      }
    }
}, []);

  const loadRegisteredMembers = useCallback(async () => {
    try {
      const localAgent = localStorage.getItem("agent");
      let agent = null;

      try {
        agent = localAgent ? JSON.parse(localAgent) : null;
      } catch {
        agent = null;
      }

      const agentId = agent?._id || agent?.id || agent?.agentId;

      if (!agentId) {
        console.error("Agent ID not found.");
        setRegisteredMembers([]);
        return;
      }

      setLoadingRegisteredMembers(true);

      // IMPORTANT:
      // The backend must return DailyMember records assigned to this agent.
      // Area/Agent are NOT selected here. They come from DailyMember.
      const res = await axios.get(`${API_BASE}/members`, {
        timeout: 60000,
        params: {
          agentId,
          _t: Date.now(),
        },
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const list = Array.isArray(res.data?.members)
        ? res.data.members
        : Array.isArray(res.data)
        ? res.data
        : [];

      // Extra frontend safety check when assignedAgent is available
      // in the API response. The backend remains the source of truth.
      const ownMembers = list.filter((member) => {
        const assignedAgent =
          member?.assignedAgent?._id ||
          member?.assignedAgent?.id ||
          member?.assignedAgent;

        // If the API returns a populated/non-null assignedAgent,
        // make sure it belongs to the logged-in agent.
        if (assignedAgent) {
          return String(assignedAgent) === String(agentId);
        }

        // Do not discard records when the backend has already filtered
        // them but does not populate assignedAgent.
        return true;
      });

      setRegisteredMembers(sortNewestFirst(ownMembers));
    } catch (error) {
      console.error("Error loading registered members:", error);
      setRegisteredMembers([]);
    } finally {
      setLoadingRegisteredMembers(false);
    }
  }, []);


  // 2. Capture Exact Scroll Y position before navigating
  const openCollection = useCallback(
    (memberId) => {
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

      sessionStorage.setItem(AGENT_MEMBERS_RETURN_KEY, "1");
      sessionStorage.setItem(
        AGENT_MEMBERS_SCROLL_KEY,
        String(currentScrollY)
      );

      navigate(`/agent/collect/${memberId}`);
    },
    [navigate]
  );

  // 3. Instant layout effect scroll restoration
  useLayoutEffect(() => {
    const isReturning = sessionStorage.getItem(AGENT_MEMBERS_RETURN_KEY) === "1";
    const savedScroll = sessionStorage.getItem(AGENT_MEMBERS_SCROLL_KEY);

    if (!isReturning || !savedScroll) return;

    const targetY = Number(savedScroll);
    if (!Number.isFinite(targetY)) return;

    // Force browser manual restoration
    const origRestoration = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = "manual";
    } catch {}

    let frameId;
    let attempts = 0;

    const scrollStep = () => {
      attempts++;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      const actualTarget = Math.min(targetY, maxScroll);

      window.scrollTo(0, actualTarget);

      // Verify and lock scroll across paint frames
      if (attempts < 15) {
        frameId = requestAnimationFrame(scrollStep);
      } else {
        sessionStorage.removeItem(AGENT_MEMBERS_SCROLL_KEY);
        sessionStorage.removeItem(AGENT_MEMBERS_RETURN_KEY);
      }
    };

    frameId = requestAnimationFrame(scrollStep);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      try {
        window.history.scrollRestoration = origRestoration;
      } catch {}
    };
  }, [members]);


 // Initial load + always sync latest portfolio
useEffect(() => {
  loadMembers();

  return () => {
    if (slowHintTimer.current) {
      clearTimeout(slowHintTimer.current);
      slowHintTimer.current = null;
    }
  };
}, [loadMembers]);

  useEffect(() => {
    sessionStorage.setItem("agentMembersSearch", search);
  }, [search]);

  // ======================================================
// REQUEST DAILY SAVING TERMINATION
// Agent cannot directly terminate the account.
// Request goes to Admin for approval.
// ======================================================

const handleRequestTermination = async (saving) => {
  if (!saving?._id) {
    alert("Saving account information is missing.");
    return;
  }

  // Only ACTIVE account can be requested for termination
  if (saving.status && saving.status !== "ACTIVE") {
    alert("Only an ACTIVE saving account can be terminated.");
    return;
  }

  const memberName =
    saving.member?.memberName ||
    "this member";

  // Ask reason
  const reasonInput = window.prompt(
    `Enter termination reason for ${memberName}:`
  );

  if (reasonInput === null) {
    return;
  }

  const reason = reasonInput.trim();

  if (!reason) {
    alert("Termination reason is required.");
    return;
  }

  // Confirmation
  const confirmed = window.confirm(
    `Send termination request for ${memberName} to Admin for approval?`
  );

  if (!confirmed) {
    return;
  }

  try {
    // Get logged-in agent
    let agentId = null;

    const agentData =
      localStorage.getItem("agent");

    if (agentData) {
      try {
        const agent = JSON.parse(agentData);

        agentId =
          agent?._id ||
          agent?.id ||
          null;
      } catch (parseError) {
        console.error(
          "AGENT DATA PARSE ERROR:",
          parseError
        );
      }
    }

    if (!agentId) {
      alert(
        "Agent information not found. Please login again."
      );
      return;
    }

    // Send termination request
    const response = await axios.post(
      `${API_BASE}/saving-termination-request`,
      {
        savingId: saving._id,
        reason,
        agentId,
      },
      {
        timeout: 60000,
      }
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
        "Failed to submit termination request."
      );
    }

    alert(
      response.data?.message ||
      "Termination request sent to Admin successfully."
    );

    // Refresh account list
    await loadMembers();

  } catch (error) {
    console.error(
      "TERMINATION REQUEST ERROR:",
      error
    );

    alert(
      error.response?.data?.message ||
      error.message ||
      "Failed to submit termination request."
    );
  }
};

  // Helpers
  const getCollectionStatus = (member) => {
    if (!member?.lastCollectionDate) return "PENDING";

    const today = new Date();
    const last = new Date(member.lastCollectionDate);

    if (Number.isNaN(last.getTime())) return "PENDING";

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const lastKey = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;

    if (todayKey === lastKey) return "PAID";

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastStart = new Date(last.getFullYear(), last.getMonth(), last.getDate());

    const diffDays = Math.floor((todayStart - lastStart) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 ? "PENDING" : "DUE";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wide";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wide";
      case "DUE":
        return "bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wide";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-200/60 px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wide";
    }
  };

  const formatAmount = (value) => {
    const number = Number(value || 0);
    return number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  // Metrics
  const totalMembers = members.length;
  const paidMembers = members.filter((m) => getCollectionStatus(m) === "PAID").length;
  const pendingAmount = members.reduce((sum, item) => sum + Number(item?.pendingAmount || 0), 0);
  const totalCollection = members.reduce((sum, item) => sum + Number(item?.totalSaved || 0), 0);

  // Search Filter
  const searchText = search.trim().toLowerCase();

  // Sort at render-time as well. This is important because the page
  // can start from sessionStorage cache before the API finishes.
  const orderedMembers = sortNewestFirst(members);

  const filteredMembers = orderedMembers.filter((member) => {
    const memberName = member?.member?.memberName || "";
    const memberId = member?.member?.memberId || "";
    const mobile = member?.member?.mobile || "";

    return (
      memberName.toLowerCase().includes(searchText) ||
      memberId.toLowerCase().includes(searchText) ||
      mobile.includes(search.trim())
    );
  });

  const openCreateDailySaving = () => {
    setSelectedSavingMember(null);
    setMemberSearch("");
    setSavingForm({
  member: "",
  collectionType: "FIXED",
      fixedAmount: "",
      durationDays: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      graceDays: "0",
      penaltyType: "PERCENTAGE",
      penaltyValue: "",
      nomineeName: "",
      nomineeMobile: "",
    });
    setShowSavingModal(true);
    loadRegisteredMembers();
  };

  const selectRegisteredMember = async (member) => {
  if (!member?._id) return;

  try {
    const res = await axios.get(
      `${API_BASE}/saving-member/${member._id}`,
      {
        timeout: 60000,
        params: { _t: Date.now() }
      }
    );

    const fullMember = res.data?.member;

    if (!fullMember) {
      alert("Member details not found.");
      return;
    }

    console.log("FULL MEMBER DATA:", fullMember);

    setSelectedSavingMember(fullMember);

    setSavingForm((prev) => ({
      ...prev,
      member: fullMember._id
    }));

    setMemberSearch("");
  } catch (error) {
    console.error("MEMBER DETAILS ERROR:", error);
    alert(
      error.response?.data?.message ||
      "Failed to load member details."
    );
  }
};

  const openNewSaving = async (savingMember) => {
  const memberId = savingMember?.member?._id;

  if (!memberId) {
    alert("Member information not found.");
    return;
  }

  try {
    const res = await axios.get(
      `${API_BASE}/saving-member/${memberId}`,
      {
        timeout: 60000,
        params: { _t: Date.now() }
      }
    );

    const member = res.data?.member;

    if (!member) {
      alert("Member details not found.");
      return;
    }

    setSelectedSavingMember(member);

    setSavingForm({
      member: member._id,
      collectionType: "FIXED",
      fixedAmount: "",
      durationDays: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      graceDays: "0",
      penaltyType: "PERCENTAGE",
      penaltyValue: "",
      nomineeName: "",
      nomineeMobile: "",
    });

    setShowSavingModal(true);
  } catch (error) {
    console.error("OPEN SAVING ERROR:", error);
    alert(
      error.response?.data?.message ||
      "Failed to load member details."
    );
  }
};

  const closeSavingModal = () => {
    if (savingSubmitting) return;
    setShowSavingModal(false);
    setSelectedSavingMember(null);
    setSavingForm({
      member: "",
      collectionType: "FIXED",
      fixedAmount: "",
      durationDays: "",
      startDate: "",
      endDate: "",
      graceDays: "0",
      penaltyType: "PERCENTAGE",
      penaltyValue: "",
      nomineeName: "",
      nomineeMobile: "",
    });
  };

  useEffect(() => {
    if (savingForm.startDate && savingForm.durationDays) {
      const end = new Date(savingForm.startDate);
      end.setDate(end.getDate() + Number(savingForm.durationDays));
      setSavingForm((prev) => ({
        ...prev,
        endDate: end.toISOString().split("T")[0],
      }));
    }
  }, [savingForm.startDate, savingForm.durationDays]);

  const submitSavingRequest = async (e) => {
    e.preventDefault();
    if (!savingForm.member) return alert("Please search and select a registered member.");
    if (!savingForm.durationDays) return alert("Please enter saving duration.");
    if (!savingForm.startDate) return alert("Please select start date.");
    if (savingForm.collectionType === "FIXED" && Number(savingForm.fixedAmount) <= 0) {
      return alert("Please enter a valid daily fixed amount.");
    }

    const localAgent = localStorage.getItem("agent");
    let agent = null;
    try {
      agent = localAgent ? JSON.parse(localAgent) : null;
    } catch {
      agent = null;
    }

    const agentId = agent?._id || agent?.id || agent?.agentId;
    if (!agentId) return alert("Agent ID not found. Please login again.");

    try {
      setSavingSubmitting(true);
      const payload = {
        ...savingForm,
        agentId,
        fixedAmount: savingForm.collectionType === "FIXED" ? Number(savingForm.fixedAmount || 0) : 0,
        durationDays: Number(savingForm.durationDays),
        graceDays: Number(savingForm.graceDays || 0),
        penaltyValue: Number(savingForm.penaltyValue || 0),
      };

      const res = await axios.post(`${API_BASE}/saving-request`, payload, { timeout: 60000 });
      alert(res.data?.message || "Saving request submitted successfully.");
      closeSavingModal();

      // Refresh the portfolio so a newly available saving account
      // appears immediately and is placed at the top.
      await loadMembers();
    } catch (error) {
      console.error("SAVE REQUEST ERROR:", error);
      alert(error.response?.data?.message || "Failed to submit saving request.");
    } finally {
      setSavingSubmitting(false);
    }
  };

  // Loading Screen
  if (loading && members.length === 0) {
    return (
      <div className="p-3 sm:p-6 bg-slate-50 min-h-screen text-slate-800 space-y-4">
        <SkeletonStats />
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>

        {showSlowHint && (
          <div className="flex items-center gap-2 justify-center text-xs font-semibold text-slate-500 pt-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Server waking up — this can take up to a minute...</span>
          </div>
        )}

        {loadError && (
          <div className="text-center py-6">
            <p className="text-xs font-bold text-rose-500">Couldn't connect to server.</p>
            <button
              type="button"
              onClick={loadMembers}
              className="mt-2 text-xs font-black text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-slate-50 min-h-screen text-slate-800 space-y-4 sm:space-y-6 antialiased font-sans">
      
      {refreshing && (
        <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200/60 px-3.5 py-2 rounded-xl text-[11px] font-bold text-blue-700 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Syncing latest live portfolio...</span>
          </div>
        </div>
      )}

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Portfolio</p>
            <h3 className="text-lg sm:text-2xl font-black mt-0.5 text-slate-900">{totalMembers}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hidden sm:block">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Paid Today</p>
            <h3 className="text-lg sm:text-2xl font-black mt-0.5 text-emerald-600">{paidMembers}</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hidden sm:block">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Pending Due</p>
            <h3 className="text-lg sm:text-2xl font-black mt-0.5 text-amber-500">₹{formatAmount(pendingAmount)}</h3>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hidden sm:block">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Saved</p>
            <h3 className="text-lg sm:text-2xl font-black mt-0.5 text-slate-800">₹{formatAmount(totalCollection)}</h3>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hidden sm:block">
            <AlertTriangle size={18} />
          </div>
        </div>
      </div>

      {/* PORTFOLIO CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
          <div>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide uppercase">
              Field Collection Roster
            </h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Live updates & savings ledger
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateDailySaving}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} />
            Create Daily Saving
          </button>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Name, ID, Mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* MOBILE CARD LIST VIEW */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {filteredMembers.map((member) => {
            const status = getCollectionStatus(member);
            const isPending = Number(member.pendingDays || 0) > 0;

            return (
              <div key={member._id} className="p-4 space-y-3 bg-white">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-slate-400 block tracking-wider">
                      {member.member?.memberId || "—"}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 truncate">
                      {member.member?.memberName || "Unknown Member"}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-bold block mt-0.5">
                      {member.member?.mobile || "—"}
                    </span>
                  </div>
                  <span className={getStatusStyle(status)}>{status}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Daily Fixed</span>
                    <span className="text-slate-800 font-black text-xs">
                      {member.collectionType === "FIXED" ? `₹${formatAmount(member.fixedAmount)}` : "Flexible"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Total Saved</span>
                    <span className="text-emerald-600 font-black text-xs">₹{formatAmount(member.totalSaved)}</span>
                  </div>

                  <div className="pt-1">
                    <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Due Amount</span>
                    <span className="text-rose-600 font-black text-xs">
                      ₹{formatAmount(member.pendingAmount)} <span className="text-[10px] font-bold text-slate-500">({member.pendingDays || 0}d)</span>
                    </span>
                  </div>

                  <div className="pt-1 min-w-0">
                    <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Area Group</span>
                    <span className="text-slate-700 font-extrabold truncate block">{member.areaGroup?.areaName || "—"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">

  {/* NEW PLAN */}
  <button
    type="button"
    onClick={() => openNewSaving(member)}
    className="w-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
  >
    <Plus size={14} />
    New Plan
  </button>

  {/* COLLECT */}
  {isPending ? (
    <button
      type="button"
      onClick={() =>
        openCollection(member._id)
      }
      className="w-full bg-emerald-600 active:bg-emerald-700 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
    >
      Collect
      <ChevronRight size={14} />
    </button>
  ) : (
    <button
      type="button"
      disabled
      className="w-full bg-slate-50 text-slate-300 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider border border-slate-100 cursor-not-allowed"
    >
      Settled
    </button>
  )}

  {/* TERMINATION REQUEST */}
  {member.status === "ACTIVE" && (
    <button
      type="button"
      onClick={() =>
        handleRequestTermination(member)
      }
      className="col-span-2 w-full bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider border border-rose-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
    >
      <Ban size={14} />
       Termination
    </button>
  )}

</div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase bg-slate-50/70 tracking-wider">
                <th className="py-3.5 px-4">Member ID</th>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Area Location</th>
                <th className="py-3.5 px-4 text-center">Daily Target</th>
                <th className="py-3.5 px-4 text-center">Total Saved</th>
                <th className="py-3.5 px-4 text-center">Overdue</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredMembers.map((member) => {
                const status = getCollectionStatus(member);
                const isPending = Number(member.pendingDays || 0) > 0;

                return (
                  <tr key={member._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-black text-slate-900">{member.member?.memberId || "—"}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{member.member?.memberName || "Unknown Member"}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                        Joined: {member.startDate ? new Date(member.startDate).toLocaleDateString("en-IN") : "—"}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-semibold">{member.member?.mobile || "—"}</td>
                    <td className="p-4 text-slate-500 font-semibold">{member.areaGroup?.areaName || "—"}</td>
                    <td className="p-4 text-center font-bold text-slate-800">
                      {member.collectionType === "FIXED" ? `₹${formatAmount(member.fixedAmount)}` : "Flexible"}
                    </td>
                    <td className="p-4 text-center font-black text-emerald-600">₹{formatAmount(member.totalSaved)}</td>
                    <td className="p-4 text-center">
                      <span className="font-black text-rose-600 block">₹{formatAmount(member.pendingAmount)}</span>
                      <span className="text-[10px] font-bold text-slate-400">({member.pendingDays || 0} days)</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={getStatusStyle(status)}>{status}</span>
                    </td>
                   <td className="p-4 text-right">
  <div className="flex items-center justify-end gap-2">

    {/* NEW PLAN */}
    <button
      type="button"
      onClick={() =>
        openNewSaving(member)
      }
      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
    >
      <Plus size={12} />
      Plan
    </button>

    {/* COLLECT */}
    {isPending ? (
      <button
        type="button"
        onClick={() =>
          openCollection(member._id)
        }
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider shadow-xs transition-all cursor-pointer"
      >
        Collect
      </button>
    ) : (
      <button
        type="button"
        disabled
        className="bg-slate-100 text-slate-400 px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider cursor-not-allowed border border-slate-200/50"
      >
        Settled
      </button>
    )}

    {/* TERMINATION REQUEST */}
    {member.status === "ACTIVE" && (
      <button
        type="button"
        onClick={() =>
          handleRequestTermination(member)
        }
        className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider border border-rose-200 transition-all cursor-pointer flex items-center gap-1"
      >
        <Ban size={12} />
        Terminate
      </button>
    )}

  </div>
</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12 text-slate-400 font-semibold text-xs">
            {members.length === 0 ? "No active accounts found." : "No accounts match your search filters."}
          </div>
        )}
      </div>

      {/* SAVING MODAL */}
      {showSavingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl relative">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase">
                  Create Daily Saving Account
                </h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Select a registered member and send the saving request to Admin
                </p>
              </div>

              <button
                type="button"
                onClick={closeSavingModal}
                disabled={savingSubmitting}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitSavingRequest} className="p-4 sm:p-6 space-y-4">
              {!selectedSavingMember && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={15} className="text-blue-600" />
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Search Registered Member
                    </label>
                  </div>

                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Search Member ID, Name or Mobile..."
                      autoFocus
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-9 pr-3 text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="mt-3 max-h-56 overflow-y-auto space-y-2">
                    {loadingRegisteredMembers ? (
                      <div className="py-6 text-center text-xs font-bold text-slate-400">
                        Loading registered members...
                      </div>
                    ) : filteredRegisteredMembers.length === 0 ? (
                      <div className="py-6 text-center text-xs font-bold text-slate-400">
                        {registeredMembers.length === 0
                          ? "No registered members found."
                          : "No member matches your search."}
                      </div>
                    ) : (
                      filteredRegisteredMembers.slice(0, 30).map((member) => (
                        <button
                          key={member._id}
                          type="button"
                          onClick={() => selectRegisteredMember(member)}
                          className="w-full text-left bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl p-3 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate">
                                {member.memberName || "Unknown Member"}
                              </p>
                              <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                                ID: {member.memberId || "—"} • {member.mobile || "—"}
                              </p>
                            </div>
                            <ArrowRight size={15} className="text-blue-500 shrink-0" />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {selectedSavingMember && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSavingMember(null);
                    setSavingForm((prev) => ({ ...prev, member: "" }));
                    setMemberSearch("");
                  }}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider cursor-pointer"
                >
                  ← Change Registered Member
                </button>
              )}

              <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-3.5 text-xs">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 block mb-1">Target Account</span>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 text-sm">
                      {selectedSavingMember?.memberName || "Unknown Member"}
                    </p>

                    <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                      ID:{" "}
                      <span className="text-blue-700">
                        {selectedSavingMember?.memberId || "—"}
                      </span>{" "}
                      • {selectedSavingMember?.mobile || "—"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 mt-3">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 block">
                          Assigned Area
                        </span>
                        <span className="text-[11px] font-extrabold text-slate-700">
                          {selectedSavingMember?.areaGroup?.areaName || "Not Assigned"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 block">
                          Assigned Agent
                        </span>
                        <span className="text-[11px] font-extrabold text-slate-700">
                          {selectedSavingMember?.assignedAgent?.name || "Not Assigned"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="self-start shrink-0 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                    Approval Req
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
    Collection Type
  </label>

  <select
    value={savingForm.collectionType}
    onChange={(e) =>
      setSavingForm({
        ...savingForm,
        collectionType: e.target.value
      })
    }
    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
  >
    <option value="FIXED">Fixed Daily Rate</option>
    <option value="FLEXIBLE">Flexible Daily Deposit</option>
  </select>
</div>
              </div>

              {savingForm.collectionType === "FIXED" && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Daily Fixed Deposit Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={savingForm.fixedAmount}
                    onChange={(e) => setSavingForm({ ...savingForm, fixedAmount: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Tenure (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={savingForm.durationDays}
                    onChange={(e) => setSavingForm({ ...savingForm, durationDays: e.target.value })}
                    placeholder="365"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={savingForm.startDate}
                    onChange={(e) => setSavingForm({ ...savingForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Calculated End Date
                  </label>
                  <input
                    type="date"
                    readOnly
                    value={savingForm.endDate}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Grace Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={savingForm.graceDays}
                    onChange={(e) => setSavingForm({ ...savingForm, graceDays: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Penalty Route
                  </label>
                  <select
                    value={savingForm.penaltyType}
                    onChange={(e) => setSavingForm({ ...savingForm, penaltyType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Cash (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Penalty Rate
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={savingForm.penaltyValue}
                    onChange={(e) => setSavingForm({ ...savingForm, penaltyValue: e.target.value })}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Nominee Full Name
                  </label>
                  <input
                    type="text"
                    value={savingForm.nomineeName}
                    onChange={(e) => setSavingForm({ ...savingForm, nomineeName: e.target.value })}
                    placeholder="Optional"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Nominee Mobile
                  </label>
                  <input
                    type="text"
                    value={savingForm.nomineeMobile}
                    onChange={(e) => setSavingForm({ ...savingForm, nomineeMobile: e.target.value })}
                    placeholder="Optional"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeSavingModal}
                  disabled={savingSubmitting}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingSubmitting}
                  className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-all cursor-pointer ${
                    savingSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-200"
                  }`}
                >
                  {savingSubmitting ? "Submitting Request..." : "Submit for Admin Approval"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 h-16 animate-pulse" />
      ))}
    </div>
  );
}
export default AgentMembers;