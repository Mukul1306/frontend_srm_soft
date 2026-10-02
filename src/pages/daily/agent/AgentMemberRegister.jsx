import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  X,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Loader2
} from "lucide-react";

const API_BASE =
  "https://finance-project-0qqk.onrender.com/api/daily";

const INITIAL_FORM = {
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
  residentialAddress: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  areaGroup: ""
};

function AgentMemberRegister() {
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [areas, setAreas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(null);

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState(INITIAL_FORM);

  /*
  ==========================================
  LOAD MEMBERS + REQUESTS
  ==========================================
  */

useEffect(() => {
  loadData();
  loadAreas();
}, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const agentData = localStorage.getItem("agent");

      let agent = null;

      if (agentData) {
        try {
          agent = JSON.parse(agentData);
        } catch (error) {
          console.error("Invalid agent data:", error);
        }
      }

      const requestsPromise = agent?._id
        ? axios.get(`${API_BASE}/member-requests/agent/${agent._id}`, {
            timeout: 60000
          })
        : Promise.resolve({ data: { requests: [] } });

     const agentId = getAgentId();

if (!agentId) {
  throw new Error("Agent ID not found");
}

const [membersRes, requestsRes] = await Promise.all([
  axios.get(`${API_BASE}/members/agent/${agentId}`, {
    timeout: 60000
  }),
  requestsPromise
]);

      setMembers(
        Array.isArray(membersRes.data?.members)
          ? membersRes.data.members
          : []
      );

      setRequests(
        Array.isArray(requestsRes.data?.requests)
          ? requestsRes.data.requests
          : []
      );
    } catch (error) {
      console.error("MEMBER REGISTER LOAD ERROR:", error);

      setMembers([]);
      setRequests([]);

      alert(
        error.response?.data?.message ||
          "Failed to load your members."
      );
    } finally {
      setLoading(false);
    }
  };
  /*
  ==========================================
  FORM CHANGE
  ==========================================
  */

const loadAreas = async () => {
  try {
    const agentId = getAgentId();

    if (!agentId) {
      console.error("Agent ID not found while loading areas");
      setAreas([]);
      return;
    }

    const response = await axios.get(`${API_BASE}/areas`, {
      timeout: 60000,
    });

    console.log("AREAS API RESPONSE:", response.data);

    // Backend returns "groups", not "areas"
    const allAreas = Array.isArray(response.data?.groups)
      ? response.data.groups
      : [];

    // Show only areas assigned to the logged-in agent
    const agentAreas = allAreas.filter((area) => {
      const assignedAgentId =
        area.assignedAgent?._id || area.assignedAgent;

      return String(assignedAgentId) === String(agentId);
    });

    console.log("LOGGED IN AGENT ID:", agentId);
    console.log("AGENT AREAS:", agentAreas);

    setAreas(agentAreas);
  } catch (error) {
    console.error("LOAD AREAS ERROR:", error);
    console.error("AREA ERROR RESPONSE:", error.response?.data);

    setAreas([]);
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

  setFormData((prev) => ({
    ...prev,
    [name]: newValue,
  }));
};

  /*
  ==========================================
  OPEN FORM
  ==========================================
  */

  const openAddMember = () => {
    setFormData(INITIAL_FORM);
    setShowModal(true);
  };

  /*
  ==========================================
  CLOSE FORM
  ==========================================
  */

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setFormData(INITIAL_FORM);
  };



  const getAgentId = () => {
  try {
    const agentData = localStorage.getItem("agent");

    if (!agentData) {
      return null;
    }

    const agent = JSON.parse(agentData);

    return (
      agent?._id ||
      agent?.id ||
      agent?.agentId ||
      agent?.user?._id ||
      agent?.user?.id ||
      null
    );
  } catch (error) {
    console.error("GET AGENT ID ERROR:", error);
    return null;
  }
};

  /*
  ==========================================
  SUBMIT REQUEST
  ==========================================
  */

  const submitMemberRequest = async () => {
  if (
    !formData.memberId ||
    !formData.memberName ||
    !formData.fatherName ||
    !formData.gender ||
    !formData.dob ||
    !formData.mobile ||
    !formData.password ||
    !formData.confirmPassword ||
    !formData.residentialAddress ||
    !formData.city ||
    !formData.district ||
    !formData.state ||
    !formData.pincode ||
!formData.areaGroup
  ) {
    alert("Please fill all required fields including Area.");
  }

  if (formData.password !== formData.confirmPassword) {
    alert("Password and Confirm Password do not match.");
    return;
  }

  if (formData.mobile.length !== 10) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  if (
    formData.alternateMobile &&
    formData.alternateMobile.length !== 10
  ) {
    alert("Please enter a valid 10-digit alternate mobile number.");
    return;
  }

  if (formData.pincode.length !== 6) {
    alert("Please enter a valid 6-digit pincode.");
    return;
  }

  // ==========================================
  // GET LOGGED-IN AGENT ID
  // ==========================================

  const agentId = getAgentId();

  if (!agentId) {
    alert(
      "Agent ID not found. Please logout and login again as Agent."
    );
    console.error(
      "Agent ID missing. localStorage.agent =",
      localStorage.getItem("agent")
    );
    return;
  }

  console.log("Submitting Member Request with Agent ID:", agentId);

  try {
    setSubmitting(true);

    // IMPORTANT:
    // Send agentId together with all member details
    const requestData = {
      ...formData,
      agentId: agentId
    };

    console.log("MEMBER REQUEST DATA:", requestData);

    const response = await axios.post(
      `${API_BASE}/member-request`,
      requestData,
      {
        timeout: 60000
      }
    );

    alert(
      response.data?.message ||
        "Member request submitted successfully."
    );

    setShowModal(false);
    setFormData(INITIAL_FORM);

    await loadData();

  } catch (error) {
    console.error(
      "CREATE MEMBER REQUEST ERROR:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Failed to submit member request."
    );

  } finally {
    setSubmitting(false);
  }
};
  /*
  ==========================================
  COMBINE MEMBERS + REQUESTS
  ==========================================
  */

  const allRecords = useMemo(() => {
    const activeMembers = members.map((member) => ({
      ...member,
      recordType: "MEMBER",
      requestStatus: "ACTIVE"
    }));

    const memberRequests = requests.map((request) => ({
      ...request,
      recordType: "REQUEST",
      requestStatus: request.status || "PENDING"
    }));

    return [...activeMembers, ...memberRequests];
  }, [members, requests]);

  /*
  ==========================================
  SEARCH
  ==========================================
  */

  const filteredRecords = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return allRecords;
    }

    return allRecords.filter((item) => {
      const memberId =
        item.memberId?.toLowerCase() || "";

      const memberName =
        item.memberName?.toLowerCase() || "";

      const mobile =
        item.mobile?.toLowerCase() || "";

      const city =
        item.city?.toLowerCase() || "";

      return (
        memberId.includes(searchText) ||
        memberName.includes(searchText) ||
        mobile.includes(searchText) ||
        city.includes(searchText)
      );
    });
  }, [allRecords, search]);

  /*
  ==========================================
  COUNTERS
  ==========================================
  */

  const totalMembers = members.length;

  const pendingRequests = requests.filter(
    (item) => item.status === "PENDING"
  ).length;

  const approvedRequests = requests.filter(
    (item) => item.status === "APPROVED"
  ).length;

  const rejectedRequests = requests.filter(
    (item) => item.status === "REJECTED"
  ).length;

  /*
  ==========================================
  STATUS STYLE
  ==========================================
  */

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
      case "APPROVED":
        return "bg-green-50 text-green-700 border-green-200";

      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  /*
  ==========================================
  STATUS ICON
  ==========================================
  */

  const StatusIcon = ({ status }) => {
    if (status === "ACTIVE" || status === "APPROVED") {
      return <CheckCircle size={13} />;
    }

    if (status === "REJECTED") {
      return <XCircle size={13} />;
    }

    return <Clock size={13} />;
  };

  /*
  ==========================================
  FORMAT DATE
  ==========================================
  */

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-IN");
  };

  /*
  ==========================================
  LOADING
  ==========================================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading member register...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen text-slate-800 space-y-5">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <div>
            <span className="text-[10px] font-black tracking-wider text-blue-600 uppercase">
              Agent Operations
            </span>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              MEMBER REGISTER
            </h1>

            <p className="text-xs text-slate-400 font-medium mt-1">
              Manage members and submit new member registration requests.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddMember}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2"
          >
            <Plus size={15} />
            Add Member
          </button>

        </div>

      </div>

      {/* ========================================
          STATISTICS
      ======================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">

        <StatCard
          title="Total Members"
          value={totalMembers}
          icon={<Users size={18} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          icon={<Clock size={18} />}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Approved"
          value={approvedRequests}
          icon={<CheckCircle size={18} />}
          iconClass="bg-green-50 text-green-600"
        />

        <StatCard
          title="Rejected"
          value={rejectedRequests}
          icon={<XCircle size={18} />}
          iconClass="bg-red-50 text-red-600"
        />

      </div>

      {/* ========================================
          MEMBER LIST
      ======================================== */}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">

        {/* HEADER */}

        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between sm:items-center">

          <div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Members & Registration Requests
            </h2>

            <p className="text-[11px] text-slate-400 mt-0.5">
              View active members and the status of submitted requests.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 w-full sm:w-72 focus-within:border-blue-500">

            <Search
              size={15}
              className="text-slate-400 shrink-0"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search name, ID, mobile..."
              className="bg-transparent outline-none text-xs w-full font-medium text-slate-700 placeholder:text-slate-400"
            />

          </div>

        </div>

        {/* ======================================
            MOBILE LIST
        ====================================== */}

        <div className="block md:hidden divide-y divide-slate-100">

          {filteredRecords.length === 0 ? (
            <EmptyState />
          ) : (
            filteredRecords.map((item) => {

              const status =
                item.recordType === "MEMBER"
                  ? "ACTIVE"
                  : item.requestStatus;

              return (
                <div
                  key={`${item.recordType}-${item._id}`}
                  className="p-4 space-y-3"
                >

                  <div className="flex justify-between items-start gap-3">

                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Member ID
                      </p>

                      <p className="text-sm font-black text-slate-900">
                        {item.memberId || "—"}
                      </p>

                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        {item.memberName || "Unknown Member"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusStyle(
                        status
                      )}`}
                    >
                      <StatusIcon status={status} />
                      {status}
                    </span>

                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3">

                    <Info
                      label="Mobile"
                      value={item.mobile}
                    />

                    <Info
                      label="City"
                      value={item.city}
                    />

                    <Info
                      label="Created"
                      value={formatDate(item.createdAt)}
                    />

                    <Info
                      label="Type"
                      value={
                        item.recordType === "MEMBER"
                          ? "Member"
                          : "Request"
                      }
                    />

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowDetails(item)
                    }
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    View Details
                  </button>

                </div>
              );
            })
          )}

        </div>

        {/* ======================================
            DESKTOP TABLE
        ====================================== */}

        <div className="hidden md:block overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">

                <th className="px-4 py-3.5">
                  Member ID
                </th>

                <th className="px-4 py-3.5">
                  Member Name
                </th>

                <th className="px-4 py-3.5">
                  Mobile
                </th>

                <th className="px-4 py-3.5">
                  City
                </th>

                <th className="px-4 py-3.5">
                  Created
                </th>

                <th className="px-4 py-3.5 text-center">
                  Status
                </th>

                <th className="px-4 py-3.5 text-center">
                  Action
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">

              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {

                  const status =
                    item.recordType === "MEMBER"
                      ? "ACTIVE"
                      : item.requestStatus;

                  return (
                    <tr
                      key={`${item.recordType}-${item._id}`}
                      className="hover:bg-slate-50/50 transition-colors"
                    >

                      <td className="px-4 py-4 font-black text-slate-900">
                        {item.memberId || "—"}
                      </td>

                      <td className="px-4 py-4">

                        <div className="font-bold text-slate-700">
                          {item.memberName || "Unknown"}
                        </div>

                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.fatherName
                            ? `S/o ${item.fatherName}`
                            : "—"}
                        </div>

                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {item.mobile || "—"}
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {item.city || "—"}
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-4 py-4 text-center">

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusStyle(
                            status
                          )}`}
                        >
                          <StatusIcon status={status} />
                          {status}
                        </span>

                      </td>

                      <td className="px-4 py-4 text-center">

                        <button
                          type="button"
                          onClick={() =>
                            setShowDetails(item)
                          }
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <Eye size={13} />
                          View
                        </button>

                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ========================================
          ADD MEMBER MODAL
      ======================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">

          <div className="bg-white w-full max-w-lg max-h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">

            {/* MODAL HEADER */}

            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center shrink-0">

              <div>

                <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                  Add New Member
                </h2>

                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  Complete the member details for Admin approval.
                </p>


<div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
  <div className="flex items-center justify-between gap-3">
    <span className="text-[9px] font-black uppercase tracking-wider text-blue-500">
      Registering Agent ID
    </span>

    <span className="text-xs font-black text-blue-700 break-all">
      {getAgentId() || "Agent ID not found"}
    </span>
  </div>
</div>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              >
                <X size={16} />
              </button>

            </div>

            {/* FORM */}

            <div className="p-4 sm:p-6 bg-slate-50/40 overflow-y-auto space-y-5">

              {/* PERSONAL */}

              <FormSection title="Personal Information">

                <div className="sm:col-span-2">
                  <FormLabel text="Member ID" />

                  <Input
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleChange}
                    placeholder="Enter Member ID (e.g. MEM001)"
                  />
                </div>

                <div>
                  <FormLabel text="Full Name" />

                  <Input
                    name="memberName"
                    value={formData.memberName}
                    onChange={handleChange}
                    placeholder="Legal Name"
                  />
                </div>

                <div>
                  <FormLabel text="Father's / Husband's Name" />

                  <Input
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Father / Husband Name"
                  />
                </div>

                <div>
                  <FormLabel text="Gender" />

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <FormLabel text="Date of Birth" />

                  <Input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>

              </FormSection>

              {/* COMMUNICATION */}

              <FormSection title="Communication">

                <div>
                  <FormLabel text="Email Id" />

                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@domain.com"
                  />
                </div>

                <div>
                  <FormLabel text="Primary Mobile" />

                  <Input
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="10-digit number"
                  />
                </div>

                <div>
                  <FormLabel text="Password" />

                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter Password"
                  />
                </div>

                <div>
                  <FormLabel text="Confirm Password" />

                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FormLabel text="Alternative Mobile Number" />

                  <Input
                    name="alternateMobile"
                    value={formData.alternateMobile}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="Secondary backup number"
                  />
                </div>

              </FormSection>

              {/* ADDRESS */}

              <FormSection title="Residential Address">



<div className="sm:col-span-2">
  <FormLabel text="Area" />

  <select
    name="areaGroup"
    value={formData.areaGroup}
    onChange={handleChange}
    className={inputClass}
    required
  >
    <option value="">Select Area</option>

    {areas.map((area) => (
      <option key={area._id} value={area._id}>
        {area.areaName || area.name || area.area}
      </option>
    ))}
  </select>
</div>
                <div className="sm:col-span-2">

                  <FormLabel text="Full Residential Address" />

                  <textarea
                    name="residentialAddress"
                    value={formData.residentialAddress}
                    onChange={handleChange}
                    rows="2"
                    placeholder="House, Block, Street..."
                    className={`${inputClass} resize-none`}
                  />

                </div>

                <div>
                  <FormLabel text="City / Village" />

                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City / Village"
                  />
                </div>

                <div>
                  <FormLabel text="District" />

                  <Input
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="District"
                  />
                </div>

                <div>
                  <FormLabel text="State" />

                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>

                <div>
                  <FormLabel text="Pincode" />

                  <Input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    placeholder="6-digit pincode"
                  />
                </div>

              </FormSection>

              {/* APPROVAL NOTICE */}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">

                <div className="flex gap-2">

                  <Clock
                    size={16}
                    className="text-amber-600 shrink-0 mt-0.5"
                  />

                  <div>

                    <p className="text-xs font-bold text-amber-800">
                      Admin Approval Required
                    </p>

                    <p className="text-[11px] text-amber-700 mt-0.5">
                      This member will not become active until Admin approves this request.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="p-4 sm:p-5 border-t border-slate-100 flex justify-end gap-3 shrink-0">

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitMemberRequest}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60"
              >

                {submitting ? (
                  <>
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Submit For Approval
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* ========================================
          DETAILS MODAL
      ======================================== */}

      {showDetails && (
        <DetailsModal
          item={showDetails}
          onClose={() => setShowDetails(null)}
          formatDate={formatDate}
          getStatusStyle={getStatusStyle}
        />
      )}

    </div>
  );
}

/*
==================================================
STAT CARD
==================================================
*/

function StatCard({
  title,
  value,
  icon,
  iconClass
}) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-xs">

      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </p>

        <h3 className="text-xl sm:text-2xl font-black mt-0.5 text-slate-900">
          {value}
        </h3>
      </div>

      <div
        className={`p-2.5 rounded-xl hidden sm:block ${iconClass}`}
      >
        {icon}
      </div>

    </div>
  );
}

/*
==================================================
FORM SECTION
==================================================
*/

function FormSection({
  title,
  children
}) {
  return (
    <div className="space-y-3">

      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-1">
        {title}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {children}
      </div>

    </div>
  );
}

/*
==================================================
FORM LABEL
==================================================
*/

function FormLabel({ text }) {
  return (
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
      {text}
    </label>
  );
}

/*
==================================================
INPUT
==================================================
*/

const inputClass =
  "w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all";

function Input(props) {
  return (
    <input
      {...props}
      className={inputClass}
    />
  );
}

/*
==================================================
INFO
==================================================
*/

function Info({
  label,
  value
}) {
  return (
    <div>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
        {label}
      </span>

      <span className="text-xs font-semibold text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
}

/*
==================================================
EMPTY STATE
==================================================
*/

function EmptyState() {
  return (
    <div className="text-center py-12 px-4">

      <Users
        size={28}
        className="mx-auto text-slate-300"
      />

      <p className="text-xs font-bold text-slate-400 mt-2">
        No members or requests found.
      </p>

    </div>
  );
}

/*
==================================================
DETAILS MODAL
==================================================
*/

function DetailsModal({
  item,
  onClose,
  formatDate,
  getStatusStyle
}) {
  const status =
    item.recordType === "MEMBER"
      ? "ACTIVE"
      : item.requestStatus;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">

      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">

        {/* HEADER */}

        <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center">

          <div>

            <span
              className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusStyle(
                status
              )}`}
            >
              {status}
            </span>

            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-2">
              {item.memberName || "Member Details"}
            </h2>

            <p className="text-[11px] text-slate-400">
              Member ID: {item.memberId || "—"}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
          >
            <X size={16} />
          </button>

        </div>

        {/* BODY */}

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">

          <DetailSection title="Personal Information">

            <Detail label="Member ID" value={item.memberId} />

            <Detail label="Full Name" value={item.memberName} />

            <Detail label="Father / Husband" value={item.fatherName} />

            <Detail label="Gender" value={item.gender} />

            <Detail
              label="Date of Birth"
              value={formatDate(item.dob)}
            />

          </DetailSection>

          <DetailSection title="Communication">

            <Detail label="Mobile" value={item.mobile} />

            <Detail label="Email" value={item.email} />

            <Detail
              label="Alternate Mobile"
              value={item.alternateMobile}
            />

          </DetailSection>

          <DetailSection title="Address">

            <div className="sm:col-span-2">
              <Detail
                label="Residential Address"
                value={item.residentialAddress}
              />
            </div>

            <Detail label="City" value={item.city} />

            <Detail
              label="District"
              value={item.district}
            />

            <Detail label="State" value={item.state} />

            <Detail label="Pincode" value={item.pincode} />

          </DetailSection>

          {/* REQUEST INFORMATION */}

          {item.recordType === "REQUEST" && (
            <DetailSection title="Request Information">

              <Detail
                label="Request Status"
                value={item.status}
              />

              <Detail
                label="Submitted"
                value={formatDate(item.createdAt)}
              />

              {item.rejectionReason && (
                <div className="sm:col-span-2">

                  <Detail
                    label="Rejection Reason"
                    value={item.rejectionReason}
                  />

                </div>
              )}

            </DetailSection>
          )}

        </div>

        {/* FOOTER */}

        <div className="p-4 border-t border-slate-100 flex justify-end">

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

/*
==================================================
DETAIL SECTION
==================================================
*/

function DetailSection({
  title,
  children
}) {
  return (
    <div>

      <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b border-slate-100 pb-1 mb-3">
        {title}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>

    </div>
  );
}

/*
==================================================
DETAIL
==================================================
*/

function Detail({
  label,
  value
}) {
  return (
    <div>

      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
        {label}
      </p>

      <p className="text-xs font-semibold text-slate-700 mt-0.5 break-words">
        {value || "—"}
      </p>

    </div>
  );
}

export default AgentMemberRegister;