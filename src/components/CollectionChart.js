import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function CollectionChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchChart();
  }, []);

  const fetchChart = async () => {
    try {
      const res = await axios.get(
        "https://finance-project-0qqk.onrender.com/api/reports/monthly-collection"
      );
      setData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Custom tooltips to match the premium dashboard aesthetics
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs font-sans">
          <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-1">
            {payload[0].payload.month}
          </p>
          <p className="font-black text-sm text-[#38bdf8]">
            ₹{payload[0].value.toLocaleString("en-IN")}
          </p>
        </div>
      );
    }
    return null;
  };

  // Helper formatting to convert numbers to 150K, 300K, 450K etc.
  const formatYAxis = (tickItem) => {
    if (tickItem === 0) return "₹0K";
    return `₹${(tickItem / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm font-sans select-none w-full">
      
      {/* Label and Header Metadata */}
      <div className="mb-6">
        <h2 className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider">
          Monthly Collection Overview
        </h2>
        <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mt-0.5">
          Total collection vs target for the year
        </p>
      </div>

      {/* Chart Wrapper Container */}
      <div className="w-full h-80 pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            {/* Horizontal system lines layout */}
            <CartesianGrid
              vertical={false}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
            />

            {/* X Axis tracking month tokens */}
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800 }}
              dy={12}
            />

            {/* Y Axis tracking amount distribution scaled down */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800 }}
              dx={-8}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />

            {/* Target Baseline Curve (Dotted Green) */}
            <Line
              type="monotone"
              dataKey="target" 
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
            />

            {/* Actual Collected Metric Curve (Premium Smooth Blue) */}
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#2563eb"
              strokeWidth={3.5}
              dot={false}
              activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: "#2563eb" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CollectionChart;