import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Phone,
  CreditCard,
  Wallet,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Loader2,
  X,
  Banknote,
  Users,
  ArrowRight
} from "lucide-react";

// ============================================================
// API & HELPERS
// ============================================================

const API_BASE = "https://aws.srmfinance.online/api/daily";

const money = (value) => {
  const number = Number(value || 0);

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 0
  });
};

// IMPORTANT:
// Always display backend dates according to India timezone.
const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getAgentId = () => {
  try {
    const agent = JSON.parse(
      localStorage.getItem("agent") || "null"
    );

    return (
      agent?._id ||
      agent?.id ||
      agent?.agentId ||
      ""
    );
  } catch {
    return "";
  }
};

const getMemberName = (member) =>
  member?.memberName ||
  member?.name ||
  "Unknown Member";

const getMemberId = (member) =>
  member?.memberId || "-";

const getMemberMobile = (member) =>
  member?.mobile || "-";

// ============================================================
// MAIN COMPONENT
// ============================================================

function AgentCollection() {
  const COLLECTION_CACHE_KEY = "agentCollectionCache";

const [members, setMembers] = useState(() => {
  try {
    const cached = sessionStorage.getItem(
      COLLECTION_CACHE_KEY
    );

    return cached
      ? JSON.parse(cached)
      : [];
  } catch {
    return [];
  }
});

  const [loading, setLoading] = useState(() => {
  try {
    const cached = sessionStorage.getItem(
      COLLECTION_CACHE_KEY
    );

    return !cached;
  } catch {
    return true;
  }
});
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedPayments, setSelectedPayments] =
    useState({});

  const [collecting, setCollecting] =
    useState(false);

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [toast, setToast] = useState(null);

const agentId = getAgentId();
  // ==========================================================
  // LOAD COLLECTION DATA
  // ==========================================================

  const loadCollection = useCallback(
    async (silent = false) => {
      if (!agentId) {
        setError(
          "Agent login information not found. Please login again."
        );

        setLoading(false);
        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await axios.get(
          `${API_BASE}/unified-agent-collection/${agentId}`,
          {
            timeout: 60000
          }
        );

        if (response.data?.success) {
          const rawMembers = Array.isArray(
            response.data.members
          )
            ? response.data.members
            : [];

          /*
           * IMPORTANT:
           *
           * Do NOT call /pending-installments/:loanId here.
           *
           * unified-agent-collection already provides:
           *   loan.pendingPayments
           *   loan.pendingInstallments
           *
           * Calling another API here can overwrite the correct
           * pending EMI data with a different date/count.
           */
          setMembers(rawMembers);
 try {
  sessionStorage.setItem(
    COLLECTION_CACHE_KEY,
    JSON.stringify(rawMembers)
  );
} catch (cacheError) {
  console.warn(
    "Collection cache failed:",
    cacheError
  );
}

        } else {
          setMembers([]);

          setError(
            response.data?.message ||
              "Unable to load collection data."
          );
        }
      } catch (err) {
        console.error(
          "UNIFIED COLLECTION ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load collection data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [agentId]
  );

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  // ==========================================================
  // SEARCH FILTER
  // ==========================================================

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return members;
    }

    return members.filter((item) => {
      const member = item?.member || {};

      const memberId = String(
        member.memberId || ""
      ).toLowerCase();

      const memberName = String(
        member.memberName || ""
      ).toLowerCase();

      const mobile = String(
        member.mobile || ""
      ).toLowerCase();

      return (
        memberId.includes(keyword) ||
        memberName.includes(keyword) ||
        mobile.includes(keyword)
      );
    });
  }, [members, search]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [search]);

  const currentMember =
    filteredMembers[currentIndex] || null;

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const nextMember = useCallback(() => {
    if (!filteredMembers.length) {
      return;
    }

    setCurrentIndex((prev) =>
      Math.min(
        prev + 1,
        filteredMembers.length - 1
      )
    );
  }, [filteredMembers.length]);

  const previousMember = useCallback(() => {
    if (!filteredMembers.length) {
      return;
    }

    setCurrentIndex((prev) =>
      Math.max(prev - 1, 0)
    );
  }, [filteredMembers.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextMember();
      }

      if (e.key === "ArrowLeft") {
        previousMember();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [nextMember, previousMember]);

  // ==========================================================
  // PAYMENT KEYS
  // ==========================================================

  const savingKey = (
    savingId,
    installmentNo
  ) =>
    `saving:${savingId}:${installmentNo}`;

  const loanKey = (
    loanId,
    installmentNo
  ) =>
    `loan:${loanId}:${installmentNo}`;

  // ==========================================================
  // PAYMENT TOGGLE
  // ==========================================================

  const togglePayment = useCallback(
    (key, payment) => {
      setSelectedPayments((prev) => {
        const copy = {
          ...prev
        };

        if (copy[key]) {
          delete copy[key];
        } else {
          copy[key] = payment;
        }

        return copy;
      });
    },
    []
  );

  // ==========================================================
  // SELECT ALL
  // ==========================================================

  const selectAllCurrentMember = () => {
    if (!currentMember) {
      return;
    }

    setSelectedPayments((prev) => {
      const copy = {
        ...prev
      };

      // -----------------------------
      // SAVINGS
      // -----------------------------

      (
        currentMember.savings || []
      ).forEach((saving) => {
        const pending = Array.isArray(
          saving?.pendingPayments
        )
          ? saving.pendingPayments
          : [];

        pending.forEach((payment) => {
          const key = savingKey(
            saving.savingId,
            payment.installmentNo
          );

          copy[key] = {
            type: "SAVING",
            saving,
            payment
          };
        });
      });

      // -----------------------------
      // LOANS
      // -----------------------------

      (
        currentMember.loans || []
      ).forEach((loan) => {
        const pending = Array.isArray(
          loan?.pendingPayments
        )
          ? loan.pendingPayments
          : [];

        pending.forEach((payment) => {
          const key = loanKey(
            loan.loanId,
            payment.installmentNo
          );

          copy[key] = {
            type: "LOAN",
            loan,
            payment
          };
        });
      });

      return copy;
    });
  };

  // ==========================================================
  // CLEAR SELECTION
  // ==========================================================

  const clearSelection = () => {
    setSelectedPayments({});
  };

  const selectedList = useMemo(
    () =>
      Object.entries(selectedPayments),
    [selectedPayments]
  );

  // ==========================================================
  // SELECTED TOTAL
  // ==========================================================

  const selectedTotal = useMemo(() => {
    return selectedList.reduce(
      (total, [, item]) => {
        if (item.type === "SAVING") {
          return (
            total +
            Number(
              item.payment?.total || 0
            )
          );
        }

        return (
          total +
          Number(
            item.payment?.totalAmount || 0
          )
        );
      },
      0
    );
  }, [selectedList]);

  // ==========================================================
  // CURRENT MEMBER PENDING COUNT
  // ==========================================================

  const currentPendingCount = useMemo(() => {
    if (!currentMember) {
      return 0;
    }

    // -----------------------------
    // SAVING COUNT
    // -----------------------------

    const savingCount = (
      currentMember.savings || []
    ).reduce((total, saving) => {
      const pending = Array.isArray(
        saving?.pendingPayments
      )
        ? saving.pendingPayments
        : [];

      return total + pending.length;
    }, 0);

    // -----------------------------
    // LOAN COUNT
    // -----------------------------

    const loanCount = (
      currentMember.loans || []
    ).reduce((total, loan) => {
      const pending = Array.isArray(
        loan?.pendingPayments
      )
        ? loan.pendingPayments
        : [];

      return total + pending.length;
    }, 0);

    return savingCount + loanCount;
  }, [currentMember]);

  // ==========================================================
  // TOAST
  // ==========================================================

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      message,
      type
    });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // ==========================================================
  // COLLECTION SUBMIT
  // ==========================================================

  const collectSelected = async () => {
    if (selectedList.length === 0) {
      return;
    }

    try {
      setCollecting(true);

      let successCount = 0;
      let failedCount = 0;

      for (const [, item] of selectedList) {
        try {
          // ==================================================
          // SAVING COLLECTION
          // ==================================================

          if (item.type === "SAVING") {
            await axios.post(
              `${API_BASE}/collect-pending`,
              {
                savingId:
                  item.saving.savingId,

                pendingDate:
                  item.payment.date,

                collectorType: "AGENT",

                collectorId: agentId,

                paymentMethod
              },
              {
                timeout: 30000
              }
            );
          }

          // ==================================================
          // LOAN EMI COLLECTION
          // ==================================================

          else {
            await axios.post(
              `${API_BASE}/collect-emi`,
              {
                loanId:
                  item.loan.loanId,

                installmentNo:
                  item.payment.installmentNo,

                collectorType: "AGENT",

                collectorId: agentId,

                paymentMethod
              },
              {
                timeout: 60000
              }
            );
          }

          successCount++;
        } catch (paymentError) {
          failedCount++;

          console.error(
            "PAYMENT ERROR:",
            paymentError
          );
        }
      }

      setSelectedPayments({});
      setShowPaymentModal(false);

      if (failedCount === 0) {
        showToast(
          `${successCount} payment${
            successCount !== 1 ? "s" : ""
          } collected successfully.`,
          "success"
        );
      } else {
        showToast(
          `${successCount} collected, ${failedCount} failed.`,
          "error"
        );
      }

          await loadCollection(true);

    } catch (err) {
      console.error(
        "COLLECT SELECTED ERROR:",
        err
      );

      let message = "Collection failed.";

      if (err.code === "ECONNABORTED") {
        message =
          "Server is taking too long to respond. Please try again.";
      } else if (err.response?.data?.message) {
        message =
          err.response.data.message;
      }

      showToast(
        message,
        "error"
      );

    } finally {
      setCollecting(false);
    }
  };
  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Loader2
              size={24}
              className="animate-spin"
            />
          </div>

          <h2 className="mt-4 text-base font-black text-slate-900">
            Loading Collection
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            Preparing daily records...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-2.5 sm:p-4 lg:p-6 pb-28">
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">

        {/* ====================================================
            HEADER & SEARCH
        ==================================================== */}

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2.5">

              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Wallet size={18} />
              </div>

              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  Collection
                </h1>

                <p className="text-[11px] text-slate-500">
                  Savings & Loan Collections
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2">

              <span className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-[11px] font-bold text-slate-600 hidden sm:inline-flex items-center gap-1">
                <Users size={13} />

                {filteredMembers.length} Members
              </span>

              <button
                type="button"
                onClick={() =>
                  loadCollection(true)
                }
                disabled={refreshing}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-1.5 text-xs font-bold transition disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>

            </div>
          </div>

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search Member ID, name or mobile..."
              className="w-full h-10 pl-9 pr-9 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 transition"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}

          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-2.5">

            <AlertTriangle
              size={18}
              className="text-rose-500 shrink-0 mt-0.5"
            />

            <div>
              <p className="font-bold text-rose-800 text-xs sm:text-sm">
                Error Loading Data
              </p>

              <p className="text-[11px] text-rose-600 mt-0.5">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ====================================================
            NO MEMBERS
        ==================================================== */}

        {!error &&
          filteredMembers.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">

              <Search
                size={22}
                className="mx-auto text-slate-300"
              />

              <h2 className="text-sm font-black text-slate-800">
                No members found
              </h2>

              <p className="text-xs text-slate-500">
                Try searching with a different ID,
                name, or phone number.
              </p>

            </div>
          )}

        {/* ====================================================
            MEMBER SLIDER
        ==================================================== */}

        {currentMember && (
          <div className="space-y-3">

            {/* SLIDER CONTROLS */}

            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200">

              <button
                type="button"
                onClick={previousMember}
                disabled={
                  currentIndex === 0
                }
                className="h-8 px-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              <div className="text-center">
                <span className="text-[11px] font-black text-slate-700">
                  {currentIndex + 1} /{" "}
                  {filteredMembers.length}
                </span>
              </div>

              <button
                type="button"
                onClick={nextMember}
                disabled={
                  currentIndex >=
                  filteredMembers.length - 1
                }
                className="h-8 px-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-xs font-bold"
              >
                Next
                <ChevronRight size={16} />
              </button>

            </div>

            {/* ==================================================
                MEMBER CARD
            ================================================== */}

            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">

              <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  {/* MEMBER INFORMATION */}

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                      {getMemberName(
                        currentMember.member
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <h2 className="text-base font-black text-slate-900 leading-tight">
                        {getMemberName(
                          currentMember.member
                        )}
                      </h2>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">

                        <span>
                          ID:{" "}
                          <strong className="text-blue-600">
                            {getMemberId(
                              currentMember.member
                            )}
                          </strong>
                        </span>

                        <span className="flex items-center gap-0.5">
                          <Phone size={11} />

                          {getMemberMobile(
                            currentMember.member
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* PENDING + SELECT ALL */}

                  <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">

                    <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100/80">

                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block leading-none">
                        Pending
                      </span>

                      <span className="text-xs font-black text-amber-900">
                        {currentPendingCount} Total
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={
                        selectAllCurrentMember
                      }
                      disabled={
                        currentPendingCount === 0
                      }
                      className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <CheckCircle2 size={14} />
                      Select All
                    </button>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  COLLECTION LISTS
              ================================================== */}

              <div className="p-3.5 sm:p-4 space-y-4">

                {/* SAVINGS */}

                {(currentMember.savings || []).map(
                  (saving, idx) => (
                    <SavingSection
                      key={
                        saving.savingId || idx
                      }
                      saving={saving}
                      selectedPayments={
                        selectedPayments
                      }
                      onToggle={
                        togglePayment
                      }
                      savingKey={
                        savingKey
                      }
                    />
                  )
                )}

                {/* LOANS */}

                {(currentMember.loans || []).map(
                  (loan, idx) => (
                    <LoanSection
                      key={
                        loan.loanId || idx
                      }
                      loan={loan}
                      selectedPayments={
                        selectedPayments
                      }
                      onToggle={
                        togglePayment
                      }
                      loanKey={loanKey}
                    />
                  )
                )}

                {/* NO ACCOUNTS */}

                {(currentMember.savings || [])
                  .length === 0 &&
                  (currentMember.loans || [])
                    .length === 0 && (
                    <div className="py-8 text-center space-y-1">

                      <CheckCircle2
                        size={32}
                        className="mx-auto text-emerald-500"
                      />

                      <h3 className="text-sm font-black text-slate-800">
                        No active accounts
                      </h3>

                      <p className="text-xs text-slate-500">
                        Member has no active savings
                        or loan accounts.
                      </p>

                    </div>
                  )}

              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          BOTTOM COLLECTION BAR
      ====================================================== */}

      {selectedList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-2.5 sm:p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">

          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl p-3 flex items-center justify-between gap-2">

            <div>

              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {selectedList.length} Selected
              </p>

              <p className="text-base sm:text-lg font-black text-white">
                ₹{money(selectedTotal)}
              </p>

            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={
                  clearSelection
                }
                className="h-9 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowPaymentModal(
                    true
                  )
                }
                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 text-white"
              >
                Collect
                <ArrowRight size={15} />
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================
          PAYMENT METHOD MODAL
      ====================================================== */}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">

          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">

            {/* MODAL HEADER */}

            <div className="p-4 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h3 className="text-base font-black text-slate-900">
                  Confirm Collection
                </h3>

                <p className="text-xs text-slate-500">
                  Verify details before proceeding
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPaymentModal(
                    false
                  )
                }
                disabled={collecting}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>

            </div>

            <div className="p-4 space-y-4">

              {/* TOTAL */}

              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-center">

                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Total Collection
                </span>

                <span className="text-2xl font-black text-blue-900 block">
                  ₹{money(selectedTotal)}
                </span>

                <span className="text-[11px] text-blue-700 font-medium">
                  {selectedList.length} Selected
                  Payment(s)
                </span>

              </div>

              {/* PAYMENT METHOD */}

              <div>

                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Payment Method
                </label>

                <div className="grid grid-cols-3 gap-2">

                  {[
                    {
                      value: "CASH",
                      label: "Cash",
                      icon: Banknote
                    },
                    {
                      value: "UPI",
                      label: "UPI",
                      icon: Wallet
                    },
                    {
                      value: "BANK",
                      label: "Bank",
                      icon: CreditCard
                    }
                  ].map((method) => {

                    const Icon =
                      method.icon;

                    const active =
                      paymentMethod ===
                      method.value;

                    return (
                      <button
                        key={
                          method.value
                        }
                        type="button"
                        onClick={() =>
                          setPaymentMethod(
                            method.value
                          )
                        }
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          active
                            ? "border-blue-600 bg-blue-50 text-blue-700 font-black"
                            : "border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                        }`}
                      >

                        <Icon size={18} />

                        <span className="text-xs">
                          {method.label}
                        </span>

                      </button>
                    );
                  })}

                </div>
              </div>

              {/* BUTTONS */}

              <div className="flex gap-2 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowPaymentModal(
                      false
                    )
                  }
                  disabled={collecting}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    collectSelected
                  }
                  disabled={collecting}
                  className="flex-[1.5] h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >

                  {collecting ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />

                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={15}
                      />

                      Collect ₹
                      {money(
                        selectedTotal
                      )}
                    </>
                  )}

                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          TOAST
      ====================================================== */}

      {toast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 max-w-sm">

          <div
            className={`rounded-xl shadow-lg border p-3 flex items-start gap-2.5 text-xs font-bold ${
              toast.type === "success"
                ? "bg-emerald-500 text-white border-emerald-600"
                : "bg-rose-500 text-white border-rose-600"
            }`}
          >

            {toast.type === "success" ? (
              <CheckCircle2
                size={16}
                className="shrink-0 mt-0.5"
              />
            ) : (
              <AlertTriangle
                size={16}
                className="shrink-0 mt-0.5"
              />
            )}

            <p>{toast.message}</p>

          </div>
        </div>
      )}

    </div>
  );
}

// ============================================================
// SAVING SECTION
// ============================================================

function SavingSection({
  saving,
  selectedPayments,
  onToggle,
  savingKey
}) {
  const [isOpen, setIsOpen] =
    useState(true);

  const pending = Array.isArray(
    saving?.pendingPayments
  )
    ? saving.pendingPayments.filter(Boolean)
    : [];

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-3">

      {/* HEADER */}

      <div className="flex items-center justify-between gap-2">

        <div className="flex items-center gap-2">

          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet size={16} />
          </div>

          <div>

            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Daily Saving
            </h3>

            <p className="text-[10px] text-slate-500">
              {saving?.collectionType ===
              "FIXED"
                ? `₹${money(
                    saving?.fixedAmount
                  )}/day`
                : "Flexible"}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-1.5">

          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-black">
            {pending.length} Pending
          </span>

          <button
            type="button"
            onClick={() =>
              setIsOpen(!isOpen)
            }
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
            aria-label="Toggle Section"
          >
            {isOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

        </div>
      </div>

      {/* SAVING INFORMATION */}

      <div className="grid grid-cols-2 gap-2 text-[11px]">

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">

          <span className="text-slate-400 block text-[9px] uppercase font-bold">
            Start Date
          </span>

          <span className="font-bold text-slate-700">
            {formatDate(
              saving?.startDate
            )}
          </span>

        </div>

        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">

          <span className="text-amber-600 block text-[9px] uppercase font-bold">
            Pending Amt
          </span>

          <span className="font-bold text-amber-900">
            ₹
            {money(
              saving?.pendingAmount
            )}
          </span>

        </div>

      </div>

      {/* DROPDOWN */}

      {isOpen && (
        <div className="space-y-1.5 pt-1">

          {pending.length > 0 ? (
            pending.map((payment) => {

              const key = savingKey(
                saving?.savingId,
                payment?.installmentNo
              );

              const selected =
                Boolean(
                  selectedPayments[key]
                );

              return (
                <button
                  type="button"
                  key={key}
                  onClick={() =>
                    onToggle(key, {
                      type: "SAVING",
                      saving,
                      payment
                    })
                  }
                  className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between text-xs ${
                    selected
                      ? "bg-blue-50/80 border-blue-400 text-blue-900"
                      : "bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    {selected ? (
                      <CheckCircle2
                        size={17}
                        className="text-blue-600 shrink-0"
                      />
                    ) : (
                      <Circle
                        size={17}
                        className="text-slate-300 shrink-0"
                      />
                    )}

                    <div>

                      <span className="font-black block text-xs">
                        Day #
                        {
                          payment?.installmentNo
                        }
                      </span>

                      <span className="text-[10px] text-slate-500">
                        {formatDate(
                          payment?.date
                        )}
                      </span>

                    </div>

                  </div>

                  <div className="text-right">

                    <span className="font-black block text-xs">
                      ₹
                      {money(
                        payment?.total
                      )}
                    </span>

                    {Number(
                      payment?.penalty || 0
                    ) > 0 && (
                      <span className="text-[9px] font-bold text-rose-500">
                        +₹
                        {money(
                          payment?.penalty
                        )}{" "}
                        penalty
                      </span>
                    )}

                  </div>

                </button>
              );
            })
          ) : (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">

              <CheckCircle2 size={15} />

              All saving days collected.

            </div>
          )}

        </div>
      )}

    </div>
  );
}

// ============================================================
// LOAN SECTION
// ============================================================

function LoanSection({
  loan,
  selectedPayments,
  onToggle,
  loanKey
}) {
  const [isOpen, setIsOpen] =
    useState(true);

  /*
   * IMPORTANT:
   *
   * Use ONLY loan.pendingPayments returned by
   * unified-agent-collection.
   *
   * Do not fetch /pending-installments here.
   */

  const pending = Array.isArray(
    loan?.pendingPayments
  )
    ? loan.pendingPayments.filter(Boolean)
    : [];

  // ==========================================================
  // SORT EMI BY DUE DATE
  // ==========================================================

  const sortedPending = useMemo(() => {
    return [...pending].sort((a, b) => {

      const dateA = new Date(
        a?.dueDate ||
          a?.date ||
          0
      ).getTime();

      const dateB = new Date(
        b?.dueDate ||
          b?.date ||
          0
      ).getTime();

      return dateA - dateB;
    });
  }, [pending]);

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-3">

      {/* ======================================================
          LOAN HEADER
      ====================================================== */}

      <div className="flex items-center justify-between gap-2">

        <div className="flex items-center gap-2">

          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard size={16} />
          </div>

          <div>

            <div className="flex items-center gap-1.5">

              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Loan
              </h3>

              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                {loan?.loanNumber || "-"}
              </span>

            </div>

            <p className="text-[10px] text-slate-500">
              {loan?.loanType || "-"} Loan
            </p>

          </div>

        </div>

        {/* PENDING COUNT */}

        <div className="flex items-center gap-1.5">

          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-black">
            {sortedPending.length} EMI Pending
          </span>

          <button
            type="button"
            onClick={() =>
              setIsOpen(!isOpen)
            }
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
            aria-label="Toggle Section"
          >
            {isOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

        </div>

      </div>

      {/* ======================================================
          LOAN INFORMATION
      ====================================================== */}

      <div className="grid grid-cols-3 gap-1.5 text-[11px]">

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">

          <span className="text-slate-400 block text-[9px] uppercase font-bold">
            Amount
          </span>

          <span className="font-bold text-slate-700">
            ₹
            {money(
              loan?.loanAmount
            )}
          </span>

        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">

          <span className="text-slate-400 block text-[9px] uppercase font-bold">
            EMI
          </span>

          <span className="font-bold text-slate-700">
            ₹
            {money(
              loan?.emiAmount
            )}
          </span>

        </div>

        <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">

          <span className="text-rose-600 block text-[9px] uppercase font-bold">
            Outstanding
          </span>

          <span className="font-bold text-rose-800">
            ₹
            {money(
              loan?.outstandingAmount
            )}
          </span>

        </div>

      </div>

      {/* ======================================================
          EMI LIST
      ====================================================== */}

      {isOpen && (
        <div className="space-y-1.5 pt-1">

          {sortedPending.length > 0 ? (
            sortedPending.map(
              (payment) => {

                const key = loanKey(
                  loan?.loanId,
                  payment?.installmentNo
                );

                const selected =
                  Boolean(
                    selectedPayments[key]
                  );

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() =>
                      onToggle(key, {
                        type: "LOAN",
                        loan,
                        payment
                      })
                    }
                    className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between text-xs ${
                      selected
                        ? "bg-blue-50/80 border-blue-400 text-blue-900"
                        : "bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100"
                    }`}
                  >

                    {/* LEFT */}

                    <div className="flex items-center gap-2">

                      {selected ? (
                        <CheckCircle2
                          size={17}
                          className="text-blue-600 shrink-0"
                        />
                      ) : (
                        <Circle
                          size={17}
                          className="text-slate-300 shrink-0"
                        />
                      )}

                      <div>

                        <span className="font-black block text-xs">
                          EMI #
                          {
                            payment?.installmentNo
                          }
                        </span>

                        <span className="text-[10px] text-slate-500">
                          Due:{" "}
                          {payment?.dueDateString ||
                            formatDate(payment?.dueDate)}
                        </span>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="text-right">

                      <span className="font-black block text-xs">
                        ₹
                        {money(
                          payment?.totalAmount
                        )}
                      </span>

                      {Number(
                        payment?.penalty || 0
                      ) > 0 && (
                        <span className="text-[9px] font-bold text-rose-500">
                          +₹
                          {money(
                            payment?.penalty
                          )}{" "}
                          penalty
                        </span>
                      )}

                    </div>

                  </button>
                );
              }
            )
          ) : (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">

              <CheckCircle2 size={15} />

              No pending EMI for this loan.

            </div>
          )}

        </div>
      )}

    </div>
  );
}

// ============================================================
// EXPORT
// ============================================================

export default AgentCollection;