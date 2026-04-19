import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '@/features/userSlice.js';
import api from '../utils/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  //const dispatch = useDispatch();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        role: data.role, 
        firstName: data.firstName, 
        lastName: data.lastName,
        phone: data.phone.replace(/\s+/g, ''),
        bio: "" 
      };

      const response = await api.post('/auth/register', payload);
      //const { user: apiUser, token } = response.data.data;

      /*if (token) {
        localStorage.setItem("token", token);
        
        const completeUser = { 
            ...apiUser, 
            id: apiUser.id,
            ID: apiUser.id, 
            email: apiUser.email,
            EMAIL: apiUser.email,
            role: apiUser.role,
            ROLE: apiUser.role?.toUpperCase(),
            firstName: data.firstName,
            lastName: data.lastName,
            NAME: `${data.firstName} ${data.lastName}`,
            PHONE: data.phone 
        };

        dispatch(login(completeUser));
        toast.success(`Welcome to Neighbourly, ${data.firstName}!`);
        navigate('/dashboard'); 
      } else {
        toast.success("Account created! Please login.");
        navigate('/');
      }*/

      if (response.data.success) {
        toast.success("OTP sent to your email!");
        // Pass the email to the next page so the user doesn't have to re-type it
        navigate('/verify-otp', { state: { email: data.email } });
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Registration failed. Try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4 font-bold text-xl">
            N
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join Neighbourly</h2>
          <p className="text-sm text-gray-500 mt-2">Connect with your community today.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  {...register("firstName", { required: "Required" })} 
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
                  placeholder="John"
                />
                {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  {...register("lastName", { required: "Required" })} 
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
                  placeholder="Doe"
                />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              {...register("email", { 
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" }
              })} 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
              placeholder="john@example.com"
            />
            {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
          </div>

          {/* --- NEW: Phone Number --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              {...register("phone", { 
                required: "Phone number is required",
                minLength: { value: 10, message: "Invalid phone number" }
              })} 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
              placeholder="+92 300 1234567"
            />
            {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })} 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
              placeholder="••••••••"
            />
            {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I want to...</label>
            <div className="relative">
              <select 
                {...register("role")} 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="seeker">Find Services (Seeker)</option>
                <option value="provider">Offer Services (Provider)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-lg font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4 active:scale-[0.98] transform"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/" className="text-emerald-600 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;