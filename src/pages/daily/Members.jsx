import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiUsers, FiSearch, FiPlus, FiX, FiEye, FiEdit2, FiTrash2 
} from "react-icons/fi";

function Members() {
  const [members, setMembers] = useState([]);
  const [areas, setAreas] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

const [formData, setFormData] = useState({
  memberName: "",
  memberId: "",
  fatherName: "",
  gender: "Male",
  dob: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  alternateMobile: "",
  areaGroup: "",
  residentialAddress: "",
  city: "",
  district: "",
  state: "",
  pincode: ""
});
  useEffect(() => {
  fetchMembers();
  loadAreas();
}, []);

const loadAreas = async () => {
  try {
    const res = await axios.get(
      "https://aws.srmfinance.online/api/daily/areas"
    );

    console.log("ADMIN AREAS:", res.data);

    const areaList = Array.isArray(res.data?.groups)
      ? res.data.groups
      : [];

    // Admin can see all active areas
    setAreas(areaList.filter((area) => area.status === "ACTIVE"));
  } catch (error) {
    console.error("Error fetching areas:", error);
    setAreas([]);
  }
};

  const fetchMembers = async () => {
    try {
      const res = await axios.get("https://aws.srmfinance.online/api/daily/members");
      setMembers(res.data.members || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "mobile" || name === "alternateMobile") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pincode") {
      newValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const saveMember = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Password and Confirm Password do not match");
      return;
    }

    try {
      await axios.post("https://aws.srmfinance.online/api/daily/create-member", formData);
      alert("Member Added Successfully");
      setShowModal(false);
      
      // Reset Form State
      setFormData({
        memberId: "",
        memberName: "",
        fatherName: "",
        gender: "Male",
        dob: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        alternateMobile: "",
        residentialAddress: "",
        city: "",
        district: "",
        state: "",
        areaGroup: "",
        pincode: ""
      });
      fetchMembers();
    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Failed to save member");
    }
  };

  const deleteMember = async (id) => {
    const ok = window.confirm("Delete this member?");
    if (!ok) return;

    try {
      await axios.delete(`https://aws.srmfinance.online/api/daily/member/${id}`);
      fetchMembers();
      alert("Member Deleted");
    } catch (error) {
      console.log(error);
      alert("Delete Failed");
    }
  };

  const filteredMembers = members
    .filter((member) => {
      const search = searchQuery.toLowerCase();
      return (
        member.memberId?.toLowerCase().includes(search) ||
        member.memberName?.toLowerCase().includes(search) ||
        member.mobile?.includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === "az") return (a.memberName || "").localeCompare(b.memberName || "");
      if (sortBy === "za") return (b.memberName || "").localeCompare(a.memberName || "");
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="p-3 sm:p-5 md:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans antialiased text-slate-800 space-y-4 sm:space-y-6 max-w-[100vw] overflow-x-hidden">
      
      {/* Top Operations Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-full lg:w-auto">
          <span className="text-[10px] font-black tracking-wider text-blue-600 uppercase">Workspace Operations</span>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight mt-0.5">MEMBERS MANAGEMENT</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5 max-w-2xl">
            Audit configurations and personal registries of all centralized pool members.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
          {/* Pending Member Requests */}
          <button
            onClick={() => navigate("/daily/member-requests")}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white font-bold text-xs uppercase tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span className="text-sm">⏳</span>
            <span>Pending Requests</span>
          </button>

          {/* Add Member */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold text-xs uppercase tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <FiPlus className="stroke-[3] text-sm" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex justify-between items-center shadow-xs">
          <div>
            <p className="text-slate-400 font-black text-[10px] tracking-wider uppercase">TOTAL MEMBERS</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 mt-1">{members.length}</h2>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-lg sm:text-xl shrink-0">
            <FiUsers />
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Inner Filters Head */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
          <div>
            <h2 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wide">ALL REGISTERED MEMBERS</h2>
            <p className="text-xs text-slate-400 mt-0.5">A dynamic tracking dashboard list of registered system actors.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            {/* Integrated Dynamic Search Field */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <FiSearch className="text-sm" />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, contact..." 
                className="pl-9 pr-4 py-2.5 text-xs w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition-all placeholder:text-slate-400 font-semibold"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold bg-slate-50 focus:bg-white outline-none w-full sm:w-auto cursor-pointer shrink-0"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>
        </div>

        {/* Desktop & Tablet Data Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] tracking-wider">
                <th className="p-4 whitespace-nowrap">Member ID</th>
                <th className="p-4 min-w-[200px]">Customer Name</th>
                <th className="p-4 whitespace-nowrap">Mobile</th>
                <th className="p-4 whitespace-nowrap">City</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                    No registry ledger accounts correspond with filters.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{member.memberId || "N/A"}</td>
                    <td className="p-4">
                      <Link
                        to={`/daily/member/${member._id}`}
                        className="text-blue-600 font-bold hover:underline block"
                      >
                        <div className="font-bold text-blue-600">
                          {member.memberName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                          S/o {member.fatherName || "N/A"}
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 whitespace-nowrap">{member.mobile}</td>
                    <td className="p-4 whitespace-nowrap">{member.city || "—"}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-100 text-[10px] font-bold uppercase tracking-wide inline-block">
                        {member.status || "Active"}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <Link to={`/daily/member/${member._id}`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors">
                          View
                        </Link>
                        <Link to={`/daily/edit-member/${member._id}`} className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors">
                          Edit
                        </Link>
                        <button onClick={() => deleteMember(member._id)} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Responsive Card View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 font-bold text-slate-400 uppercase tracking-wider text-xs">
              No registry ledger accounts correspond with filters.
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div key={member._id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      ID: {member.memberId || "N/A"}
                    </span>
                    <Link
                      to={`/daily/member/${member._id}`}
                      className="text-blue-600 font-bold text-sm hover:underline block mt-0.5 truncate"
                    >
                      {member.memberName}
                    </Link>
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      S/o {member.fatherName || "N/A"}
                    </p>
                  </div>
                  <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-100 text-[10px] font-bold uppercase tracking-wide shrink-0">
                    {member.status || "Active"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mobile</span>
                    <span className="font-semibold text-slate-700 truncate block">{member.mobile || "—"}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">City</span>
                    <span className="font-semibold text-slate-700 truncate block">{member.city || "—"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to={`/daily/member/${member._id}`}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <FiEye size={13} /> View
                  </Link>
                  <Link
                    to={`/daily/edit-member/${member._id}`}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 px-3 rounded-xl text-xs text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <FiEdit2 size={13} /> Edit
                  </Link>
                  <button
                    onClick={() => deleteMember(member._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Delete Member"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Registration Form Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-2 sm:p-4 transition-all overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">Register Ledger Member</h2>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-0.5">Add a new dynamic core node directly inside operational nodes.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 cursor-pointer transition-colors shrink-0"
              >
                <FiX />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-slate-50/40 overflow-y-auto flex-1 text-slate-800">
              
              {/* Personal Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-slate-200/60 pb-1">Personal Identity Matrices</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Member ID
                    </label>
                    <input
                      type="text"
                      name="memberId"
                      value={formData.memberId}
                      onChange={handleChange}
                      placeholder="Enter Member ID (e.g. MEM001)"
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      name="memberName"
                      placeholder="Legal Name"
                      value={formData.memberName}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Father's / Husband's Name</label>
                    <input
                      name="fatherName"
                      placeholder="Nominee Reference"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all min-h-[38px]"
                    />
                  </div>
                </div>
              </div>

              {/* Communication Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-slate-200/60 pb-1">Communication Routelines</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Email Id</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="name@domain.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Primary Mobile</label>
                    <input
                      type="text"
                      name="mobile"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter Password"
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Alternative Mobile Number</label>
                  <input
                    type="text"
                    name="alternateMobile"
                    maxLength={10}
                    placeholder="Secondary backup number"
                    value={formData.alternateMobile}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Geographic Location Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-slate-200/60 pb-1">Geographical Node Parameters</h4>
                
<div className="space-y-1">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
    Area
  </label>

  <select
    name="areaGroup"
    value={formData.areaGroup}
    onChange={handleChange}
    required
    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all cursor-pointer"
  >
    <option value="">Select Area</option>

    {areas.map((area) => (
      <option key={area._id} value={area._id}>
        {area.areaName}
        {area.assignedAgent?.name
          ? ` — ${area.assignedAgent.name}`
          : ""}
      </option>
    ))}
  </select>
</div>


                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Full Residential Address</label>
                  <textarea
                    name="residentialAddress"
                    placeholder="House, Block, Street parameters..."
                    value={formData.residentialAddress}
                    onChange={handleChange}
                    rows="2"
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    name="city"
                    placeholder="City / Village"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                  />
                  <input
                    name="district"
                    placeholder="District"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                  />
                  <input
                    name="pincode"
                    placeholder="PinCode"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Modal Action Footer */}
            <div className="flex justify-end gap-3 p-3.5 sm:p-5 border-t border-slate-100 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 sm:px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveMember}
                className="px-5 sm:px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Save Registry</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export default Members;
