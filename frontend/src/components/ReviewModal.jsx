import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Star, X } from "lucide-react";
import api from "../utils/api";

const ReviewModal = ({ bookingId, serviceTitle, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    if (rating === 0) {
      return toast.error("Please select a star rating");
    }

    try {
      // API call matches your backend controller: createReview
      await api.post('/reviews', {
        bookingId: bookingId,
        rating: rating,
        title: data.title,
        comment: data.comment,
        isAnonymous: data.isAnonymous
      });

      toast.success("Review submitted! Thank you.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rate your experience</h2>
          <p className="text-gray-500 text-sm mb-6">
            How was the service for <span className="font-semibold text-gray-800">{serviceTitle}</span>?
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Star Rating Picker */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    size={36} 
                    className={`transition-colors duration-200 ${
                      star <= (hoverRating || rating) 
                        ? "fill-amber-400 text-amber-400" 
                        : "fill-transparent text-gray-300"
                    }`} 
                  />
                </button>
              ))}
            </div>
            
            {rating > 0 && (
                <p className="text-sm font-medium text-amber-600 animate-in fade-in slide-in-from-bottom-2">
                    {rating === 5 ? "Excellent!" : rating === 4 ? "Good" : rating === 3 ? "Okay" : rating === 2 ? "Poor" : "Terrible"}
                </p>
            )}

            {/* Title */}
            <div>
              <input 
                {...register("title", { required: "Please give a headline" })}
                placeholder="Headline (e.g. Great work!)"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
              />
              {errors.title && <span className="text-xs text-red-500 block text-left mt-1">{errors.title.message}</span>}
            </div>

            {/* Comment */}
            <div>
              <textarea 
                rows="3"
                {...register("comment", { required: "Please share some details" })}
                placeholder="Share details about your experience..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition resize-none"
              />
              {errors.comment && <span className="text-xs text-red-500 block text-left mt-1">{errors.comment.message}</span>}
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-2 text-sm text-gray-600 justify-start">
                <input 
                    type="checkbox" 
                    id="anon"
                    {...register("isAnonymous")}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                />
                <label htmlFor="anon" className="cursor-pointer">Post anonymously</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;