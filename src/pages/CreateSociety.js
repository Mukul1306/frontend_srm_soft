import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
function CreateSociety() {

  const navigate = useNavigate();
const { id } = useParams();

const isEdit = Boolean(id);
const [formData, setFormData] = useState({
  societyName: "",
  startDate: "",
  durationMonths: "",
  maxMembers: ""
});

 const handleChange = (e) => {

  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value
  }));

};

useEffect(() => {

  if (isEdit) {

    fetchSociety();

  }

}, [id]);

const fetchSociety = async () => {

  try {

    const res = await axios.get(
      `https://finance-project-0qqk.onrender.com/api/society/${id}`
    );

    const society = res.data.society;

    setFormData({
      societyName: society.societyName,
      startDate: society.startDate.substring(0, 10),
      durationMonths: society.durationMonths,
      maxMembers: society.maxMembers
    });

  } catch (error) {

    console.log(error);

    alert("Unable to load society.");

  }

};

  const handleSubmit = async (e) => {

  e.preventDefault();

  try {

   let response;

if (isEdit) {

  response = await axios.put(

    `https://finance-project-htz0.onrender.com/api/society/update/${id}`,

    {
      societyName: formData.societyName,
      startDate: formData.startDate,
      durationMonths: Number(formData.durationMonths),
      maxMembers: Number(formData.maxMembers)
    }

  );

} else {

  response = await axios.post(

    "https://finance-project-0qqk.onrender.com/api/society/create",

    {
      societyName: formData.societyName,
      startDate: formData.startDate,
      durationMonths: Number(formData.durationMonths),
      maxMembers: Number(formData.maxMembers)
    }

  );

}

    alert(response.data.message);

    setFormData({
      societyName: "",
      startDate: "",
      durationMonths: "",
      maxMembers: ""
    });

navigate("/societies");

  }
  catch (error) {

    console.log(error);

    alert(
      error.response?.data?.message ||
      "Error Creating Society"
    );

  }

};

  return (

    <div className="min-h-screen bg-slate-100 p-8">

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm p-8">

        <h1 className="text-4xl font-bold text-slate-800">

{isEdit ? "Update Society" : "Create New Society"}

        </h1>

        <p className="text-slate-500 mt-2">

        {isEdit
  ? "Modify society information."
  : "Setup a new society cluster."
}

        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8"
        >

          <div className="mb-5">

            <label className="block text-sm font-medium mb-2">

              Society Name

            </label>

            <input
              type="text"
              name="societyName"
              value={formData.societyName}
              onChange={handleChange}
              placeholder="Enter Society Name"
              required
              className="w-full border rounded-xl p-4"
            />

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <div>

              <label className="block text-sm font-medium mb-2">

                Duration (Months)

              </label>

              <input
                type="number"
                name="durationMonths"
                value={formData.durationMonths}
                onChange={handleChange}
                placeholder="12"
                required
                className="w-full border rounded-xl p-4"
              />

            </div>

            <div>

              <label className="block text-sm font-medium mb-2">

                Maximum Members

              </label>

              <input
                type="number"
                name="maxMembers"
                value={formData.maxMembers}
                onChange={handleChange}
                placeholder="20"
                required
                className="w-full border rounded-xl p-4"
              />

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-5">

            <div>

              <label className="block text-sm font-medium mb-2">

                Start Date

              </label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full border rounded-xl p-4"
              />

            </div>

       
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold"
          >

            {isEdit ? "Update Society" : "Create Society"}

          </button>

        </form>

      </div>

    </div>

  );

}

export default CreateSociety;