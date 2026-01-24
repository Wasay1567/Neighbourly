import { MapPin } from "lucide-react";

const ServiceCard = ({ service, onBook }) => {
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-200 border border-gray-100 flex flex-col h-full">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            {service.CATEGORY}
          </span>
          <div className="text-gray-400">
            <MapPin size={16} />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {service.TITLE}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {service.DESCRIPTION}
        </p>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between rounded-b-xl">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
             #{service.AUTHORID}
           </div>
           <span className="text-sm text-gray-500">Neighbor</span>
        </div>

        <button 
          onClick={onBook}
          className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition shadow-sm"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default ServiceCard