import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Calendar, User, AlertTriangle, MessageSquare, XCircle, Star } from 'lucide-react';
import DisputeModal from '../components/DisputeModal';
import ReviewModal from '../components/ReviewModal'; // <--- Import logic
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [disputeBookingId, setDisputeBookingId] = useState(null);
  const [reviewData, setReviewData] = useState(null); // Stores { id, title } for the review modal

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings');
        setBookings(data.data.bookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if(!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
        await api.post(`/bookings/${bookingId}/cancel`, { reason: "User dashboard request" });
        toast.success("Booking cancelled.");
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
        toast.error("Failed to cancel booking.");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">My Bookings</h1>

      {loading ? (
        <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition hover:shadow-md">
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">
                        {booking.service?.title || "Service Booking"} 
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                    </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                    <p className="flex items-center gap-1.5"><Calendar size={14} className="text-teal-600"/> {new Date(booking.scheduledStart || booking.scheduled_start).toLocaleDateString()}</p>
                    <p className="flex items-center gap-1.5"><User size={14} className="text-teal-600"/> Provider ID: {booking.providerId || booking.provider_id}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                 
                 {/* Cancel Action */}
                 {booking.status === 'pending' && (
                    <button onClick={() => handleCancel(booking.id)} className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-semibold transition">
                      <XCircle size={16} /> Cancel
                    </button>
                 )}

                 {/* Contact Action */}
                 {['confirmed', 'completed', 'in_progress'].includes(booking.status) && (
                    <button className="flex items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-semibold transition">
                      <MessageSquare size={16} /> Message
                    </button>
                 )}

                 {/* --- REVIEW ACTION (Completed Only) --- */}
                 {booking.status === 'completed' && (
                    <button 
                        onClick={() => setReviewData({ id: booking.id, title: booking.service?.title })}
                        className="flex items-center gap-1 text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-semibold transition border border-gray-200"
                    >
                        <Star size={16} className="text-amber-500 fill-amber-500" /> Rate & Review
                    </button>
                 )}

                 {/* Dispute Action */}
                 {['confirmed', 'completed', 'in_progress'].includes(booking.status) && (
                    <button onClick={() => setDisputeBookingId(booking.id)} className="flex items-center gap-1 text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg text-sm font-semibold transition border border-amber-100">
                        <AlertTriangle size={16} /> Report
                    </button>
                 )}
              </div>
            </div>
          ))}
          
          {bookings.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">You haven't booked any services yet.</p>
            </div>
          )}
        </div>
      )}

      {/* --- MODALS --- */}
      {disputeBookingId && (
        <DisputeModal bookingId={disputeBookingId} onClose={() => setDisputeBookingId(null)} />
      )}
      
      {reviewData && (
        <ReviewModal 
            bookingId={reviewData.id} 
            serviceTitle={reviewData.title || "Service"} 
            onClose={() => setReviewData(null)} 
        />
      )}
    </div>
  );
};

export default MyBookings;