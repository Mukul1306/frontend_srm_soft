import React from "react";

import {
  Building2,
  Phone,
  Smartphone,
  Mail,
  MapPin,
  Clock
} from "lucide-react";

function ContactUs() {
  return (
    <>
   

      <div className="max-w-md mx-auto pt-20 pb-24 px-4">

        {/* Header */}

        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-6 text-white shadow-lg">

          <h1 className="text-3xl font-bold">
            Contact Us
          </h1>

          <p className="mt-2 text-blue-100">
            SRM Finance Customer Support
          </p>

        </div>

        {/* Office Details */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <h2 className="text-xl font-bold mb-5">
            Office Information
          </h2>

          <InfoRow
            icon={<Building2 size={20} />}
            title="Company"
            value="SRM Finance"
          />

          <InfoRow
            icon={<MapPin size={20} />}
            title="Office Address"
            value="Manpur, Dausa, Rajasthan - 303509"
          />

          <InfoRow
            icon={<Clock size={20} />}
            title="Working Hours"
            value="Monday - Saturday (10:00 AM - 6:00 PM)"
          />

        </div>

        {/* Contact */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <h2 className="text-xl font-bold mb-5">
            Contact Details
          </h2>

          <InfoRow
            icon={<Phone size={20} />}
            title="Office Number"
                value="+91 8696755781"
          />

          <InfoRow
            icon={<Smartphone size={20} />}
            title="Mobile Number"
            value="+91 8696755781"
          />

          <InfoRow
            icon={<Phone size={20} />}
            title="Helpline Number"
            value="Now  Not Available"
          />

          <InfoRow
            icon={<Mail size={20} />}
            title="Email"
            value="support@srmfinance.online"
          />

        </div>

        {/* Footer */}

        <div className="bg-blue-50 border border-blue-200 rounded-3xl mt-5 p-5">

          <h3 className="font-bold text-blue-700">
            Need Help?
          </h3>

          <p className="text-sm text-gray-600 mt-2">
            If you have any questions regarding your Daily Saving,
            Society Account, Loan, EMI, or Passbook, please contact
            our customer support team during office hours.
          </p>

        </div>

      </div>
    </>
  );
}

function InfoRow({

  icon,
  title,
  value

}) {

  return (

    <div className="flex items-start gap-4 py-4 border-b last:border-none">

      <div className="bg-blue-100 p-3 rounded-xl text-blue-700">

        {icon}

      </div>

      <div>

        <h3 className="font-semibold">

          {title}

        </h3>

        <p className="text-gray-600 text-sm mt-1">

          {value}

        </p>

      </div>

    </div>

  );

}

export default ContactUs;