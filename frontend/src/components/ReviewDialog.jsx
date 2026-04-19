import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { getReviewsForService } from "@/utils/api";
import { SAMPLE_REVIEWS } from "@/data/sampleReviews";

const DEV_MODE = import.meta.env.VITE_DEV_MODE === "TRUE";

export default function ReviewDialog({ service, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!service) {
    return null; // Safety check
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : 0;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getReviewsForService(service.id || service.ID);
        let reviewsData = data.data || data || [];
        
        // Use sample reviews as fallback in dev mode or if no real reviews exist
        if ((DEV_MODE || reviewsData.length === 0) && !reviewsData.length) {
          reviewsData = SAMPLE_REVIEWS;
        }
        
        setReviews(reviewsData);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        // Use sample reviews as fallback on error
        setReviews(SAMPLE_REVIEWS);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [service]);

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={16}
            className={i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X size={20} className="text-gray-700" />
        </button>

        {/* Header with Rating */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">{service.TITLE || service.title}</h2>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold">{avgRating}</div>
            <div>
              <div className="flex gap-1 mb-2">{renderStars(Math.round(avgRating))}</div>
              <p className="text-teal-100 text-sm">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No reviews yet</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id || review._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{review.title || "Untitled"}</p>
                      <p className="text-sm text-gray-500">{review.reviewerName || "Anonymous"}</p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700 text-sm">{review.comment || review.text}</p>
                  {review.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

