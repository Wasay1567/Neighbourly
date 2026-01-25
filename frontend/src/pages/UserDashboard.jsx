import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, Search, Calendar, MapPin, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api"; 
import ProviderStats from "../components/ProviderStats";
import CreateForm from "../components/CreateForm"; // Ensure this is imported

const UserDashboard = () => {
  const [services, setServices] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { userData } = useSelector((state) => state.user);
  
  // 1. Robust Provider Check
  // Check both keys and normalize to lowercase
  const rawRole = userData?.ROLE || userData?.role || '';
  const isProvider = rawRole.toLowerCase() === 'provider' || rawRole.toLowerCase() === 'admin';

  console.log("UserDashboard - isProvider:", isProvider, "Raw Role:", rawRole);

  // 2. Fetch Services (Only if Provider)
  useEffect(() => {
    const fetchMyServices = async () => {
        if (!isProvider) return; // Skip for Seekers

        try {
            setLoading(true);
            const res = await api.get('/services/my/services');
            // Backend returns: { data: { services: [...] } }
            setServices(res.data.data.services || []);
        } catch (err) {
            console.error("Fetch services failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (userData) {
        fetchMyServices();
    }
  }, [userData, isProvider]);

  return (
    <div className="min-h-screen bg-gray-50 relative pb-20">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 pb-24 pt-12 px-6 shadow-md">
        <div className="max-w-6xl mx-auto text-white">
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight">
                Welcome, {userData?.firstName || userData?.NAME?.split(' ')[0] || "Neighbor"}!
            </h2>
            <p className="text-teal-50 text-lg font-medium opacity-90">
            {isProvider 
                ? "Here is an overview of your business activity." 
                : "Find reliable help for your next project."}
            </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12">
        
        {/* --- PROVIDER STATS (Provider Only) --- */}
        {isProvider && (
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProviderStats />
            </div>
        )}

        {/* --- ACTION CARDS --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            
            {/* 1. Find Services (Everyone) */}
            <Link
                to="/search-services"
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300 flex items-center gap-5"
            >
                <div className="bg-blue-50 p-4 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Search size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Find Services</h3>
                    <p className="text-sm text-gray-500 group-hover:text-blue-600 transition">Browse local experts</p>
                </div>
            </Link>

            {/* 2. My Bookings (Everyone) */}
            <Link
                to="/my-bookings"
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300 flex items-center gap-5"
            >
                <div className="bg-purple-50 p-4 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Calendar size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">My Bookings</h3>
                    <p className="text-sm text-gray-500 group-hover:text-purple-600 transition">Track your activity</p>
                </div>
            </Link>

            {/* 3. Create Service (Provider Only) */}
            {isProvider && (
                <button
                    onClick={() => setShowCreate(true)}
                    className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300 flex items-center gap-5 text-left w-full"
                >
                    <div className="bg-teal-50 p-4 rounded-full text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">List Service</h3>
                        <p className="text-sm text-gray-500 group-hover:text-teal-600 transition">Offer your skills</p>
                    </div>
                </button>
            )}
        </section>

        {/* --- ACTIVE LISTINGS (Provider Only) --- */}
        {isProvider && (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Your Active Listings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.length > 0 ? (
                    services.map((service) => (
                    <div key={service.id || service.ID} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                                {service.category?.name || service.category || "Service"}
                            </span>
                            {/* Option to delete/edit could go here */}
                        </div>
                        
                        <h4 className="font-bold text-xl text-gray-900 mb-2 leading-tight">{service.title || service.TITLE}</h4>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">{service.description || service.DESCRIPTION}</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="text-lg font-bold text-gray-900">
                                ${service.priceAmount || service.price_amount}<span className="text-sm text-gray-400 font-normal">/hr</span>
                            </div>
                            <div className="text-xs font-medium text-gray-400 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                <MapPin size={12} /> {service.serviceRadiusKm || 5}km Radius
                            </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                             <Search size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">No services listed yet</h4>
                        <p className="text-gray-500 mb-6">Create your first service to start getting booked.</p>
                        <button 
                            onClick={() => setShowCreate(true)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition shadow-lg shadow-teal-600/20"
                        >
                            <Plus size={18} /> Create Listing
                        </button>
                    </div>
                )}
                </div>
            </section>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
           <div className="relative w-full max-w-xl">
               {/* Close button handled inside CreateForm or add wrapper here */}
               <CreateForm
                 setServices={setServices}
                 closeForm={() => setShowCreate(false)}
               />
           </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;