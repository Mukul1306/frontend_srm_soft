import React, { useState } from "react";

import {
  CircleHelp,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageCircle
} from "lucide-react";

function HelpFaq() {

  const [active, setActive] = useState(null);

  const faqs = [

    {
      question: "How do I check my Daily Saving balance?",
      answer:
        "Open the Saving page from the dashboard. There you can view your total saved amount, pending amount, completed days and collection details."
    },

    {
      question: "How can I view my Passbook?",
      answer:
        "Open the Passbook page to see all your saving transactions, collection dates and payment history."
    },

    {
      question: "How do I check my Loan details?",
      answer:
        "Open the Loan page to view your loan amount, outstanding balance, EMI history, penalties and payment status."
    },

    {
      question: "I forgot my password. What should I do?",
      answer:
        "Please visit the SRM Finance office or contact your authorized collection agent. Password changes are handled by the office."
    },

    {
      question: "Can I update my mobile number or address?",
      answer:
        "Yes. Visit the SRM Finance office with valid identification documents to request profile updates."
    },

    {
      question: "Why was a penalty charged?",
      answer:
        "Penalty is automatically calculated according to the company's approved penalty policy whenever payments are delayed beyond the allowed due period."
    },

    {
      question: "Can I close my Saving account early?",
      answer:
        "Yes. Please contact the SRM Finance office. Early closure will follow company policies and approval."
    },

    {
      question: "Can I repay my Loan before maturity?",
      answer:
        "Yes. Early repayment is subject to company rules and approval from SRM Finance."
    },

    {
      question: "My transaction is missing. What should I do?",
      answer:
        "Please contact the office immediately with your receipt number or payment details so that our team can verify the transaction."
    },

    {
      question: "Where can I read all company rules?",
      answer:
        "Open the Terms & Conditions page from the menu to view all company policies."
    }

  ];

  return (

    <>
    

      <div className="max-w-md mx-auto pt-20 pb-24 px-4">

        {/* Header */}

        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-6 text-white shadow-lg">

          <div className="flex items-center gap-3">

            <CircleHelp size={32} />

            <div>

              <h1 className="text-2xl font-bold">

                Help & FAQ

              </h1>

              <p className="text-blue-100 text-sm mt-1">

                Frequently Asked Questions

              </p>

            </div>

          </div>

        </div>

        {/* FAQ */}

        <div className="mt-5 space-y-4">

          {faqs.map((faq, index) => (

            <div
              key={index}
              className="bg-white rounded-2xl shadow"
            >

              <button
                onClick={() =>
                  setActive(
                    active === index ? null : index
                  )
                }
                className="w-full flex justify-between items-center p-5 text-left"
              >

                <h2 className="font-semibold text-gray-800 pr-3">

                  {faq.question}

                </h2>

                {

                  active === index

                  ?

                  <ChevronUp />

                  :

                  <ChevronDown />

                }

              </button>

              {

                active === index &&

                <div className="px-5 pb-5 text-gray-600 leading-7 text-sm">

                  {faq.answer}

                </div>

              }

            </div>

          ))}

        </div>

        {/* Support */}

        <div className="bg-white rounded-3xl shadow mt-6 p-5">

          <h2 className="text-lg font-bold mb-4">

            Need More Help?

          </h2>

          <div className="space-y-4">

            <SupportRow
              icon={<Phone size={20} />}
              title="Call Support"
              value="+91 9876543210"
            />

            <SupportRow
              icon={<Mail size={20} />}
              title="Email Support"
              value="support@srmfinance.in"
            />

            <SupportRow
              icon={<MessageCircle size={20} />}
              title="Office Visit"
              value="Visit your nearest SRM Finance Office"
            />

          </div>

        </div>

        {/* Footer */}

        <div className="bg-blue-700 rounded-3xl mt-6 p-6 text-center text-white">

          <CircleHelp
            size={36}
            className="mx-auto mb-3"
          />

          <h2 className="text-xl font-bold">

            We're Here To Help

          </h2>

          <p className="text-blue-100 mt-2 text-sm leading-6">

            Our support team is committed to helping you with
            your Saving Account, Loan, Passbook and other
            financial services.

          </p>

        </div>

      </div>

    </>
  );

}

function SupportRow({

  icon,
  title,
  value

}) {

  return (

    <div className="flex items-center gap-4 border rounded-2xl p-4">

      <div className="bg-blue-100 p-3 rounded-xl text-blue-700">

        {icon}

      </div>

      <div>

        <h3 className="font-semibold">

          {title}

        </h3>

        <p className="text-sm text-gray-600">

          {value}

        </p>

      </div>

    </div>

  );

}

export default HelpFaq;