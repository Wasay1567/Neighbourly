import { MapPin, Star, User } from "lucide-react";

const ServiceCard = ({ service, onBook, onReview }) => {
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-200 border border-gray-100 flex flex-col h-full overflow-hidden group">
      {/* Header with category and location */}
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start gap-3 mb-3">
          <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full">
            {service.CATEGORY}
          </span>
          <div className="text-gray-300 group-hover:text-gray-400 transition">
            <MapPin size={18} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-700 transition">
          {service.TITLE}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {service.DESCRIPTION}
        </p>

        {/* Price section */}
        <div className="text-lg font-bold text-teal-600 mb-4">
          ${service.priceAmount || service.price_amount}/hr
        </div>
      </div>

      {/* Footer with provider info and actions */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 space-y-3">
        {/* Provider info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">
            <User size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Service Provider</p>
            <p className="text-xs text-gray-500">ID: #{service.AUTHORID}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button 
            onClick={onBook}
            className="flex-1 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2.5 rounded-lg transition shadow-sm hover:shadow-md"
          >
            Book Now
          </button>
          <button
            onClick={onReview}
            className="flex-1 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-1.5"
          >
            <Star size={16} className="group-hover:fill-teal-700" />
            Reviews
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard