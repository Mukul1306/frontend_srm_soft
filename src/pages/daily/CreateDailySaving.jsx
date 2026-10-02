import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
function CreateDailySaving() {
const [members, setMembers] = useState([]);
const [selectedMember, setSelectedMember] = useState(null);

const [memberSearch, setMemberSearch] = useState("");
const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
const { id } = useParams();
const isEditMode = Boolean(id);
const [formData, setFormData] = useState({
  member: "",
  collectionType: "FIXED",
  fixedAmount: "",
  durationDays: "",
  startDate: "",
  endDate: "",
  graceDays: "0",
  penaltyType: "PERCENTAGE",
  penaltyValue: "",
  nomineeName: "",
  nomineeMobile: ""
});
useEffect(() => {
  fetchMembers();

  if (isEditMode) {
    fetchSavingForEdit();
  }
}, [id]);

  // Calculate End Date dynamically when Start Date or Duration shifts
  useEffect(() => {
    if (formData.startDate && formData.durationDays) {
      const end = new Date(formData.startDate);
      end.setDate(end.getDate() + Number(formData.durationDays));
      
      setFormData((prev) => ({
        ...prev,
        endDate: end.toISOString().split("T")[0],
      }));
    }
  }, [formData.startDate, formData.durationDays]);

  const fetchMembers = async () => {
    try {
      const res = await axios.get("https://finance-project-0qqk.onrender.com/api/daily/members");
      setMembers(res.data.members || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };
 


const fetchSavingForEdit = async () => {
  try {

    const res = await axios.get(
      `https://finance-project-0qqk.onrender.com/api/daily/saving/${id}`
    );

    const saving = res.data.saving;

    setSelectedMember(saving.member);

    setFormData({
      member: saving.member?._id || "",
      collectionType: saving.collectionType || "FIXED",
      fixedAmount: saving.fixedAmount || "",
      durationDays: saving.durationDays || "",
      startDate: saving.startDate
        ? new Date(saving.startDate)
            .toISOString()
            .split("T")[0]
        : "",
      endDate: saving.endDate
        ? new Date(saving.endDate)
            .toISOString()
            .split("T")[0]
        : "",
      graceDays: saving.graceDays ?? "0",
      penaltyType: saving.penaltyType || "PERCENTAGE",
      penaltyValue: saving.penaltyValue || "",
      nomineeName: saving.nomineeName || "",
      nomineeMobile: saving.nomineeMobile || ""
    });

  } catch (error) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to load saving account"
    );

  }
};


 const handleMemberChange = (e) => {
  const id = e.target.value;

  const member = members.find((m) => m._id === id);

  setFormData((prev) => ({
    ...prev,
    member: id,
  }));

  setSelectedMember(member || null);
};

const handleMemberSelect = (member) => {
  if (!member?._id) return;

  // Use the member object already loaded by /members.
  // No extra API request is made, so selection is immediate.
  setSelectedMember(member);

  setFormData((prev) => ({
    ...prev,
    member: member._id,
  }));

  setMemberSearch("");
  setShowMemberDropdown(false);
};

  const resetForm = () => {
    setFormData({
      member: "",
      collectionType: "FIXED",
      fixedAmount: "",
      durationDays: "",
      startDate: "",
      endDate: "",
      graceDays: "0",
      penaltyType: "PERCENTAGE",
      penaltyValue: "",
        nomineeName: "",

  nomineeMobile: ""
    });
    setSelectedMember(null);
  };

  const filteredMembers = members.filter((member) => {

  const search = memberSearch
    .toLowerCase()
    .trim();

  if (!search) return true;

  return (
    member.memberId
      ?.toLowerCase()
      .includes(search) ||

    member.memberName
      ?.toLowerCase()
      .includes(search) ||

    member.mobile
      ?.toString()
      .includes(search)
  );

});


 const handleSubmit = async (e) => {

  e.preventDefault();

  if (!formData.member) {
    alert("Please select a registered member first.");
    return;
  }

  setSubmitting(true);

  try {

    if (isEditMode) {

      await axios.put(
        `https://finance-project-0qqk.onrender.com/api/daily/saving/${id}`,
        formData
      );

      alert("Daily Saving Account Updated Successfully!");

    } else {

      await axios.post(
        "https://finance-project-0qqk.onrender.com/api/daily/create-saving",
        formData
      );

      alert("Daily Saving Account Created Successfully!");

      resetForm();

    }

  } catch (error) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "Operation Failed"
    );

  } finally {

    setSubmitting(false);

  }

};



  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-slate-50/50">
      {/* Title Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
  {isEditMode
    ? "EDIT DAILY SAVING ACCOUNT"
    : "OPEN DAILY SAVING ACCOUNT"}
</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Link registered customers to operational saving terms and group tracking pools.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Member Lookup & Detail Previews */}
        <div className="lg:col-span-1 space-y-6">

<div className="bg-white rounded-2xl shadow border p-6">

<label className="font-bold mb-2 block">
Select Member
</label>

<div className="relative">

  {/* Search Input */}
  <input
    type="text"
   value={
  showMemberDropdown
    ? memberSearch
    : selectedMember
      ? `${selectedMember.memberId} - ${selectedMember.memberName}`
      : ""
}
    onChange={(e) => {

      if (isEditMode) return;

      setMemberSearch(e.target.value);
      setSelectedMember(null);

      setFormData((prev) => ({
        ...prev,
        member: ""
      }));

      setShowMemberDropdown(true);

    }}
    onFocus={() => {
  if (!isEditMode) {
    setMemberSearch("");
    setShowMemberDropdown(true);
  }
}}
    disabled={isEditMode}
    placeholder="Search Member ID, Name or Mobile..."
    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 bg-white"
  />

  {/* Search Results */}
  {showMemberDropdown && !isEditMode && (

    <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">

      {filteredMembers.length === 0 ? (

        <div className="p-4 text-sm text-slate-500 text-center">
          No member found
        </div>

      ) : (

        filteredMembers.map((member) => (

          <button
            type="button"
            key={member._id}
      onClick={() => handleMemberSelect(member)}
            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 transition"
          >

            <div className="flex justify-between items-center">

              <div>

                <div className="font-bold text-slate-800">
                  {member.memberName}
                </div>

                <div className="text-xs text-slate-500 mt-1">
                  ID: {member.memberId}
                </div>

              </div>

              <div className="text-xs font-semibold text-blue-600">
                {member.mobile}
              </div>

            </div>

          </button>

        ))

      )}

    </div>

  )}

</div>

</div>


          {/* Member Details Visual Card Panel */}
          {selectedMember && (



            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 animate-fadeIn">
              <h2 className="text-base font-black text-slate-800 tracking-tight mb-4 flex items-center gap-2">
                👤 Member Information Profile
              </h2>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-bold text-xs uppercase">ID</span>
                  <span className="col-span-2 text-slate-700 font-extrabold">{selectedMember.memberId}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-bold text-xs uppercase">Name</span>
                  <span className="col-span-2 text-slate-700 font-semibold">{selectedMember.memberName}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-bold text-xs uppercase">Guardian</span>
                  <span className="col-span-2 text-slate-600 font-medium">{selectedMember.fatherName || "N/A"}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-bold text-xs uppercase">Mobile</span>
                  <span className="col-span-2 text-slate-600 font-medium">{selectedMember.mobile}</span>
                </div>

                <div className="grid grid-cols-3 border-b border-slate-50 pb-2">
  <span className="text-slate-400 font-bold text-xs uppercase">
    Area
  </span>

  <span className="col-span-2 text-slate-700 font-semibold">
    {selectedMember.areaGroup?.areaName || "N/A"}
  </span>
</div>

<div className="grid grid-cols-3">
  <span className="text-slate-400 font-bold text-xs uppercase">
    Agent
  </span>

  <span className="col-span-2 text-slate-700 font-semibold">
    {selectedMember.assignedAgent?.name || "N/A"}
  </span>
</div>

                <div className="grid grid-cols-3">
                  <span className="text-slate-400 font-bold text-xs uppercase">Location</span>
                  <span className="col-span-2 text-slate-600 font-medium">
                    {selectedMember.city}, {selectedMember.state}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Saving Account Parameters Setup Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-black text-slate-800 tracking-tight mb-5">
            Configure Scheme Operations Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Collection Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Collection Model Class
              </label>
              <select
                value={formData.collectionType}
                onChange={(e) => setFormData({ ...formData, collectionType: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-white cursor-pointer shadow-sm text-slate-700"
              >
                <option value="FIXED">Fixed Daily Installments</option>
                <option value="FLEXIBLE">Flexible Open Savings</option>
              </select>
            </div>

            {/* Daily Fixed Amount (Conditional Layout block row) */}
            {formData.collectionType === "FIXED" && (
              <div className="space-y-1 md:col-span-2 animate-fadeIn">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Daily Fixed Amount Commitment (₹)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 100 or 500"
                  value={formData.fixedAmount}
                  onChange={(e) => setFormData({ ...formData, fixedAmount: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50"
                />
              </div>
            )}

            {/* Saving Duration */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Saving Plan Term Duration (Days)
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 300, 365, 730"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Grace Days */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Grace Days Buffer Limit
              </label>
              <input
                type="number"
                placeholder="e.g. 3 days max"
                value={formData.graceDays}
                onChange={(e) => setFormData({ ...formData, graceDays: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Activation Start Date
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50 text-slate-700"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Maturity Settlement End Date
              </label>
              <input
                type="date"
                readOnly
                value={formData.endDate}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-slate-100 text-slate-500 focus:outline-none cursor-not-allowed"
              />
            </div>

            {/* Penalty Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Defaulter Penalty Bracket Model
              </label>
              <select
                value={formData.penaltyType}
                onChange={(e) => setFormData({ ...formData, penaltyType: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-white cursor-pointer shadow-sm text-slate-700"
              >
                <option value="PERCENTAGE">Percentage Valuation (%)</option>
                <option value="FIXED">Flat Fixed Cash Rate (₹)</option>
              </select>
            </div>

            {/* Penalty Value */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Penalty Charge Rate Magnitude
              </label>
              <input
                type="number"
                placeholder="Example: 2% or 50 INR"
                value={formData.penaltyValue}
                onChange={(e) => setFormData({ ...formData, penaltyValue: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
            </div>


            <div className="space-y-1">
  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
    Nominee Name (Optional)
  </label>

  <input
    type="text"
    placeholder="Enter Nominee Name"
    value={formData.nomineeName}
    onChange={(e) =>
      setFormData({
        ...formData,
        nomineeName: e.target.value,
      })
    }
    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50"
  />
</div>

<div className="space-y-1">
  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
    Nominee Mobile (Optional)
  </label>

  <input
    type="text"
    placeholder="Enter Nominee Mobile"
    value={formData.nomineeMobile}
    onChange={(e) =>
      setFormData({
        ...formData,
        nomineeMobile: e.target.value,
      })
    }
    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50"
  />
</div>

          </div>



          {/* Form Action Layout Footer Section Panel */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
           {!isEditMode && (
  <button
    type="button"
    onClick={resetForm}
    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
  >
    Reset Configuration
  </button>
)}
          <button
  type="submit"
  disabled={submitting}
  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-bold text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer"
>
  {submitting
    ? "Processing..."
    : isEditMode
      ? "Update Saving Account"
      : "Deploy Active Savings Ledger Account"}
</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateDailySaving;