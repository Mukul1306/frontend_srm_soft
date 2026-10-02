import React, { useEffect, useState } from "react";
import axios from "axios";

const CreateLoan = ({ isOpen, onClose, onLoanCreated }) => {

const [societies,setSocieties]=useState([]);

const [members,setMembers]=useState([]);

const [member,setMember]=useState(null);

const [isSubmitting,setIsSubmitting]=useState(false);

const [borrowerType,setBorrowerType]=useState("MEMBER");

const [formData,setFormData]=useState({

borrowerType:"MEMBER",

societyId:"",

memberId:"",

// Customer

name:"",

fatherOrHusbandName:"",

mobile:"",

alternateMobile:"",

gender:"Male",

dob:"",

aadhaarNumber:"",

panNumber:"",

occupation:"",

address:"",

city:"",

state:"",

pinCode:"",

photo:"",

guarantorName:"",

guarantorMobile:"",

remarks:"",

// Loan

loanAmount:"",

interestPerHundred:"",

loanGivenDate:"",

emiDueDay:"",

emiPenaltyPercentage:"2"

});



  // Load baseline collection networks on initialization
  useEffect(() => {
    if (isOpen) {
      fetchSocieties();
    }
  }, [isOpen]);

const fetchSocieties = async () => {
  try {

 const res = await axios.get(
  "https://finance-project-0qqk.onrender.com/api/society/all"
);

    console.log("Society API", res.data);

    setSocieties(
      res.data.societies || []
    );

  } catch (error) {

    console.log(
      "Society Error",
      error.response?.data
    );

    console.log(error);

  }
};
  // Select Society Handler
  const handleSocietyChange = async (e) => {
    const societyId = e.target.value;
    setFormData({
      ...formData,
      societyId,
      memberId: "",
    });
    setMember(null);
    setMembers([]);

    if (!societyId) return;

    try {
      const res = await axios.get(`https://finance-project-0qqk.onrender.com/api/loans/members/${societyId}`);
      setMembers(res.data.members || []);
    } catch (error) {
      console.error("Error compiling ledger indices:", error);
    }
  };

  // Select Individual Target Member Handler
  const handleMemberChange = async (e) => {
    const memberId = e.target.value;
    setFormData({
      ...formData,
      memberId,
    });
    setMember(null);

    if (!memberId) return;

    try {
      const res = await axios.get(`https://finance-project-0qqk.onrender.com/api/loans/member/${memberId}`);
      setMember(res.data.member);
    } catch (error) {
      console.error("Error processing account query:", error);
    }
  };

  // Inline reactive computation engine
  const monthlyInterest = (Number(formData.loanAmount || 0) / 100) * Number(formData.interestPerHundred || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post("https://finance-project-0qqk.onrender.com/api/loans/create", formData);
      alert("Loan Created Successfully");
      
      // Clear transactional states
      setFormData({
  societyId: "",
  memberId: "",
  loanAmount: "",
  interestPerHundred: "",
  loanGivenDate: "",
  emiDueDay: "",
  emiPenaltyPercentage: "2"
});
      setMember(null);
      setMembers([]);
      
      if (onLoanCreated) onLoanCreated(); // Instantly update background dashboard tables
      onClose(); // Hide side drawer panel layout
    } catch (error) {
      alert(error?.response?.data?.message || "Error creating loan asset records");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 transition-all duration-300">
      
      {/* Click outside sidebar layer to clear stack */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Form Drawer Shell */}
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto flex flex-col z-10 animate-in slide-in-from-right duration-200 font-sans">
        
        {/* Dynamic Panel Header Block */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase">Issue New Loan Position</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Disburse active balance liabilities to registered society profiles.</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-300 hover:text-slate-600 font-bold text-xl p-1 transition"
          >
            &times;
          </button>
        </div>

        {/* Form Transactional Body */}
        <form onSubmit={handleSubmit} className="space-y-5 text-[11px] flex-1 flex flex-col justify-between">
          <div className="space-y-4">
       
            {/* ================= Borrower Type ================= */}

<div className="md:col-span-2">

  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-3">

    Borrower Type

  </label>

  <div className="flex gap-8">

    <label className="flex items-center gap-2 cursor-pointer">

      <input
        type="radio"
        checked={borrowerType === "MEMBER"}
        onChange={() => {
          setBorrowerType("MEMBER");

          setFormData({
            ...formData,
            borrowerType: "MEMBER"
          });
        }}
      />

      Society Member

    </label>

    <label className="flex items-center gap-2 cursor-pointer">

      <input
        type="radio"
        checked={borrowerType === "CUSTOMER"}
        onChange={() => {
          setBorrowerType("CUSTOMER");

          setFormData({
            ...formData,
            borrowerType: "CUSTOMER",
            societyId: "",
            memberId: ""
          });
        }}
      />

      External Customer

    </label>

  </div>

</div>

{/* ================= MEMBER SECTION ================= */}

{borrowerType === "MEMBER" && (

<>

<div>

  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">

    Target Society Allocation

  </label>

  <select
    value={formData.societyId}
    onChange={handleSocietyChange}
    required
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold"
  >

    <option value="">Select Society</option>

    {societies.map((society) => (

      <option
        key={society._id}
        value={society._id}
      >

        {society.societyName}

      </option>

    ))}

  </select>

</div>

<div>

  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">

    Beneficiary Member Account

  </label>

  <select
    value={formData.memberId}
    onChange={handleMemberChange}
    required
    disabled={!formData.societyId}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold disabled:opacity-50"
  >

    <option value="">

      Select Member

    </option>

    {members.map((m) => (

      <option
        key={m._id}
        value={m._id}
      >

        {m.name}

      </option>

    ))}

  </select>

</div>

</>

)}

{borrowerType==="CUSTOMER" && (

<div className="bg-slate-50 border rounded-2xl p-5">

<h3 className="font-black text-lg mb-5">

Customer Details

</h3>

<div className="grid grid-cols-2 gap-4">

<input
className="border rounded-xl p-3"
placeholder="Full Name"
name="name"
value={formData.name}
onChange={(e)=>
setFormData({
...formData,
name:e.target.value
})
}
/>

<input
className="border rounded-xl p-3"
placeholder="Father Name"
name="fatherOrHusbandName"
value={formData.fatherOrHusbandName}
onChange={(e)=>
setFormData({
...formData,
fatherOrHusbandName:e.target.value
})
}
/>

<input
className="border rounded-xl p-3"
placeholder="Mobile"
name="mobile"
value={formData.mobile}
onChange={(e)=>
setFormData({
...formData,
mobile:e.target.value
})
}
/>

<input
className="border rounded-xl p-3"
placeholder="Alternate Mobile"
name="alternateMobile"
value={formData.alternateMobile}
onChange={(e)=>
setFormData({
...formData,
alternateMobile:e.target.value
})
}
/>

<input
className="border rounded-xl p-3"
placeholder="Aadhaar Number"
name="aadhaarNumber"
value={formData.aadhaarNumber}
onChange={(e)=>
setFormData({
...formData,
aadhaarNumber:e.target.value
})
}
/>

<input
className="border rounded-xl p-3"
placeholder="PAN Number"
name="panNumber"
value={formData.panNumber}
onChange={(e)=>
setFormData({
...formData,
panNumber:e.target.value
})
}
/>

<textarea

className="border rounded-xl p-3 col-span-2"

rows="3"

placeholder="Address"

value={formData.address}

onChange={(e)=>
setFormData({
...formData,
address:e.target.value
})
}

/>

</div>

</div>

)}

            {/* Interactive Member File Drawer Information */}
         {borrowerType==="MEMBER" && member && (
  <>
    {/* Member Information */}

    <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">

      <h4 className="font-black text-blue-700 uppercase mb-4">
        Member Information
      </h4>

      <div className="grid grid-cols-2 gap-4 text-sm">

        <div>
          <p className="text-slate-500">Member ID</p>
          <p className="font-bold">{member.memberId}</p>
        </div>

        <div>
          <p className="text-slate-500">Full Name</p>
          <p className="font-bold">{member.name}</p>
        </div>

        <div>
          <p className="text-slate-500">Father / Husband</p>
          <p className="font-bold">{member.fatherOrHusbandName}</p>
        </div>

        <div>
          <p className="text-slate-500">Mobile</p>
          <p className="font-bold">{member.mobile}</p>
        </div>

        <div>
          <p className="text-slate-500">Alternative Mobile</p>
          <p className="font-bold">
            {member.alternateMobile || "-"}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Email</p>
          <p className="font-bold">
            {member.email || "-"}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Gender</p>
          <p className="font-bold">{member.gender}</p>
        </div>

        <div>
          <p className="text-slate-500">DOB</p>
          <p className="font-bold">
            {new Date(member.dob).toLocaleDateString("en-IN")}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-slate-500">Address</p>
          <p className="font-bold">{member.address}</p>
        </div>

        <div>
          <p className="text-slate-500">City</p>
          <p className="font-bold">{member.city || "-"}</p>
        </div>

        <div>
          <p className="text-slate-500">District</p>
          <p className="font-bold">{member.district || "-"}</p>
        </div>

        <div>
          <p className="text-slate-500">State</p>
          <p className="font-bold">{member.state || "-"}</p>
        </div>

        <div>
          <p className="text-slate-500">PIN Code</p>
          <p className="font-bold">{member.pinCode || "-"}</p>
        </div>

        <div className="col-span-2">
          <p className="text-slate-500">Aadhaar Number</p>
          <p className="font-bold">{member.aadhaarNumber}</p>
        </div>

      </div>

    </div>

    {/* Collection Summary */}

    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mt-5">

      <h3 className="font-black text-green-700 mb-4">
        Collection Summary
      </h3>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <p className="text-slate-500">Monthly Installment</p>
          <p className="font-bold">
            ₹{member.monthlyInstallment}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Paid Installments</p>
          <p className="font-bold">
            {member.paidInstallments}/{member.totalInstallments}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Pending Installments</p>
          <p className="font-bold text-red-600">
            {member.pendingInstallments}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Total Collected</p>
          <p className="font-bold">
            ₹{member.totalPaid}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Pending Amount</p>
          <p className="font-bold">
            ₹{member.pendingAmount}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Penalty Paid</p>
          <p className="font-bold">
            ₹{member.totalPenaltyPaid}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Current Penalty</p>
          <p className="font-bold text-red-600">
            ₹{member.currentPenalty}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Last Payment</p>
          <p className="font-bold">
            {member.lastPaymentDate
              ? new Date(member.lastPaymentDate).toLocaleDateString("en-IN")
              : "-"}
          </p>
        </div>

      </div>

    </div>
  </>
)}

            <div className="border-t border-slate-100 my-2 pt-2" />

            {/* Inputs: Principal Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Principal Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g., 50000"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Interest Rate / ₹100</label>
                <input
                  type="number"
                  required
                  placeholder="e.g., 2"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                  value={formData.interestPerHundred}
                  onChange={(e) => setFormData({ ...formData, interestPerHundred: e.target.value })}
                />
              </div>
            </div>

            {/* Calculated Monthly Accrued Yield Box */}
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Calculated Monthly Interest Yield</label>
              <div className="w-full px-3 py-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-emerald-700 font-black text-sm flex items-center justify-between">
                <span>₹ {monthlyInterest.toLocaleString("en-IN")}</span>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-100 rounded-md font-bold">Auto Math</span>
              </div>
            </div>




            {/* EMI Configuration */}

<div className="mt-5">

  <h3 className="text-sm font-black text-slate-700 uppercase mb-4">
    EMI Configuration
  </h3>

  <div className="grid grid-cols-2 gap-4">

    <div>

      <label className="block text-slate-500 font-semibold mb-2">
        EMI Due Day
      </label>

      <input
        type="number"
        min="1"
        max="31"
        required
        value={formData.emiDueDay}
        onChange={(e)=>
          setFormData({
            ...formData,
            emiDueDay:e.target.value
          })
        }
        placeholder="10"
        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
      />

    </div>

    <div>

      <label className="block text-slate-500 font-semibold mb-2">
        EMI Penalty (%)
      </label>

      <input
        type="number"
        min="0"
        step="0.1"
        required
        value={formData.emiPenaltyPercentage}
        onChange={(e)=>
          setFormData({
            ...formData,
            emiPenaltyPercentage:e.target.value
          })
        }
        placeholder="2"
        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
      />

    </div>

  </div>

</div>

            {/* Date Configurations */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Disbursal Allocation Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                  value={formData.loanGivenDate}
                  onChange={(e) => setFormData({ ...formData, loanGivenDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Horizon Maturity Date</label>
                <input
                  type="text"
                  readOnly
                  placeholder="Pending Selection"
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium focus:outline-none select-none cursor-not-allowed"
                value={
borrowerType === "MEMBER"
  ? (
      member
        ? new Date(member.memberEndDate).toLocaleDateString("en-IN")
        : "Select Member First"
    )
  : (
      formData.loanGivenDate
        ? new Date(
            new Date(formData.loanGivenDate).setMonth(
              new Date(formData.loanGivenDate).getMonth() + 12
            )
          ).toLocaleDateString("en-IN")
        : "Select Loan Date"
    )
}
                />
              </div>
            </div>

          </div>

          {/* Core Action Footer Elements */}
          <div className="pt-4 border-t border-slate-100 flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition"
            >
              Cancel Dismiss
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : "Deploy Account Asset"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateLoan;