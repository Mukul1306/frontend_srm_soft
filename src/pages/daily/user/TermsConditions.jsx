import React, { useState } from "react";
import { FileText } from "lucide-react";

function TermsConditions() {

  const [tab, setTab] = useState("dailySaving");

  const tabs = [
    {
      id: "societySaving",
      title: "Society Saving",
    },
    {
      id: "societyLoan",
      title: "Society Loan",
    },
    {
      id: "dailySaving",
      title: "Daily Saving",
    },
    {
      id: "financeLoan",
      title: "Finance Loan",
    },
  ];

  const content = {

    societySaving: [

      "Monthly installment must be deposited before the due date.",

      "Late payment may attract penalties.",

      "Membership is non-transferable.",

      "Members must provide genuine documents.",

      "Refunds will follow company policy.",

      "Company reserves the right to modify schemes.",

      "Member should preserve all receipts safely.",

      "All disputes are subject to local jurisdiction.",

      "Company decisions shall be final.",

      "Members agree to all Society Saving rules."

    ],

    societyLoan: [

      "Loan approval depends upon company verification.",

      "EMI must be paid on or before the due date.",

      "Penalty will apply for delayed EMI.",

      "Borrower must provide genuine documents.",

      "Loan cannot be transferred.",

      "Company may reject any application.",

      "Loan closure requires full repayment.",

      "Legal action may be taken for default.",

      "Company reserves the right to recover dues.",

      "Borrower accepts all loan conditions."

    ],

    dailySaving: [

      "Daily amount should be deposited regularly.",

      "Delay in payment may attract penalty.",

      "Payments should be made only to authorized staff.",

      "Members must collect payment receipts.",

      "Member should keep mobile number updated.",

      "Company may modify saving rules anytime.",

      "Fraudulent activities may suspend membership.",

      "Savings are managed according to company policy.",

      "Company is not responsible for incorrect member information.",

      "Company decisions are final."

    ],

    financeLoan: [

      "Interest rate will be applicable as per agreement.",

      "EMI must be paid before due date.",

      "Penalty applies for delayed payment.",

      "Guarantor information must be correct.",

      "Borrower should maintain updated contact details.",

      "Company may verify all submitted documents.",

      "Loan closure requires complete payment.",

      "Company reserves legal recovery rights.",

      "Prepayment conditions follow company policy.",

      "Borrower agrees to all Finance Loan rules."

    ]

  };

  return (

    <>

      <div className="max-w-md mx-auto pt-20 pb-24 px-4">

        {/* Header */}

        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-6 text-white shadow-lg">

          <div className="flex items-center gap-3">

            <FileText size={32} />

            <div>

              <h1 className="text-2xl font-bold">
                Terms & Conditions
              </h1>

              <p className="text-blue-100 text-sm mt-1">
                SRM Finance Rules & Policies
              </p>

            </div>

          </div>

        </div>

        {/* Tabs */}

        <div className="grid grid-cols-2 gap-3 mt-5">

          {tabs.map((item) => (

            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-2xl p-3 text-sm font-semibold transition ${
                tab === item.id
                  ? "bg-blue-700 text-white"
                  : "bg-white shadow text-gray-700"
              }`}
            >
              {item.title}
            </button>

          ))}

        </div>

        {/* Content */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <h2 className="text-xl font-bold mb-5">

            {tabs.find(t => t.id === tab)?.title}

          </h2>

          <div className="space-y-4">

            {content[tab].map((item, index) => (

              <div
                key={index}
                className="flex items-start gap-3 border-b pb-3"
              >

                <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">

                  {index + 1}

                </div>

                <p className="text-gray-700 leading-6">

                  {item}

                </p>

              </div>

            ))}

          </div>

        </div>

        {/* Footer */}

        <div className="bg-blue-700 rounded-3xl mt-5 p-5 text-center text-white">

          <h2 className="font-bold text-lg">

            Important Notice

          </h2>

          <p className="text-blue-100 text-sm mt-2 leading-6">

            By using SRM Finance services,
            every member agrees to follow
            the above Terms & Conditions.

            The company reserves the right
            to update these policies whenever
            necessary.

          </p>

        </div>

      </div>

    </>
  );

}

export default TermsConditions;