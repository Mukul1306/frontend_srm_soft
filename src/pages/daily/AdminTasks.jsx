import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Users,
  X,
  AlertCircle,
} from "lucide-react";

const API = "https://aws.srmfinance.online/api/daily";

const statusClass = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MISSED: "bg-rose-50 text-rose-700 border-rose-200",
};

const taskStatusClass = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  PAUSED: "bg-amber-50 text-amber-700",
  ARCHIVED: "bg-slate-100 text-slate-500",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

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

const getAgentId = () => {
  try {
    const agent = JSON.parse(localStorage.getItem("agent") || "null");
    return agent?._id || agent?.id || agent?.agentId || "";
  } catch {
    return "";
  }
};

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [history, setHistory] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedType: "SPECIFIC",
    assignedAgent: "",
    frequency: "DAILY",
    startDate: new Date().toISOString().split("T")[0],
    dueTime: "18:00",
  });

 const loadAgents = async () => {
  try {
    const res = await axios.get(`${API}/task-agents`);

    console.log("AGENTS API RESPONSE:", res.data);

    // Support different possible API response structures
    const agentList =
      Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.agents)
        ? res.data.agents
        : Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.data?.agents)
        ? res.data.data.agents
        : Array.isArray(res.data?.users)
        ? res.data.users
        : [];

    const activeAgents = agentList.filter(
      (agent) =>
        !agent.status ||
        ["ACTIVE", "Active", "active"].includes(agent.status)
    );

    console.log("AGENTS LOADED:", activeAgents);

    setAgents(activeAgents);
  } catch (error) {
    console.error("Load agents error:", error);
    console.error("Response:", error.response?.data);

    setAgents([]);

    alert(
      error.response?.data?.message ||
        "Failed to load agents."
    );
  }
};

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/tasks`);
      setTasks(res.data?.tasks || []);
    } catch (error) {
      console.error("Load tasks error:", error);
      alert(error.response?.data?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
    loadTasks();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      assignedType: "SPECIFIC",
      assignedAgent: "",
      frequency: "DAILY",
      startDate: new Date().toISOString().split("T")[0],
      dueTime: "18:00",
    });
  };

  const createTask = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Enter task title.");
      return;
    }

    if (form.assignedType === "SPECIFIC" && !form.assignedAgent) {
      alert("Select an agent.");
      return;
    }

    try {
      setSaving(true);

      await axios.post(`${API}/tasks`, {
        ...form,
        assignedAgent:
          form.assignedType === "SPECIFIC"
            ? form.assignedAgent
            : null,
      });

      alert("Task created successfully.");
      setShowCreate(false);
      resetForm();
      await loadTasks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create task."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (task) => {
    try {
      setSelectedTask(task);
      const res = await axios.get(`${API}/tasks/${task._id}`);
      setSelectedTask(res.data?.task || task);
      setHistory(res.data?.assignments || []);
    } catch (error) {
      console.error("Task details error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to load task details."
      );
    }
  };

  const changeTaskStatus = async (task, status) => {
    try {
      await axios.put(`${API}/tasks/${task._id}/status`, {
        status,
      });
      await loadTasks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update task."
      );
    }
  };

  const stats = useMemo(() => {
    let pending = 0;
    let progress = 0;
    let completed = 0;
    let missed = 0;

    tasks.forEach((task) => {
      (task.agentStatuses || []).forEach((item) => {
        if (item.status === "PENDING") pending++;
        if (item.status === "IN_PROGRESS") progress++;
        if (item.status === "COMPLETED") completed++;
        if (item.status === "MISSED") missed++;
      });
    });

    return { pending, progress, completed, missed };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Task Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Send daily, weekly or monthly tasks to one agent or all agents.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadTasks}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowCreate(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm hover:bg-blue-700"
            >
              <Plus size={17} />
              Create Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Pending Today"
            value={stats.pending}
            icon={<Clock3 size={18} />}
          />
          <StatCard
            title="In Progress"
            value={stats.progress}
            icon={<Play size={18} />}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle2 size={18} />}
          />
          <StatCard
            title="Missed"
            value={stats.missed}
            icon={<AlertCircle size={18} />}
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <ClipboardList size={20} className="text-blue-600" />
            <h2 className="font-black text-slate-900">
              Assigned Tasks
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No tasks created yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="p-5 hover:bg-slate-50/60 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-900">
                          {task.title}
                        </h3>

                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${taskStatusClass[task.status] || ""}`}
                        >
                          {task.status}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        {task.description || "No description"}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-3 text-xs font-bold text-slate-500">
                        <span>
                          Frequency: {task.frequency}
                        </span>
                        <span>
                          Start: {formatDate(task.startDate)}
                        </span>
                        <span>
                          Due: {task.dueTime}
                        </span>
                        <span>
                          Assigned:{" "}
                          {task.assignedType === "ALL"
                            ? "All Agents"
                            : task.assignedAgent?.name || "Agent"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openDetails(task)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs"
                      >
                        <Eye size={15} />
                        Details
                      </button>

                      {task.status === "ACTIVE" ? (
                        <button
                          onClick={() =>
                            changeTaskStatus(task, "PAUSED")
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs"
                        >
                          <Pause size={15} />
                          Pause
                        </button>
                      ) : task.status === "PAUSED" ? (
                        <button
                          onClick={() =>
                            changeTaskStatus(task, "ACTIVE")
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                        >
                          <Play size={15} />
                          Activate
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(task.agentStatuses || []).map((item) => (
                      <div
                        key={String(item.agent?._id)}
                        className="inline-flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                      >
                        <Users size={14} className="text-slate-400" />
                        <span className="font-bold text-xs">
                          {item.agent?.name || "Agent"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[9px] font-black ${statusClass[item.status] || ""}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <Modal title="Create New Task" onClose={() => setShowCreate(false)}>
          <form onSubmit={createTask} className="space-y-4">
            <Field label="Task Title">
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                className={inputClass}
                placeholder="e.g. Daily Collection Report"
                required
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="Describe what the agent needs to do..."
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Assign To">
                <select
                  value={form.assignedType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      assignedType: e.target.value,
                      assignedAgent: "",
                    })
                  }
                  className={inputClass}
                >
                  <option value="SPECIFIC">Specific Agent</option>
                  <option value="ALL">All Agents</option>
                </select>
              </Field>

              {form.assignedType === "SPECIFIC" && (
                <Field label="Agent">
                  <select
                    value={form.assignedAgent}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        assignedAgent: e.target.value,
                      })
                    }
                    className={inputClass}
                    required
                  >
                    <option value="">Select Agent</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} {agent.mobile ? `- ${agent.mobile}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="Frequency">
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      frequency: e.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option value="ONCE">One Time</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </Field>

              <Field label="Start Date">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      startDate: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Due Time">
                <input
                  type="time"
                  value={form.dueTime}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dueTime: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selectedTask && (
        <Modal
          title="Task Details"
          onClose={() => {
            setSelectedTask(null);
            setHistory([]);
          }}
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {selectedTask.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {selectedTask.description || "No description"}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Info label="Frequency" value={selectedTask.frequency} />
              <Info
                label="Assigned"
                value={
                  selectedTask.assignedType === "ALL"
                    ? "All Agents"
                    : selectedTask.assignedAgent?.name || "Agent"
                }
              />
              <Info
                label="Start"
                value={formatDate(selectedTask.startDate)}
              />
              <Info
                label="Due Time"
                value={selectedTask.dueTime}
              />
            </div>

            <div>
              <h4 className="font-black text-slate-900 mb-3">
                Agent Task History
              </h4>

              {history.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No task history yet.
                </p>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {history.map((item) => (
                    <div
                      key={item._id}
                      className="border border-slate-200 rounded-xl p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-bold text-sm">
                          {item.agent?.name || "Agent"}
                        </div>

                        <span
                          className={`px-2 py-1 rounded-full border text-[9px] font-black ${statusClass[item.status] || ""}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-2">
                        Due: {formatDateTime(item.dueDate)}
                      </div>

                      {item.completedAt && (
                        <div className="text-xs text-emerald-600 mt-1 font-semibold">
                          Completed: {formatDateTime(item.completedAt)}
                        </div>
                      )}

                      {item.completionNote && (
                        <div className="mt-2 text-xs bg-slate-50 rounded-lg p-2 text-slate-600">
                          {item.completionNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center">
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

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="text-[9px] font-black text-slate-400 uppercase">
        {label}
      </div>
      <div className="text-sm font-black text-slate-800 mt-1 truncate">
        {value}
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-black text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white";
