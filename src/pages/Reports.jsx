import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiGrid, 
  FiUsers, 
  FiDownload, 
  FiFileText, 
  FiChevronDown 
} from "react-icons/fi";

function Reports() {

  const [societies, setSocieties] = useState([]);
  const [report, setReport] = useState({
    totalSocieties: 0,
    totalMembers: 0,
    activeMembers: 0,
    completedMembers: 0,
    overdueMembers: 0,
    totalCollection: 0,
    pendingCollection: 0
  });

  useEffect(() => {

  fetchReport();

  fetchSocietyAnalysis();

}, []);

  const fetchReport = async () => {
    try {
      const res = await axios.get(
        "https://finance-project-0qqk.onrender.com/api/reports/dashboard"
      );
      setReport(res.data);
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
        "Failed to load reports"
      );
    }
  };


const fetchSocietyAnalysis = async () => {

  try {

    const res = await axios.get(
      "https://finance-project-0qqk.onrender.com/api/reports/society-analysis"
    );

    console.log(res.data);

    setSocieties(res.data.data);

  } catch (error) {

    console.log(error);

  }

};

  // Safe internal calculation for collection efficiency percentage
  const calculateEfficiency = () => {
    const total = report.totalCollection + report.pendingCollection;
    if (total === 0) return 100;
    return Math.round((report.totalCollection / total) * 100);
  };

  // Formats large metric values elegantly to Indian standard currency layout (Lakhs)
  const formatToLakhs = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans text-[#334155] select-none">
      
      {/* Top Header Banner & Action Button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl font-black text-[#0f172a] uppercase tracking-tight">
            Fiscal Reports & Analytics
          </h1>
          <p className="text-[11px] text-[#94a3b8] font-bold uppercase tracking-wider mt-0.5">
            Audit system spreadsheets and evaluate dynamic monthly charts summaries logs.
          </p>
        </div>
        <button className="flex items-center gap-2 text-xs font-black text-[#475569] bg-white border border-[#e2e8f0] px-4 py-2.5 rounded-xl shadow-sm hover:border-slate-300 transition-all uppercase tracking-wider">
          <FiDownload className="stroke-[2.5]" /> Export Spreadsheet
        </button>
      </div>

      {/* Main Stats Counter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        
        {/* Net Pooled Collection (from report.totalCollection) */}
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest block mb-1">
              Net Pooled Collection
            </span>
            <span className="text-base font-black text-[#0f172a]">
              {formatToLakhs(report.totalCollection)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1e60ff] flex items-center justify-center text-base">
            <FiDollarSign className="stroke-[2.5]" />
          </div>
        </div>

        {/* Collection Efficiency Rate */}
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest block mb-1">
              Efficiency Rate
            </span>
            <span className="text-base font-black text-emerald-600">
              {calculateEfficiency()}%
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
            <FiTrendingUp className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Societies Card */}
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest block mb-1">
              Active Clusters
            </span>
            <span className="text-base font-black text-[#0f172a]">
              {report.totalSocieties} Nodes
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-base">
            <FiGrid className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Members Card */}
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest block mb-1">
              Active Accounts
            </span>
            <span className="text-base font-black text-[#0f172a]">
              {report.totalMembers} Operators
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-base">
            <FiUsers className="stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Workspace Context Filter Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 mb-6 flex gap-4 text-[10px] font-black uppercase tracking-wider">
        <div className="flex items-center gap-2 cursor-pointer text-[#64748b] hover:text-[#0f172a]">
          <span>Filter Fiscal Horizon:</span>
          <span className="text-[#1e60ff] bg-[#eff6ff] px-2 py-1 rounded border border-[#d0e1ff] flex items-center gap-1">
            Previous Month Balance <FiChevronDown />
          </span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer text-[#64748b] hover:text-[#0f172a]">
          <span>Target Workspace Group:</span>
          <span className="text-[#475569] bg-slate-50 px-2 py-1 rounded border border-[#e2e8f0] flex items-center gap-1">
            All Societies Matrices <FiChevronDown />
          </span>
        </div>
      </div>

      {/* Analytical Charts and Ring Row Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Collection Bar Charts Curve Visualizer */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm lg:col-span-2">
          <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider">
            Monthly Collection Trend Curves
          </h3>
          <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mt-0.5 mb-6">
            Direct analytical target vs actual parameters comparison logs.
          </p>
          
          <div className="h-44 flex items-end justify-between px-2 pt-4 relative">
            <div className="absolute inset-x-0 bottom-4 border-b border-[#f1f5f9]"></div>
            <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-[#f1f5f9]"></div>
            <div className="absolute inset-x-0 top-4 border-b border-[#f1f5f9]"></div>

            {[
              { m: "Jan", t: 75, a: 80 },
              { m: "Feb", t: 85, a: 70 },
              { m: "Mar", t: 65, a: 72 },
              { m: "Apr", t: 90, a: 85 },
              { m: "May", t: 95, a: 80 },
              { m: "Jun", t: 80, a: 95 }
            ].map((d, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 z-10 w-full">
                <div className="flex items-end gap-1.5 h-32">
                  <div className="w-3.5 bg-[#1e60ff] rounded-t-sm transition-all" style={{ height: `${d.t}%` }}></div>
                  <div className="w-3.5 bg-[#10b981] rounded-t-sm transition-all" style={{ height: `${d.a}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-wider mt-1">{d.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Member Status Circular Allocation Ring */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider">
              Payment Status Cluster
            </h3>
            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mt-0.5">
              Central ledger allocation distributions.
            </p>
          </div>

          <div className="flex justify-center items-center my-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="60 100" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="25 100" strokeDashoffset="-60" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeDasharray="15 100" strokeDashoffset="-85" />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-black text-[#0f172a] block">
                  {report.totalMembers}
                </span>
                <span className="text-[8px] font-bold text-[#94a3b8] uppercase tracking-widest block">
                  Members
                </span>
              </div>
            </div>
          </div>

          {/* Member Status Segment Labels mapped from active dynamic arrays */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[9px] font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span> 
              Active ({report.activeMembers})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> 
              Done ({report.completedMembers})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> 
              Overdue ({report.overdueMembers})
            </span>
          </div>
        </div>
      </div>

      {/* Financial Liquidity Statement Block (Total vs Pending) */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm mb-6 p-5">
        <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider mb-4">
          Financial Liquidity Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
          <div className="flex justify-between items-center p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
            <span className="text-emerald-700 uppercase tracking-wider text-[10px] font-black">
              Total Receipts Settled
            </span>
            <span className="text-base font-black text-emerald-600">
            ₹{(report.totalCollection || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
            <span className="text-amber-700 uppercase tracking-wider text-[10px] font-black">
              Total Outstanding Deficit
            </span>
            <span className="text-base font-black text-amber-600">
           ₹{(report.pendingCollection || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

{/* Society Wise Analysis Table */}

<div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm mb-6">

  <div className="p-5 border-b border-[#e2e8f0]">

    <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider">
      Society Wise Analysis Sheet
    </h3>

    <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mt-1">
      Detailed documentation overview map across legal operations.
    </p>

  </div>

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead>

        <tr className="border-b border-[#e2e8f0] text-left text-[10px] uppercase font-black text-[#94a3b8]">

          <th className="p-4">
            Society
          </th>

          <th className="p-4">
            Pool Size
          </th>

          <th className="p-4">
  Joined Members
</th>


          <th className="p-4">
            Collection
          </th>

          <th className="p-4">
            Pending
          </th>

          <th className="p-4">
            Status
          </th>

          <th className="p-4">
            Download
          </th>

        </tr>

      </thead>

      <tbody>

        {
          societies?.map((item) => (

            <tr
              key={item.societyId}
              className="border-b border-[#f1f5f9]"
            >

              <td className="p-4 font-bold">
                {item.societyName}
              </td>

              <td className="p-4">
                {item.poolSize}
              </td>
<td className="p-4 font-bold text-blue-600">
  {item.joinedMembers || 0}/{item.poolSize}
</td>
              <td className="p-4 text-green-600 font-bold">
                ₹{item.totalCollection}
              </td>

              <td className="p-4 text-orange-600 font-bold">
                ₹{item.pendingAmount}
              </td>

              <td className="p-4">
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  {item.status}
                </span>
              </td>

              <td className="p-4">

                <a
                  href={`https://finance-project-htz0.onrender.com/api/reports/society-pdf/${item.societyId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs"
                >
                  PDF
                </a>

              </td>

            </tr>

          ))
        }

      </tbody>

    </table>

  </div>

</div>


      {/* Sub Audit Actions Fast Extraction File Cards Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          "Monthly Collection Report", 
          "Society-wise Report", 
          "Member Payment Report", 
          "Agent Performance Report"
        ].map((title, idx) => (
          <div key={idx} className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-sm">
            <h4 className="text-[10px] font-black text-[#0f172a] uppercase tracking-wide">
              {title}
            </h4>
            <p className="text-[9px] text-[#94a3b8] font-bold uppercase mt-0.5 mb-3">
              Individual analytics file extraction.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase tracking-wider">
              <button className="bg-[#f8fafc] border border-[#e2e8f0] py-1.5 rounded-md text-[#64748b] hover:bg-slate-100 flex items-center justify-center gap-1">
                <FiFileText /> CSV
              </button>
              <button className="bg-[#f8fafc] border border-[#e2e8f0] py-1.5 rounded-md text-red-500 hover:bg-red-50 flex items-center justify-center gap-1">
                <FiFileText /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Reports;