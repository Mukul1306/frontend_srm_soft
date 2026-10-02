import React, { useEffect, useState } from "react";
import axios from "axios";

function DailySaving() {
  const [showModal, setShowModal] = useState(false);
  const [areas, setAreas] = useState([]);
  const [agents, setAgents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

const [formData, setFormData] = useState({
  areaName: "",
  duration: "",
  durationType: "DAYS",
  maxMembers: "",
  startDate: "",
  assignedAgent: "",
  secondaryAgent: "",
});

  useEffect(() => {
    fetchAreas();
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get("https://finance-project-0qqk.onrender.com/api/daily/agents");
      setAgents(res.data.agents || []);
    } catch (error) {
      console.log("Error fetching agents:", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await axios.get("https://finance-project-0qqk.onrender.com/api/daily/areas");
      setAreas(res.data.groups || []);
    } catch (error) {
      console.log("Error fetching areas:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
  setFormData({
  areaName: "",
  duration: "",
  durationType: "DAYS",
  maxMembers: "",
  startDate: "",
  assignedAgent: "",
  secondaryAgent: "",
});
    setEditingId(null);
    setShowModal(false);
  };

  const editArea = (area) => {
    setEditingId(area._id);
   setFormData({

  areaName: area.areaName,

  duration: area.duration,

  durationType: area.durationType || "DAYS",

  maxMembers: area.maxMembers,

  startDate: area.startDate?.substring(0,10) || "",

  assignedAgent: area.assignedAgent?._id || "",

  secondaryAgent: area.secondaryAgent?._id || ""

});
    setShowModal(true);
  };

  const deleteArea = async (id) => {
    const ok = window.confirm("Delete this Area Group?");
    if (!ok) return;

    try {
      await axios.delete(`https://finance-project-0qqk.onrender.com/api/daily/area/${id}`);
      alert("Area Deleted");
      fetchAreas();
    } catch (error) {
      console.log(error);
      alert("Delete Failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
     const payload = {

  areaName: formData.areaName,

  duration: Number(formData.duration),

  durationType: formData.durationType,

  maxMembers: Number(formData.maxMembers),

  startDate: formData.startDate,

  assignedAgent: formData.assignedAgent,

  secondaryAgent: formData.secondaryAgent || null,

};

      if (editingId) {
        await axios.put(`https://finance-project-0qqk.onrender.com/api/daily/area/${editingId}`, payload);
        alert("Area Updated");
      } else {
        await axios.post("https://finance-project-0qqk.onrender.com/api/daily/create-area", payload);
        alert("Area Created");
      }

      resetForm();
      fetchAreas();
    } catch (error) {
      console.log("Error processing area group layout setup:", error);
      alert(error.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Status Styling Configuration Utility Helper Rule
  const getStatusStyles = (status = "ACTIVE") => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "UPCOMING":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      case "ACTIVE":
      default:
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    }
  };

  const filteredAreas = areas.filter((area) => {
    const matchesSearch = area.areaName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && area.status?.toUpperCase() === statusFilter;
  });

  return (
    <div className="p-1 min-h-screen bg-slate-50/30">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            DAILY SAVINGS MANAGEMENT
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Manage your daily collection areas, assigned local agents, and operational targets.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span className="text-lg font-light">+</span> Create Area Group
        </button>
      </div>

      {/* Filter and Search Layout Block */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search areas, locations, or agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-200/80 rounded-xl pl-11 pr-4 py-2.5 w-[380px] text-sm font-medium bg-white focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white focus:outline-none cursor-pointer shadow-sm"
        >
          <option value="ALL">All Area Status</option>
          <option value="ACTIVE">Active Operations</option>
          <option value="COMPLETED">Completed Cycles</option>
          <option value="UPCOMING">Upcoming Areas</option>
        </select>
      </div>

      {/* Cards Display Grid Layout Frame */}
      {loading ? (
        <div className="text-slate-400 font-semibold text-sm animate-pulse">Loading workspace areas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAreas.map((area) => {
            const totalMembers = area.totalMembers || 0;
            const maxMembers = area.maxMembers || 50;
            const currentDay = area.currentDay || 0;
            const duration = area.duration || 365;
            const establishedDate = area.startDate ? new Date(area.startDate).toLocaleDateString("en-GB") : "Pending";

            return (
              <div
                key={area._id}
                className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  {/* Top Header Card Grid Section */}
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3.5">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl h-11 w-11 flex items-center justify-center font-bold shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-[17px] font-black text-slate-800 tracking-tight leading-snug">
                          {area.areaName}
                        </h2>
                        <p className="text-[12px] text-slate-400 font-bold mt-0.5">
                          Agents: <span className="text-slate-600 font-medium">{area.assignedAgent?.name || "Unassigned"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400/80 uppercase tracking-wider">
                        Est: {establishedDate}
                      </span>
                    </div>
                  </div>

                  {/* Status Configuration Tag Wrapper Row */}
                  <div className="mt-3.5">
                    <span className={`text-[11px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-md uppercase ${getStatusStyles(area.status)}`}>
                      {area.status || "ACTIVE"}
                    </span>
                  </div>

                  {/* Operational Data Metrics Row Pill Dashboard Section */}
                  <div className="grid grid-cols-3 gap-2 mt-5 bg-slate-50/60 rounded-2xl p-2.5 border border-slate-100">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center justify-center gap-1">
                        👥 Total Users
                      </p>
                      <h3 className="font-extrabold text-slate-800 text-[14px] mt-1">
                        {totalMembers}
                      </h3>
                    </div>

                    <div className="text-center border-x border-slate-200/60">
                      <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center justify-center gap-1">
                        📅 Duration
                      </p>
                      <h3 className="font-extrabold text-slate-800 text-[14px] mt-1">
                      {duration} {area.durationType || "Days"}
                      </h3>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center justify-center gap-1">
                        🏁 Pool
                      </p>
                      <h3 className="font-extrabold text-slate-800 text-[14px] mt-1">
                        {totalMembers}/{maxMembers}
                      </h3>
                    </div>
                  </div>

                  {/* Timeline Analytics Linear Progress Line Module Area */}
                  <div className="mt-5">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 mb-1.5">
                      <span className="tracking-wider uppercase text-slate-400/90">Daily Collection Timeline</span>
                      <span className="text-slate-600">Day {currentDay} / {duration}</span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/30">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${Math.min((currentDay / duration) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Main Card Action Grid Base Layout Footer */}
                <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                      Total Active Collection
                    </p>
                    <h2 className="text-blue-600 text-xl font-black tracking-tight mt-0.5">
                      ₹{area.totalCollection ? area.totalCollection.toLocaleString("en-IN") : "0"}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editArea(area)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteArea(area._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Overlay Configured precisely layout matches mockup inputs field rows */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-[540px] rounded-[32px] p-8 shadow-2xl border border-slate-100 relative">
            <h2 className="text-[22px] font-black text-slate-900 tracking-tight mb-1">
              {editingId ? "Modify Daily Area Group" : "Initialize New Daily Area"}
            </h2>
            <p className="text-slate-400 text-[13px] mb-6 font-medium leading-relaxed">
              Configure an area-based daily saving pool and assign field agents.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Area / Local Hub Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manpur Main Market"
                  value={formData.areaName}
                  onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50"
                />
              </div>

             <div className="grid grid-cols-2 gap-4">

  <div>
    <label className="text-[10px] font-bold uppercase text-slate-400">
      Duration
    </label>

    <input
      type="number"
      required
      placeholder="Enter Duration"
      value={formData.duration}
      onChange={(e) =>
        setFormData({
          ...formData,
          duration: e.target.value,
        })
      }
      className="w-full border rounded-xl px-4 py-2.5"
    />
  </div>

  <div>
    <label className="text-[10px] font-bold uppercase text-slate-400">
      Duration Type
    </label>

    <select
      value={formData.durationType}
      onChange={(e) =>
        setFormData({
          ...formData,
          durationType: e.target.value,
        })
      }
      className="w-full border rounded-xl px-4 py-2.5"
    >
      <option value="DAYS">Days</option>
      <option value="MONTHS">Months</option>
      <option value="YEARS">Years</option>
    </select>
  </div>

</div>

<div className="space-y-1">
  <label className="text-[10px] font-bold uppercase text-slate-400">
    Maximum Members
  </label>

  <input
    type="number"
    required
    min="1"
    placeholder="Enter Maximum Members"
    value={formData.maxMembers}
    onChange={(e) =>
      setFormData({
        ...formData,
        maxMembers: e.target.value,
      })
    }
    className="
      w-full
      border
      border-slate-200
      rounded-xl
      px-4
      py-2.5
      text-sm
      font-medium
      focus:outline-none
      focus:border-blue-500
      bg-slate-50/50
    "
  />
</div>



              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Start Collection Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50 text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Primary Agent
                </label>
                <select
                  required
                  value={formData.assignedAgent}
                  onChange={(e) => setFormData({ ...formData, assignedAgent: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-white text-slate-700 shadow-sm cursor-pointer"
                >
                  <option value="" disabled hidden>Select Agent</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Secondary Agent
                </label>
                <select
                  value={formData.secondaryAgent}
                  onChange={(e) => setFormData({ ...formData, secondaryAgent: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-white text-slate-700 shadow-sm cursor-pointer"
                >
                  <option value="">Select Secondary Agent (Optional)</option>
                  {agents
                    .filter((agent) => agent._id !== formData.assignedAgent)
                    .map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Actions Interface Row Component Panel */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-xs tracking-wider uppercase shadow-md transition-colors cursor-pointer"
                >
                  {submitting ? "Deploying..." : editingId ? "Update Area Group" : "Deploy Area Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailySaving;