import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "@/features/userSlice.js";
import { useNavigate, Link } from "react-router-dom";
import { authLogin } from "../utils/api";
import { normalizeUser } from "@/utils/normalizeUser";
import { 
  Search,       // for Seeker
  Briefcase,    // for Provider
  ShieldAlert,  // for Moderator
  Settings      // for Admin
} from "lucide-react"; 

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState("seeker"); // Default to Seeker
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleTabChange = (role) => {
    setActiveRole(role);
  };

  const onSubmit = async ({ email, password }) => {
    setIsLoading(true);
    try {
      // 1. API Call
      const response = await authLogin(email, password);

      // 2. Extract Data
      const { user, token } = response.data; 

      if (!token) throw new Error("No access token received");

      // 3. Store & State
      localStorage.setItem("token", token);
      const normalizedUser = normalizeUser(user);
      dispatch(login(normalizedUser));
      toast.success(`Welcome back, ${normalizedUser.NAME}!`);
      
      // 4. Redirect Logic
      // We check the ACTUAL role from the database, not just the tab they clicked
      const userRole = user.role?.toLowerCase();
      
      // if (userRole === 'admin') {
      //     navigate("/dashboard");
      // } else if (userRole === 'moderator') {
      //     navigate("/dashboard");
      // } else {
      //     // Standard users (Seekers & Providers) go to same dashboard
      //     // The dashboard handles what they see internally
      //     navigate("/dashboard");
      // }

      navigate("/dashboard");

    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Login failed.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Dynamic Styling Based on Role ---
  const getTheme = () => {
    switch (activeRole) {
      case 'admin':    return { bg: 'bg-gray-800',    text: 'text-gray-800',    border: 'border-gray-800',    hover: 'hover:bg-gray-900',    icon: Settings };
      case 'moderator':return { bg: 'bg-purple-700',  text: 'text-purple-700',  border: 'border-purple-700',  hover: 'hover:bg-purple-800',  icon: ShieldAlert };
      case 'provider': return { bg: 'bg-blue-600',    text: 'text-blue-600',    border: 'border-blue-600',    hover: 'hover:bg-blue-700',    icon: Briefcase };
      case 'seeker':   
      default:         return { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', hover: 'hover:bg-emerald-700', icon: Search };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-300">
      
      {/* Header */}
      <div className={`${theme.bg} p-6 text-center transition-colors duration-300`}>
        <h2 className="text-2xl font-bold text-white tracking-wide drop-shadow-md">
          Neighbourly Portal
        </h2>
        <p className="text-white/80 text-sm mt-1 capitalize">{activeRole} Access</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
        {['seeker', 'provider', 'moderator', 'admin'].map((role) => (
            <button
                key={role}
                type="button"
                onClick={() => handleTabChange(role)}
                className={`flex-1 py-4 px-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap
                ${activeRole === role 
                    ? `bg-white border-t-4 shadow-sm ${
                        role === 'admin' ? 'text-gray-800 border-gray-800' :
                        role === 'moderator' ? 'text-purple-700 border-purple-700' :
                        role === 'provider' ? 'text-blue-600 border-blue-600' :
                        'text-emerald-600 border-emerald-600'
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
          <Icon className={theme.text} size={28} />
          
          <h3 className={`text-2xl font-bold capitalize ${theme.text}`}>
            {activeRole} Login
          </h3>
        </div>

        <div className="flex justify-end gap-1 text-sm mb-6">
            <a href="#" className="text-gray-500 hover:text-gray-800">Recover Password</a>
            {(activeRole === 'seeker' || activeRole === 'provider') && (
                <>
                    <span className="text-gray-300">|</span>
                    <Link to="/register" className={`${theme.text} font-bold hover:underline`}>Sign Up</Link>
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
            className={`w-full text-white font-bold py-3 rounded shadow-md transition-transform transform active:scale-[0.98] ${theme.bg} ${theme.hover}`}
          >
            {isLoading ? "Authenticating..." : `Login as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;