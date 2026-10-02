import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin, CalendarDays, Users, CheckCircle2, XCircle, ChevronLeft,
  ChevronRight, BarChart3, Clock, Search, Download,
  X, CircleDashed, AlertTriangle, Timer
} from "lucide-react";

// =====================================================================
// CONFIG
// =====================================================================

const API = "https://finance-project-0qqk.onrender.com/api/daily/attendance";

// Warm, punch-card inspired palette — teal for identity, amber for caution,
// coral for absence, emerald for presence. Deliberately not slate/indigo.
const AVATAR_PALETTE = [
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-amber-100", text: "text-amber-800" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-700" }
];

// =====================================================================
// GLOBAL TYPE / THEME INJECTION
// =====================================================================

function ThemeFonts() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,900&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
      .attn-root { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; }
      .attn-root .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
      .attn-root .font-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
      .attn-stub { position: relative; }
      .attn-stub::before, .attn-stub::after {
        content: "";
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        border-radius: 9999px;
        background: var(--attn-bg, #FAFAF9);
        border: 1px solid #E7E5E4;
      }
      .attn-stub::before { left: -8px; }
      .attn-stub::after { right: -8px; }
    `}</style>
  );
}

// =====================================================================
// HELPERS
// =====================================================================

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarColors(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function formatTime(value) {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatWorkingTime(minutes) {
  if (minutes === undefined || minutes === null || Number(minutes) <= 0) return "--";
  const hours = Math.floor(Number(minutes) / 60);
  const mins = Number(minutes) % 60;
  return `${hours}h ${mins}m`;
}

function getDateKey(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function downloadCSV(filename, headers, rows) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

// =====================================================================
// SMALL UI PRIMITIVES
// =====================================================================

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const day = now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-teal-800 bg-teal-800 px-4 py-2.5 shadow-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
      </span>
      <div className="leading-tight">
        <div className="font-mono text-sm font-bold tabular-nums text-white">{time}</div>
        <div className="text-[11px] font-medium text-teal-200">{day}</div>
      </div>
    </div>
  );
}

function AvatarBadge({ name, size = "md" }) {
  const c = avatarColors(name || "?");
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`flex ${dim} shrink-0 items-center justify-center rounded-full ${c.bg} ${c.text} font-bold font-display`}>
      {initials(name)}
    </div>
  );
}

const STATUS_STYLES = {
  PRESENT: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle2 },
  HALF_DAY: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", dot: "bg-amber-500", Icon: Clock },
  ABSENT: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", dot: "bg-rose-500", Icon: XCircle },
  UPCOMING: { bg: "bg-stone-100", text: "text-stone-400", ring: "ring-stone-200", dot: "bg-stone-300", Icon: CircleDashed }
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.ABSENT;
  const Icon = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${s.bg} ${s.text} ring-1 ${s.ring} px-2.5 py-1 text-xs font-bold tracking-wide`}>
      <Icon size={12} />
      {status.replace("_", " ")}
    </span>
  );
}

// Signature element: a perforated "timecard stub" — an eyebrow label, a torn
// dashed line with side notches, then the punched value beneath it.
function StatCard({ icon: Icon, label, value, tone = "teal", hint }) {
  const tones = {
    teal: "bg-teal-50 text-teal-700",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600"
  };
  return (
    <div className="overflow-visible rounded-2xl border border-stone-200 bg-white">
      <div className="flex items-center justify-between px-5 pt-4 pb-3.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tones[tone]}`}>
          <Icon size={15} />
        </div>
      </div>
      <div className="attn-stub border-t-2 border-dashed border-stone-200" style={{ "--attn-bg": "#FAFAF9" }} />
      <div className="px-5 py-4">
        <div className="font-display text-3xl font-bold tabular-nums text-stone-900">{value}</div>
        {hint && <div className="mt-1 text-xs font-medium text-stone-400">{hint}</div>}
      </div>
    </div>
  );
}

function CompositionBar({ present = 0, halfDay = 0, absent = 0 }) {
  const total = present + halfDay + absent;
  if (total === 0) {
    return <div className="h-2 w-full rounded-full bg-stone-100" />;
  }
  const p = (present / total) * 100;
  const h = (halfDay / total) * 100;
  const a = (absent / total) * 100;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-stone-100">
      {p > 0 && <div className="h-full bg-emerald-500" style={{ width: `${p}%` }} />}
      {h > 0 && <div className="h-full bg-amber-400" style={{ width: `${h}%` }} />}
      {a > 0 && <div className="h-full bg-rose-400" style={{ width: `${a}%` }} />}
    </div>
  );
}

function SearchField({ value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 sm:w-64 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100">
      <Search size={16} className="shrink-0 text-stone-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm font-medium text-stone-700 outline-none placeholder:text-stone-400"
      />
    </div>
  );
}

function TableSkeleton({ cols = 6, rows = 6 }) {
  return (
    <div className="divide-y divide-stone-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 p-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 flex-1 animate-pulse rounded bg-stone-100"
              style={{ maxWidth: c === 0 ? "160px" : "90px" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon = CalendarDays, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-500">
        <Icon size={22} />
      </div>
      <div>
        <p className="font-display font-bold text-stone-700">{title}</p>
        <p className="mt-1 text-sm text-stone-400">{message}</p>
      </div>
    </div>
  );
}

function LocationButton({ location, onClick }) {
  if (!location || location.latitude === undefined || location.longitude === undefined) {
    return <span className="text-xs font-medium text-stone-300">Not captured</span>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100"
    >
      <MapPin size={13} />
      View
    </button>
  );
}

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function AttendanceManagement() {
  const today = new Date();

  const [view, setView] = useState("daily");

  // daily
  const [date, setDate] = useState(today.toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dailySearch, setDailySearch] = useState("");

  // monthly
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [monthlySearch, setMonthlySearch] = useState("");

  // detail modal
  const [selectedAgent, setSelectedAgent] = useState(null);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON(`${API}/all?date=${encodeURIComponent(date)}`);
      setAttendance(data.attendance || []);
    } catch (error) {
      console.error("Attendance loading error:", error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "daily") loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, view]);

  const loadMonthlyAttendance = async (month = selectedMonth, year = selectedYear) => {
    try {
      setMonthlyLoading(true);
      const data = await fetchJSON(`${API}/monthly?month=${month}&year=${year}`);
      setMonthlyReport(data.report || []);
    } catch (error) {
      console.error("Monthly attendance error:", error);
      setMonthlyReport([]);
    } finally {
      setMonthlyLoading(false);
    }
  };

  useEffect(() => {
    if (view === "monthly") loadMonthlyAttendance(selectedMonth, selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const changeMonth = (direction) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    loadMonthlyAttendance(newMonth, newYear);
  };

  const handleAgentClick = (agentReport) => {
    if (!agentReport?.agent?._id) {
      console.error("Agent ID missing:", agentReport);
      return;
    }
    setSelectedAgent(agentReport);
  };

  const openMap = (location) => {
    if (!location || location.latitude === undefined || location.longitude === undefined) return;
    window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, "_blank", "noopener,noreferrer");
  };

  const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });

  const presentCount = attendance.filter((i) => i.status === "PRESENT").length;
  const absentCount = attendance.filter((i) => i.status === "ABSENT").length;
  const locationCount = attendance.filter((i) => i.checkInLocation).length;

  const filteredAttendance = useMemo(() => {
    const q = dailySearch.trim().toLowerCase();
    if (!q) return attendance;
    return attendance.filter(
      (i) => i.agent?.name?.toLowerCase().includes(q) || i.agent?.mobile?.toLowerCase?.().includes(q)
    );
  }, [attendance, dailySearch]);

  const filteredMonthly = useMemo(() => {
    const q = monthlySearch.trim().toLowerCase();
    if (!q) return monthlyReport;
    return monthlyReport.filter(
      (i) => i.agent?.name?.toLowerCase().includes(q) || i.agent?.mobile?.toLowerCase?.().includes(q)
    );
  }, [monthlyReport, monthlySearch]);

  const exportMonthlyCSV = () => {
    const headers = ["Agent", "Mobile", "Present", "Absent", "Half day", "Attendance %", "Working time"];
    const rows = filteredMonthly.map((item) => [
      item.agent?.name || "Unknown",
      item.agent?.mobile || "--",
      item.present || 0,
      item.absent || 0,
      item.halfDay || 0,
      `${item.attendanceRate || 0}%`,
      formatWorkingTime(item.totalWorkingMinutes)
    ]);
    downloadCSV(`attendance-${monthName.replace(" ", "-")}.csv`, headers, rows);
  };

  return (
    <div className="attn-root min-h-screen bg-stone-50 p-4 sm:p-6 lg:p-8">
      <ThemeFonts />

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-800 text-white">
            <Timer size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900">Attendance Ledger</h1>
            <p className="text-sm text-stone-400">Track daily check-ins and monthly attendance across your team.</p>
          </div>
        </div>
        <LiveClock />
      </div>

      {/* TABS — folder-style */}
      <div className="mb-0 flex w-fit gap-1 border-b-2 border-stone-200">
        <button
          type="button"
          onClick={() => setView("daily")}
          className={`rounded-t-xl border border-b-0 px-5 py-2.5 text-sm font-bold transition ${
            view === "daily"
              ? "border-stone-200 bg-white text-teal-800 relative -mb-0.5"
              : "border-transparent bg-stone-100 text-stone-500 hover:bg-stone-200/70"
          }`}
        >
          Daily attendance
        </button>
        <button
          type="button"
          onClick={() => setView("monthly")}
          className={`rounded-t-xl border border-b-0 px-5 py-2.5 text-sm font-bold transition ${
            view === "monthly"
              ? "border-stone-200 bg-white text-teal-800 relative -mb-0.5"
              : "border-transparent bg-stone-100 text-stone-500 hover:bg-stone-200/70"
          }`}
        >
          Monthly report
        </button>
      </div>
      <div className="mb-6 h-px w-full bg-white" />

      {/* DAILY VIEW */}
      {view === "daily" && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Records" value={attendance.length} tone="teal" />
            <StatCard icon={CheckCircle2} label="Present" value={presentCount} tone="emerald" />
            <StatCard icon={XCircle} label="Absent" value={absentCount} tone="rose" />
            <StatCard icon={MapPin} label="Locations captured" value={locationCount} tone="amber" />
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5">
              <CalendarDays size={16} className="text-teal-700" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-sm font-bold text-stone-700 outline-none"
              />
            </div>
            <SearchField value={dailySearch} onChange={setDailySearch} placeholder="Search agent or mobile" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {loading ? (
              <TableSkeleton cols={6} />
            ) : filteredAttendance.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No attendance records"
                message={dailySearch ? "No agents match your search." : "No one has checked in for this date yet."}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-stone-200 bg-stone-50">
                    <tr>
                      <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-stone-400">Agent</th>
                      <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-stone-400">Status</th>
                      <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-stone-400">Check in</th>
                      <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-stone-400">Check out</th>
                      <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-stone-400">Working</th>
                      <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-stone-400">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredAttendance.map((item) => (
                      <tr key={item._id} className="hover:bg-teal-50/40">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <AvatarBadge name={item.agent?.name} size="sm" />
                            <div>
                              <div className="font-bold text-stone-900">{item.agent?.name || "Unknown agent"}</div>
                              <div className="text-xs text-stone-400">{item.agent?.mobile || "--"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center"><StatusPill status={item.status || "PRESENT"} /></td>
                        <td className="p-4 text-center font-mono font-semibold tabular-nums text-stone-600">{formatTime(item.checkInTime)}</td>
                        <td className="p-4 text-center font-mono font-semibold tabular-nums text-stone-600">{formatTime(item.checkOutTime)}</td>
                        <td className="p-4 text-center font-mono font-semibold tabular-nums text-stone-600">{formatWorkingTime(item.workingMinutes)}</td>
                        <td className="p-4 text-center">
                          <LocationButton location={item.checkInLocation} onClick={() => openMap(item.checkInLocation)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* MONTHLY VIEW */}
      {view === "monthly" && (
        <MonthlyAttendanceReport
          report={filteredMonthly}
          rawCount={monthlyReport.length}
          loading={monthlyLoading}
          monthName={monthName}
          search={monthlySearch}
          onSearch={setMonthlySearch}
          onPreviousMonth={() => changeMonth(-1)}
          onNextMonth={() => changeMonth(1)}
          onAgentClick={handleAgentClick}
          onExport={exportMonthlyCSV}
        />
      )}

      {/* AGENT DETAIL */}
      {selectedAgent && (
        <AgentCalendarModal
          agent={selectedAgent}
          month={selectedMonth}
          year={selectedYear}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}

// =====================================================================
// MONTHLY REPORT
// =====================================================================

function MonthlyAttendanceReport({
  report, rawCount, loading, monthName, search, onSearch,
  onPreviousMonth, onNextMonth, onAgentClick, onExport
}) {
  const totalPresent = report.reduce((sum, i) => sum + Number(i.present || 0), 0);
  const totalAbsent = report.reduce((sum, i) => sum + Number(i.absent || 0), 0);
  const totalHalfDay = report.reduce((sum, i) => sum + Number(i.halfDay || 0), 0);

  return (
    <div className="space-y-6">
      {/* MONTH HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <BarChart3 size={17} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-stone-400">Monthly attendance</p>
            <h2 className="font-display text-lg font-bold text-stone-900">{monthName}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onPreviousMonth} className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:text-teal-700">
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-[150px] rounded-xl bg-teal-50 px-4 py-2.5 text-center text-sm font-black text-teal-800">{monthName}</div>
          <button type="button" onClick={onNextMonth} className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:text-teal-700">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total agents" value={rawCount} tone="teal" />
        <StatCard icon={CheckCircle2} label="Present days" value={totalPresent} tone="emerald" />
        <StatCard icon={XCircle} label="Absent days" value={totalAbsent} tone="rose" />
        <StatCard icon={CalendarDays} label="Half days" value={totalHalfDay} tone="amber" />
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <BarChart3 size={19} />
            </div>
            <div>
              <h3 className="font-display font-bold text-stone-900">Agent monthly report</h3>
              <p className="text-xs text-stone-400">Click an agent to view the full month.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SearchField value={search} onChange={onSearch} placeholder="Search agent or mobile" />
            <button
              type="button"
              onClick={onExport}
              disabled={report.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40"
            >
              <Download size={15} />
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton cols={6} />
        ) : report.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No attendance records"
            message={search ? "No agents match your search." : "No attendance found for this month."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-stone-400">Agent</th>
                  <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-stone-400 w-40">Composition</th>
                  <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-stone-400">Present</th>
                  <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-stone-400">Absent</th>
                  <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-stone-400">Half day</th>
                  <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-stone-400">Attendance</th>
                  <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-stone-400">Working time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {report.map((item) => (
                  <tr key={item.agent?._id} className="hover:bg-teal-50/40">
                    <td className="p-4">
                      <button type="button" onClick={() => onAgentClick(item)} className="group flex items-center gap-3 text-left">
                        <AvatarBadge name={item.agent?.name} size="sm" />
                        <div>
                          <div className="font-bold text-stone-900 group-hover:text-teal-700 group-hover:underline">
                            {item.agent?.name || "Unknown agent"}
                          </div>
                          <div className="text-xs text-stone-400">{item.agent?.mobile || "--"}</div>
                        </div>
                      </button>
                    </td>
                    <td className="p-4">
                      <CompositionBar present={item.present} halfDay={item.halfDay} absent={item.absent} />
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex min-w-[38px] justify-center rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-xs font-black tabular-nums text-emerald-700">
                        {item.present || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex min-w-[38px] justify-center rounded-full bg-rose-50 px-2.5 py-1 font-mono text-xs font-black tabular-nums text-rose-700">
                        {item.absent || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold tabular-nums text-amber-600">{item.halfDay || 0}</td>
                    <td className="p-4 text-center font-mono font-black tabular-nums text-teal-700">{item.attendanceRate || 0}%</td>
                    <td className="p-4 text-center font-mono font-semibold tabular-nums text-stone-600">{formatWorkingTime(item.totalWorkingMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// AGENT CALENDAR DETAIL MODAL
// =====================================================================

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarCells(year, month) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function AgentCalendarModal({ agent, month, year, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(null);

  const agentId = agent?.agent?._id || agent?.agent?.id || agent?._id;
  const monthName = new Date(year, month - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
  const today = new Date();

  useEffect(() => {
    const loadAgentAttendance = async () => {
      if (!agentId) {
        setError("Agent ID is missing.");
        return;
      }
      try {
        setLoading(true);
        setError("");
        const data = await fetchJSON(`${API}/all?agentId=${encodeURIComponent(agentId)}&month=${month}&year=${year}`);
        setRecords(data.attendance || []);
      } catch (err) {
        console.error("Agent monthly attendance error:", err);
        setRecords([]);
        setError(err?.message || "Unable to load agent attendance.");
      } finally {
        setLoading(false);
      }
    };
    loadAgentAttendance();
  }, [agentId, month, year]);

  const recordMap = useMemo(() => {
    const map = new Map();
    records.forEach((record) => {
      const key = getDateKey(record.attendanceDate);
      if (key) map.set(key, record);
    });
    return map;
  }, [records]);

  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);

  const dayInfo = (day) => {
    if (!day) return null;
    const date = new Date(year, month - 1, day);
    const key = [year, String(month).padStart(2, "0"), String(day).padStart(2, "0")].join("-");
    const record = recordMap.get(key) || null;
    const isFuture = date > today && !sameDay(date, today);
    let status = "ABSENT";
    if (record?.status === "PRESENT") status = "PRESENT";
    else if (record?.status === "HALF_DAY") status = "HALF_DAY";
    else if (isFuture) status = "UPCOMING";
    return { day, date, key, record, status, isToday: sameDay(date, today) };
  };

  const summary = useMemo(() => {
    let present = 0, halfDay = 0, absent = 0, totalWorking = 0;
    cells.forEach((day) => {
      const info = dayInfo(day);
      if (!info || info.status === "UPCOMING") return;
      if (info.status === "PRESENT") present++;
      else if (info.status === "HALF_DAY") halfDay++;
      else absent++;
    });
    records.forEach((r) => { totalWorking += Number(r.workingMinutes || 0); });
    const counted = present + halfDay + absent;
    const rate = counted > 0 ? Math.round(((present + halfDay * 0.5) / counted) * 100) : 0;
    return { present, halfDay, absent, totalWorking, rate };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells, recordMap, records]);

  const agentName = agent?.agent?.name || agent?.name || "Agent";
  const agentMobile = agent?.agent?.mobile || agent?.mobile || "--";

  const openMap = (location) => {
    if (!location || location.latitude === undefined || location.longitude === undefined) return;
    window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="attn-root fixed inset-0 z-[100] flex items-center justify-center bg-teal-950/50 p-4 backdrop-blur-sm">
      <ThemeFonts />
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-teal-800 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <AvatarBadge name={agentName} />
            <div>
              <h2 className="font-display text-lg font-bold text-white">{agentName}</h2>
              <p className="text-xs text-teal-200">{agentMobile} &middot; {monthName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-teal-100 hover:bg-teal-600">
            <X size={17} />
          </button>
        </div>

        {/* SUMMARY */}
        <div className="grid shrink-0 grid-cols-2 gap-3 border-b border-stone-100 p-5 sm:grid-cols-5 sm:p-6">
          <MiniStat label="Present" value={summary.present} tone="emerald" icon={CheckCircle2} />
          <MiniStat label="Absent" value={summary.absent} tone="rose" icon={XCircle} />
          <MiniStat label="Half day" value={summary.halfDay} tone="amber" icon={CalendarDays} />
          <MiniStat label="Attendance" value={`${summary.rate}%`} tone="teal" icon={BarChart3} />
          <MiniStat label="Working time" value={formatWorkingTime(summary.totalWorking)} tone="stone" icon={Clock} />
        </div>

        {error && (
          <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600 sm:mx-6">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* CALENDAR */}
        <div className="flex-1 overflow-auto p-5 sm:p-6">
          {loading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-stone-100" />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-2 grid grid-cols-7 gap-2">
                {WEEKDAYS.map((wd) => (
                  <div key={wd} className="text-center text-xs font-black uppercase tracking-wider text-stone-400">{wd}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {cells.map((day, idx) => {
                  const info = dayInfo(day);
                  if (!info) return <div key={idx} />;
                  const s = STATUS_STYLES[info.status];
                  const isActive = activeDay === info.key;
                  return (
                    <button
                      key={info.key}
                      type="button"
                      onClick={() => setActiveDay(isActive ? null : info.key)}
                      className={`relative flex aspect-square flex-col items-start justify-start rounded-xl border p-2 text-left transition ${s.bg} ${s.ring.replace("ring-", "border-")} ${info.isToday ? "ring-2 ring-teal-600" : ""} hover:brightness-95`}
                    >
                      <span className={`font-mono text-xs font-bold tabular-nums ${s.text}`}>{info.day}</span>
                      {info.status === "PRESENT" && (
                        <span className="mt-auto w-full truncate font-mono text-[10px] font-semibold tabular-nums text-emerald-600 sm:text-xs">
                          {formatTime(info.record?.checkInTime)}
                        </span>
                      )}
                      {info.status === "HALF_DAY" && (
                        <span className="mt-auto w-full truncate font-mono text-[10px] font-semibold tabular-nums text-amber-600 sm:text-xs">
                          {formatTime(info.record?.checkInTime)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* legend */}
              <div className="mt-5 flex flex-wrap items-center gap-4">
                {Object.entries({ PRESENT: "Present", HALF_DAY: "Half day", ABSENT: "Absent", UPCOMING: "Upcoming" }).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[key].dot}`} />
                    {label}
                  </div>
                ))}
              </div>

              {/* selected day detail */}
              {activeDay && (() => {
                const day = Number(activeDay.split("-")[2]);
                const info = dayInfo(day);
                if (!info) return null;
                return (
                  <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-display text-sm font-bold text-stone-900">
                          {info.date.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" })}
                        </div>
                        <div className="mt-1"><StatusPill status={info.status} /></div>
                      </div>
                      {info.record && (
                        <div className="flex flex-wrap items-center gap-5 text-sm">
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wide text-stone-400">Check in</div>
                            <div className="font-mono font-bold tabular-nums text-stone-700">{formatTime(info.record.checkInTime)}</div>
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wide text-stone-400">Check out</div>
                            <div className="font-mono font-bold tabular-nums text-stone-700">{formatTime(info.record.checkOutTime)}</div>
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wide text-stone-400">Working</div>
                            <div className="font-mono font-bold tabular-nums text-stone-700">{formatWorkingTime(info.record.workingMinutes)}</div>
                          </div>
                          <LocationButton location={info.record.checkInLocation} onClick={() => openMap(info.record.checkInLocation)} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 justify-end border-t border-stone-100 bg-stone-50 p-4">
          <button type="button" onClick={onClose} className="rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone, icon: Icon }) {
  const tones = {
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
    teal: "text-teal-700",
    stone: "text-stone-700"
  };
  return (
    <div className="rounded-xl bg-stone-50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-stone-400">{label}</span>
        {Icon && <Icon size={14} className="text-stone-400" />}
      </div>
      <div className={`mt-1 font-mono text-lg font-black tabular-nums ${tones[tone]}`}>{value}</div>
    </div>
  );
}