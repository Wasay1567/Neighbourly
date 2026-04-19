import React, { useEffect, useState } from "react";
import { Search, MapPin, Navigation, RotateCcw, AlertCircle } from "lucide-react";
import BookingModal from "../components/BookingModal";
import ServiceCard from "../components/ServiceCard";
import useGeoLocation from "../hooks/useGeoLocation";
import api from "../utils/api";
import { getSampleServices } from "@/data/sampleServices";
import ReviewModal from "@/components/ReviewModal";
import ReviewDialog from "@/components/ReviewDialog";

const DEV_MODE = import.meta.env.VITE_DEV_MODE === "TRUE";

const SearchServicePage = () => {
  const { location, getLocation, error: locationError } = useGeoLocation();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isBookOpen, setIsBookOpen] = useState(false);

  // 1. Fetch Logic (uses sample services in dev, API otherwise)
  const fetchServices = async (mode, params = {}) => {
    setLoading(true);

    if (DEV_MODE) {
      let list = getSampleServices();
      const query = (params.q || "").trim().toLowerCase();
      if (mode === "text" && query && query !== "all") {
        list = list.filter(
          (s) =>
            (s.title || s.TITLE || "").toLowerCase().includes(query) ||
            (s.description || s.DESCRIPTION || "").toLowerCase().includes(query) ||
            (s.category_name || s.CATEGORY || "").toLowerCase().includes(query)
        );
      }
      if (mode === "nearby" && params.radius != null) {
        list = list.filter((s) => (s.serviceRadiusKm || 5) <= (params.radius || 99));
      }
      setServices(list);
      setLoading(false);
      return;
    }

    try {
      let endpoint = "/services/search?q=all";
      if (mode === "text") {
        const q = params.q && params.q !== "all" ? params.q : "all";
        endpoint = `/services/search?q=${encodeURIComponent(q)}`;
      } else if (mode === "nearby" && params.lat && params.lng) {
        const rad = params.radius || 5;
        endpoint = `/services/nearby?lat=${params.lat}&lng=${params.lng}&radius=${rad}`;
      }
      const { data } = await api.get(endpoint);
      if (data.success && Array.isArray(data.data?.services)) {
        setServices(data.data.services);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. Initial Load
  useEffect(() => {
    fetchServices('text', { q: 'all' });
  }, []);

  // 3. Handle Text Search 
  const handleTextSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (radius) setRadius(null);

    // Debounce manual simulation
    // In production, use a real debounce function
    if (val.length === 0) {
        fetchServices('text', { q: 'all' });
    } else if (val.length > 2) {
        fetchServices('text', { q: val });
    }
  };

  // 4. Handle Radius/Location Click
  const handleRadiusChange = (km) => {
    setRadius(km);
    setSearchQuery(""); 
    
    if (location.loaded && location.coordinates.lat) {
        fetchServices('nearby', {
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
            radius: km
        });
    } else {
        getLocation();
        // Effect #5 will trigger fetch once location arrives
    }
  };

  // 5. Effect: Watch for Location ready state
  useEffect(() => {
    if (radius && location.loaded && location.coordinates.lat) {
        fetchServices('nearby', {
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
            radius: radius
        });
    }
  }, [location, radius]);

  // 6. Reset
  const handleClear = () => {
      setRadius(null);
      setSearchQuery("");
      fetchServices('text', { q: 'all' });
  };
//-73.9851
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Find Local Experts
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Search by skill or find who is available right now in your neighborhood.
          </p>

          {/* Search Input */}
          <div className="relative max-w-xl mx-auto mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleTextSearch}
              className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition outline-none"
              placeholder="Search 'Plumber', 'Tutor', 'Gardener'..."
            />
          </div>

          {/* Radius Filter Bar */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-200">
                <button
                    onClick={handleClear}
                    className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                        !radius ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    <RotateCcw size={14} /> Any
                </button>

                {[5, 10, 25].map((km) => (
                    <button
                        key={km}
                        onClick={() => handleRadiusChange(km)}
                        className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                            radius === km 
                            ? "bg-teal-600 text-white shadow-md" 
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        {radius === km && <Navigation size={12} fill="currentColor" />}
                        {km}km
                    </button>
                ))}
            </div>
            
            {/* Context Messages */}
            {locationError && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> Location denied. Using text search only.
                </p>
            )}
            {radius && (
                <p className="text-teal-600 text-xs flex items-center gap-1 animate-in fade-in">
                    <MapPin size={12} /> Showing providers within {radius}km.
                </p>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
           <div className="text-center py-20">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
             <p className="mt-4 text-gray-500">Scanning neighborhood...</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length > 0 ? (
                services.map((s) => (
                    <ServiceCard 
                        key={s.id || s.ID} 
                        service={s} 
                        onBook={() => {
                          setSelectedService(s)
                          setIsBookOpen(true)
                        }}
                        onReview={() => {
                          setSelectedService(s);
                          setIsReviewOpen(true);
                        }}
                    />
                ))
            ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">
                        {searchQuery 
                            ? `No services found matching "${searchQuery}"`
                            : "No services found in this area."}
                    </p>
                    <button 
                        onClick={handleClear}
                        className="mt-2 text-teal-600 font-medium hover:underline"
                    >
                        View all services
                    </button>
                </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookOpen && (
        <BookingModal 
          service={selectedService} 
          onClose={() => setIsBookOpen(false)} 
        />
      )}
      {isReviewOpen && (
        <ReviewDialog
        service= {selectedService}
          onClose={()=> setIsReviewOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchServicePage;