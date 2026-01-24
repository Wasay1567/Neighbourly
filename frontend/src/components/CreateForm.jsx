import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { API_URL } from "../conf/conf.js";
import { X, MapPin, Loader2 } from "lucide-react"; 
import useGeoLocation from "../hooks/useGeoLocation"; // <--- Import your custom hook

const CreateForm = ({ setServices, closeForm }) => {
  const { userData } = useSelector((state) => state.user);
  
  // 1. Initialize Location Hook
  const { location, getLocation, error: locationError } = useGeoLocation();

  const {
    register,
    handleSubmit,
    setValue, // Used to manually set hidden fields if needed
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  // 2. Auto-get location on mount
  useEffect(() => {
    getLocation();
  }, []);

  const onSubmit = async (data) => {
    // Stage 2 Validation: Ensure we have location
    if (!location.loaded || !location.coordinates.lat) {
      toast.error("We need your location to list this service!");
      getLocation(); // Try again
      return;
    }

    try {
      // 3. Construct Stage 2 Payload
      const payload = {
        // ... basic fields ...
        title: data.title,
        desc: data.description, // Ensure backend matches this key (desc vs description)
        category: data.category,
        authorID: userData.ID,
        
        // ... NEW GEOLOCATION FIELDS ...
        latitude: location.coordinates.lat,
        longitude: location.coordinates.lng,
        
        // Hardcoded defaults for Hackathon MVP if user doesn't type them
        priceAmount: parseFloat(data.price) || 0, 
        serviceRadiusKm: 5, 
      };

      const res = await fetch(`${API_URL}/services/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create service");
      }

      const apiResponse = await res.json();
      toast.success("Service created with Location! 📍");

      // Optimistic UI Update
      const newServiceOptimistic = {
        ID: apiResponse.id || Date.now(),
        TITLE: data.title,
        DESCRIPTION: data.description,
        CATEGORY: data.category,
        AUTHORID: userData.ID,
        // Optional: Add location flag so UI knows it's geo-tagged
        HAS_LOCATION: true 
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
    <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
      <button
        type="button"
        onClick={closeForm}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
      >
        <X size={24} />
      </button>

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Create a New Service
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* --- LOCATION STATUS INDICATOR --- */}
        <div className={`p-3 rounded-lg flex items-center gap-3 text-sm ${
            location.error 
                ? "bg-red-50 text-red-600 border border-red-100" 
                : location.loaded 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : "bg-blue-50 text-blue-600 border border-blue-100"
        }`}>
            {location.error ? (
                <>
                    <MapPin size={18} className="shrink-0" />
                    <span>Location denied. Please enable GPS.</span>
                    <button type="button" onClick={getLocation} className="underline ml-auto">Retry</button>
                </>
            ) : location.loaded ? (
                <>
                    <MapPin size={18} className="shrink-0" />
                    <span className="font-medium">
                        Location tagged: {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                    </span>
                </>
            ) : (
                <>
                    <Loader2 size={18} className="animate-spin shrink-0" />
                    <span>Acquiring your location...</span>
                </>
            )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            placeholder="e.g. Lawn Mowing"
            {...register("title", { required: "Title is required" })}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows="3"
            placeholder="Describe what you are offering..."
            {...register("description", {
              required: "Description required",
              minLength: { value: 10, message: "Must be at least 10 chars" },
            })}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Category & Price Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                    placeholder="e.g. Repair"
                    {...register("category", { required: "Required" })}
                    className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                    type="number"
                    placeholder="25.00"
                    {...register("price", { required: "Required" })}
                    className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !location.loaded || !!location.error}
          className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
              <>Processing...</>
          ) : !location.loaded ? (
              <>Waiting for Location...</>
          ) : (
              <>Create Service</>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateForm;