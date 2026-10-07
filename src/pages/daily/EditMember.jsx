import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API = "https://aws.srmfinance.online/api/daily";

function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
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
    areaGroup: "",
    residentialAddress: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    fetchMember();
    loadAreas();
  }, [id]);

  // ================================
  // LOAD MEMBER
  // ================================
  const fetchMember = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/member/${id}`);

      const member = res.data?.member;

      if (!member) {
        alert("Member not found");
        navigate("/daily/members");
        return;
      }

      setFormData({
        memberId: member.memberId || "",
        memberName: member.memberName || "",
        fatherName: member.fatherName || "",
        gender: member.gender || "Male",

        dob: member.dob
          ? new Date(member.dob).toISOString().split("T")[0]
          : "",

        email: member.email || "",
        mobile: member.mobile || "",
        password: "",
        confirmPassword: "",
        alternateMobile: member.alternateMobile || "",

        // IMPORTANT: Area
        areaGroup:
          member.areaGroup?._id ||
          member.areaGroup ||
          member.area?._id ||
          member.area ||
          "",

        residentialAddress: member.residentialAddress || "",
        city: member.city || "",
        district: member.district || "",
        state: member.state || "",
        pincode: member.pincode || "",

        status: member.status || "ACTIVE",
      });
    } catch (error) {
      console.error("Fetch member error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load member details"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // LOAD AREAS
  // ================================
  const loadAreas = async () => {
    try {
      const res = await axios.get(`${API}/areas`);

      const areaList = Array.isArray(res.data?.groups)
        ? res.data.groups
        : [];

      // Same behavior as Create Member
      setAreas(
        areaList.filter(
          (area) => area.status === "ACTIVE"
        )
      );
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreas([]);
    }
  };

  // ================================
  // HANDLE INPUT
  // ================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // Mobile validation
    if (
      name === "mobile" ||
      name === "alternateMobile"
    ) {
      newValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    // Pincode validation
    if (name === "pincode") {
      newValue = value
        .replace(/\D/g, "")
        .slice(0, 6);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // ================================
  // UPDATE MEMBER
  // ================================
  const updateMember = async (e) => {
    e.preventDefault();

    // Password validation
    if (
      formData.password &&
      formData.password !== formData.confirmPassword
    ) {
      alert(
        "Password and Confirm Password do not match"
      );
      return;
    }

    // Basic validation
    if (!formData.memberId.trim()) {
      alert("Member ID is required");
      return;
    }

    if (!formData.memberName.trim()) {
      alert("Member Name is required");
      return;
    }

    if (!formData.areaGroup) {
      alert("Please select an Area");
      return;
    }

    if (
      formData.mobile &&
      formData.mobile.length !== 10
    ) {
      alert("Mobile number must be 10 digits");
      return;
    }

    if (
      formData.alternateMobile &&
      formData.alternateMobile.length !== 10
    ) {
      alert(
        "Alternate mobile number must be 10 digits"
      );
      return;
    }

    if (
      formData.pincode &&
      formData.pincode.length !== 6
    ) {
      alert("Pincode must be 6 digits");
      return;
    }

    try {
      setSaving(true);

      const data = {
        memberId: formData.memberId,
        memberName: formData.memberName,
        fatherName: formData.fatherName,
        gender: formData.gender,
        dob: formData.dob || null,
        email: formData.email,
        mobile: formData.mobile,
        alternateMobile: formData.alternateMobile,

        // IMPORTANT
        areaGroup: formData.areaGroup,

        residentialAddress:
          formData.residentialAddress,

        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        status: formData.status,
      };

      // Only update password if user entered a new password
      if (formData.password.trim()) {
        data.password = formData.password;
      }

      console.log(
        "Updating member with:",
        data
      );

      await axios.put(
        `${API}/member/${id}`,
        data
      );

      alert("Member Updated Successfully");

      navigate(`/daily/member/${id}`);
    } catch (error) {
      console.error(
        "Update member error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Update Failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="font-bold text-slate-700">
            Loading Member...
          </p>
        </div>
      </div>
    );
  }

  // ================================
  // UI
  // ================================
  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5 md:p-8">

      <div className="max-w-5xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow border border-slate-200 overflow-hidden">

        {/* HEADER */}
        <div className="p-5 sm:p-7 border-b border-slate-100">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                Member Management
              </p>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Edit Member
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Update complete member information,
                area and account details.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(`/daily/member/${id}`)
              }
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
            >
              Back
            </button>

          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={updateMember}
          className="p-5 sm:p-7 space-y-7"
        >

          {/* =========================
              PERSONAL INFORMATION
          ========================== */}
          <section>

            <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* MEMBER ID */}
              <div>
                <label className="label">
                  Member ID
                </label>

                <input
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  placeholder="Enter Member ID"
                  className="input"
                  required
                />
              </div>

              {/* MEMBER NAME */}
              <div>
                <label className="label">
                  Full Name
                </label>

                <input
                  name="memberName"
                  value={formData.memberName}
                  onChange={handleChange}
                  placeholder="Enter Member Name"
                  className="input"
                  required
                />
              </div>

              {/* FATHER NAME */}
              <div>
                <label className="label">
                  Father's / Husband's Name
                </label>

                <input
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="Father / Husband Name"
                  className="input"
                />
              </div>

              {/* GENDER */}
              <div>
                <label className="label">
                  Gender
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input"
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

              {/* DOB */}
              <div>
                <label className="label">
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="label">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="ACTIVE">
                    ACTIVE
                  </option>

                  <option value="INACTIVE">
                    INACTIVE
                  </option>
                </select>
              </div>

            </div>
          </section>

          {/* =========================
              CONTACT INFORMATION
          ========================== */}
          <section>

            <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* EMAIL */}
              <div>
                <label className="label">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="input"
                />
              </div>

              {/* MOBILE */}
              <div>
                <label className="label">
                  Primary Mobile
                </label>

                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="input"
                />
              </div>

              {/* ALTERNATE MOBILE */}
              <div>
                <label className="label">
                  Alternate Mobile
                </label>

                <input
                  type="text"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="10-digit alternate number"
                  className="input"
                />
              </div>

            </div>
          </section>

          {/* =========================
              AREA + ADDRESS
          ========================== */}
          <section>

            <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              Area & Address
            </h2>

            <div className="space-y-4">

              {/* AREA */}
              <div>
                <label className="label">
                  Area
                </label>

                <select
                  name="areaGroup"
                  value={formData.areaGroup}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">
                    Select Area
                  </option>

                  {areas.map((area) => (
                    <option
                      key={area._id}
                      value={area._id}
                    >
                      {area.areaName}

                      {area.assignedAgent?.name
                        ? ` — ${area.assignedAgent.name}`
                        : ""}
                    </option>
                  ))}
                </select>

                {areas.length === 0 && (
                  <p className="text-[11px] text-orange-500 mt-1">
                    No active areas found.
                  </p>
                )}
              </div>

              {/* ADDRESS */}
              <div>
                <label className="label">
                  Full Residential Address
                </label>

                <textarea
                  name="residentialAddress"
                  value={
                    formData.residentialAddress
                  }
                  onChange={handleChange}
                  placeholder="House, Block, Street..."
                  rows={3}
                  className="input resize-none"
                />
              </div>

              {/* CITY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="label">
                    City / Village
                  </label>

                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City / Village"
                    className="input"
                  />
                </div>

                {/* DISTRICT */}
                <div>
                  <label className="label">
                    District
                  </label>

                  <input
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="District"
                    className="input"
                  />
                </div>

              </div>

              {/* STATE + PINCODE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="label">
                    State
                  </label>

                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">
                    Pincode
                  </label>

                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    placeholder="6-digit Pincode"
                    className="input"
                  />
                </div>

              </div>

            </div>
          </section>

          {/* =========================
              PASSWORD
          ========================== */}
          <section>

            <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              Account Password
            </h2>

            <p className="text-xs text-slate-400 mb-4">
              Leave both password fields blank if
              you do not want to change the current
              password.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="label">
                  New Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="input"
                />
              </div>

            </div>
          </section>

          {/* =========================
              ACTIONS
          ========================== */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t border-slate-100">

            <button
              type="button"
              onClick={() =>
                navigate(`/daily/member/${id}`)
              }
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-sm shadow-sm"
            >
              {saving
                ? "Updating..."
                : "Update Member"}
            </button>

          </div>

        </form>
      </div>

      {/* INPUT STYLES */}
      <style>{`
        .label {
          display: block;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 6px;
        }

        .input {
          width: 100%;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          outline: none;
          transition: all 0.2s;
        }

        .input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
        }
      `}</style>

    </div>
  );
}

export default EditMember;
