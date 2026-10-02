
import React,
{
useEffect,
useState
}
from "react";

import axios from "axios";

function RecentActivity() {

const [activities,
setActivities] =
useState([]);

useEffect(()=>{

fetchActivities();

},[]);

const fetchActivities =
async()=>{

try{

const res =
await axios.get(
"https://finance-project-0qqk.onrender.com/api/reports/recent-activity"
);

setActivities(
res.data.activities
);

}
catch(error){

console.log(error);

}

};

return (

<div className="bg-white rounded-3xl p-6 border shadow-sm">

<h2 className="text-xl font-bold">
Recent Activity
</h2>

<p className="text-gray-500 mb-5">
Latest system updates
</p>

<div className="space-y-4">

{
activities.map(
(item,index)=>(

<div
key={index}
className="bg-slate-50 rounded-2xl p-4"
>

<div className="flex justify-between">

<h3 className="font-semibold">
{item.title}
</h3>

<span className="text-sm text-gray-500">
{new Date(item.time)
.toLocaleDateString()}
</span>

</div>

<p className="text-gray-500 mt-2">
{item.desc}
</p>

</div>

))
}

</div>

</div>

);

}

export default RecentActivity;