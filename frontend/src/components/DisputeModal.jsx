import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AlertTriangle, X, Shield, FileText } from "lucide-react";
import api from "../utils/api";

const DisputeModal = ({ bookingId, onClose }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      // FIX: Matches backend 'createDispute' controller exactly
      await api.post(`/disputes`, {
        bookingId: bookingId, // <--- CHANGED from booking_id to bookingId
        category: data.category,
        description: data.description,
        evidence: [] // Optional: Add file upload logic later
      });

      toast.success("Dispute submitted. A moderator will review it shortly.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit dispute");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-amber-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Shield size={20} />
            <h3 className="font-bold text-lg">Report an Issue</h3>
          </div>
          <button onClick={onClose} className="hover:bg-amber-700 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 p-4 border-b border-amber-100 flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-relaxed">
                Opening a dispute will freeze the funds held in escrow. Please try to resolve the issue with the neighbor directly first.
            </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Booking Reference */}
            <div className="text-xs text-gray-500 font-mono mb-2">
                REF: {bookingId}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
              <select
                {...register("category", { required: "Please select a reason" })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
              >
                <option value="">Select a category...</option>
                <option value="service_not_delivered">Service Not Delivered</option>
                <option value="quality_issue">Poor Service Quality</option>
                <option value="payment_dispute">Payment Issue</option>
                <option value="safety_concern">Safety Concern</option>
              </select>
              {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea
                  rows="4"
                  placeholder="Describe the issue..."
                  {...register("description", { required: "Required" })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg">
                    {isSubmitting ? "Submitting..." : "Submit Dispute"}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DisputeModal;