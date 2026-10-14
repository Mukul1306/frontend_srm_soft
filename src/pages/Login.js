import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);


const handleLogin = async (e) => {
  e.preventDefault();

  if (!mobile.trim() || !password) {
    alert("Please enter mobile and password");
    return;
  }

  if (loggingIn) return;

  try {
    setLoggingIn(true);

    const response = await axios.post(
      "https://aws.srmfinance.online/api/auth/login",
      {
        mobile: mobile.trim(),
        password,
      }
    );

    const result = response.data;

    if (!result?.success) {
      alert(result?.message || "Login failed");
      return;
    }

    const { role, token, agent, member } = result;

    const routes = {
      ADMIN: "/dashboard",
      AGENT: "/agent/dashboard",
      MEMBER: "/user/dashboard",
      SOCIETY_MEMBER: "/society-member/dashboard",
    };

    if (!routes[role]) {
      alert("Unknown user role.");
      return;
    }

    // These roles require a backend-issued token.
    // Do not create fake tokens on the frontend.
    if (!token) {
      alert(
        "Authentication token missing. Please update the backend login API."
      );
      return;
    }

    if (
      (role === "AGENT" && !agent) ||
      (role === "MEMBER" && !member) ||
      (role === "SOCIETY_MEMBER" && !member)
    ) {
      alert("User information was not returned by the server.");
      return;
    }

    // Clear any previous user's session.
    [
      "token",
      "role",
      "agent",
      "member",
      "societyMember",
      "societyMemberToken",
    ].forEach((key) => localStorage.removeItem(key));

    // Save the new session.
    localStorage.setItem("role", role);

    if (role === "SOCIETY_MEMBER") {
      localStorage.setItem("societyMemberToken", token);
      localStorage.setItem(
        "societyMember",
        JSON.stringify(member)
      );
    } else {
      localStorage.setItem("token", token);

      if (role === "AGENT") {
        localStorage.setItem("agent", JSON.stringify(agent));
      }

      if (role === "MEMBER") {
        localStorage.setItem("member", JSON.stringify(member));
      }
    }

    navigate(routes[role], { replace: true });
  } catch (error) {
    console.error(
      "Login error:",
      error.response?.data || error
    );

    alert(error.response?.data?.message || "Login failed");
  } finally {
    setLoggingIn(false);
  }
};

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Background Grid */}
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

      {/* System Mode */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <div className="bg-[#0F172A] border border-blue-500/20 rounded-xl px-4 py-2 text-blue-100 text-xs">
          {">_ SYSTEM MODE : ACTIVE"}
        </div>
      </div>

      {/* Settings */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          type="button"
          aria-label="Settings"
          className="w-12 h-12 rounded-xl bg-[#0F172A] border border-blue-500/20 text-white"
        >
          ⚙
        </button>
      </div>

      {/* Login Form */}
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
            <span className="text-blue-200">
              COMP_ID: 192.168.43.210
            </span>
            <span className="text-green-400">
              TLS_CONNECTED
            </span>
          </div>

          <form onSubmit={handleLogin}>
            {/* Mobile */}
            <div className="mt-7">
              <label
                htmlFor="mobile"
                className="text-gray-400 text-xs uppercase tracking-wider"
              >
                Mobile Number
              </label>

              <input
                id="mobile"
                type="tel"
                autoComplete="username"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter Mobile Number"
                className="w-full mt-2 bg-[#020B22] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Password */}
            <div className="mt-5">
              <label
                htmlFor="password"
                className="text-gray-400 text-xs uppercase tracking-wider"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full mt-2 bg-[#020B22] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="flex justify-between mt-4 text-xs">
              <span className="text-gray-400">
                Secure Connection
              </span>
              <span className="text-blue-400">
                Secure Login
              </span>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-3 rounded-xl transition"
            >
              {loggingIn
                ? "Authenticating..."
                : "Initialize Safe Secure Authentication"}
            </button>
          </form>

          <div className="border-t border-blue-500/20 mt-6 pt-5 text-center text-gray-500 text-[11px] leading-5">
            Authorized personnel access only.
            <br />
            Secure authentication required.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
