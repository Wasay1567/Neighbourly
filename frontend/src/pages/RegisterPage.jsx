import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '@/features/userSlice.js';
import api from '../utils/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // 1. Construct Payload (Matches your backend authController.register)
      const payload = {
        email: data.email,
        password: data.password,
        role: data.role, 
        firstName: data.firstName, 
        lastName: data.lastName,
        phone: data.phone || "", 
        bio: "" 
      };

      // 2. API Call
      const response = await api.post('/auth/register', payload);
      
      // 3. Extract Data
      // Backend returns: data: { user: { id, email, role }, token }
      const { user: apiUser, token } = response.data.data;

      // 4. Auto-Login Logic
      if (token) {
        localStorage.setItem("token", token);
        
        // MERGE: Backend response lacks names, so we add form data for Redux state
        const completeUser = { 
            ...apiUser, 
            NAME: `${data.firstName} ${data.lastName}`,
            firstName: data.firstName,
            lastName: data.lastName 
        };

        dispatch(login({ userData: completeUser }));
        toast.success(`Welcome to Neighbourly, ${data.firstName}!`);
        navigate('/dashboard'); 
      } else {
        toast.success("Account created! Please login.");
        navigate('/');
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Registration failed. Try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Join Neighbourly</h2>
          <p className="text-sm text-gray-500 mt-2">Create an account to connect with your community.</p>
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
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all appearance-none bg-white"
              >
                <option value="seeker">Find Services (Seeker)</option>
                <option value="provider">Offer Services (Provider)</option>
              </select>
            </div>
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-lg font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
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