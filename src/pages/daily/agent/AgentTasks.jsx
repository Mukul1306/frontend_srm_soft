import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  RefreshCw,
  Play,
  AlertCircle,
  CalendarDays,
  X,
} from "lucide-react";

const API = "https://finance-project-0qqk.onrender.com/api/daily";

const getAgentId = () => {
  try {
    const agent = JSON.parse(localStorage.getItem("agent") || "null");
    return agent?._id || agent?.id || agent?.agentId || "";
  } catch {
    return "";
  }
};

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const statusClass = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MISSED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AgentTasks() {
  const [tasks, setTasks] = useState([]);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [note, setNote] = useState("");

  const agentId = getAgentId();

  const loadTasks = async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(`${API}/agent/tasks`, {
        params: { agentId },
      });

      setTasks(res.data?.tasks || []);
      setAgent(res.data?.agent || null);
    } catch (error) {
      console.error("Agent tasks error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();

    const timer = setInterval(loadTasks, 60000);

    return () => clearInterval(timer);
  }, [agentId]);

  const counts = useMemo(() => {
    return {
      pending: tasks.filter((x) => x.status === "PENDING").length,
      progress: tasks.filter((x) => x.status === "IN_PROGRESS").length,
      completed: tasks.filter((x) => x.status === "COMPLETED").length,
      missed: tasks.filter((x) => x.status === "MISSED").length,
    };
  }, [tasks]);

  const startTask = async (task) => {
    try {
      setActionId(task._id);

      await axios.put(
        `${API}/agent/tasks/${task._id}/start`,
        { agentId }
      );

      await loadTasks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to start task."
      );
    } finally {
      setActionId("");
    }
  };

  const completeTask = async () => {
    if (!selectedTask) return;

    try {
      setActionId(selectedTask._id);

      await axios.put(
        `${API}/agent/tasks/${selectedTask._id}/complete`,
        {
          agentId,
          completionNote: note,
        }
      );

      setSelectedTask(null);
      setNote("");
      await loadTasks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to complete task."
      );
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              My Tasks
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {agent?.name
                ? `Hello ${agent.name}, complete your assigned tasks within their due period.`
                : "Your assigned daily, weekly and monthly tasks."}
            </p>
          </div>

          <button
            onClick={loadTasks}
            className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat
            title="Pending"
            value={counts.pending}
            icon={<Clock3 size={18} />}
          />
          <Stat
            title="In Progress"
            value={counts.progress}
            icon={<Play size={18} />}
          />
          <Stat
            title="Completed"
            value={counts.completed}
            icon={<CheckCircle2 size={18} />}
          />
          <Stat
            title="Missed"
            value={counts.missed}
            icon={<AlertCircle size={18} />}
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <ClipboardCheck size={20} className="text-blue-600" />
            <h2 className="font-black text-slate-900">
              Today's Tasks
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              Loading tasks...
            </div>
          ) : !agentId ? (
            <div className="p-12 text-center text-rose-500 font-semibold">
              Agent login information was not found.
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays
                size={34}
                className="mx-auto text-slate-300"
              />
              <p className="font-black text-slate-700 mt-3">
                No tasks for today
              </p>
              <p className="text-sm text-slate-400 mt-1">
                New tasks assigned by Admin will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((item) => (
                <div
                  key={item._id}
                  className="p-5 hover:bg-slate-50/50"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-900 text-base">
                          {item.task?.title}
                        </h3>

                        <span
                          className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase ${statusClass[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        {item.task?.description ||
                          "No description provided."}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-3 text-xs font-bold text-slate-500">
                        <span>
                          Frequency: {item.task?.frequency}
                        </span>
                        <span>
                          Due: {formatDateTime(item.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {item.status === "PENDING" && (
                        <button
                          disabled={actionId === item._id}
                          onClick={() => startTask(item)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs disabled:opacity-50"
                        >
                          <Play size={15} />
                          {actionId === item._id
                            ? "Starting..."
                            : "Start Task"}
                        </button>
                      )}

                      {item.status === "IN_PROGRESS" && (
                        <button
                          disabled={actionId === item._id}
                          onClick={() => {
                            setSelectedTask(item);
                            setNote("");
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs disabled:opacity-50"
                        >
                          <CheckCircle2 size={15} />
                          Complete Task
                        </button>
                      )}

                      {item.status === "COMPLETED" && (
                        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs">
                          Completed
                        </div>
                      )}

                      {item.status === "MISSED" && (
                        <div className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs">
                          Missed
                        </div>
                      )}
                    </div>
                  </div>

                  {item.status === "COMPLETED" &&
                    item.completionNote && (
                      <div className="mt-4 bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800">
                        <b>Completion Note:</b>{" "}
                        {item.completionNote}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-black text-lg">
                  Complete Task
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedTask.task?.title}
                </p>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-[9px] font-black text-slate-400 uppercase">
                  Due
                </div>
                <div className="font-black text-slate-800 mt-1">
                  {formatDateTime(selectedTask.dueDate)}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Completion Note (Optional)
                </label>

                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Tell Admin what you completed..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={completeTask}
                  disabled={actionId === selectedTask._id}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-50"
                >
                  {actionId === selectedTask._id
                    ? "Completing..."
                    : "Mark Complete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value, icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-blue-600">{icon}</span>
      </div>
      <div className="text-2xl font-black text-slate-900 mt-2">
        {value}
      </div>
    </div>
  );
}
