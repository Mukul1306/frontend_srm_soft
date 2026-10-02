import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Bell, 
  Users, 
  FileSpreadsheet, 
  AlertTriangle, 
  History, 
  Send, 
  Loader2 
} from "lucide-react";

function Notifications() {
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadMembers();
    loadHistory();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await axios.get("https://finance-project-0qqk.onrender.com/api/daily/members");
      setMembers(res.data.members || []);
    } catch (err) {
      console.error("Error loading members:", err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await axios.get("https://finance-project-0qqk.onrender.com/api/notifications/history");
      setHistory(res.data.notifications || []);
    } catch (err) {
      console.error("Error loading history logs:", err);
    }
  };

  const clearForm = () => {
    setTitle("");
    setMessage("");
    setMemberId("");
  };

  const sendSingle = async () => {
    if (!memberId || !title || !message) {
      alert("Please populate all required fields.");
      return;
    }
    setSending(true);
    try {
      await axios.post("https://finance-project-0qqk.onrender.com/api/notifications/single", {
        memberId,
        title,
        message
      });
      alert("Notification Sent Successfully");
      clearForm();
      loadHistory();
    } catch (error) {
      alert(error.response?.data?.message || "Failed To Send Notification");
    } finally {
      setSending(false);
    }
  };

  const sendBroadcast = async (endpoint, successMessage) => {
    if (!title || !message) {
      alert("Please fill out the Title and Message before broadcasting.");
      return;
    }
    setSending(true);
    try {
      await axios.post(`https://finance-project-0qqk.onrender.com/api/notifications/${endpoint}`, {
        title,
        message
      });
      alert(successMessage);
      clearForm();
      loadHistory();
    } catch (error) {
      alert(error.response?.data?.message || "Broadcast Delivery Failure");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Block */}
      <div>
        <h1 className="text-sm font-black text-slate-900 tracking-wider uppercase flex items-center gap-2">
          Notification Center
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Send directly to individual members or use targeted segment broadcasts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Composition Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2">
              <Bell size={15} className="text-slate-400" />
              <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase">Compose Alert</h2>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Specific Member (Leave empty to broadcast to segments)
                </label>
                <select
                  value={memberId}
                  disabled={sending}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-100 transition disabled:opacity-60"
                >
                  <option value="">-- Bulk Mode Selection --</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.memberName} {m.mobile ? `(${m.mobile})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Alert Title
                </label>
                <input
                  type="text"
                  placeholder="Ex: EMI Due Reminder"
                  value={title}
                  disabled={sending}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 transition disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Message Content
                </label>
                <textarea
                  placeholder="Type the notice payload details here..."
                  rows={4}
                  value={message}
                  disabled={sending}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border rounded-xl p-3.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 transition disabled:opacity-60"
                />
              </div>

              {/* Action Dynamic Routing Buttons */}
              <div className="pt-2 border-t border-dashed">
                {memberId ? (
                  <button
                    type="button"
                    disabled={sending}
                    onClick={sendSingle}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs tracking-wider uppercase shadow-sm transition disabled:opacity-50 w-full sm:w-auto"
                  >
                    {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    Send Individual Alert
                  </button>
                ) : (
                  <p className="text-[11px] text-slate-400 font-medium italic">
                    Fill out the Title & Message, then use the bulk actions sidebar to trigger a segment blast.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Broadcasting Actions Panel */}
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2">
              <Users size={15} className="text-slate-400" />
              <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase">Segment Targets</h2>
            </div>
            
            <div className="p-4 space-y-3">
              <SegmentButton 
                onClick={() => sendBroadcast("all", "Broadcast deployed to all members.")}
                disabled={sending || !!memberId}
                label="Send To All Members"
                color="bg-emerald-600 hover:bg-emerald-700 text-white"
                icon={<Users size={14} />}
              />
              <SegmentButton 
                onClick={() => sendBroadcast("loan-members", "Broadcast deployed to active loan holders.")}
                disabled={sending || !!memberId}
                label="Send To Loan Holders"
                color="bg-amber-500 hover:bg-amber-600 text-white"
                icon={<FileSpreadsheet size={14} />}
              />
              <SegmentButton 
                onClick={() => sendBroadcast("pending-members", "Urgent notice sent to overdue accounts.")}
                disabled={sending || !!memberId}
                label="Send To Overdue Accounts"
                color="bg-rose-600 hover:bg-rose-700 text-white"
                icon={<AlertTriangle size={14} />}
              />
            </div>
          </div>
        </div>

      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2">
          <History size={15} className="text-slate-400" />
          <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase">Transmission History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/40 border-b text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-5">Target Recipient</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-5">Message</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs font-medium text-slate-600">
              {history.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3 px-5">
                    <span className={`inline-block text-[10px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded ${
                      item.member?.memberName ? "bg-slate-100 text-slate-700" : "bg-blue-50 text-blue-700 font-black"
                    }`}>
                      {item.member?.memberName || "Global Broadcast"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 max-w-[180px] truncate" title={item.title}>
                    {item.title}
                  </td>
                  <td className="py-3 px-5 text-slate-500 max-w-sm truncate" title={item.message}>
                    {item.message}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </td>
                </tr>
              ))}

              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 text-xs font-medium italic">
                    No outbound history logs discovered in system memory.
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

function SegmentButton({ onClick, disabled, label, color, icon }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-sm ${color} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default Notifications;