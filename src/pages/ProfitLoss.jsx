import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X,
  Loader2,
  Trash2,
  Wallet,
  ArrowUpRight,
  Coins,
  Receipt
} from "lucide-react";

function SocietyProfitLoss() {
  const [report, setReport] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

const [form, setForm] = useState({

  type: "EXPENSE",

  title: "",

  category: "",

  amount: "",

  paymentMethod: "Cash",

  note: ""

});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profitRes, expenseRes] = await Promise.all([
        axios.get("https://finance-project-0qqk.onrender.com/api/profit-loss"),
        axios.get("https://finance-project-0qqk.onrender.com/api/expenses")
      ]);
      setReport(profitRes.data || {});
      setExpenses(expenseRes.data?.expenses || []);
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post("https://finance-project-0qqk.onrender.com/api/expenses", form);
      setShowModal(false);
   setForm({

type: "EXPENSE",

title: "",

category: "",

amount: "",

paymentMethod: "Cash",

note: ""

});
      await loadData();
    } catch (error) {
      alert("Failed to save expense record.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    setDeletingId(id);
    try {
      await axios.delete(`https://finance-project-0qqk.onrender.com/api/expenses/${id}`);
      await loadData();
    } catch (error) {
      alert("Failed to delete record.");
    } finally {
      setDeletingId(null);
    }
  };

  const isNetProfitPositive = (report.netProfit || 0) >= 0;

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen text-slate-900 font-sans max-w-7xl mx-auto">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">
            Society Profit & Loss
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage society collections and track operational expenditures.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* --- METRIC GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        
        {/* Payment Collection */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Payments</p>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Wallet size={18} />
            </div>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {loading ? "..." : `₹${(report.totalPayment || 0).toLocaleString("en-IN")}`}
          </h2>
        </div>

        {/* Interest Collection */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Interest</p>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Coins size={18} />
            </div>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {loading ? "..." : `₹${(report.totalInterest || 0).toLocaleString("en-IN")}`}
          </h2>
        </div>

        {/* Total Income */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Income</p>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <h2 className="text-xl font-black text-emerald-600">
            {loading ? "..." : `₹${(report.totalIncome || 0).toLocaleString("en-IN")}`}
          </h2>
        </div>
<div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
  <div className="flex justify-between items-center mb-4">
    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
      Manual Income
    </p>

    <div className="p-2 rounded-lg bg-green-50 text-green-600">
      <Coins size={18} />
    </div>
  </div>

  <h2 className="text-xl font-black text-green-600">
    {loading
      ? "..."
      : `₹${(report.remainingManualIncome || 0).toLocaleString("en-IN")}`}
  </h2>
</div>




        {/* Total Expense */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Expense</p>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown size={18} />
            </div>
          </div>
          <h2 className="text-xl font-black text-rose-600">
            {loading ? "..." : `₹${(report.totalExpense || 0).toLocaleString("en-IN")}`}
          </h2>
        </div>

        {/* Net Profit */}
        <div className={`rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${
          isNetProfitPositive 
            ? "bg-blue-50/50 border-blue-100 text-blue-900" 
            : "bg-rose-50 border-rose-100 text-rose-900"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">Net Profit</p>
            <div className={`p-2 rounded-lg ${isNetProfitPositive ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600"}`}>
              {isNetProfitPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
          </div>
          <h2 className="text-xl font-black">
            {loading ? "..." : `₹${(report.netProfit || 0).toLocaleString("en-IN")}`}
          </h2>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Receipt size={18} className="text-slate-400" />
          <h2 className="text-base font-bold text-slate-800">Transaction History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-[11px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100">
              <th className="py-4 px-6">

Type

</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <Loader2 size={24} className="animate-spin mx-auto text-slate-300" />
                  </td>
                </tr>
              ) : expenses.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">

<span

className={`px-3 py-1 rounded-full text-xs font-bold

${item.type==="INCOME"

?

"bg-green-100 text-green-700"

:

"bg-red-100 text-red-700"

}`}

>

{item.type}

</span>

</td>
                  <td className="py-4 px-6 font-semibold text-slate-700">{item.title}</td>
                  <td className="py-4 px-6 text-slate-500">{item.category}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">₹{(item.amount || 0).toLocaleString("en-IN")}</td>
                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      disabled={deletingId === item._id}
                      onClick={() => deleteExpense(item._id)}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      {deletingId === item._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && expenses.length === 0 && (
            <div className="text-center py-12 text-slate-400 font-medium">No records found</div>
          )}
        </div>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Record New Transaction</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addExpense} className="p-6 space-y-4">

              <div>

<label className="block text-xs font-bold text-slate-500 uppercase mb-1">

Transaction Type

</label>

<select

className="w-full border border-slate-200 rounded-xl px-4 py-2.5"

value={form.type}

onChange={(e)=>

setForm({

...form,

type:e.target.value

})

}

>

<option value="EXPENSE">

Expense

</option>

<option value="INCOME">

Income

</option>

</select>

</div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                  placeholder="e.g. Electricity Bill"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
            placeholder={
form.type==="INCOME"

?

"Capital / Investment"

:

"Electricity / Rent"
}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    disabled={submitting}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Note (Optional)</label>
                <textarea
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition resize-none"
                  rows="3"
                  placeholder="Additional details..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : "Save Record"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default SocietyProfitLoss;