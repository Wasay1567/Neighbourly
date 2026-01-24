import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { API_URL } from "../conf/conf.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "@/features/userSlice.js";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ name, email }) => {
    setIsLoading(true);
    try {
      //check if user exists
      const res = await fetch(`${API_URL}/users/retrieve`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const users = await res.json();

      let user = users.find(u => u.EMAIL === email);

      if (!user) {
        //if user doesn't exist, create
        const createRes = await fetch(`${API_URL}/users/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email }),
        });

        if (!createRes.ok) throw new Error("Failed to create user");
        user = await createRes.json();
      }

      //successful login or signup
      dispatch(login({userData: user}))
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

//   alt functionn
    const onSubmitAlt = async ({ name, email }) => {
    setIsLoading(true);
    try {
      // DEV MODE: skip API, just create a fake user
      const fakeUser = {
        ID: Math.floor(Math.random() * 1000), // random ID
        NAME: name,
        EMAIL: email
      };

      // simulate a small delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // pass the fake user to parent
      dispatch(login(fakeUser));
      navigate('/dashboard')
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Neighbourly</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your name and email to join or continue.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmitAlt)} className="space-y-5">
        {/* name field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            {...register("name", { required: "Name is required" })}
            className={`w-full px-4 py-3 rounded-lg border outline-none
              ${errors.name ? "border-red-500" : "border-gray-200 focus:border-emerald-500"}`}
            placeholder="Your Name"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* email field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /\S+@\S+\.\S+/, message: "Enter a valid email" },
            })}
            className={`w-full px-4 py-3 rounded-lg border outline-none
              ${errors.email ? "border-red-500" : "border-gray-200 focus:border-emerald-500"}`}
            placeholder="name@neighbourhood.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg disabled:opacity-70"
        >
          {isLoading ? "Processing..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default Login;
