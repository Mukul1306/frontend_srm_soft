import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

 const handleLogin = async () => {

  if (!mobile || !password) {
    alert("Please enter mobile and password");
    return;
  }

  try {

    const response = await axios.post(
      "https://aws.srmfinance.online/api/auth/login",
      {
        mobile,
        password,
      }
    );

    console.log(response.data);

    if (response.data.success) {

      // ADMIN LOGIN

      if (response.data.role === "ADMIN") {

        localStorage.setItem(
          "token",
          response.data.token
        );

        localStorage.setItem(
          "role",
          "ADMIN"
        );

        alert("Admin Login Successful");

        navigate("/dashboard");

      }

      // AGENT LOGIN

      else if (response.data.role === "AGENT") {

        localStorage.setItem(
          "role",
          "AGENT"
        );

        localStorage.setItem(
          "agent",
          JSON.stringify(
            response.data.agent
          )
        );

        alert("Agent Login Successful");

        navigate(
          "/agent/dashboard"
        );

      }


// MEMBER LOGIN
else if (response.data.role === "MEMBER") {

  localStorage.setItem(
    "role",
    "MEMBER"
  );

 localStorage.setItem(
  "member",
  JSON.stringify(response.data.member)
);

  alert("Member Login Successful");

  navigate("/user/dashboard");

}

// SOCIETY MEMBER LOGIN
else if (response.data.role === "SOCIETY_MEMBER") {

  localStorage.setItem(
    "role",
    "SOCIETY_MEMBER"
  );

  localStorage.setItem(
    "societyMemberToken",
    response.data.token
  );

  localStorage.setItem(
    "societyMember",
    JSON.stringify(
      response.data.member
    )
  );

  alert("Society Member Login Successful");

  navigate(
    "/society-member/dashboard"
  );
}

      else {

        alert("Unknown Role");

      }

    }

  } catch (error) {

    console.log(error);

    alert(
      error.response?.data?.message ||
      "Login Failed"
    );

  }

};

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Left System Mode Indicator */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <div className="bg-[#0F172A] border border-blue-500/20 rounded-xl px-4 py-2 text-blue-100 text-xs">
          {">_ SYSTEM MODE : ACTIVE"}
        </div>
      </div>

      {/* Top Right Settings Button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button className="w-12 h-12 rounded-xl bg-[#0F172A] border border-blue-500/20 text-white">
          ⚙
        </button>
      </div>

      {/* Main Container */}
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="w-full max-w-[620px] bg-[#071330] border border-blue-500/20 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl z-10">
          
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-3xl border border-blue-500/20 flex items-center justify-center text-2xl">
              🛡️
            </div>
          </div>

          <h1 className="text-center text-white text-2xl md:text-4xl font-bold mt-5">
            SRM Finance Portal
          </h1>

          <p className="text-center text-blue-200 mt-2 tracking-[3px] text-xs uppercase">
            Multi-Tenant Ledger Gateway
          </p>

          <div className="mt-7 flex justify-between items-center bg-[#020B22] rounded-xl px-5 py-3 text-xs">
            <span className="text-blue-200">COMP_ID: 192.168.43.210</span>
            <span className="text-green-400">TLS_CONNECTED</span>
          </div>

          {/* Mobile Number Input */}
          <div className="mt-7">
            <label className="text-gray-400 text-xs uppercase tracking-wider">
              Mobile Number
            </label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter Mobile Number"
              className="w-full mt-2 bg-[#020B22] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Password Input */}
          <div className="mt-5">
            <label className="text-gray-400 text-xs uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full mt-2 bg-[#020B22] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="flex justify-between mt-4 text-xs">
            <span className="text-gray-400">AES-GCM-256 Bit Channel</span>
            <span className="text-blue-400">Secure Login</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleLogin}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition"
          >
            Initialize Safe Secure Authentication
          </button>

          <div className="border-t border-blue-500/20 mt-6 pt-5 text-center text-gray-500 text-[11px] leading-5">
            Authorized personnel access only.
            <br />
            Every operational payload event is digitally signed.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;