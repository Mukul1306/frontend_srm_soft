import React from "react";

import {
  Building2,
  ShieldCheck,
  Target,
  Eye,
  Users,
  Landmark,
  BadgeCheck
} from "lucide-react";

function About() {
  return (
    <>
  

      <div className="max-w-md mx-auto pt-20 pb-24 px-4">

        {/* Header */}

        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 text-white shadow-lg">

          <div className="flex items-center gap-3">

            <div className="bg-white/20 p-3 rounded-2xl">
              <Building2 size={30} />
            </div>

            <div>

              <h1 className="text-2xl font-bold">
                About SRM Finance
              </h1>

              <p className="text-blue-100 text-sm mt-1">
                Trusted Financial Services
              </p>

            </div>

          </div>

        </div>

        {/* About */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <h2 className="font-bold text-lg mb-3">
            Who We Are
          </h2>

          <p className="text-gray-600 leading-7 text-sm">

            SRM Finance is a trusted financial organization
            committed to providing secure saving schemes,
            transparent loan services, and customer-friendly
            financial solutions.

            Our objective is to help members build disciplined
            savings while offering reliable financial assistance
            through modern technology.

          </p>

        </div>

        {/* Mission */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <div className="flex items-center gap-3 mb-3">

            <Target className="text-blue-600" />

            <h2 className="font-bold text-lg">
              Our Mission
            </h2>

          </div>

          <p className="text-gray-600 text-sm leading-7">

            To encourage financial discipline, provide
            affordable financial services, and maintain
            complete transparency with every member.

          </p>

        </div>

        {/* Vision */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <div className="flex items-center gap-3 mb-3">

            <Eye className="text-indigo-600" />

            <h2 className="font-bold text-lg">
              Our Vision
            </h2>

          </div>

          <p className="text-gray-600 text-sm leading-7">

            To become one of India's most trusted financial
            organizations by delivering secure, technology-driven
            and transparent financial services.

          </p>

        </div>

        {/* Services */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <div className="flex items-center gap-3 mb-4">

            <Landmark className="text-green-600" />

            <h2 className="font-bold text-lg">
              Our Services
            </h2>

          </div>

          <ul className="space-y-3 text-sm">

            <Service text="Society Saving Scheme" />

            <Service text="Daily Saving Accounts" />

            <Service text="Society Loan Services" />

            <Service text="Finance Loan Services" />

            <Service text="Digital Passbook" />

            <Service text="Loan EMI Collection" />

            <Service text="Saving Collection Tracking" />

            <Service text="Member Portal" />

          </ul>

        </div>

        {/* Why Choose */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <div className="flex items-center gap-3 mb-4">

            <ShieldCheck className="text-blue-700" />

            <h2 className="font-bold text-lg">
              Why Choose SRM Finance?
            </h2>

          </div>

          <ul className="space-y-3 text-sm">

            <Service text="100% Transparent Process" />

            <Service text="Safe & Secure Transactions" />

            <Service text="Experienced Staff" />

            <Service text="Digital Records" />

            <Service text="Quick Customer Support" />

            <Service text="Easy Loan Process" />

            <Service text="Daily Collection Facility" />

            <Service text="Modern Member Portal" />

          </ul>

        </div>

        {/* Company Values */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <div className="flex items-center gap-3 mb-4">

            <Users className="text-purple-600" />

            <h2 className="font-bold text-lg">
              Our Core Values
            </h2>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <Value title="Trust" />

            <Value title="Transparency" />

            <Value title="Integrity" />

            <Value title="Customer First" />

            <Value title="Security" />

            <Value title="Commitment" />

          </div>

        </div>

        {/* Footer */}

        <div className="bg-blue-700 rounded-3xl mt-5 p-6 text-center text-white">

          <BadgeCheck
            size={40}
            className="mx-auto mb-3"
          />

          <h2 className="text-xl font-bold">

            Thank You

          </h2>

          <p className="text-blue-100 mt-2 text-sm leading-6">

            Thank you for choosing SRM Finance.

            We are committed to providing secure,
            transparent, and reliable financial
            services for every member.

          </p>

        </div>

      </div>

    </>
  );
}

function Service({ text }) {

  return (

    <li className="flex items-center gap-3">

      <div className="w-2 h-2 rounded-full bg-blue-600"></div>

      {text}

    </li>

  );

}

function Value({ title }) {

  return (

    <div className="border rounded-2xl p-4 text-center font-semibold bg-slate-50">

      {title}

    </div>

  );

}

export default About;