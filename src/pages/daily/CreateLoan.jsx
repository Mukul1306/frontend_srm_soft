import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";
import {
  Building2,
  User,
  Phone,
  MapPin,
  IndianRupee,
  Percent,
  ShieldCheck,
  FileText,
  Users,
  Calculator
} from "lucide-react";

function CreateLoan() {
  const [search, setSearch] = useState("");
const [searchResults, setSearchResults] = useState([]);
  const [memberData, setMemberData] = useState(null);
const { id } = useParams();

const isEdit = Boolean(id);
  const [summary, setSummary] = useState({
    interest: 0,
    totalPayable: 0,
    emi: 0
  });

  const [loading, setLoading] = useState(false);

 const [form, setForm] = useState({
    member: "",
    loanType: "DAILY",
    loanAmount: "",
    loanTenureMonths: 10,
    interestRate: 2,
    durationDays: "",
    durationWeeks: "",
    durationMonths: "",
    nomineeName: "",
    nomineeMobile: "",
    aadhaarNumber: "",
    panNumber: "",
    loanDate: new Date().toISOString().split("T")[0],

gracePeriod: 3,

penaltyType: "PERCENTAGE",

penaltyValue: 2,

processingFee: 0,

insuranceAmount: 0,

fileCharge: 0,

otherCharges: 0,

disbursementMode: "CASH",

loanPurpose: "",

agentRemarks: "",

    cheque1Number: "",
    cheque2Number: "",
    passportPhoto: false,
    aadhaarSubmitted: false,
    panSubmitted: false,
    chequeSubmitted: false,
    stampPaperSubmitted: false,
    securityType: "UNSECURED",
    securityDetails: "",

    guarantor1Name: "",
    guarantor1Father: "",
    guarantor1Gender: "",
    guarantor1Dob: "",
    guarantor1Mobile: "",
    guarantor1AlternateMobile: "",
    guarantor1Email: "",
    guarantor1Address: "",
    guarantor1Village: "",
    guarantor1District: "",
    guarantor1State: "",
    guarantor1PinCode: "",
    guarantor1Aadhaar: "",
    guarantor1Pan: "",
    guarantor1ChequeNo: "",
    guarantor1Passport: false,
    guarantor1AadhaarSubmitted: false,
    guarantor1PanSubmitted: false,
    guarantor1ChequeSubmitted: false,
    guarantor1StampPaper: false,

    guarantor2Name: "",
    guarantor2Father: "",
    guarantor2Gender: "",
    guarantor2Dob: "",
    guarantor2Mobile: "",
    guarantor2AlternateMobile: "",
    guarantor2Email: "",
    guarantor2Address: "",
    guarantor2Village: "",
    guarantor2District: "",
    guarantor2State: "",
    guarantor2PinCode: "",
    guarantor2Aadhaar: "",
    guarantor2Pan: "",
    guarantor2ChequeNo: "",
    guarantor2Passport: false,
    guarantor2AadhaarSubmitted: false,
    guarantor2PanSubmitted: false,
    guarantor2ChequeSubmitted: false,
    guarantor2StampPaper: false,

    remarks: ""
  });
useEffect(() => {
  if (isEdit) {
    fetchLoan();
  }
}, [id]);

  useEffect(() => {
    calculateLoan();
  }, [
    form.loanAmount,
    form.interestRate,
    form.loanType,
    form.durationDays,
    form.durationWeeks,
    form.durationMonths
  ]);


const loadMember = async (memberId) => {
  if (!memberId) {
    setMemberData(null);

    setForm(prev => ({
      ...prev,
      member: ""
    }));

    return;
  }

  try {
    const res = await axios.get(
      `https://finance-project-0qqk.onrender.com/api/daily/member/${memberId}`
    );

    const member = res.data.member;

    console.log("SELECTED MEMBER:", member);

    setMemberData(member);

    setForm(prev => ({
      ...prev,
      member: memberId
    }));

  } catch (error) {
    console.error("MEMBER LOAD ERROR:", error);
    alert(
      error.response?.data?.message ||
      "Unable to load member details."
    );
  }
};


  const calculateLoan = () => {
    const amount = Number(form.loanAmount);
    const rate = Number(form.interestRate);

    if (!amount || !rate) {
      setSummary({ interest: 0, totalPayable: 0, emi: 0 });
      return;
    }

    let interest = 0;
    let total = 0;
    let emi = 0;

    if (form.loanType === "DAILY") {
      const days = Number(form.durationDays);
      const months = days / 30;
      interest = (amount * rate * months) / 100;
      total = amount + interest;
      emi = days ? Math.ceil(total / days) : 0;
    }

   if (form.loanType === "WEEKLY") {

    const weeks = Number(form.durationWeeks);

    const tenure = Number(form.loanTenureMonths);

    interest =
        (amount * rate * tenure) / 100;

    total =
        amount + interest;

    emi =
        weeks
        ? Math.ceil(total / weeks)
        : 0;
}

    if (form.loanType === "MONTHLY") {
      const months = Number(form.durationMonths);
      interest = (amount * rate * months) / 100;
      total = amount + interest;
      emi = months ? Math.ceil(total / months) : 0;
    }

    if (form.loanType === "FIXED") {
      const months = Number(form.durationMonths);
      interest = (amount * rate) / 100;
      total = amount;
      emi = interest;
    }

    setSummary({ interest, totalPayable: total, emi });
  };

 const fetchLoan = async () => {
  try {
    setLoading(true);

    const res = await axios.get(
      `https://finance-project-0qqk.onrender.com/api/daily/loan/${id}`
    );

    const loan = res.data.loan;

    console.log("EDIT LOAN DATA:", loan);

    // -----------------------------
    // MEMBER DETAILS
    // -----------------------------
    setMemberData({
      memberName: loan.borrowerName || "",
      fatherName: loan.fatherName || "",
      mobile: loan.mobile || "",
      memberId:
        loan.member?.memberId ||
        loan.memberId ||
        ""
    });

   

    // -----------------------------
    // COMPLETE FORM
    // -----------------------------
    setForm(prev => ({
      ...prev,

      // Member
      member:
        typeof loan.member === "object"
          ? loan.member?._id
          : loan.member || "",


      // Loan
      loanType: loan.loanType || "DAILY",
      loanAmount: loan.loanAmount ?? "",
      loanTenureMonths: loan.loanTenureMonths ?? 10,
      interestRate: loan.interestRate ?? 2,

      durationDays: loan.durationDays ?? "",
      durationWeeks: loan.durationWeeks ?? "",
      durationMonths: loan.durationMonths ?? "",

      // Nominee
      nomineeName: loan.nomineeName || "",
      nomineeMobile: loan.nomineeMobile || "",

      // KYC
      aadhaarNumber: loan.aadhaarNumber || "",
      panNumber: loan.panNumber || "",

      // Date
      loanDate: loan.loanDate
        ? new Date(loan.loanDate).toISOString().split("T")[0]
        : "",

      // Penalty
      gracePeriod: loan.gracePeriod ?? 3,
      penaltyType: loan.penaltyType || "PERCENTAGE",
      penaltyValue: loan.penaltyValue ?? 2,

      // Charges
      processingFee: loan.processingFee ?? 0,
      insuranceAmount: loan.insuranceAmount ?? 0,
      fileCharge: loan.fileCharge ?? 0,
      otherCharges: loan.otherCharges ?? 0,

      // Disbursement
      disbursementMode:
        loan.disbursementMode || "CASH",

      loanPurpose: loan.loanPurpose || "",
      agentRemarks: loan.agentRemarks || "",

      // Cheques
      cheque1Number: loan.cheque1Number || "",
      cheque2Number: loan.cheque2Number || "",

      // Documents
      passportPhoto:
        loan.passportPhotoSubmitted ??
        loan.passportPhoto ??
        false,

      aadhaarSubmitted:
        loan.aadhaarSubmitted ?? false,

      panSubmitted:
        loan.panSubmitted ?? false,

      chequeSubmitted:
        loan.cheque1Submitted ||
        loan.cheque2Submitted ||
        loan.chequeSubmitted ||
        false,

      stampPaperSubmitted:
        loan.stampPaperSubmitted ?? false,

      // Security
      securityType:
        loan.securityType || "UNSECURED",

      securityDetails:
        loan.securityDetails || "",

      // -----------------------------
      // GUARANTOR 1
      // -----------------------------
      guarantor1Name:
        loan.guarantor1Name || "",

      guarantor1Father:
        loan.guarantor1FatherName ||
        loan.guarantor1Father ||
        "",

      guarantor1Gender:
        loan.guarantor1Gender || "",

      guarantor1Dob: loan.guarantor1Dob
        ? new Date(loan.guarantor1Dob)
            .toISOString()
            .split("T")[0]
        : "",

      guarantor1Mobile:
        loan.guarantor1Mobile || "",

      guarantor1AlternateMobile:
        loan.guarantor1AlternateMobile || "",

      guarantor1Email:
        loan.guarantor1Email || "",

      guarantor1Address:
        loan.guarantor1Address || "",

      guarantor1Village:
        loan.guarantor1City ||
        loan.guarantor1Village ||
        "",

      guarantor1District:
        loan.guarantor1District || "",

      guarantor1State:
        loan.guarantor1State || "",

      guarantor1PinCode:
        loan.guarantor1Pincode ||
        loan.guarantor1PinCode ||
        "",

      guarantor1Aadhaar:
        loan.guarantor1AadhaarNumber ||
        loan.guarantor1Aadhaar ||
        "",

      guarantor1Pan:
        loan.guarantor1PanNumber ||
        loan.guarantor1Pan ||
        "",

      guarantor1ChequeNo:
        loan.guarantor1Cheque1Number ||
        loan.guarantor1ChequeNo ||
        "",

      guarantor1Passport:
        loan.guarantor1PhotoSubmitted ||
        loan.guarantor1Passport ||
        false,

      guarantor1AadhaarSubmitted:
        loan.guarantor1AadhaarSubmitted ??
        false,

      guarantor1PanSubmitted:
        loan.guarantor1PanSubmitted ??
        false,

      guarantor1ChequeSubmitted:
        loan.guarantor1Cheque1Submitted ||
        loan.guarantor1ChequeSubmitted ||
        false,

      guarantor1StampPaper:
        loan.guarantor1StampPaperSubmitted ||
        loan.guarantor1StampPaper ||
        false,

      // -----------------------------
      // GUARANTOR 2
      // -----------------------------
      guarantor2Name:
        loan.guarantor2Name || "",

      guarantor2Father:
        loan.guarantor2FatherName ||
        loan.guarantor2Father ||
        "",

      guarantor2Gender:
        loan.guarantor2Gender || "",

      guarantor2Dob: loan.guarantor2Dob
        ? new Date(loan.guarantor2Dob)
            .toISOString()
            .split("T")[0]
        : "",

      guarantor2Mobile:
        loan.guarantor2Mobile || "",

      guarantor2AlternateMobile:
        loan.guarantor2AlternateMobile || "",

      guarantor2Email:
        loan.guarantor2Email || "",

      guarantor2Address:
        loan.guarantor2Address || "",

      guarantor2Village:
        loan.guarantor2City ||
        loan.guarantor2Village ||
        "",

      guarantor2District:
        loan.guarantor2District || "",

      guarantor2State:
        loan.guarantor2State || "",

      guarantor2PinCode:
        loan.guarantor2Pincode ||
        loan.guarantor2PinCode ||
        "",

      guarantor2Aadhaar:
        loan.guarantor2AadhaarNumber ||
        loan.guarantor2Aadhaar ||
        "",

      guarantor2Pan:
        loan.guarantor2PanNumber ||
        loan.guarantor2Pan ||
        "",

      guarantor2ChequeNo:
        loan.guarantor2Cheque1Number ||
        loan.guarantor2ChequeNo ||
        "",

      guarantor2Passport:
        loan.guarantor2PhotoSubmitted ||
        loan.guarantor2Passport ||
        false,

      guarantor2AadhaarSubmitted:
        loan.guarantor2AadhaarSubmitted ??
        false,

      guarantor2PanSubmitted:
        loan.guarantor2PanSubmitted ??
        false,

      guarantor2ChequeSubmitted:
        loan.guarantor2Cheque1Submitted ||
        loan.guarantor2ChequeSubmitted ||
        false,

      guarantor2StampPaper:
        loan.guarantor2StampPaperSubmitted ||
        loan.guarantor2StampPaper ||
        false,

      remarks: loan.remarks || ""
    }));

    // -----------------------------
    // LOAD MEMBER
    // -----------------------------
    if (loan.member?._id) {
      try {
        const memberRes = await axios.get(
          `https://finance-project-0qqk.onrender.com/api/daily/member/${loan.member._id}`
        );

        setMemberData(memberRes.data.member);
      } catch (memberError) {
        console.log(
          "MEMBER LOAD ERROR:",
          memberError
        );
      }
    }

  } catch (err) {
    console.log("FETCH LOAN ERROR:", err);
    alert(
      err.response?.data?.message ||
      "Unable to load loan."
    );
  } finally {
    setLoading(false);
  }
};
  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
     const payload = {

...form,
passportPhotoSubmitted: form.passportPhoto,
cheque1Submitted: form.chequeSubmitted,
cheque2Submitted: form.chequeSubmitted,
guarantor1FatherName: form.guarantor1Father,
guarantor1City: form.guarantor1Village,
guarantor1Pincode: form.guarantor1PinCode,
guarantor1AadhaarNumber: form.guarantor1Aadhaar,
guarantor1PanNumber: form.guarantor1Pan,
guarantor1Cheque1Number: form.guarantor1ChequeNo,
guarantor1Cheque2Number: form.guarantor1ChequeNo,
guarantor1PhotoSubmitted: form.guarantor1Passport,
guarantor1Cheque1Submitted: form.guarantor1ChequeSubmitted,
guarantor1Cheque2Submitted: form.guarantor1ChequeSubmitted,
guarantor1StampPaperSubmitted: form.guarantor1StampPaper,

guarantor2FatherName: form.guarantor2Father,
guarantor2City: form.guarantor2Village,
guarantor2Pincode: form.guarantor2PinCode,
guarantor2AadhaarNumber: form.guarantor2Aadhaar,
guarantor2PanNumber: form.guarantor2Pan,
guarantor2Cheque1Number: form.guarantor2ChequeNo,
guarantor2Cheque2Number: form.guarantor2ChequeNo,
guarantor2PhotoSubmitted: form.guarantor2Passport,
guarantor2Cheque1Submitted: form.guarantor2ChequeSubmitted,
guarantor2Cheque2Submitted: form.guarantor2ChequeSubmitted,
guarantor2StampPaperSubmitted: form.guarantor2StampPaper

};

if (isEdit) {

  await axios.put(
    `https://finance-project-0qqk.onrender.com/api/daily/loan/${id}`,
    payload
  );

  alert("Loan Updated Successfully");

} else {

  await axios.post(
    "https://finance-project-0qqk.onrender.com/api/daily/create-loan",
    payload
  );

  alert("Loan Created Successfully");

}
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const searchMembers = async (keyword) => {

    setSearch(keyword);

    if(keyword.length < 2){

        setSearchResults([]);

        return;

    }

    try{

        const res = await axios.get(

            `https://finance-project-0qqk.onrender.com/api/daily/loan-search/${keyword}`

        );

        setSearchResults(res.data.members);

    }catch(err){

        console.log(err);

    }

};

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={submit} className="space-y-6">
          {/* =======================================
                  MEMBER DETAILS
          ======================================= */}
          <div className="bg-white rounded-2xl shadow border">
            <div className="border-b p-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User size={20} />
                Member Details
              </h2>
            </div>
         <div className="p-6 grid md:grid-cols-2 gap-5">

  <div>
    <label className="font-semibold">
      Search Member
    </label>

    <input
      type="text"
      placeholder="Enter Member ID / Name / Mobile"
      value={search}
      onChange={(e) => searchMembers(e.target.value)}
      className="w-full border rounded-xl p-3 mt-2"
    />
  </div>

  <div>
    <label className="font-semibold">
      Select Member
    </label>

    <select
      className="w-full border rounded-xl p-3 mt-2"
      value={form.member}
      onChange={(e) => loadMember(e.target.value)}
    >
      <option value="">
        Select Member
      </option>

  {searchResults.map((item) => (
  <option
    key={item._id}
    value={item._id}
  >
    {item.memberId} - {item.memberName} ({item.mobile})
  </option>
))}
    </select>
  </div>

</div>

          {memberData && (
  <div className="grid md:grid-cols-6 gap-5 px-6 pb-6">

    <div>
      <p className="text-xs text-slate-400">Member Name</p>
      <h3 className="font-bold">
        {memberData.memberName}
      </h3>
    </div>

    <div>
      <p className="text-xs text-slate-400">Father Name</p>
      <h3 className="font-bold">
        {memberData.fatherName}
      </h3>
    </div>

    <div>
      <p className="text-xs text-slate-400">Mobile</p>
      <h3 className="font-bold">
        {memberData.mobile}
      </h3>
    </div>

    <div>
      <p className="text-xs text-slate-400">Member ID</p>
      <h3 className="font-bold">
        {memberData.memberId}
      </h3>
    </div>

    <div>
      <p className="text-xs text-slate-400">Area</p>
      <h3 className="font-bold">
        {memberData.areaGroup?.areaName || "Not Assigned"}
      </h3>
    </div>

    <div>
      <p className="text-xs text-slate-400">Assigned Agent</p>
      <h3 className="font-bold">
        {memberData.assignedAgent?.name || "Not Assigned"}
      </h3>
    </div>

  </div>
)}
          </div>



          {/* =======================================
                  LOAN DETAILS
          ======================================= */}
          <div className="bg-white rounded-2xl shadow border">
            <div className="border-b p-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calculator size={20} />
                {isEdit ? "Edit Loan" : "Create Loan"}
              </h2>
            </div>
            <div className="p-6 grid md:grid-cols-4 gap-5">
              <div>
                <label>Loan Type</label>
                <select
                  value={form.loanType}
                  onChange={(e) => setForm({ ...form, loanType: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-2"
                >
                  <option value="DAILY">Daily Loan EMI</option>
                  <option value="WEEKLY">Weekly Loan  EMI</option>
                  <option value="MONTHLY">Monthly Loan  EMI</option>
                  <option value="FIXED">Fixed Loan EMI</option>
                </select>
              </div>
              <div>
                <label>Loan Amount</label>
                <input
                  type="number"
                  value={form.loanAmount}
                  onChange={(e) => setForm({ ...form, loanAmount: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-2"
                >
                </input>
              </div>
              <div>
  <label>Loan Tenure (Months)</label>

  <input
    type="number"
    min="1"
    value={form.loanTenureMonths}
    onChange={(e) =>
      setForm({
        ...form,
        loanTenureMonths: e.target.value
      })
    }
  />
</div>
              <div>
                <label>Interest %</label>
                <input
                  type="number"
                  value={form.interestRate}
                  onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-2"
                />
              </div>

              {form.loanType === "DAILY" && (
                <div>
                  <label>Days</label>
                  <input
                    type="number"
                    value={form.durationDays}
                    onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                    className="w-full border rounded-xl p-3 mt-2"
                  />
                </div>
              )}

              {form.loanType === "WEEKLY" && (
                <div>
                  <label>Weeks</label>
                  <input
                    type="number"
                    value={form.durationWeeks}
                    onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })}
                    className="w-full border rounded-xl p-3 mt-2"
                  />
                </div>
              )}

              {(form.loanType === "MONTHLY" || form.loanType === "FIXED") && (
                <div>
                  <label>Months</label>
                  <input
                    type="number"
                    value={form.durationMonths}
                    onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
                    className="w-full border rounded-xl p-3 mt-2"
                  />
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-5 px-6 pb-6">
              <div className="bg-blue-50 rounded-xl p-5">
                <p className="text-slate-500">Interest</p>
                <h2 className="text-3xl font-bold text-blue-700">
                  ₹{summary.interest.toLocaleString("en-IN")}
                </h2>
              </div>
<div>
<label>Penalty Type</label>

<select
value={form.penaltyType}
onChange={(e)=>
setForm({
...form,
penaltyType:e.target.value
})
}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="PERCENTAGE">
Percentage
</option>

<option value="FIXED">
Fixed Amount
</option>

</select>
</div>
<div>
<label>

Penalty Value

</label>

<input

type="number"

value={form.penaltyValue}

onChange={(e)=>

setForm({

...form,

penaltyValue:e.target.value

})

}

className="w-full border rounded-xl p-3 mt-2"

/>

</div>


              <div>
  <label>Loan Date</label>

  <input
    type="date"
    value={form.loanDate}
    onChange={(e)=>
      setForm({
        ...form,
        loanDate:e.target.value
      })
    }
    className="w-full border rounded-xl p-3 mt-2"
  />
</div>
<div>
  <label>Grace Period</label>

  <input
    type="number"
    value={form.gracePeriod}
    onChange={(e)=>
      setForm({
        ...form,
        gracePeriod:e.target.value
      })
    }
    className="w-full border rounded-xl p-3 mt-2"
  />

  <p className="text-xs text-gray-500 mt-1">
    Grace days before penalty starts.
  </p>
</div>


              <div className="bg-green-50 rounded-xl p-5">
                <p className="text-slate-500">Total Payable</p>
                <h2 className="text-3xl font-bold text-green-700">
                  ₹{summary.totalPayable.toLocaleString("en-IN")}
                </h2>
              </div>
              <div className="bg-orange-50 rounded-xl p-5">
                <p className="text-slate-500">EMI</p>
                <h2 className="text-3xl font-bold text-orange-700">
                  ₹{summary.emi.toLocaleString("en-IN")}
                </h2>
              </div>
            </div>
          </div>

          {/* =======================================
                  NOMINEE DETAILS
          ======================================= */}
          <div className="bg-white rounded-2xl shadow border">
            <div className="border-b p-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users size={20} />
                Nominee Details (Optional)
              </h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-5">
              <div>
                <label>Nominee Name</label>
                <input
                  type="text"
                  value={form.nomineeName}
                  onChange={(e) => setForm({ ...form, nomineeName: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-2"
                />
              </div>
              <div>
                <label>Nominee Mobile</label>
                <input
                  type="text"
                  value={form.nomineeMobile}
                  onChange={(e) => setForm({ ...form, nomineeMobile: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-2"
                />
              </div>
            </div>
          </div>

          {/* =======================================
                CUSTOMER DOCUMENTS
          ======================================= */}
          <div className="bg-white rounded-2xl shadow border">
            <div className="border-b p-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText size={20} />
                Customer Documents
              </h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-5">
              <div>
                <label>Aadhaar Number</label>
                <input
                  type="text"
                  value={form.aadhaarNumber}
                  onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-2"
                />
              </div>
              <div>
                <label>PAN Number</label>
                <input
                  type="text"
                  value={form.panNumber}
                  onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-2"
                />
              </div>
              <div>
                <label>Cheque Number 1</label>
                <input
                  type="text"
                  value={form.cheque1Number}
                  onChange={(e) => setForm({ ...form, cheque1Number: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-2"
                />
              </div>
              <div>
                <label>Cheque Number 2</label>
                <input
                  type="text"
                  value={form.cheque2Number}
                  onChange={(e) => setForm({ ...form, cheque2Number: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 px-6 pb-6">
              <label className="flex items-center gap-3 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.passportPhoto}
                  onChange={(e) => setForm({ ...form, passportPhoto: e.target.checked })}
                />
                2 Passport Photos Received
              </label>
              <label className="flex items-center gap-3 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.aadhaarSubmitted}
                  onChange={(e) => setForm({ ...form, aadhaarSubmitted: e.target.checked })}
                />
                Aadhaar Copy Received
              </label>
              <label className="flex items-center gap-3 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.panSubmitted}
                  onChange={(e) => setForm({ ...form, panSubmitted: e.target.checked })}
                />
                PAN Copy Received
              </label>
              <label className="flex items-center gap-3 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.chequeSubmitted}
                  onChange={(e) => setForm({ ...form, chequeSubmitted: e.target.checked })}
                />
                2 Blank Signed Cheques
              </label>
              <label className="flex items-center gap-3 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.stampPaperSubmitted}
                  onChange={(e) => setForm({ ...form, stampPaperSubmitted: e.target.checked })}
                />
                Stamp Paper Received
              </label>
            </div>
          </div>

          {/* =======================================
                    SECURITY DETAILS
          ======================================= */}
          <div className="bg-white rounded-2xl shadow border">
            <div className="border-b p-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck size={20} />
                Security Details
              </h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-5">
              <div>
                <label>Loan Security</label>
                <select
                  value={form.securityType}
                  onChange={(e) => setForm({ ...form, securityType: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-2"
                >
                  <option value="UNSECURED">Unsecured Loan</option>
                  <option value="SECURED">Secured Loan</option>
                </select>
              </div>

              {form.securityType === "SECURED" && (
                <div>
                  <label>Security Given</label>
                  <input
                    type="text"
                    placeholder="Gold / Property / Vehicle"
                    value={form.securityDetails}
                    onChange={(e) => setForm({ ...form, securityDetails: e.target.value })}
                    className="w-full border rounded-xl p-3 mt-2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* =======================================
                  GUARANTOR 1
          ======================================= */}
          <div className="bg-white rounded-2xl shadow border">
            <div className="border-b p-5">
              <h2 className="text-xl font-bold">Guarantor 1 (Optional)</h2>
            </div>
            <div className="p-6 grid md:grid-cols-3 gap-5">
              <input
                type="text"
                placeholder="Name"
                value={form.guarantor1Name}
                onChange={(e) => setForm({ ...form, guarantor1Name: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Father / Husband Name"
                value={form.guarantor1Father}
                onChange={(e) => setForm({ ...form, guarantor1Father: e.target.value })}
                className="border rounded-xl p-3"
              />
              <select
                value={form.guarantor1Gender}
                onChange={(e) => setForm({ ...form, guarantor1Gender: e.target.value })}
                className="border rounded-xl p-3"
              >
                <option value="">Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <input
                type="date"
                value={form.guarantor1Dob}
                onChange={(e) => setForm({ ...form, guarantor1Dob: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Mobile"
                value={form.guarantor1Mobile}
                onChange={(e) => setForm({ ...form, guarantor1Mobile: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Alternate Mobile"
                value={form.guarantor1AlternateMobile}
                onChange={(e) => setForm({ ...form, guarantor1AlternateMobile: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.guarantor1Email}
                onChange={(e) => setForm({ ...form, guarantor1Email: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Full Address"
                value={form.guarantor1Address}
                onChange={(e) => setForm({ ...form, guarantor1Address: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Village / City"
                value={form.guarantor1Village}
                onChange={(e) => setForm({ ...form, guarantor1Village: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="District"
                value={form.guarantor1District}
                onChange={(e) => setForm({ ...form, guarantor1District: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="State"
                value={form.guarantor1State}
                onChange={(e) => setForm({ ...form, guarantor1State: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="PIN Code"
                value={form.guarantor1PinCode}
                onChange={(e) => setForm({ ...form, guarantor1PinCode: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Aadhaar Number"
                value={form.guarantor1Aadhaar}
                onChange={(e) => setForm({ ...form, guarantor1Aadhaar: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="PAN Number"
                value={form.guarantor1Pan}
                onChange={(e) => setForm({ ...form, guarantor1Pan: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Cheque Number"
                value={form.guarantor1ChequeNo}
                onChange={(e) => setForm({ ...form, guarantor1ChequeNo: e.target.value })}
                className="border rounded-xl p-3"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4 px-6 pb-6">
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.guarantor1Passport}
                  onChange={(e) => setForm({ ...form, guarantor1Passport: e.target.checked })}
                />
                Passport Photos
              </label>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.guarantor1AadhaarSubmitted}
                  onChange={(e) => setForm({ ...form, guarantor1AadhaarSubmitted: e.target.checked })}
                />
                Aadhaar Received
              </label>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.guarantor1PanSubmitted}
                  onChange={(e) => setForm({ ...form, guarantor1PanSubmitted: e.target.checked })}
                />
                PAN Received
              </label>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.guarantor1ChequeSubmitted}
                  onChange={(e) => setForm({ ...form, guarantor1ChequeSubmitted: e.target.checked })}
                />
                Blank Cheques
              </label>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.guarantor1StampPaper}
                  onChange={(e) => setForm({ ...form, guarantor1StampPaper: e.target.checked })}
                />
                Stamp Paper
              </label>
            </div>
          </div>

          {/* =======================================
                  GUARANTOR 2
          ======================================= */}
          <div className="bg-white rounded-2xl shadow border">
            <div className="border-b p-5">
              <h2 className="text-xl font-bold">Guarantor 2 (Optional)</h2>
            </div>
            <div className="p-6 grid md:grid-cols-3 gap-5">
              <input
                type="text"
                placeholder="Name"
                value={form.guarantor2Name}
                onChange={(e) => setForm({ ...form, guarantor2Name: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Father / Husband Name"
                value={form.guarantor2Father}
                onChange={(e) => setForm({ ...form, guarantor2Father: e.target.value })}
                className="border rounded-xl p-3"
              />
              <select
                value={form.guarantor2Gender}
                onChange={(e) => setForm({ ...form, guarantor2Gender: e.target.value })}
                className="border rounded-xl p-3"
              >
                <option value="">Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <input
                type="date"
                value={form.guarantor2Dob}
                onChange={(e) => setForm({ ...form, guarantor2Dob: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Mobile"
                value={form.guarantor2Mobile}
                onChange={(e) => setForm({ ...form, guarantor2Mobile: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Alternate Mobile"
                value={form.guarantor2AlternateMobile}
                onChange={(e) => setForm({ ...form, guarantor2AlternateMobile: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.guarantor2Email}
                onChange={(e) => setForm({ ...form, guarantor2Email: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Full Address"
                value={form.guarantor2Address}
                onChange={(e) => setForm({ ...form, guarantor2Address: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Village / City"
                value={form.guarantor2Village}
                onChange={(e) => setForm({ ...form, guarantor2Village: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="District"
                value={form.guarantor2District}
                onChange={(e) => setForm({ ...form, guarantor2District: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="State"
                value={form.guarantor2State}
                onChange={(e) => setForm({ ...form, guarantor2State: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="PIN Code"
                value={form.guarantor2PinCode}
                onChange={(e) => setForm({ ...form, guarantor2PinCode: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Aadhaar Number"
                value={form.guarantor2Aadhaar}
                onChange={(e) => setForm({ ...form, guarantor2Aadhaar: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="PAN Number"
                value={form.guarantor2Pan}
                onChange={(e) => setForm({ ...form, guarantor2Pan: e.target.value })}
                className="border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Cheque Number"
                value={form.guarantor2ChequeNo}
                onChange={(e) => setForm({ ...form, guarantor2ChequeNo: e.target.value })}
                className="border rounded-xl p-3"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4 px-6 pb-6">
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.guarantor2Passport}
                  onChange={(e) => setForm({ ...form, guarantor2Passport: e.target.checked })}
                />
                Passport Photos
              </label>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.guarantor2AadhaarSubmitted}
                  onChange={(e) => setForm({ ...form, guarantor2AadhaarSubmitted: e.target.checked })}
                />
                Aadhaar Received
              </label>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.guarantor2PanSubmitted}
                  onChange={(e) => setForm({ ...form, guarantor2PanSubmitted: e.target.checked })}
                />
                PAN Received
              </label>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.guarantor2ChequeSubmitted}
                  onChange={(e) => setForm({ ...form, guarantor2ChequeSubmitted: e.target.checked })}
                />
                Blank Cheques
              </label>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={form.guarantor2StampPaper}
                  onChange={(e) => setForm({ ...form, guarantor2StampPaper: e.target.checked })}
                />
                Stamp Paper
              </label>
            </div>
          </div>

          {/* =======================================
                  LOAN REMARKS
          ======================================= */}
          <div className="bg-white rounded-2xl shadow border">
            <div className="border-b p-5">
              <h2 className="text-xl font-bold">Loan Remarks</h2>
            </div>
            <div className="p-6">
              <textarea
                rows="5"
                placeholder="Write remarks..."
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                className="w-full border rounded-xl p-4"
              ></textarea>
            </div>
          </div>

          {/* =======================================
                    LOAN SUMMARY
          ======================================= */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white p-8">
            <h2 className="text-2xl font-bold mb-6">Loan Summary</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-blue-100">Loan Amount</p>
                <h2 className="text-3xl font-black">
                  ₹{Number(form.loanAmount || 0).toLocaleString("en-IN")}
                </h2>
              </div>
              <div>
                <p className="text-blue-100">Interest</p>
                <h2 className="text-3xl font-black">
                  ₹{summary.interest.toLocaleString("en-IN")}
                </h2>
              </div>
              <div>
                <p className="text-blue-100">Total Payable</p>
                <h2 className="text-3xl font-black">
                  ₹{summary.totalPayable.toLocaleString("en-IN")}
                </h2>
              </div>
              <div>
                <p className="text-blue-100">EMI</p>
                <h2 className="text-3xl font-black">
                  ₹{summary.emi.toLocaleString("en-IN")}
                </h2>
              </div>
            </div>
          </div>

          {/* =======================================
                    ACTION BUTTONS
          ======================================= */}
          <div className="flex justify-end gap-4 pb-10">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-8 py-3 rounded-xl border border-slate-300 font-bold hover:bg-slate-100"
            >
              Cancel
            </button>
       <button
  type="submit"
  disabled={loading}
  className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-xl font-bold shadow-lg disabled:bg-gray-400"
>
  {loading
    ? (isEdit ? "Updating Loan..." : "Creating Loan...")
    : (isEdit ? "Update Loan" : "Create Loan")}
</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateLoan;