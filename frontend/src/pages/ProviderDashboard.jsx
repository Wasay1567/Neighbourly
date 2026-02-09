import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, Search, Calendar, MapPin } from "lucide-react";
import api from "../utils/api"; 
import ProviderStats from "../components/ProviderStats";
import CreateForm from "../components/CreateForm"; 

const ProviderDashboard = () => {
  const [services, setServices] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { userData } = useSelector((state) => state.user);

  // Fetch Provider Services
  useEffect(() => {
    const fetchMyServices = async () => {
        try {
            setLoading(true);
            const res = await api.get('/services/my/services');
            setServices(res.data.data.services || []);
        } catch (err) {
            console.error("Fetch services failed", err);
        } finally {
            setLoading(false);
        }
    };
    if (userData) fetchMyServices();
  }, [userData]);

  return (
    <div className="min-h-screen bg-gray-50 relative pb-20">
      {/* Provider Hero */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 pb-24 pt-12 px-6 shadow-md border-b border-slate-700">
        <div className="max-w-6xl mx-auto text-white flex justify-between items-end">
            <div>
                <h2 className="text-4xl font-extrabold mb-3 tracking-tight">
                    Provider Portal
                </h2>
                <p className="text-slate-300 text-lg font-medium">
                    Manage your business, listings, and bookings.
                </p>
            </div>
            <div className="hidden md:block">
                 <span className="bg-slate-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-slate-300 border border-slate-600">
                    Verified Provider
                 </span>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12">
        
        {/* 1. Stats Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProviderStats />
        </div>

        {/* 2. Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Create Service */}
            <button
                onClick={() => setShowCreate(true)}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300 flex items-center gap-5 text-left w-full"
            >
                <div className="bg-teal-50 p-4 rounded-full text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Plus size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Post New Service</h3>
                    <p className="text-sm text-gray-500 group-hover:text-teal-600 transition">Create a listing for customers</p>
                </div>
            </button>

            {/* My Bookings (Incoming Jobs) */}
            <Link
                to="/my-bookings"
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300 flex items-center gap-5"
            >
                <div className="bg-purple-50 p-4 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Calendar size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Incoming Bookings</h3>
                    <p className="text-sm text-gray-500 group-hover:text-purple-600 transition">Manage your schedule</p>
                </div>
            </Link>
        </section>

        {/* 3. Active Listings */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-end mb-6">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Your Active Listings</h3>
                <span className="text-sm text-gray-500 font-medium">{services.length} Services Live</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length > 0 ? (
                services.map((service) => (
                <div key={service.id || service.ID} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                            {service.category?.name || service.category || "Service"}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                    
                    <h4 className="font-bold text-xl text-gray-900 mb-2 leading-tight group-hover:text-teal-700 transition-colors">
                        {service.title || service.TITLE}
                    </h4>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                        {service.description || service.DESCRIPTION}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="text-lg font-bold text-gray-900">
                            ${service.priceAmount || service.price_amount}<span className="text-sm text-gray-400 font-normal">/hr</span>
                        </div>
                        <div className="text-xs font-medium text-gray-400 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                            <MapPin size={12} /> {service.serviceRadiusKm || 5}km
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
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
           <div className="relative w-full max-w-xl">
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

export default ProviderDashboard;