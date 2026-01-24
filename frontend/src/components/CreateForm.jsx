import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { API_URL } from "../conf/conf.js";
import { X } from "lucide-react"; // Importing the icon you used in Dashboard

const CreateForm = ({ setServices, closeForm }) => {
  const { userData } = useSelector((state) => state.user);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${API_URL}/services/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: null,
          title: data.title,
          desc: data.description,
          category: data.category,
          authorID: userData.ID,
        }),
      });

      if (!res.ok) throw new Error("Failed to create service");

      const apiResponse = await res.json();
      toast.success("Service created successfully 🎉");

      // CRITICAL FIX: 
      // Your Dashboard expects UPPERCASE keys (TITLE, DESCRIPTION), 
      // but your API response might be different. 
      // We normalize the new object here for the local state update.
      const newServiceOptimistic = {
        ID: apiResponse.id || apiResponse.ID || Date.now(), // Fallback if API doesn't return ID
        TITLE: data.title,
        DESCRIPTION: data.description,
        CATEGORY: data.category,
        AUTHORID: userData.ID
      };

      setServices((prev) => [newServiceOptimistic, ...prev]);

      reset();
      closeForm();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong ❌");
    }
  };

  return (
    // This Div is the "Card"
    <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
      <button
        type="button" // FIX: Prevent form submission on close
        onClick={closeForm}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
      >
        <X size={24} />
      </button>

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Create a New Service
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            placeholder="e.g. Lawn Mowing"
            {...register("title", { required: "Title is required" })}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows="4"
            placeholder="Describe what you are offering..."
            {...register("description", {
              required: "Description required",
              minLength: { value: 10, message: "Must be at least 10 chars" },
            })}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            placeholder="e.g. Gardening, Tutoring"
            {...register("category", { required: "Category is required" })}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Creating..." : "Create Service"}
        </button>
      </form>
    </div>
  );
};

export default CreateForm;