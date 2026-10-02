import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  PiggyBank, 
  Coins,
  MapPin,
  Download
} from "lucide-react";

function Reports() {
  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://finance-project-0qqk.onrender.com/api/daily-reports/dashboard");
      setReport(res.data || {});
    } catch (error) {
      console.error("Error loading analytical report arrays:", error);
    } finally {
      setLoading(false);
    }
  };

  // Safe fallback handling for backend area data array
  const analyticalAreas = report.areas || [];

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6 max-w-7xl mx-auto">
      
      {/* --- CONTROL BARS HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-sm font-black text-slate-900 tracking-wider uppercase flex items-center gap-2">
            System Intelligence Reports Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit operational capital movements, active micro-loan distributions, and centralized asset pools.
          </p>
        </div>

        <button 
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 bg-white border hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs tracking-wider uppercase shadow-sm transition"
        >
          <Download size={14} />
          Export Ledger Statement
        </button>
      </div>

      {/* --- HIGH-DENSITY ANALYTICAL SUMMARY CARDS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <ReportMetricCard 
          title="Total Shareholders" 
          value={loading ? "..." : (report.totalMembers || 0)} 
          icon={<Users size={16} className="text-blue-600" />}
          bgColor="bg-blue-50/40 border-blue-100/60"
        />

        <ReportMetricCard 
          title="Active Loan Allocation" 
          value={loading ? "..." : (report.activeLoans || 0)} 
          icon={<FileText size={16} className="text-amber-500" />}
          bgColor="bg-amber-50/40 border-amber-100/60"
        />

        <ReportMetricCard 
          title="Matured Settled Contracts" 
          value={loading ? "..." : (report.closedLoans || 0)} 
          icon={<CheckCircle2 size={16} className="text-emerald-600" />}
          bgColor="bg-emerald-50/40 border-emerald-100/60"
        />

        <ReportSavingsCard 
          title="Savings Cash Flow Pool" 
          value={loading ? "..." : `₹${(report.dailySavingCollection || 0).toLocaleString("en-IN")}`} 
          icon={<PiggyBank size={16} className="text-indigo-600" />}
          bgColor="bg-indigo-50/40 border-indigo-100/60"
        />

        <ReportMetricCard 
          title="Gross Repayments Collected" 
          value={loading ? "..." : `₹${(report.loanCollection || 0).toLocaleString("en-IN")}`} 
          icon={<Coins size={16} className="text-purple-600" />}
          bgColor="bg-purple-50/40 border-purple-100/60"
        />

        <ReportMetricCard
          title="Monthly Revenue"
          value={loading ? "..." : `₹${(report.monthlyRevenue || 0).toLocaleString("en-IN")}`}
          icon={<Coins size={16} className="text-green-600" />}
          bgColor="bg-green-50/40 border-green-100/60"
        />
      </div>

      {/* --- REGIONAL GEOLOCATION AREA BREAKDOWN LEDGER --- */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2">
          <MapPin size={15} className="text-slate-400" />
          <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
            Regional Collection & Area Performance
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/40 border-b text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-5">Target Area Zone</th>
                <th className="py-3 px-4 text-center">Active Enrolled Members</th>
                <th className="py-3 px-4 text-right">Aggregate Revenue Collection</th>
                <th className="py-3 px-5 text-center">Operational State</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs font-medium text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400 italic">
                    Querying geographical metrics ledger logs...
                  </td>
                </tr>
              ) : analyticalAreas.map((area, index) => (
                <tr key={area.areaName || index} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">
                    {area.areaName}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                    {area.members || 0}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900">
                    ₹{(area.totalCollection || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-block text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${
                      area.status === "ACTIVE" 
                        ? "bg-emerald-50 text-emerald-600" 
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {area.status || "ACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && analyticalAreas.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 italic">
                    No active regional territorial data registered in database pipelines.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

/* --- LEAN REUSABLE SUMMARY CARD MATRICES --- */
function ReportMetricCard({ title, value, icon, bgColor }) {
  return (
    <div className={`bg-white border rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 border-l-4 ${bgColor.split(' ')[1]}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
          {title}
        </p>
        <div className={`p-1.5 rounded-lg ${bgColor.split(' ')[0]}`}>
          {icon}
        </div>
      </div>
      <div>
        <h2 className="text-md font-black text-slate-900 tracking-tight break-all">
          {value}
        </h2>
      </div>
    </div>
  );
}

/* Custom layout sizing adjustment rule applied specifically to savings component context details */
function ReportSavingsCard({ title, value, icon, bgColor }) {
  return (
    <div className={`bg-white border rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 border-l-4 ${bgColor.split(' ')[1]}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
          {title}
        </p>
        <div className={`p-1.5 rounded-lg ${bgColor.split(' ')[0]}`}>
          {icon}
        </div>
      </div>
      <div>
        <h2 className="text-md font-black text-slate-900 tracking-tight break-all">
          {value}
        </h2>
      </div>
    </div>
  );
}

export default Reports;