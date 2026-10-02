import React from "react";

import {
  ShieldCheck,
  Lock,
  Database,
  UserCheck,
  Eye,
  FileText,
  BadgeCheck
} from "lucide-react";

function PrivacyPolicy() {
  return (
    <>
     

      <div className="max-w-md mx-auto pt-20 pb-24 px-4">

        {/* Header */}

        <div className="bg-gradient-to-r from-indigo-700 to-blue-700 rounded-3xl p-6 text-white shadow-lg">

          <div className="flex items-center gap-3">

            <div className="bg-white/20 p-3 rounded-2xl">
              <ShieldCheck size={30} />
            </div>

            <div>

              <h1 className="text-2xl font-bold">
                Privacy Policy
              </h1>

              <p className="text-blue-100 text-sm mt-1">
                Your Privacy Matters
              </p>

            </div>

          </div>

        </div>

        {/* Introduction */}

        <Section
          icon={<FileText className="text-blue-700" />}
          title="Introduction"
        >

          SRM Finance respects your privacy and is committed to
          protecting your personal information. This Privacy Policy
          explains how we collect, use, store and protect your data.

        </Section>

        {/* Information */}

        <Section
          icon={<Database className="text-green-600" />}
          title="Information We Collect"
        >

          <ul className="space-y-2 text-gray-600 text-sm">

            <li>• Member Name</li>

            <li>• Mobile Number</li>

            <li>• Address</li>

            <li>• Aadhaar Details</li>

            <li>• PAN Details</li>

            <li>• Nominee Information</li>

            <li>• Saving Account Details</li>

            <li>• Loan Information</li>

            <li>• Transaction History</li>

          </ul>

        </Section>

        {/* Use */}

        <Section
          icon={<UserCheck className="text-purple-600" />}
          title="How We Use Your Information"
        >

          <ul className="space-y-2 text-gray-600 text-sm">

            <li>• Account Verification</li>

            <li>• Saving Management</li>

            <li>• Loan Processing</li>

            <li>• Collection Records</li>

            <li>• Customer Support</li>

            <li>• Notifications</li>

            <li>• Legal Compliance</li>

          </ul>

        </Section>

        {/* Security */}

        <Section
          icon={<Lock className="text-red-600" />}
          title="Data Security"
        >

          SRM Finance uses reasonable administrative and technical
          measures to protect your personal information against
          unauthorized access, misuse, alteration or disclosure.

        </Section>

        {/* Sharing */}

        <Section
          icon={<Eye className="text-orange-600" />}
          title="Information Sharing"
        >

          We never sell or rent your personal information.

          Information may only be shared when:

          <ul className="space-y-2 mt-3 text-gray-600 text-sm">

            <li>• Required by law</li>

            <li>• Financial verification is necessary</li>

            <li>• Customer provides written authorization</li>

          </ul>

        </Section>

        {/* Rights */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <h2 className="font-bold text-lg mb-4">

            Your Rights

          </h2>

          <div className="grid grid-cols-2 gap-3">

            <RightCard title="View Profile" />

            <RightCard title="View Passbook" />

            <RightCard title="View Loan" />

            <RightCard title="Contact Support" />

            <RightCard title="Report Errors" />

            <RightCard title="Request Assistance" />

          </div>

        </div>

        {/* Policy */}

        <Section
          icon={<BadgeCheck className="text-green-700" />}
          title="Policy Updates"
        >

          SRM Finance may update this Privacy Policy whenever
          necessary.

          Updated versions will always be available inside the
          application.

        </Section>

        {/* Footer */}

        <div className="bg-blue-700 rounded-3xl mt-5 p-6 text-center text-white">

          <h2 className="text-xl font-bold">

            Last Updated

          </h2>

          <p className="text-blue-100 mt-2">

            January 2026

          </p>

          <p className="text-blue-200 text-sm mt-4">

            © SRM Finance. All Rights Reserved.

          </p>

        </div>

      </div>
    </>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-white rounded-3xl shadow mt-5 p-5">

      <div className="flex items-center gap-3 mb-4">

        {icon}

        <h2 className="font-bold text-lg">

          {title}

        </h2>

      </div>

      <div className="text-gray-600 leading-7 text-sm">

        {children}

      </div>

    </div>
  );
}

function RightCard({ title }) {
  return (
    <div className="bg-slate-50 border rounded-2xl p-4 text-center font-semibold text-sm">
      {title}
    </div>
  );
}

export default PrivacyPolicy;