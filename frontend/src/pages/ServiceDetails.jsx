import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, Clock, DollarSign, Trash2, Edit, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import BookingModal from '../components/BookingModal';

const ServiceDetails = () => {
  const { id } = useParams(); // Get Service ID from URL
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  // 1. Fetch Service Data
  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await api.get(`/services/${id}`);
        setService(data);
      } catch (err) {
        toast.error("Service not found");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id, navigate]);

  // 2. Handle Delete (Author Only)
  const handleDelete = async () => {
    if(!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success("Service deleted");
      navigate('/dashboard');
    } catch (err) {
      toast.error("Could not delete service");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const isAuthor = userData?.ID === service.provider_id;
  const isModerator = userData?.ROLE === 'moderator';

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* Hero Image / Banner */}
      <div className="h-64 bg-gray-200 rounded-xl mb-6 relative overflow-hidden">
        {/* If your schema has images, map them here. Using placeholder for now */}
        <img 
          src={service.images?.[0] || "https://via.placeholder.com/800x400?text=Service+Image"} 
          alt={service.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
           <span className="bg-white/90 px-3 py-1 rounded-full text-sm font-bold shadow">
             {service.category_name}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
            <div className="flex items-center text-gray-500 mt-2 gap-4">
              <span className="flex items-center gap-1"><MapPin size={16}/> {service.neighborhood_name || "Local"}</span>
              <span className="flex items-center gap-1"><Clock size={16}/> {service.duration_minutes} mins</span>
            </div>
          </div>

          <div className="prose max-w-none text-gray-700">
            <h3 className="text-xl font-semibold mb-2">About this service</h3>
            <p className="whitespace-pre-line">{service.description}</p>
          </div>
        </div>

        {/* Right: Action Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-500">Price</span>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-teal-600">${service.price_amount}</span>
                <span className="text-sm text-gray-500 mb-1">/{service.price_unit}</span>
              </div>
            </div>

            {/* --- DYNAMIC ACTION BUTTONS --- */}
            
            {/* Case 1: I am the Author */}
            {isAuthor && (
              <div className="space-y-3">
                <button 
                  onClick={() => navigate(`/services/edit/${id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-200 transition"
                >
                  <Edit size={18}/> Edit Listing
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-100 transition"
                >
                  <Trash2 size={18}/> Delete Listing
                </button>
              </div>
            )}

            {/* Case 2: I am a Moderator */}
            {isModerator && !isAuthor && (
               <button 
               onClick={() => alert("Suspend logic here")}
               className="w-full flex items-center justify-center gap-2 bg-amber-100 text-amber-800 py-3 rounded-lg font-semibold hover:bg-amber-200 transition"
             >
               <AlertTriangle size={18}/> Suspend Listing
             </button>
            )}

            {/* Case 3: I am a Seeker (Default) */}
            {!isAuthor && !isModerator && (
              <button 
                onClick={() => setShowBooking(true)}
                className="w-full bg-teal-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-teal-700 shadow-md transition transform active:scale-[0.98]"
              >
                Book Now
              </button>
            )}
            
            <div className="mt-6 text-center text-xs text-gray-400">
              Protected by Neighbourly Guarantee
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal Popup */}
      {showBooking && (
        <BookingModal 
          service={service} 
          onClose={() => setShowBooking(false)} 
        />
      )}
    </div>
  );
};

export default ServiceDetails;