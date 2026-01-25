import React, { useEffect, useState } from "react";
import CreateForm from "../components/CreateForm";
import api from "../utils/api"; // Stage 2: Use the interceptor
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import ProviderStats from "../components/ProviderStats";
import { Plus, Search, Calendar, MapPin } from "lucide-react";

const UserDashboard = () => {
  const [services, setServices] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { userData } = useSelector((state) => state.user);
  
  // Normalize Role (Backend sends 'provider', 'seeker', etc.)
  const role = userData?.ROLE?.toLowerCase() || userData?.role?.toLowerCase();
  const isProvider = role === 'provider' || role === 'admin';

  // 1. Fetch "My Services" (Only for Providers)
  const fetchMyServices = async () => {
    if (!isProvider) {
        setLoading(false);
        return;
    }

    try {
      // Stage 2 Endpoint: /services/my/services
      const res = await api.get('/services/my/services');
      setServices(res.data.data.services); // Backend: { data: { services: [] } }
    } catch (err) {
      console.error(err);
      // Don't toast error if it's just empty or 404
      if (err.response?.status !== 404) {
          toast.error("Could not load your services");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, [userData]); 

  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 pb-20 pt-10 px-6">
        <div className="max-w-6xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-2">Welcome back, {userData?.firstName || userData?.NAME}!</h2>
            <p className="text-teal-100 text-lg opacity-90">
            {isProvider 
                ? "Here is how your business is doing today." 
                : "Ready to find some help around the neighborhood?"}
            </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10">
        
        {/* --- PROVIDER STATS (Only for Providers) --- */}
        {isProvider && (
            <div className="mb-10">
                <ProviderStats />
            </div>
        )}

        {/* --- ACTION GRID --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            
            {/* 1. Search (Everyone) */}
            <Link
                to="/search-services"
                className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition flex items-center gap-4"
            >
                <div className="bg-blue-50 p-3 rounded-full text-blue-600 group-hover:bg-blue-100 transition">
                    <Search size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Find Services</h3>
                    <p className="text-sm text-gray-500">Browse local experts near you</p>
                </div>
            </Link>

            {/* 2. My Bookings (Everyone) */}
            <Link
                to="/my-bookings"
                className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition flex items-center gap-4"
            >
                <div className="bg-purple-50 p-3 rounded-full text-purple-600 group-hover:bg-purple-100 transition">
                    <Calendar size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">My Bookings</h3>
                    <p className="text-sm text-gray-500">Track status & history</p>
                </div>
            </Link>

            {/* 3. Create Service (Provider Only) */}
            {isProvider && (
                <div
                    onClick={() => setShowCreate(true)}
                    className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition flex items-center gap-4 cursor-pointer"
                >
                    <div className="bg-teal-50 p-3 rounded-full text-teal-600 group-hover:bg-teal-100 transition">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">List New Service</h3>
                        <p className="text-sm text-gray-500">Offer your skills to neighbors</p>
                    </div>
                </div>
            )}
        </section>

        {/* --- PROVIDER LISTINGS SECTION --- */}
        {isProvider && (
            <section className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Your Active Listings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-gray-400 col-span-full">Loading your services...</p>
                ) : services.length > 0 ? (
                    services.map((service) => (
                    <div key={service.id || service.ID} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-1 rounded">
                                {service.category?.name || service.category || "Service"}
                            </span>
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 mb-2">{service.title || service.TITLE}</h4>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description || service.DESCRIPTION}</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="text-sm font-bold text-gray-900">
                                ${service.priceAmount || service.price_amount}/hr
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin size={12} /> {service.serviceRadiusKm || 5}km Radius
                            </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
                        <p className="text-gray-500 mb-4">You haven't listed any services yet.</p>
                        <button 
                            onClick={() => setShowCreate(true)}
                            className="text-teal-600 font-bold hover:underline"
                        >
                            Create your first listing
                        </button>
                    </div>
                )}
                </div>
            </section>
        )}
      </div>

      {/* CreateForm Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <CreateForm
             setServices={setServices}
             closeForm={() => setShowCreate(false)}
           />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;