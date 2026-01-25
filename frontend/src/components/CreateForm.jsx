import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { API_URL } from "../conf/conf.js";
import { X, MapPin, Loader2, Tag } from "lucide-react"; 
import useGeoLocation from "../hooks/useGeoLocation";
import useMetaData from "../hooks/useMetaData"; // <--- Import new hook
import api from "../utils/api";

const CreateForm = ({ setServices, closeForm }) => {
  const { userData } = useSelector((state) => state.user);
  
  // 1. Hooks
  const { location, getLocation } = useGeoLocation();
  const { categories, loading: catsLoading } = useMetaData(); // Fetch dynamic categories
  
  const [neighborhoodName, setNeighborhoodName] = useState(null); // Store detected neighborhood

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  // 2. Auto-get location & Identify Neighborhood
  useEffect(() => {
    getLocation();
  }, []);

  // New Effect: When coordinates arrive, ask backend "Where am I?"
  useEffect(() => {
    const identifyNeighborhood = async () => {
        if (location.loaded && location.coordinates.lat) {
            try {
                // Hit your new Stage 2 endpoint
                const { data } = await api.get(`/neighborhoods/find?lat=${location.coordinates.lat}&lng=${location.coordinates.lng}`);
                setNeighborhoodName(data.data.neighborhood.name);
            } catch (err) {
                console.log("Could not identify specific neighborhood (H3 index not found)");
                setNeighborhoodName(null);
            }
        }
    };
    identifyNeighborhood();
  }, [location.loaded, location.coordinates.lat]);

  const onSubmit = async (data) => {
    if (!location.loaded || !location.coordinates.lat) {
      toast.error("We need your location to list this service!");
      getLocation(); 
      return;
    }

    try {
      const payload = {
        title: data.title,
        desc: data.description,
        categoryId: parseInt(data.category), // Send ID, not name
        authorID: userData.ID,
        latitude: location.coordinates.lat,
        longitude: location.coordinates.lng,
        priceAmount: parseFloat(data.price),
        serviceRadiusKm: 5, 
      };

      const res = await api.post('/services', payload); 
      toast.success(`Service listed in ${neighborhoodName || 'your area'}! 📍`);

      // Optimistic Update
      const newServiceOptimistic = {
        ID: Date.now(),
        TITLE: data.title,
        DESCRIPTION: data.description,
        CATEGORY: categories.find(c => c.id == data.category)?.name || "Service",
        AUTHORID: userData.ID,
        neighborhood: neighborhoodName // Display this on card if you want
      };

      setServices((prev) => [newServiceOptimistic, ...prev]);
      reset();
      closeForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create service");
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
        List a Service
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* --- LOCATION BADGE --- */}
        <div className={`p-3 rounded-lg flex items-center gap-3 text-sm ${
            neighborhoodName 
                ? "bg-purple-50 text-purple-700 border border-purple-100" // Verified Neighborhood
                : location.loaded 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : "bg-blue-50 text-blue-600 border border-blue-100"
        }`}>
            {neighborhoodName ? (
                <>
                    <MapPin size={18} className="shrink-0" />
                    <span className="font-bold">Verified Zone: {neighborhoodName}</span>
                </>
            ) : location.loaded ? (
                <>
                    <MapPin size={18} className="shrink-0" />
                    <span>GPS Tagged: {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}</span>
                </>
            ) : (
                <>
                    <Loader2 size={18} className="animate-spin shrink-0" />
                    <span>Acquiring GPS...</span>
                </>
            )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            placeholder="e.g. Expert Plumbing"
            {...register("title", { required: "Required" })}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Category (DYNAMIC DROPDOWN) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <div className="relative">
            <select
                {...register("category", { required: "Select a category" })}
                className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-teal-500 outline-none bg-white appearance-none"
                disabled={catsLoading}
            >
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                ))}
            </select>
            <Tag className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows="3"
            placeholder="Describe your service..."
            {...register("description", { required: "Required" })}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Price */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
            <input
                type="number"
                placeholder="25.00"
                {...register("price", { required: "Required" })}
                className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-teal-500 outline-none"
            />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !location.loaded}
          className="w-full bg-teal-600 text-white font-bold py-2.5 rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Listing..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
};

export default CreateForm;