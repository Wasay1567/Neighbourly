import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Calendar, User, CheckCircle, Clock } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Backend should return different bookings based on my role (seeker vs provider)
        const { data } = await api.get('/bookings/my-bookings'); 
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {loading ? <p>Loading...</p> : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Service Info */}
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{booking.service_title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <Calendar size={14}/> {new Date(booking.scheduled_start).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <User size={14}/> {booking.other_party_name} {/* Provider or Seeker name */}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                 {booking.status === 'pending' && (
                   <button className="text-red-600 text-sm font-semibold hover:bg-red-50 px-3 py-2 rounded">
                     Cancel
                   </button>
                 )}
                 {booking.status === 'confirmed' && (
                   <button className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-3 py-2 rounded">
                     Message
                   </button>
                 )}
              </div>
            </div>
          ))}
          
          {bookings.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
              No bookings found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookings;