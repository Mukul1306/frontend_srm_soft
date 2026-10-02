import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiSearch, 
  FiMapPin, 
  FiUsers, 
  FiShield, 
  FiPlus,
  FiX,
  FiUser,
  FiPhone,
  FiFileText,
  FiLock,
  FiDollarSign
} from "react-icons/fi";

function Agents() {
  const [agents, setAgents] = useState([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal Control Configuration States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [errorFeedback, setErrorFeedback] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    gender: "Male",
    dob: "",
    email: "",
    mobile: "",
    alternateMobile: "",
    aadhaarNumber: "",
    aadhaarReceived: false,
    panNumber: "",
    panReceived: false,
    stampPaperReceived: false,
    address: "",
    operationalArea: "",
    joiningDate: "",
    password: "",
    confirmPassword: ""
  });

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        "https://aws.srmfinance.online/api/daily/agents"
      );
      setAgents(res.data.agents || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (agent) => {
    setIsEdit(true);
    setEditingId(agent._id);
    setIsModalOpen(true);
    setFormData({
      name: agent.name || "",
      fatherName: agent.fatherName || "",
      gender: agent.gender || "Male",
      dob: agent.dob?.substring(0, 10) || "",
      email: agent.email || "",
      mobile: agent.mobile || "",
      alternateMobile: agent.alternateMobile || "",
      aadhaarNumber: agent.aadhaarNumber || "",
      aadhaarReceived: agent.aadhaarReceived || false,
      panNumber: agent.panNumber || "",
      panReceived: agent.panReceived || false,
      stampPaperReceived: agent.stampPaperReceived || false,
      address: agent.address || "",
      operationalArea: agent.operationalArea || "",
      joiningDate: agent.joiningDate?.substring(0, 10) || "",
      password: "",
      confirmPassword: ""
    });
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const closeAndResetModal = () => {
    setIsEdit(false);
    setEditingId("");
    setIsModalOpen(false);
    setErrorFeedback("");
    setFormData({
      name: "",
      fatherName: "",
      gender: "Male",
      dob: "",
      email: "",
      mobile: "",
      alternateMobile: "",
      aadhaarNumber: "",
      aadhaarReceived: false,
      panNumber: "",
      panReceived: false,
      stampPaperReceived: false,
      address: "",
      operationalArea: "",
      joiningDate: "",
      password: "",
      confirmPassword: ""
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorFeedback("");

    if (!isEdit && formData.password !== formData.confirmPassword) {
      setErrorFeedback("Passwords do not match.");
      return;
    }

    if (isEdit && formData.password && formData.password !== formData.confirmPassword) {
      setErrorFeedback("Passwords do not match.");
      return;
    }

    // Omit empty password when editing so existing password stays intact
    const payload = { ...formData };
    if (isEdit && !payload.password) {
      delete payload.password;
      delete payload.confirmPassword;
    }

    try {
      if (isEdit) {
        await axios.put(
          `https://aws.srmfinance.online/api/daily/agent/${editingId}`,
          payload
        );
      } else {
        await axios.post(
          "https://aws.srmfinance.online/api/daily/add-agent",
          payload
        );
      }
      closeAndResetModal();
      fetchAgents();
    } catch (error) {
      console.error("Registration operational execution fault:", error);
      setErrorFeedback(
        error.response?.data?.message || "Failed to save agent details."
      );
    }
  };

  const filteredAgents = agents.filter((agent) =>
    (agent.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (agent.operationalArea || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = agents.filter((a) => (a.status || "").toUpperCase() === "ACTIVE").length;
  const totalTargetToday = agents.reduce((sum, agent) => sum + (Number(agent.todayTarget) || 0), 0);
  const totalCollectedToday = agents.reduce((sum, agent) => sum + Number(agent.todayCollection || 0), 0);
  const totalPendingToday = agents.reduce((sum, agent) => sum + (Number(agent.todayPending) || 0), 0);
  const totalPendingTillToday = agents.reduce((sum, agent) => sum + Number(agent.pendingTillToday || 0), 0);
  const totalCollectionAll = agents.reduce((sum, agent) => sum + Number(agent.totalCollection || 0), 0);

  const totalActualCollection =
  agents.reduce(
    (sum, agent) =>
      sum +
      Number(
        agent.todayActualCollection || 0
      ),
    0
  );

  
  const averageEfficiency = agents.length 
    ? Math.round(agents.reduce((acc, curr) => acc + (Number(curr.efficiency) || 0), 0) / agents.length) 
    : 0;

  const getInitials = (name) => {
    if (!name) return "AG";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="p-10 space-y-8 bg-[#f8fafc] min-h-screen font-sans text-slate-800">
      
      {/* Top Main Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Agent Management Portal</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage field agents, real-time daily collection targets, and panel access credentials.
          </p>
        </div>

        <button 
          onClick={() => {
            setIsEdit(false);
            setEditingId("");
            setFormData({
              name: "",
              fatherName: "",
              gender: "Male",
              dob: "",
              email: "",
              mobile: "",
              alternateMobile: "",
              aadhaarNumber: "",
              aadhaarReceived: false,
              panNumber: "",
              panReceived: false,
              stampPaperReceived: false,
              address: "",
              operationalArea: "",
              joiningDate: "",
              password: "",
              confirmPassword: ""
            });
            setErrorFeedback("");
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <FiPlus className="stroke-[3] text-sm" /> Add Field Agent
        </button>
      </div>

      {/* Analytical KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-center shadow-xs">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Agents</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">{agents.length} Agents</h2>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg border border-blue-100/50">
            <FiUsers />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-center shadow-xs">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Active Agents</span>
            <h2 className="text-2xl font-black text-emerald-600 mt-1">{isLoading ? 0 : activeCount} Online</h2>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg border border-emerald-100/50">
            <FiShield />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Today's Target</p>
          <h2 className="text-2xl font-black text-slate-900 mt-2">₹{totalTargetToday.toLocaleString("en-IN")}</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Today's Collection</p>
          <h2 className="text-2xl font-black text-green-600 mt-2">₹{totalCollectedToday.toLocaleString("en-IN")}</h2>
        </div>
<div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
    Today's Actual Collection
  </p>

  <h2 className="text-2xl font-black text-emerald-600 mt-2">
    ₹{totalActualCollection.toLocaleString("en-IN")}
  </h2>

  <p className="text-[10px] text-slate-400 mt-1">
    Includes previous pending collections
  </p>

</div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Today's Pending</p>
          <h2 className="text-2xl font-black text-red-600 mt-2">₹{totalPendingToday.toLocaleString("en-IN")}</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Pending Till Today</p>
          <h2 className="text-2xl font-black text-orange-600 mt-2">₹{totalPendingTillToday.toLocaleString("en-IN")}</h2>
          <p className="text-[10px] text-slate-400 mt-2">Saving + Loan EMI</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Collection</p>
          <h2 className="text-2xl font-black text-blue-600 mt-2">₹{totalCollectionAll.toLocaleString("en-IN")}</h2>
          <p className="text-[10px] text-slate-400 mt-2">All Time</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Avg Efficiency</p>
          <h2 className="text-2xl font-black text-purple-600 mt-2">{averageEfficiency}%</h2>
        </div>
      </div>

      {/* Internal Filtering Search Bar */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
        <input
          type="text"
          placeholder="Search agent name or operational track..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-xs"
        />
      </div>

      {/* Dynamic Grid Layout Layer */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center text-slate-400 font-bold bg-white border border-slate-200 rounded-3xl shadow-xs">
          <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs uppercase tracking-wider text-slate-400">Streaming field operation records...</span>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="p-20 text-center font-bold text-xs uppercase tracking-wider text-slate-400 bg-white border border-slate-200 rounded-3xl shadow-xs">
          No field operators matched with your active database queries.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const currentEff = Number(agent.efficiency) || 0;
            const todayColl = Number(agent.todayCollection) || 0;
            const targetColl = Number(agent.todayTarget) || 0;
            
            return (
              <div
                key={agent._id}
                onClick={() => navigate(`/daily/agent/${agent._id}`)}
                className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-black text-xs flex items-center justify-center shrink-0">
                      {getInitials(agent.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-900 text-sm tracking-tight truncate">{agent.name}</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID: {agent._id?.slice(-6).toUpperCase() || "AGENT"}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 border text-[9px] font-black rounded-md uppercase tracking-wider ${
                    (agent.status || "ACTIVE").toUpperCase() === "ACTIVE" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {agent.status || "Active"}
                  </span>
                </div>

                <div className="space-y-3 text-slate-600 font-medium text-xs border-y border-slate-100 py-3.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FiMapPin className="text-slate-400 text-sm shrink-0" />
                    <span className="truncate text-slate-700 font-semibold">{agent.operationalArea || agent.address || "Unassigned Track"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FiUsers className="text-slate-400 text-sm shrink-0" />
                    <span>
                      Accounts Handled: <strong className="text-slate-900 font-bold">{agent.totalMembers || 0} Clients</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FiDollarSign className="text-slate-400 text-sm shrink-0" />
                    <span className="text-slate-600">
                      Collection: <strong className="text-blue-600 font-black">₹{todayColl.toLocaleString("en-IN")}</strong>
                      <span className="text-slate-300 mx-1.5">/</span>
                      ₹{targetColl.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                    <span className="text-slate-400">Yield Efficiency</span>
                    <span className="text-slate-900">{currentEff}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${currentEff >= 75 ? "bg-emerald-500" : currentEff >= 40 ? "bg-blue-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(currentEff, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(agent);
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-xs font-bold"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/daily/agent/${agent._id}`);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OVERLAY REGISTRATION MODAL FRAMEWORK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px] transition-all">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Form Title Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">{isEdit ? "Edit Agent" : "Register Field Representative"}</h2>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Provision platform accounts and credential nodes.</p>
              </div>
              <button 
                onClick={closeAndResetModal}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            {/* Scrollable Data Capture Input Group Container Form */}
            <form onSubmit={handleRegisterSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              
              {errorFeedback && (
                <div className="p-3.5 text-xs font-bold bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-2">
                  <span>⚠️ {errorFeedback}</span>
                </div>
              )}

              {/* PERSONAL DETAILS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <h3 className="font-black text-xs text-blue-600 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-50">
                  <FiUser /> Personal Details
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Agent Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Father's / Husband's Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* CONTACT DETAILS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <h3 className="font-black text-xs text-emerald-600 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-50">
                  <FiPhone /> Contact Channels
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Alternative Mobile Number</label>
                    <input
                      type="text"
                      value={formData.alternateMobile}
                      onChange={(e) => setFormData({ ...formData, alternateMobile: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* DOCUMENT DETAILS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <h3 className="font-black text-xs text-orange-600 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-50">
                  <FiFileText /> Statutory KYC Documents
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Aadhaar Number</label>
                    <input
                      type="text"
                      required
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">PAN Card Number</label>
                    <input
                      type="text"
                      required
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-3 font-semibold text-slate-700 text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.aadhaarReceived}
                      onChange={(e) => setFormData({ ...formData, aadhaarReceived: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    Aadhaar Verification Physical Card Received
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.panReceived}
                      onChange={(e) => setFormData({ ...formData, panReceived: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    PAN Verification Physical Card Received
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.stampPaperReceived}
                      onChange={(e) => setFormData({ ...formData, stampPaperReceived: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    Executed Legal Indemnity Stamp Paper Received
                  </label>
                </div>
              </div>

              {/* ADDRESS & EMPLOYMENT */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <h3 className="font-black text-xs text-purple-600 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-50">
                  <FiMapPin /> Deployment & Address Boundaries
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Full Legal Address</label>
                  <textarea
                    required
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                    placeholder="House No., Street, Village, District, State, PIN"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Assign Operational Target Area</label>
                    <input
                      type="text"
                      required
                      value={formData.operationalArea}
                      onChange={(e) => setFormData({ ...formData, operationalArea: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      placeholder="e.g. Manpur, Sikrai"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Staff Joining Execution Date</label>
                    <input
                      type="date"
                      required
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* LOGIN DETAILS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <h3 className="font-black text-xs text-rose-600 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-50">
                  <FiLock /> System Access Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Panel Security Password</label>
                    <input
                      type="password"
                      required={!isEdit}
                      placeholder={isEdit ? "Leave blank to keep unchanged" : "••••••••"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Confirm Password</label>
                    <input
                      type="password"
                      required={!isEdit}
                      placeholder={isEdit ? "Leave blank to keep unchanged" : "••••••••"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Form Action Buttons Control */}
              <div className="flex justify-end gap-3 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={closeAndResetModal}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  {isEdit ? "Update Agent" : "Register Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agents;