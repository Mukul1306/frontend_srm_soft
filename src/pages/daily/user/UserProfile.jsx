import React, { useEffect, useState } from "react";
import axios from "axios";

const API =
"https://finance-project-0qqk.onrender.com/api/daily/user";

function Profile() {

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchProfile();

  }, []);

  const fetchProfile = async () => {

    try {

      const member = JSON.parse(
        localStorage.getItem("member")
      );

      const res = await axios.get(

        `${API}/profile/${member._id}`

      );

      setProfile(res.data);

    } catch (error) {

      console.log(error);

      alert("Unable to load profile");

    } finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (

      <div className="flex justify-center items-center h-screen">

        Loading...

      </div>

    );

  }

  return (

    <div className="max-w-md mx-auto p-4 pb-24">

      {/* Header */}

      <div className="bg-blue-600 rounded-3xl p-6 text-white text-center">

        <div className="w-24 h-24 rounded-full bg-white text-blue-600 mx-auto flex items-center justify-center text-4xl font-bold">

          {profile.member.memberName.charAt(0)}

        </div>

        <h2 className="text-2xl font-bold mt-4">

          {profile.member.memberName}

        </h2>

        <p>

          {profile.member.memberId}

        </p>

      </div>

      {/* Personal Details */}

      <Section title="Personal Details">

        <Item

          label="Father Name"

          value={profile.member.fatherName}

        />

        <Item

          label="Gender"

          value={profile.member.gender}

        />

        <Item

          label="Date of Birth"

          value={new Date(profile.member.dob).toLocaleDateString()}

        />

        <Item

          label="Mobile"

          value={profile.member.mobile}

        />

        <Item

          label="Email"

          value={profile.member.email || "-"}

        />

      </Section>

      {/* Address */}

      <Section title="Address">

        <Item

          label="Address"

          value={profile.member.residentialAddress}

        />

        <Item

          label="City"

          value={profile.member.city}

        />

        <Item

          label="District"

          value={profile.member.district}

        />

        <Item

          label="State"

          value={profile.member.state}

        />

        <Item

          label="Pincode"

          value={profile.member.pincode}

        />

      </Section>

      {/* Saving */}

      {

        profile.saving &&

        <Section title="Saving Account">

          <Item

            label="Area"

            value={profile.saving.areaGroup?.areaName}

          />

          <Item

            label="Agent"

            value={profile.saving.assignedAgent?.name}

          />

          <Item

            label="Agent Mobile"

            value={profile.saving.assignedAgent?.mobile}

          />

          <Item

            label="Collection"

            value={profile.saving.collectionType}

          />

          <Item

            label="Fixed Amount"

            value={`₹${profile.saving.fixedAmount}`}

          />

        </Section>

      }

    </div>

  );

}

function Section({

  title,

  children

}) {

  return (

    <div className="bg-white rounded-3xl shadow mt-5 p-5">

      <h2 className="font-bold text-lg mb-4">

        {title}

      </h2>

      {children}

    </div>

  );

}

function Item({

  label,

  value

}) {

  return (

    <div className="flex justify-between border-b py-3">

      <span className="text-gray-500">

        {label}

      </span>

      <span className="font-semibold">

        {value || "-"}

      </span>

    </div>

  );

}

export default Profile;