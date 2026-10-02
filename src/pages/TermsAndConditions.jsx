import React, { useState } from "react";
import {
  FiFileText,
  FiCheckCircle,
  FiShield,
  FiCreditCard,
  FiUsers,
  FiAlertTriangle,
  FiLock,
  FiPrinter,
  FiArrowRight,
  FiHelpCircle,
  FiDollarSign,
  FiSmartphone,
  FiBriefcase
} from "react-icons/fi";

const TermsAndConditions = ({ onAccept }) => {
  const [agreed, setAgreed] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-inner">
                <FiFileText className="text-3xl sm:text-4xl text-blue-100" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                  Legal Policy
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                  Terms & Conditions
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1">
                  SRM Finance Management System
                </p>
              </div>
            </div>

            {/* Quick Action */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <FiPrinter className="text-sm" /> Print Terms
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-blue-200 font-semibold">
            <span>Effective Date: August 2026</span>
            <span>Version 1.0</span>
          </div>
        </div>

        {/* Policy Body */}
        <div className="p-6 sm:p-10 space-y-8">

          {/* 1. Membership Rules */}
          <section className="bg-slate-50/50 border border-slate-200/70 p-6 rounded-2xl">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5 mb-3">
              <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <FiUsers className="text-base" />
              </span>
              1. Membership Rules
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium pl-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-black">•</span>
                Every member must provide valid national identification documents, Mobile Number, and permanent Address details.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-black">•</span>
                Membership becomes active only after successful document verification and system onboarding.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-black">•</span>
                Each verified member will receive a unique, non-transferable Membership ID.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-black">•</span>
                Submission of false or misleading information may lead to immediate account suspension or legal action.
              </li>
            </ul>
          </section>

          {/* 2. Saving Scheme Rules */}
          <section className="bg-slate-50/50 border border-slate-200/70 p-6 rounded-2xl">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5 mb-3">
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <FiCreditCard className="text-base" />
              </span>
              2. Saving Scheme Rules
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium pl-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-black">•</span>
                Monthly installment contributions must be credited on or before the agreed scheduled due date.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-black">•</span>
                The recurring installment amount remains fixed throughout the tenor post-registration.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-black">•</span>
                Account status remains active upon timely recurring payments until maturity completion.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-black">•</span>
                Maturity payouts are subject to complete ledger verification and compliance approval.
              </li>
            </ul>
          </section>

          {/* 3. Penalty Rules */}
          <section className="bg-slate-50/50 border border-slate-200/70 p-6 rounded-2xl">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5 mb-3">
              <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <FiAlertTriangle className="text-base" />
              </span>
              3. Due Date & Late Penalty Rules
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium pl-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-black">•</span>
                Every savings or loan account is assigned a rigid monthly due cycle.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-black">•</span>
                A predefined grace period may apply strictly according to internal society governance policies.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-black">•</span>
                Non-receipt of installments within the due window triggers automated daily/monthly late penalty charges.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-black">•</span>
                Accrued penalties must be cleared in priority alongside the installment base amount.
              </li>
            </ul>
          </section>

          {/* 4. Loan Policies */}
          <section className="bg-slate-50/50 border border-slate-200/70 p-6 rounded-2xl">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5 mb-3">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <FiShield className="text-base" />
              </span>
              4. Loan Issuance & Repayment Policies
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium pl-2">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-black">•</span>
                Loan eligibility and approvals are strictly determined by society credit criteria and member savings history.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-black">•</span>
                Sanctioned loan amounts and interest structures are determined at management discretion.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-black">•</span>
                Loan EMIs must follow the automated collection schedule without default.
              </li>
            </ul>
          </section>

          {/* 5. Approved Payment Methods */}
          <section>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-4">
              5. Approved Payment Channels
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-700"><FiDollarSign /></div>
                <div>
                  <p className="text-xs font-black text-slate-800">Cash Ledger</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Counter Pay</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-700"><FiSmartphone /></div>
                <div>
                  <p className="text-xs font-black text-slate-800">UPI Transfer</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Instant Pay</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-700"><FiBriefcase /></div>
                <div>
                  <p className="text-xs font-black text-slate-800">Bank Transfer</p>
                  <p className="text-[10px] text-slate-400 font-semibold">NEFT / RTGS</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-700"><FiFileText /></div>
                <div>
                  <p className="text-xs font-black text-slate-800">Cheque Deposit</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Subject to Clearing</p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Member Privacy & Security */}
          <section className="grid sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-2xl p-5 bg-white">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FiUsers className="text-blue-600" /> Member Responsibilities
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Members are responsible for keeping personal profile records accurate, maintaining digital or physical receipt copies, and promptly notifying administration of contact changes.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 bg-white">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FiLock className="text-indigo-600" /> Data Privacy Guarantee
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Personal identification and account ledgers are kept strictly confidential under system encryption standards and used exclusively for internal financial accounting.
              </p>
            </div>
          </section>

          {/* Notice Box */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <FiHelpCircle className="text-amber-600 text-lg shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              <strong>Modification Notice:</strong> SRM Finance Management reserves the full right to amend or revise terms and policies as necessitated by operational or legal requirements. Updated terms are rendered effective immediately upon publication in the system.
            </p>
          </div>

          {/* Interactive Declaration Agreement */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl shrink-0">
                <FiCheckCircle className="text-xl" />
              </div>
              <div className="space-y-4 w-full">
                <div>
                  <h3 className="text-base font-black tracking-tight text-white">
                    Member Acknowledgment & Consent
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    By checking the agreement box below, you acknowledge that you have thoroughly read, understood, and consented to comply with all operational terms, savings rules, loan regulations, and payment collection schedules enforced by SRM Finance.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                      I accept and agree to all terms
                    </span>
                  </label>

                  {onAccept && (
                    <button
                      disabled={!agreed}
                      onClick={onAccept}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                        agreed
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      Proceed <FiArrowRight />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200/80 text-center py-5 px-4 text-xs font-semibold text-slate-500">
          <p>© 2026 SRM Finance Management System • All Rights Reserved</p>
        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;