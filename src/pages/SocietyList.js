import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiUsers,
  FiCalendar,
  FiSearch,
  FiHome,
  FiMoreHorizontal,
  FiChevronDown
} from "react-icons/fi";

function SocietyList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [societies, setSocieties] = useState([]);

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      const res = await axios.get(
        "https://finance-project-htz0.onrender.com/api/society/all"
      );
      setSocieties(res.data.societies || []);
    } catch (error) {
      console.error("FULL ERROR:", error);
      if (error.response) {
        alert(JSON.stringify(error.response.data));
      } else {
        alert(error.message);
      }
    }
  };

  const deleteSociety = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this society?"
    );
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `https://finance-project-0qqk.onrender.com/api/society/delete/${id}`
      );
      alert(res.data.message || "Society deleted successfully");
      fetchSocieties();
    } catch (error) {
      alert(error.response?.data?.message || "Delete Failed");
    }
  };

  // Helper function to map status to the client's design badge colors
  const getStatusBadgeClass = (status) => {
    const cleanStatus = (status || "ACTIVE").toUpperCase();
    if (cleanStatus === "COMPLETED") {
      return "bg-blue-50 text-blue-600 border border-blue-200";
    }
    if (cleanStatus === "UPCOMING") {
      return "bg-orange-50 text-orange-600 border border-orange-200";
    }
    return "bg-emerald-50 text-emerald-600 border border-emerald-200";
  };

  // Filter functionality
  const filteredSocieties = societies.filter((society) =>
    (society.societyName || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  // Sorting functionality
  const sortedSocieties = [...filteredSocieties].sort((a, b) => {
    switch (sortBy) {
      case "az":
        return (a.societyName || "").localeCompare(b.societyName || "");
      case "za":
        return (b.societyName || "").localeCompare(a.societyName || "");
      case "highestCollection":
        return (b.totalCollection || 0) - (a.totalCollection || 0);
      case "lowestCollection":
        return (a.totalCollection || 0) - (b.totalCollection || 0);
      case "maxMembers":
        return (b.maxMembers || 0) - (a.maxMembers || 0);
      case "minMembers":
        return (a.maxMembers || 0) - (b.maxMembers || 0);
      case "longest":
        return (b.durationMonths || 0) - (a.durationMonths || 0);
      case "shortest":
        return (a.durationMonths || 0) - (b.durationMonths || 0);
      case "oldest":
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#0f172a] uppercase tracking-wide">
            Society Management
          </h1>
          <p className="text-[#64748b] text-[15px] font-medium mt-1">
            Manage your corporate chit fund societies and centralized operational committees.
          </p>
        </div>

        <button
          onClick={() => navigate("/create-society")}
          className="bg-[#1e60ff] hover:bg-blue-700 text-white font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <FiPlus className="stroke-[3]" /> Create Society
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] text-lg" />
          <input
            type="text"
            placeholder="Search Society by Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#e2e8f0] rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
          />
        </div>

        <div className="relative inline-block">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-white border border-[#e2e8f0] rounded-xl pl-4 pr-10 py-3 text-sm font-semibold text-[#1e293b] outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="highestCollection">Highest Collection</option>
            <option value="lowestCollection">Lowest Collection</option>
            <option value="maxMembers">Maximum Members</option>
            <option value="minMembers">Minimum Members</option>
            <option value="longest">Longest Duration</option>
            <option value="shortest">Shortest Duration</option>
          </select>
          <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
        </div>
      </div>

      {/* Grid Cards Container */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {sortedSocieties.map((society) => {
          const currentCount = society.currentMembers || 0;
          const maxCount = society.maxMembers || 1;
          const progressPercent = Math.min((currentCount / maxCount) * 100, 100);

          return (
            <div
              key={society._id}
              className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between"
            >
              <div>
                {/* Card Top Line Info */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#1e60ff] flex-shrink-0">
                      <FiHome className="text-xl stroke-[2]" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-[#0f172a] tracking-tight line-clamp-1">
                        {society.societyName}
                      </h2>
                      <p className="text-xs text-[#94a3b8] font-medium mt-0.5">
                        Agent: {society.agentName || "Not Assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="relative group">
                    <button className="text-[#94a3b8] hover:text-[#475569] p-1 rounded-lg hover:bg-slate-50 transition-colors">
                      <FiMoreHorizontal className="text-xl"/>
                    </button>

                  <div className="absolute right-0 top-full w-44 bg-white rounded-xl shadow-xl border hidden group-hover:block z-50 overflow-hidden">
                    
                      <button
                        onClick={() => navigate(`/edit-society/${society._id}`)}
                        className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-blue-50 text-blue-600 flex items-center gap-2"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => deleteSociety(society._id)}
                        className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-red-50 text-red-600 flex items-center gap-2 border-t"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Badges Row */}
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider ${getStatusBadgeClass(society.status)}`}>
                    {society.status || "ACTIVE"}
                  </span>
                  <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                    EST: {society.startDate ? new Date(society.startDate).toLocaleDateString("en-IN") : "N/A"}
                  </span>
                </div>

                {/* Main Client Style Core Specs Blocks */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-[#f8fafc] rounded-xl p-2.5 border border-[#f1f5f9] text-center">
                    <div className="flex items-center justify-center gap-1 text-[#1e60ff] text-[10px] font-extrabold tracking-wider uppercase mb-1">
                      <FiUsers className="text-xs" /> Users
                    </div>
                    <h3 className="text-base font-black text-[#1e293b]">
                      {society.currentMembers || 0}
                    </h3>
                  </div>

                  <div className="bg-[#f8fafc] rounded-xl p-2.5 border border-[#f1f5f9] text-center">
                    <div className="flex items-center justify-center gap-1 text-[#f59e0b] text-[10px] font-extrabold tracking-wider uppercase mb-1">
                      <FiCalendar className="text-xs" /> Duration
                    </div>
                    <h3 className="text-base font-black text-[#1e293b]">
                      {society.durationMonths || 0} <span className="text-xs font-bold text-[#64748b]">Mo</span>
                    </h3>
                  </div>

                  <div className="bg-[#f8fafc] rounded-xl p-2.5 border border-[#f1f5f9] text-center">
                    <div className="flex items-center justify-center gap-1 text-[#10b981] text-[10px] font-extrabold tracking-wider uppercase mb-1">
                      <FiUsers className="text-xs" /> Pool
                    </div>
                    <h3 className="text-base font-black text-[#1e293b]">
                      {society.currentMembers || 0}/{society.maxMembers || 0}
                    </h3>
                  </div>
                </div>

                {/* Progress Tracking Timeline */}
                <div className="mb-6">
                  <div className="flex justify-between items-center text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider mb-2">
                    <span>Execution Timeline</span>
                    <span className="text-[#1e293b] font-black">
                      Pool Filled {Math.round(progressPercent)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                    <div
                      className="bg-[#1e60ff] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Info Row & Action Button */}
              <div className="flex justify-between items-center mt-2 pt-4 border-t border-[#f1f5f9]">
                <div>
                  <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-wider">
                    Total Active Collection
                  </p>
                  <h4 className="text-lg font-black text-[#1e60ff] mt-0.5">
                    ₹{society.totalCollection ? society.totalCollection.toLocaleString('en-IN') : "0"}
                  </h4>
                </div>

                <button
                  onClick={() => navigate(`/society/${society._id}`)}
                  className="bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all border border-[#e2e8f0]"
                >
                  View Specs
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedSocieties.length === 0 && (
        <div className="w-full text-center py-12 text-sm font-semibold text-slate-400 bg-white rounded-3xl border border-[#e2e8f0] mt-6">
          No matching societies found.
        </div>
      )}
    </div>
  );
}

export default SocietyList;