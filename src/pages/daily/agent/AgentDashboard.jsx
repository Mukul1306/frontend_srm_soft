import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Wallet,
  Target,
  Calendar,
  TrendingUp,
  Users,
  IndianRupee,
  RefreshCw,
  Clock,
  ArrowUpRight
} from "lucide-react";

function AgentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const agent = JSON.parse(localStorage.getItem("agent"));
      const res = await axios.get(
        `https://aws.srmfinance.online/api/daily/agent-profile/${agent._id}`
      );
      setDashboard(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

 const currentMonth =
  new Date().toLocaleString(
    "en-IN",
    {
      month: "long",
      timeZone: "Asia/Kolkata"
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
        {/* Skeleton Header */}
        <div className="animate-pulse mb-8 space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-32 bg-slate-200 rounded-lg" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-slate-200 rounded-md" />
                <div className="h-10 w-10 bg-slate-200 rounded-xl" />
              </div>
              <div className="h-8 w-36 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      {/* Dashboard Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Agent Overview
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            Real-time collection & member summary
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard
          title="Today's Collection"
          value={`₹${(summary.todayCollection || 0).toLocaleString("en-IN")}`}
          icon={Wallet}
          gradient="from-emerald-500 to-teal-600"
          accentBg="bg-emerald-500/10"
          accentText="text-emerald-600"
          tag="Live"
        />
<MetricCard
  title="Today's Actual Collection"
  value={`₹${(summary.todayActualCollection || 0).toLocaleString("en-IN")}`}
  icon={IndianRupee}
  gradient="from-green-600 to-emerald-700"
  accentBg="bg-green-500/10"
  accentText="text-green-700"
  tag="Actual"
/>

        <MetricCard
          title={`${currentMonth} Collection`}
          value={`₹${(summary.monthlyCollection || 0).toLocaleString("en-IN")}`}
          icon={Calendar}
          gradient="from-blue-600 to-indigo-600"
          accentBg="bg-blue-500/10"
          accentText="text-blue-600"
          tag="Monthly"
        />

        <MetricCard
          title="Today's Target"
          value={`₹${(summary.dailyTarget || 0).toLocaleString("en-IN")}`}
          icon={Target}
          gradient="from-violet-600 to-purple-600"
          accentBg="bg-purple-500/10"
          accentText="text-purple-600"
          tag="Goal"
        />

     <MetricCard 
  title="Pending Target" 
  value={`₹${(summary.todayPending || 0).toLocaleString("en-IN")}`} 
  icon={TrendingUp} 
  gradient="from-rose-500 to-red-600" 
  accentBg="bg-rose-500/10" 
  accentText="text-rose-600" 
  tag="Today"
/>

<MetricCard 
  title="Pending Till Today" 
  value={`₹${(summary.pendingTillToday || 0).toLocaleString("en-IN")}`} 
  icon={Clock} 
  gradient="from-orange-500 to-amber-600" 
  accentBg="bg-orange-500/10" 
  accentText="text-orange-600" 
  tag="All Pending"
/>

        <MetricCard
          title="Total Collection"
          value={`₹${(summary.totalCollection || 0).toLocaleString("en-IN")}`}
          icon={IndianRupee}
          gradient="from-slate-800 to-slate-900"
          accentBg="bg-slate-500/10"
          accentText="text-slate-800"
          tag="Lifetime"
        />

        <MetricCard
          title="Total Members"
          value={summary.totalMembers || 0}
          icon={Users}
          gradient="from-cyan-600 to-blue-600"
          accentBg="bg-cyan-500/10"
          accentText="text-cyan-600"
          tag="Active"
        />
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, gradient, accentBg, accentText, tag }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
      {/* Top Border Gradient Accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${accentBg} ${accentText} transition-transform group-hover:scale-105`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </h2>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${accentBg} ${accentText}`}>
          {tag}
        </span>
      </div>
    </div>
  );
}

export default AgentDashboard;