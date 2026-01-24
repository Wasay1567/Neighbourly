import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "@/features/userSlice.js";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { User, Briefcase, ShieldCheck } from "lucide-react"; // Icons for roles

const DEMO_MODE = true

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. State for the Active Tab (Default to 'seeker')
  // Options: 'seeker', 'provider', 'moderator'
  const [activeRole, setActiveRole] = useState("neighbor");
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Helper to switch tabs
  const handleTabChange = (role) => {
    setActiveRole(role);
  };

  const onSubmit = async ({ email, password }) => {
    setIsLoading(true);
    try {
      // We pass the 'role' to the backend so it can enforce:
      // "You are trying to login as a Provider, but your account is a Seeker."
      const response = await api.post('/auth/login', { 
        email, 
        password,
        role: activeRole // <--- Sending the selected role
      });
      
      const { user, token } = response.data.data; 

      // Optional: Frontend check (Double safety)
      // If the backend doesn't enforce role check, we can do it here:
      if (user.role && user.role !== activeRole) {
        throw new Error(`Invalid account type. Please login as a ${user.role}.`);
      }

      if (!token) throw new Error("No access token received");

      localStorage.setItem("token", token);
      dispatch(login({ userData: user }));

      toast.success(`Welcome back, ${user.NAME || 'Neighbor'}!`);
      
      // Redirect based on role
      if (activeRole === 'moderator') navigate("/moderator-dashboard");
      else navigate("/dashboard");

    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Login failed.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic Styles based on Role
  const getThemeColor = () => {
    switch (activeRole) {
      case 'provider': return 'bg-blue-700'; // Blue for Work/Provider
      case 'moderator': return 'bg-purple-700'; // Purple for Admin/Mod
      case 'seeker': default: return 'bg-teal-700'; // Teal for Default
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
      
      {/* --- 1. HEADER (Like the Red banner in your image) --- */}
      <div className={`${getThemeColor()} p-6 text-center transition-colors duration-300`}>
        <h2 className="text-2xl font-bold text-white tracking-wide shadow-black drop-shadow-md">
          Neighbourly Portal Login
        </h2>
      </div>

      {/* --- 2. TABS (Employee | Undergraduate | Postgraduate style) --- */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => handleTabChange("seeker")}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all 
            ${activeRole === "seeker" 
              ? "bg-white text-teal-700 border-t-4 border-teal-700 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.1)]" 
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
        >
          Seeker
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("provider")}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all 
            ${activeRole === "provider" 
              ? "bg-white text-blue-700 border-t-4 border-blue-700 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.1)]" 
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
        >
          Provider
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("moderator")}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all 
            ${activeRole === "moderator" 
              ? "bg-white text-purple-700 border-t-4 border-purple-700 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.1)]" 
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
        >
          Moderator
        </button>
      </div>

      {/* --- 3. FORM AREA --- */}
      <div className="p-8">
        
        {/* Dynamic Title with Icon */}
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
          {activeRole === 'seeker' && <User className="text-teal-600" size={28} />}
          {activeRole === 'provider' && <Briefcase className="text-blue-600" size={28} />}
          {activeRole === 'moderator' && <ShieldCheck className="text-purple-600" size={28} />}
          
          <h3 className={`text-2xl font-bold capitalize ${
            activeRole === 'provider' ? 'text-blue-700' : 
            activeRole === 'moderator' ? 'text-purple-700' : 'text-teal-700'
          }`}>
            {activeRole} Login
          </h3>
        </div>

        {/* Links Area (Like the 'Recover Password | Sign Up' in image) */}
        <div className="flex justify-end gap-1 text-sm mb-6">
          <a href="#" className="text-gray-500 hover:text-gray-800">Recover Password</a>
          <span className="text-gray-300">|</span>
          <Link to="/register" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
              <User size={16} /> Portal ID / Email
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-3 rounded border border-gray-300 focus:border-gray-500 focus:ring-0 transition-colors"
              placeholder={`Enter ${activeRole} email`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-4 py-3 rounded border border-gray-300 focus:border-gray-500 focus:ring-0 transition-colors"
              placeholder="Enter password"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            <p className="mt-1 text-xs text-blue-500">( Password is case sensitive )</p>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 rounded shadow-md transition-transform transform active:scale-[0.98] ${
                activeRole === 'provider' ? 'bg-blue-600 hover:bg-blue-700' :
                activeRole === 'moderator' ? 'bg-purple-600 hover:bg-purple-700' :
                'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isLoading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;