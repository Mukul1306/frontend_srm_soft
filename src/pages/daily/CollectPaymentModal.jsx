import React, { useEffect, useState } from "react";
import axios from "axios";

function CollectPaymentModal({

    open,

    saving,

    onClose,

    refresh

}) {

    const [pendingDays,setPendingDays]=useState([]);

const agent = JSON.parse(localStorage.getItem("agent"));
    const [selectedDay,setSelectedDay]=useState(null);

    const [paymentMethod,setPaymentMethod]=
    useState("CASH");

    const [flexibleAmount,setFlexibleAmount]=
    useState("");

    const [loading,setLoading]=
    useState(false);

    useEffect(()=>{

        if(open && saving){

            fetchPendingDays();

        }

    },[open,saving]);

    const fetchPendingDays=async()=>{

        try{

            const res=
            await axios.get(

            `https://finance-project-0qqk.onrender.com/api/daily/pending-days/${saving._id}`

            );

            setPendingDays(

                res.data.pendingDays

            );

            if(res.data.pendingDays.length>0){

                setSelectedDay(

                    res.data.pendingDays[0]

                );

            }

        }catch(error){

            console.log(error);

        }

    };
    const collectPayment = async()=>{

try{

setLoading(true);

await axios.post(

"https://finance-project-0qqk.onrender.com/api/daily/collect-pending",

{

savingId:saving._id,

pendingDate:selectedDay.date,


collectorType: "AGENT",
collectorId: agent._id,

paymentMethod,

amount:flexibleAmount

}

);

alert(

"Payment Collected Successfully"

);

refresh();

onClose();

}catch(error){

console.log(error);

alert(

error.response?.data?.message ||

"Collection Failed"

);

}

finally{

setLoading(false);

}

};

if(!open) return null;

return(

<div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

<div className="bg-white rounded-3xl w-[650px] p-8">

<h2 className="text-2xl font-black">

Collect Payment

</h2>

<p className="text-slate-500 mt-2">

{saving.member.memberName}

</p>

<div className="mt-6">

<label className="font-bold">

Pending Days

</label>

<select

className="w-full border rounded-xl p-3 mt-2"

onChange={(e)=>{

const day=

pendingDays.find(

d=>

d.date===e.target.value

);

setSelectedDay(day);

}}

>

{

pendingDays.map((day,index)=>(

<option

key={index}

value={day.date}

>

{

new Date(

day.date

).toLocaleDateString()

}

</option>

))

}

</select>

</div>
{

selectedDay &&

<div className="grid grid-cols-3 gap-5 mt-6">

<div>

<p className="text-slate-500">

Daily Amount

</p>

<h2 className="font-black text-xl">

₹{selectedDay.dailyAmount}

</h2>

</div>

<div>

<p className="text-slate-500">

Penalty

</p>

<h2 className="font-black text-xl text-red-600">

₹{selectedDay.penalty}

</h2>

</div>

<div>

<p className="text-slate-500">

Total

</p>

<h2 className="font-black text-2xl text-green-600">

₹{selectedDay.total}

</h2>

</div>

</div>

}
{

saving.collectionType==="FLEXIBLE" &&

<div className="mt-5">

<label>

Amount

</label>

<input

type="number"

value={flexibleAmount}

onChange={(e)=>

setFlexibleAmount(

e.target.value

)

}

className="w-full border rounded-xl p-3"

/>

</div>

}
<div className="mt-5">

<label>

Payment Method

</label>

<select

value={paymentMethod}

onChange={(e)=>

setPaymentMethod(

e.target.value

)

}

className="w-full border rounded-xl p-3 mt-2"

>

<option value="CASH">

Cash

</option>

<option value="UPI">

UPI

</option>

<option value="BANK">

Bank

</option>

</select>

</div>
<div className="flex justify-end gap-4 mt-8">

<button

onClick={onClose}

className="px-5 py-3 rounded-xl bg-gray-300"

>

Cancel

</button>

<button

onClick={collectPayment}

disabled={!selectedDay || loading}

className="px-5 py-3 rounded-xl bg-green-600 text-white"

>

{

loading ?

"Collecting..."

:

"Collect Payment"

}

</button>

</div>

</div>

</div>

);

}

export default CollectPaymentModal;
