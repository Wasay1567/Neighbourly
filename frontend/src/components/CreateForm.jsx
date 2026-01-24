import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const CreateForm = ({ onSuccess, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          status: "Active",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create service");
      }

      toast.success("Service created successfully 🎉");

      onSuccess({
        id: Date.now(),
        ...data,
        status: "Active",
      });

      reset();
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong ❌");
    }
  };

  return (
    <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold mb-6 text-center">
        Create a New Service
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <input
            placeholder="Title"
            className="w-full border px-4 py-2 rounded"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <textarea
            placeholder="Description"
            className="w-full border px-4 py-2 rounded"
            {...register("description", {
              required: "Description is required",
              minLength: { value: 10, message: "Minimum 10 characters" },
            })}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <input
            type="number"
            placeholder="Price"
            className="w-full border px-4 py-2 rounded"
            {...register("price", {
              required: "Price is required",
              min: { value: 1, message: "Price must be greater than 0" },
            })}
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <input
            placeholder="Category"
            className="w-full border px-4 py-2 rounded"
            {...register("category", { required: "Category is required" })}
          />
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <input
            placeholder="Location"
            className="w-full border px-4 py-2 rounded"
            {...register("location", { required: "Location is required" })}
          />
          {errors.location && (
            <p className="text-red-500 text-sm">{errors.location.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Service"}
        </button>
      </form>
    </div>
  );
};

export default CreateForm;