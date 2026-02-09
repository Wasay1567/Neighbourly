import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useSelector } from "react-redux";

const DEV_MODE = import.meta.env.VITE_DEV_MODE === "TRUE";

const BookingModal = ({ service, onClose }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [duration, setDuration] = useState(1);
  const pricePerHour = parseFloat(service.priceAmount || service.price_amount || 0);
  const estimatedTotal = (pricePerHour * duration).toFixed(2);

  const onSubmit = async (data) => {
    try {
      const startDateTime = new Date(`${data.date}T${data.time}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);

      let booking;

      if (DEV_MODE) {
        //dev: skip API, use mock booking
        booking = {
          id: `dev-booking-${Date.now()}`,
          totalAmount: estimatedTotal,
          scheduledStart: startDateTime.toISOString(),
          scheduledEnd: endDateTime.toISOString(),
        };
        console.log("Dev Mode :: mock booking created", booking);
      } else {
        const payload = {
          serviceId: service.id || service.ID,
          scheduledStart: startDateTime.toISOString(),
          scheduledEnd: endDateTime.toISOString(),
          specialInstructions: data.notes || "",
        };
        const response = await api.post("/bookings", payload);
        booking = response.data.data.booking
      }

      toast.success("Booking request sent!");

      navigate("/payment", {
        state: {
          bookingId: booking.id,
          serviceTitle: service.TITLE || service.title,
          amount: booking.totalAmount || estimatedTotal,
          providerName: service.providerName || "Service Provider",
        },
      });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Booking failed. Please try again.";
      toast.error(msg);
    }
  };

  if (!userData) {
      return null; //safety check
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Header */}
        <div className="bg-teal-600 p-6 text-white">
          <h2 className="text-xl font-bold">Request Service</h2>
          <p className="text-teal-100 text-sm mt-1">{service.TITLE || service.title}</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            {...register("date", { required: "Date is required" })}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            min={new Date().toISOString().split('T')[0]} // Disable past dates
                        />
                        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Time</label>
                    <div className="relative">
                        <input
                            type="time"
                            {...register("time", { required: "Time is required" })}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <Clock className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                    </div>
                </div>
            </div>

            {/* Duration Selector */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Duration (Hours)</label>
                <select 
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                        <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''}</option>
                    ))}
                </select>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Special Instructions</label>
                <textarea
                    rows="3"
                    {...register("notes")}
                    placeholder="Gate code, specific focus areas, etc..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                />
            </div>

            {/* Price Estimate */}
            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle size={16} />
                    <span>Estimated Total</span>
                </div>
                <span className="text-xl font-bold text-teal-700">${estimatedTotal}</span>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-teal-700 transition transform active:scale-[0.98] disabled:opacity-70"
            >
                {isSubmitting ? "Sending Request..." : "Proceed to Payment"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;