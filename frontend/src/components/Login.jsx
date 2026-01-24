import React, { useState } from "react";
import { useForm } from "react-hook-form";

const Login = ({onLogin}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }} = useForm();

  const onSubmit = (data) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin(data);
      setIsLoading(false);
    }, 800);
  };

  const communityLinkMock = () => {
    alert("Link to join the community (Not implemented yet)")
  }
  
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">
          Login to manage your listings and bookings.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Please enter a valid email address",
              },
            })}
            className={`w-full px-4 py-3 rounded-lg border outline-none transition-all 
              ${errors.email 
                ? "border-red-500 focus:ring-2 focus:ring-red-200" 
                : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              }`}
            placeholder="name@neighbourhood.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className={`w-full px-4 py-3 rounded-lg border outline-none transition-all 
              ${errors.password 
                ? "border-red-500 focus:ring-2 focus:ring-red-200" 
                : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        New to the neighbourhood?{" "}
        <div
        onClick={communityLinkMock}
        className="text-emerald-600 font-semibold hover:underline">
          Join the community
        </div>
      </div>
    </div>
  );
};

export default Login;