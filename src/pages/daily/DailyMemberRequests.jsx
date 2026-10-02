import React, { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiRefreshCw,
  FiUsers,
  FiClock,
  FiSearch,
  FiX,
} from "react-icons/fi";

const API_BASE =
  "https://finance-project-0qqk.onrender.com/api/daily";

function DailyMemberRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRequest, setRejectRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // =====================================================
  // FETCH PENDING REQUESTS
  // =====================================================

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/member-requests`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load member requests"
        );
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.error("Fetch requests error:", error);
      alert(error.message || "Failed to load member requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // =====================================================
  // APPROVE REQUEST
  // =====================================================

  const approveRequest = async (request) => {
    const confirmApprove = window.confirm(
      `Approve registration of ${request.memberName}?`
    );

    if (!confirmApprove) return;

    try {
      setProcessingId(request._id);

      const response = await fetch(
        `${API_BASE}/member-request/${request._id}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to approve request"
        );
      }

      alert(
        data.message || "Member approved successfully"
      );

      setSelectedRequest(null);

      await fetchRequests();
    } catch (error) {
      console.error("Approve request error:", error);
      alert(error.message || "Failed to approve member");
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // OPEN REJECT MODAL
  // =====================================================

  const openRejectModal = (request) => {
    setRejectRequest(request);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // =====================================================
  // REJECT REQUEST
  // =====================================================

  const rejectRequestHandler = async () => {
    if (!rejectRequest) return;

    try {
      setProcessingId(rejectRequest._id);

      const response = await fetch(
        `${API_BASE}/member-request/${rejectRequest._id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejectionReason: rejectionReason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to reject request"
        );
      }

      alert(
        data.message || "Member request rejected"
      );

      setShowRejectModal(false);
      setRejectRequest(null);
      setRejectionReason("");
      setSelectedRequest(null);

      await fetchRequests();
    } catch (error) {
      console.error("Reject request error:", error);
      alert(error.message || "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredRequests = requests.filter((request) => {
    const search = searchQuery.toLowerCase().trim();

    return (
      request.memberName
        ?.toLowerCase()
        .includes(search) ||
      request.memberId
        ?.toLowerCase()
        .includes(search) ||
      request.mobile?.includes(search) ||
      request.city
        ?.toLowerCase()
        .includes(search) ||
      request.requestedBy?.name
        ?.toLowerCase()
        .includes(search) ||
      request.requestedBy?.mobile?.includes(search)
    );
  });

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-8 font-sans text-slate-800">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">

        <div>
          <span className="text-[10px] font-black tracking-wider text-orange-500 uppercase">
            Approval Workspace
          </span>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            MEMBER REGISTRATION REQUESTS
          </h1>

          <p className="text-xs text-slate-400 font-medium mt-1">
            Review member registrations submitted by agents.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <FiRefreshCw
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>

      </div>

      {/* ================================================= */}
      {/* STAT CARDS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">

          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Pending Requests
            </p>

            <h2 className="text-3xl font-black text-slate-800 mt-1">
              {requests.length}
            </h2>
          </div>

          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 text-xl">
            <FiClock />
          </div>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">

          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Showing Results
            </p>

            <h2 className="text-3xl font-black text-slate-800 mt-1">
              {filteredRequests.length}
            </h2>
          </div>

          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl">
            <FiUsers />
          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* SEARCH */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-6">

        <div className="relative w-full sm:max-w-md">

          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search member, ID, mobile or agent..."
            className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-semibold"
          />

        </div>

      </div>

      {/* ================================================= */}
      {/* REQUEST TABLE */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        {loading ? (
          <div className="py-16 flex justify-center">
            <FiRefreshCw className="animate-spin text-blue-600 text-3xl" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center">

            <FiUsers className="mx-auto text-slate-300 text-5xl mb-3" />

            <h3 className="text-sm font-black text-slate-600 uppercase">
              No Pending Requests
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              New agent registrations will appear here.
            </p>

          </div>
        ) : (
          <>

            {/* DESKTOP */}

            <div className="hidden md:block overflow-x-auto">

              <table className="w-full text-left border-collapse">

                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500">

                    <th className="p-4">
                      Member
                    </th>

                    <th className="p-4">
                      Member ID
                    </th>

                    <th className="p-4">
                      Mobile
                    </th>

                    <th className="p-4">
                      Agent
                    </th>

                    <th className="p-4">
                      Requested
                    </th>

                    <th className="p-4 text-center">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredRequests.map((request) => (

                    <tr
                      key={request._id}
                      className="hover:bg-slate-50 transition-colors"
                    >

                      <td className="p-4">

                        <div className="font-bold text-slate-800">
                          {request.memberName}
                        </div>

                        <div className="text-[11px] text-slate-400">
                          {request.gender}
                        </div>

                      </td>

                      <td className="p-4">

                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                          {request.memberId}
                        </span>

                      </td>

                      <td className="p-4 text-xs font-semibold">
                        {request.mobile}
                      </td>

                      <td className="p-4">

                        <div className="text-xs font-bold text-slate-700">
                          {request.requestedBy?.name ||
                            "Agent"}
                        </div>

                        <div className="text-[10px] text-slate-400">
                          {request.requestedBy?.mobile ||
                            "-"}
                        </div>

                      </td>

                      <td className="p-4 text-xs text-slate-500">
                        {formatDate(request.createdAt)}
                      </td>

                      <td className="p-4">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() =>
                              setSelectedRequest(request)
                            }
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg"
                            title="View Details"
                          >
                            <FiEye />
                          </button>

                          <button
                            onClick={() =>
                              approveRequest(request)
                            }
                            disabled={
                              processingId === request._id
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1 disabled:opacity-50"
                          >
                            <FiCheckCircle />
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              openRejectModal(request)
                            }
                            disabled={
                              processingId === request._id
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1 disabled:opacity-50"
                          >
                            <FiXCircle />
                            Reject
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* MOBILE */}

            <div className="md:hidden divide-y divide-slate-100">

              {filteredRequests.map((request) => (

                <div
                  key={request._id}
                  className="p-4 space-y-4"
                >

                  <div className="flex justify-between items-start">

                    <div>

                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        {request.memberId}
                      </p>

                      <h3 className="text-sm font-black text-slate-800 mt-1">
                        {request.memberName}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {request.mobile}
                      </p>

                    </div>

                    <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2 py-1 rounded-lg text-[9px] font-bold uppercase">
                      Pending
                    </span>

                  </div>

                  <div className="bg-slate-50 rounded-xl p-3">

                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                      Agent
                    </p>

                    <p className="text-xs font-bold text-slate-700 mt-1">
                      {request.requestedBy?.name ||
                        "Agent"}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {request.requestedBy?.mobile ||
                        "-"}
                    </p>

                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        setSelectedRequest(request)
                      }
                      className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold flex justify-center items-center gap-1"
                    >
                      <FiEye />
                      View
                    </button>

                    <button
                      onClick={() =>
                        approveRequest(request)
                      }
                      disabled={
                        processingId === request._id
                      }
                      className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-xs font-bold flex justify-center items-center gap-1 disabled:opacity-50"
                    >
                      <FiCheckCircle />
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        openRejectModal(request)
                      }
                      disabled={
                        processingId === request._id
                      }
                      className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold flex justify-center items-center gap-1 disabled:opacity-50"
                    >
                      <FiXCircle />
                      Reject
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </>
        )}

      </div>

      {/* ================================================= */}
      {/* DETAILS MODAL */}
      {/* ================================================= */}

      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5">

          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">

            <div className="p-5 border-b border-slate-100 flex justify-between items-center">

              <div>

                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Member Registration Details
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Review all submitted information
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedRequest(null)
                }
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center"
              >
                <FiX />
              </button>

            </div>

            <div className="p-5 sm:p-6 overflow-y-auto">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Detail
                  label="Member Name"
                  value={selectedRequest.memberName}
                />

                <Detail
                  label="Member ID"
                  value={selectedRequest.memberId}
                />

                <Detail
                  label="Father / Husband Name"
                  value={selectedRequest.fatherName}
                />

                <Detail
                  label="Gender"
                  value={selectedRequest.gender}
                />

                <Detail
                  label="Date of Birth"
                  value={formatDate(selectedRequest.dob)}
                />

                <Detail
                  label="Email"
                  value={selectedRequest.email}
                />

                <Detail
                  label="Mobile"
                  value={selectedRequest.mobile}
                />

                <Detail
                  label="Alternate Mobile"
                  value={selectedRequest.alternateMobile}
                />

                <Detail
                  label="Residential Address"
                  value={selectedRequest.residentialAddress}
                />

                <Detail
                  label="City"
                  value={selectedRequest.city}
                />

                <Detail
                  label="District"
                  value={selectedRequest.district}
                />

                <Detail
                  label="State"
                  value={selectedRequest.state}
                />

                <Detail
                  label="Pincode"
                  value={selectedRequest.pincode}
                />

                <Detail
                  label="Agent Name"
                  value={
                    selectedRequest.requestedBy?.name ||
                    "Agent"
                  }
                />

                <Detail
                  label="Agent Mobile"
                  value={
                    selectedRequest.requestedBy?.mobile ||
                    "-"
                  }
                />

                <Detail
                  label="Request Date"
                  value={formatDate(
                    selectedRequest.createdAt
                  )}
                />

              </div>

            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-4 flex flex-col sm:flex-row justify-end gap-3">

              <button
                onClick={() =>
                  approveRequest(selectedRequest)
                }
                disabled={
                  processingId === selectedRequest._id
                }
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl text-xs font-bold flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <FiCheckCircle />
                Approve Member
              </button>

              <button
                onClick={() =>
                  openRejectModal(selectedRequest)
                }
                disabled={
                  processingId === selectedRequest._id
                }
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl text-xs font-bold flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <FiXCircle />
                Reject Member
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* REJECT MODAL */}
      {/* ================================================= */}

      {showRejectModal && rejectRequest && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b border-slate-100 flex justify-between items-center">

              <h2 className="text-base font-black text-slate-900">
                Reject Member Request
              </h2>

              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectRequest(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center"
              >
                <FiX />
              </button>

            </div>

            <div className="p-5">

              <p className="text-xs text-slate-500 mb-4">
                Reject registration request for{" "}
                <strong className="text-slate-800">
                  {rejectRequest.memberName}
                </strong>
                .
              </p>

              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                Rejection Reason
              </label>

              <textarea
                rows="4"
                value={rejectionReason}
                onChange={(e) =>
                  setRejectionReason(e.target.value)
                }
                placeholder="Enter reason for rejection..."
                className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-red-500 resize-none"
              />

              <div className="flex gap-3 mt-5">

                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectRequest(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  onClick={rejectRequestHandler}
                  disabled={
                    processingId === rejectRequest._id
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {processingId === rejectRequest._id
                    ? "Rejecting..."
                    : "Confirm Reject"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// =====================================================
// DETAIL COMPONENT
// =====================================================

function Detail({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">

      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
        {label}
      </p>

      <p className="text-xs font-bold text-slate-700 mt-1 break-words">
        {value || "-"}
      </p>

    </div>
  );
}

export default DailyMemberRequests;