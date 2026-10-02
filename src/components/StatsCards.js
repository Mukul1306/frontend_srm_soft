import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { 
  Users, 
  UserCheck, 
  Wallet, 
  CalendarAmount, // Fallback icon or TrendingUp
  TrendingUp, 
  Clock, 
  AlertCircle, 
  RefreshCw 
} from "lucide-react";

// Helper for Indian Rupee Formatting
const formatCurrency = (amount = 0) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

const formatNumber = (num = 0) =>
  Number(num).toLocaleString("en-IN");

// Use Environment Variable or Fallback
const API_URL = process.env.REACT_APP_API_URL || "https://finance-project-0qqk.onrender.com";

export default function StatsCards() {
  const [stats, setStats] = useState({
    totalCollection: 0,
    totalMembers: 0,
    activeMembers: 0,
    thisMonthCollection: 0,
    pendingCollection: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fixed syntax error (removed duplicate 'await')
      const res = await axios.get(`${API_URL}/api/reports/dashboard`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching report stats:", err);
      setError("Failed to load metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <div className="h-3 bg-slate-200 rounded w-24"></div>
            <div className="h-8 bg-slate-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between text-rose-700 text-xs">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-1 font-semibold underline hover:text-rose-800"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

      {/* 1. Total Members */}
      <CardItem
        title="Total Members"
        value={formatNumber(stats.totalMembers)}
        valueColor="text-blue-600"
        icon={<Users size={18} className="text-blue-600" />}
        iconBg="bg-blue-50"
      />

      {/* 2. Active Members */}
      <CardItem
        title="Active Members"
        value={formatNumber(stats.activeMembers)}
        valueColor="text-emerald-600"
        icon={<UserCheck size={18} className="text-emerald-600" />}
        iconBg="bg-emerald-50"
      />

      {/* 3. Total Collection */}
      <CardItem
        title="Total Collection"
        value={formatCurrency(stats.totalCollection)}
        valueColor="text-indigo-600"
        icon={<Wallet size={18} className="text-indigo-600" />}
        iconBg="bg-indigo-50"
      />

    
      {/* 5. Pending Collection */}
      <CardItem
        title="Pending Collection"
        value={formatCurrency(stats.pendingCollection)}
        valueColor="text-rose-600"
        icon={<Clock size={18} className="text-rose-600" />}
        iconBg="bg-rose-50"
      />

    </div>
  );
}

// Reusable Sub-component for Card
function CardItem({ title, value, valueColor, icon, iconBg }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider line-clamp-1">
          {title}
        </h3>
        <div className={`p-2 rounded-xl shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <h2 className={`text-2xl lg:text-3xl font-bold tracking-tight break-all ${valueColor}`}>
          {value}
        </h2>
      </div>
    </div>
  );
}