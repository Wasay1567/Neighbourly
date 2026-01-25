import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "@/features/userSlice.js";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { Home, ShieldAlert, Settings } from "lucide-react"; 

//backend is ready
const DEMO_MODE = false; 

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState("neighbor");
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleTabChange = (role) => {
    setActiveRole(role);
  };

  const onSubmit = async ({ email, password }) => {
    setIsLoading(true);
    try {
      // 1. API Call (Stage 2 Integration)
      // Note: Backend 'login' uses email/pass. It ignores 'role' in body, 
      // but we send it if we want to add frontend validation later.
      const response = await api.post('/auth/login', { 
        email, 
        password
      });

      // 2. Extract Data
      const { user, token } = response.data.data; 

      if (!token) throw new Error("No access token received");

      // 3. Store & State
      localStorage.setItem("token", token);
      
      // Normalize User Data for Redux (Map backend fields to what UI expects)
      const normalizedUser = {
        ...user,
        NAME: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
        ROLE: user.role ? user.role.toUpperCase() : 'USER'
      };

      dispatch(login({ userData: normalizedUser }));

      toast.success(`Welcome back!`);
      
      // 4. Redirect based on Role (Using the ACTUAL role from DB, not just the tab)
      const userRole = user.role?.toLowerCase();
      
      if (userRole === 'admin') {
          navigate("/dashboard");
      } else if (userRole === 'moderator') {
          navigate("/dashboard"); // DashboardWrapper handles the UI
      } else {
          navigate("/dashboard");
      }

    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Login failed.";
      
      if(err.response?.status === 403) {
          toast.error("Account pending verification.");
      } else {
          toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Theme Colors
  const getThemeColor = () => {
    switch (activeRole) {
      case 'admin': return 'bg-gray-800';      
      case 'moderator': return 'bg-purple-700'; 
      case 'neighbor': default: return 'bg-emerald-600'; 
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-300">
      
      {/* Header */}
      <div className={`${getThemeColor()} p-6 text-center transition-colors duration-300`}>
        <h2 className="text-2xl font-bold text-white tracking-wide drop-shadow-md">
          Neighbourly Portal
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {['neighbor', 'moderator', 'admin'].map((role) => (
            <button
                key={role}
                type="button"
                onClick={() => handleTabChange(role)}
                className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all 
                ${activeRole === role 
                    ? `bg-white border-t-4 shadow-sm ${
                        role === 'admin' ? 'text-gray-800 border-gray-800' :
                        role === 'moderator' ? 'text-purple-700 border-purple-700' :
                        'text-emerald-700 border-emerald-600'
                    }` 
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
            >
                {role}
            </button>
        ))}
      </div>

      {/* Form Area */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
          {activeRole === 'neighbor' && <Home className="text-emerald-600" size={28} />}
          {activeRole === 'moderator' && <ShieldAlert className="text-purple-600" size={28} />}
          {activeRole === 'admin' && <Settings className="text-gray-700" size={28} />}
          
          <h3 className={`text-2xl font-bold capitalize ${
            activeRole === 'admin' ? 'text-gray-800' : 
            activeRole === 'moderator' ? 'text-purple-700' : 'text-emerald-700'
          }`}>
            {activeRole} Login
          </h3>
        </div>

        <div className="flex justify-end gap-1 text-sm mb-6">
            <a href="#" className="text-gray-500 hover:text-gray-800">Recover Password</a>
            {activeRole === 'neighbor' && (
                <>
                    <span className="text-gray-300">|</span>
                    <Link to="/register" className="text-emerald-600 font-bold hover:underline">Sign Up</Link>
                </>
            )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
               Portal ID / Email
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-3 rounded border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-200 outline-none transition-colors"
              placeholder={`Enter ${activeRole} email`} 
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-4 py-3 rounded border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-200 outline-none transition-colors"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 rounded shadow-md transition-transform transform active:scale-[0.98] ${
                activeRole === 'admin' ? 'bg-gray-800 hover:bg-gray-900' :
                activeRole === 'moderator' ? 'bg-purple-600 hover:bg-purple-700' :
                'bg-emerald-600 hover:bg-emerald-700'
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