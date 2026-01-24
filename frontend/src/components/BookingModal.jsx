import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { API_URL } from "../conf/conf.js";
import { useNavigate } from "react-router-dom";

const BookingModal = ({ service, onClose }) => {
  const user = useSelector((state) => state.user.userData);
    const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    if (!user) {
      toast.error("You must be logged in to book a service!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/bookings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: user.ID,
          serviceID: service.ID,
          coverletter: data.coverLetter,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        // Handle specific "Already Booked" error from your API
        if (res.status === 400) {
          throw new Error("You have already requested this service.");
        }
        throw new Error(responseData.error || "Booking failed");
      }

      toast.success("Request sent successfully!");
      onClose(); // Close the modal
      navigate("/payment", {
         state: {
             bookingId: responseData.data.bookingId,
             serviceTitle: service.TITLE,
             amount: service.priceAmount || 500,
             providerName: "Service Provider Inc."
         } });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">Request Service</h3>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Booking</p>
            <p className="font-semibold text-gray-800">{service.TITLE}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message to Provider
              </label>
              <textarea
                rows="4"
                placeholder="Hi! I'm interested in this service. Are you available on..."
                {...register("coverLetter", { required: true })}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Introduce yourself and suggest a time.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending Request..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;