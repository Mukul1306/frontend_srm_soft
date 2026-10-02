import React, { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import axios from "axios";
import { 
  UserPlus, 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  Users, 
  Info,
  ShieldAlert,
  CreditCard,
  Building2
} from "lucide-react";

function AddMember() {

  const [search, setSearch] = useState("");
const [sortBy, setSortBy] = useState("newest");

  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [submitting, setSubmitting] = useState(false);
const { id } = useParams();

const navigate = useNavigate();

const isEdit = Boolean(id);

const [formData, setFormData] = useState({
  memberId: "",
  societyId: "",
  joiningDate: "",
  name: "",
  fatherOrHusbandName: "",
  gender: "",
  dob: "",
  email: "",
  mobile: "",
  alternateMobile: "",
  address: "",
  pinCode: "",
  city: "",
  district: "",
  state: "",
  aadhaarNumber: "",
  nomineeName: "",
  nomineeMobile: "",
  monthlyPenalty: "",
  monthlyInstallment: "",
  dueDay: "10",

  password: "",
  confirmPassword: ""
});
useEffect(() => {

  fetchSocieties();

  if (id) {

    fetchMember();

  }

}, [id]);

  const fetchSocieties = async () => {
    setLoadingSocieties(true);
    try {
      const res = await axios.get("https://finance-project-0qqk.onrender.com/api/society/all");
      setSocieties(res.data.societies || []);
    } catch (error) {
      console.error("Error retrieving society catalog registry streams:", error);
    } finally {
      setLoadingSocieties(false);
    }
  };

  const fetchMember = async () => {

  try {

    const res = await axios.get(

      `https://finance-project-0qqk.onrender.com/api/member/${id}`

    );

    const member = res.data.member;

    setFormData({

      memberId: member.memberId,

      societyId: member.societyId._id,

      joiningDate: member.joiningDate?.substring(0,10),

      name: member.name,

      fatherOrHusbandName: member.fatherOrHusbandName,

      gender: member.gender,

      dob: member.dob?.substring(0,10),

      email: member.email,

      mobile: member.mobile,

      alternateMobile: member.alternateMobile,

      address: member.address,

      pinCode: member.pinCode,

      city: member.city,

      district: member.district,

      state: member.state,

      aadhaarNumber: member.aadhaarNumber,

      nomineeName: member.nomineeName,

      nomineeMobile: member.nomineeMobile,

      monthlyPenalty: member.monthlyPenalty,

      monthlyInstallment: member.monthlyInstallment,

      dueDay: member.dueDay

    });

    setSelectedSociety(member.societyId);

  }

  catch(error){

    console.log(error);

  }

};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSocietyChange = (e) => {
    const societyId = e.target.value;
    const society = societies.find(s => s._id === societyId);
    setSelectedSociety(society || null);
    setFormData({
      ...formData,
      societyId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let res;

if (isEdit) {

  res = await axios.put(

    `https://finance-project-0qqk.onrender.com/api/member/update/${id}`,

    formData

  );

} else {

  res = await axios.post(

    "https://finance-project-0qqk.onrender.com/api/member/create",

    formData

  );

}
      alert(res.data.message || "Member registered successfully.");
     navigate("/members");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to process enrollment voucher.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-4 md:p-8 selection:bg-blue-100">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* --- HEADER BAR --- */}
        <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-100 hidden sm:block">
              <UserPlus size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {isEdit ? "Update Member Profile" : "Register New Member"}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Enroll a new beneficiary ledger profile into an active mutual savings system.
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm transition active:scale-95 self-start sm:self-center"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* === SECTION 1: SOCIETY ALLOCATION === */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <Building2 size={16} className="text-blue-500" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Society Affiliation
              </h2>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                Select Targeting Society Account
              </label>
              <select
                name="societyId"
                value={formData.societyId}
                onChange={handleSocietyChange}
                disabled={submitting || loadingSocieties}
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
                required
              >
                <option value="">{loadingSocieties ? "Loading societies..." : "Choose from active directories..."}</option>
                {societies.map((society) => (
                  <option key={society._id} value={society._id}>
                    {society.societyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Context Card Grid */}
            {selectedSociety && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} className="text-blue-500" /> Duration
                  </p>
                  <h4 className="text-sm font-black text-slate-800 mt-1">
                    {selectedSociety.durationMonths} Months
                  </h4>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} className="text-emerald-500" /> Commenced
                  </p>
                  <h4 className="text-sm font-black text-slate-800 mt-1">
                    {new Date(selectedSociety.startDate).toLocaleDateString("en-IN")}
                  </h4>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Users size={12} className="text-amber-500" /> Composition
                  </p>
                  <h4 className="text-sm font-black text-slate-800 mt-1">
                    {selectedSociety.currentMembers || 0} / {selectedSociety.maxMembers || 0} Cap
                  </h4>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Info size={12} className="text-purple-500" /> Directives
                  </p>
                  <h4 className="text-sm font-black text-slate-800 mt-1 capitalize">
                    {selectedSociety.status || "N/A"}
                  </h4>
                </div>
              </div>
            )}
          </div>

          {/* === SECTION 2: PRIMARY IDENTITY RECORDS === */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <Info size={16} className="text-blue-500" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Primary Identity Dossier
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


              <div>
  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
    Member ID
  </label>

  <input
    type="text"
    name="memberId"
    placeholder="Example : SRM101"
    value={formData.memberId}
    onChange={handleChange}
    disabled={submitting}
    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
    required
  />
</div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Full Legal Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Father / Husband Name</label>
                <input
                  type="text"
                  name="fatherOrHusbandName"
                  placeholder="Guardian reference"
                  value={formData.fatherOrHusbandName}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Primary Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  placeholder="10-digit number"
                  value={formData.mobile}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
                  required
                />
              </div>
<div>
  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
    Gmail ID
  </label>

  <input
    type="email"
    name="email"
      required
    placeholder="example@gmail.com"
    value={formData.email}
    onChange={handleChange}
    className="w-full border border-slate-200 rounded-xl px-4 py-3"
  />
</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
    Alternative Mobile
  </label>

  <input
    type="text"
    name="alternateMobile"
    placeholder="Optional"
    value={formData.alternateMobile}
    onChange={handleChange}
    className="w-full border border-slate-200 rounded-xl px-4 py-3"
  />
</div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Gender Identity</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
                  required
                >
                  <option value="">Choose item...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
                  required
                />
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  <div className="md:col-span-2">

    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
      Full Address
    </label>

    <input
      type="text"
      name="address"
      value={formData.address}
      onChange={handleChange}
      className="w-full border border-slate-200 rounded-xl px-4 py-3"
      required
    />

  </div>

  <div>

    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
      PIN Code
    </label>

    <input
      type="text"
      name="pinCode"
      required
      value={formData.pinCode}
      onChange={handleChange}
      className="w-full border border-slate-200 rounded-xl px-4 py-3"
    />

  </div>

  <div>

    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
      City / Village
    </label>

    <input
      type="text"
      name="city"
      required
      value={formData.city}
      onChange={handleChange}
      className="w-full border border-slate-200 rounded-xl px-4 py-3"
    />

  </div>

  <div>

    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
      District
    </label>

    <input
      type="text"
      name="district"
      required
      value={formData.district}
      onChange={handleChange}
      className="w-full border border-slate-200 rounded-xl px-4 py-3"
    />

  </div>

  <div>

    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
      State
    </label>

    <input
      type="text"
      name="state"
      required
      value={formData.state}
      onChange={handleChange}
      className="w-full border border-slate-200 rounded-xl px-4 py-3"
    />

  </div>

  <div className="md:col-span-2">

    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
      Aadhaar Number
    </label>

    <input
      type="text"
      name="aadhaarNumber"
      value={formData.aadhaarNumber}
      onChange={handleChange}
      className="w-full border border-slate-200 rounded-xl px-4 py-3"
      required
    />

  </div>

</div>
          </div>

          {/* === SECTION 3: DELEGATED NOMINEE RELATIONSHIPS === */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <ShieldAlert size={16} className="text-blue-500" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Assigned Legal Nominee Parameters
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nominee Full Name</label>
                <input
                  type="text"
                  name="nomineeName"
                  placeholder="Beneficiary target name"
                  value={formData.nomineeName}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nominee Mobile Reference</label>
                <input
                  type="text"
                  name="nomineeMobile"
                  placeholder="10-digit communication vector"
                  value={formData.nomineeMobile}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
                  required
                />
              </div>
            </div>
          </div>

          {/* === SECTION 4: FINANCIAL ACCOUNT ARCHITECTURE === */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <CreditCard size={16} className="text-blue-500" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Financial Ledger Parameters
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">


              <div>
  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
    Joining Date
  </label>

  <input
    type="date"
    name="joiningDate"
    value={formData.joiningDate}
    onChange={handleChange}
    disabled={submitting}
    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
    required
  />
</div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Monthly Installment (₹)</label>
                <input
                  type="number"
                  name="monthlyInstallment"
                  placeholder="e.g., 2000"
                  value={formData.monthlyInstallment}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Monthly Penalty Cap (₹)</label>
                <input
                  type="number"
                  name="monthlyPenalty"
                  placeholder="e.g., 100"
                  value={formData.monthlyPenalty}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Payment Due Day Calendar Index</label>
                <input
                  type="number"
                  name="dueDay"
                  min="1"
                  max="31"
                  placeholder="10"
                  value={formData.dueDay}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
                  required
                />
              </div>
            </div>
          </div>


{/* === SECTION 5: MEMBER LOGIN CREDENTIALS === */}
{isEdit && (
  <div className="space-y-4">

    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
      <ShieldAlert
        size={16}
        className="text-blue-500"
      />

      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
        Member Login Credentials
      </h2>
    </div>

    <p className="text-xs text-slate-500">
      Set a password for this member. The member will log in
      using their mobile number and this password.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* PASSWORD */}
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
          New Password
        </label>

        <input
          type="password"
          name="password"
          placeholder="Enter new password"
          value={formData.password}
          onChange={handleChange}
          disabled={submitting}
          autoComplete="new-password"
          className="
            w-full
            border border-slate-200
            rounded-xl
            px-4 py-3
            text-sm
            font-semibold
            text-slate-800
            outline-none
            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-500/10
            transition
          "
        />

        <p className="text-[10px] text-slate-400 mt-1">
          Leave blank to keep the existing password.
        </p>
      </div>

      {/* CONFIRM PASSWORD */}
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
          Confirm Password
        </label>

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={submitting}
          autoComplete="new-password"
          className="
            w-full
            border border-slate-200
            rounded-xl
            px-4 py-3
            text-sm
            font-semibold
            text-slate-800
            outline-none
            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-500/10
            transition
          "
        />
      </div>

    </div>
  </div>
)}

          {/* --- SUBMISSION BUTTON CONTROL BAR --- */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting || loadingSocieties}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold px-8 py-3.5 rounded-xl text-sm shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none disabled:shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing Verification Ledger...</span>
                </>
              ) : (
                <span>{isEdit ? "Update Member Profile" : "Add Member Profile"}</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddMember;