import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "@/features/userSlice.js";
import api from "../utils/api";
import toast from "react-hot-toast";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Retrieve email passed from Login/Register state
  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Please enter a 6-digit code");

    setIsLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      const { user, token } = response.data.data;

      // SUCCESS: Save token and update Redux
      localStorage.setItem("token", token);
      
      const normalizedUser = {
        ...user,
        NAME: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
        ROLE: user.role ? user.role.toUpperCase() : 'SEEKER'
      };

      dispatch(login(normalizedUser));
      toast.success("Account verified successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold">N</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-500 mb-8">We sent a 6-digit code to <br/><strong>{email}</strong></p>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
            placeholder="000000"
          />
          <button
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify & Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;