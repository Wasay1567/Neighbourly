import React, { useEffect, useState } from "react";
import { Search, MapPin, Navigation, RotateCcw, AlertCircle } from "lucide-react";
import BookingModal from "../components/BookingModal";
import ServiceCard from "../components/ServiceCard";
import useGeoLocation from "../hooks/useGeoLocation";

// --- HARDCODED MOCK DATA ---
// --- HARDCODED MOCK DATA (Keys matching ServiceCard expectations) ---
const MOCK_SERVICES = [
  {
    ID: 1, // ServiceCard expects ID
    TITLE: "Expert Pipe Fitting & Repair",
    DESCRIPTION: "Licensed plumber with 10 years experience. I can fix leaks, install new fixtures, and handle emergency pipe bursts anytime.",
    CATEGORY: "Plumbing", // ServiceCard expects a string or object.name
    price_amount: 45.00,  // ServiceCard might check price_amount or priceAmount
    priceAmount: 45.00,   // Keeping both for safety
    serviceRadiusKm: 10,
    neighborhood: "Downtown", // Shows in the #tag
    provider: {
      name: "Mario Rossi",
      avatar: "https://i.pravatar.cc/150?u=mario",
      rating: 4.9,
      reviewCount: 124,
      verified: true
    },
    location: { lat: 40.7128, lng: -74.0060 },
    distance: 1.2
  },
  {
    ID: 2,
    TITLE: "Home Electrical Diagnostics",
    DESCRIPTION: "Solving flickering lights, breaker trips, and outlet issues. Certified electrician available for weekend appointments.",
    CATEGORY: "Electrical",
    price_amount: 60.00,
    priceAmount: 60.00,
    serviceRadiusKm: 15,
    neighborhood: "Westside",
    provider: {
      name: "Elena Sparks",
      avatar: "https://i.pravatar.cc/150?u=elena",
      rating: 4.8,
      reviewCount: 89,
      verified: true
    },
    location: { lat: 40.7138, lng: -74.0070 },
    distance: 3.5
  },
  {
    ID: 3,
    TITLE: "Math & Physics Tutoring",
    DESCRIPTION: "Patient tutor specializing in Calculus and Physics. I help students prepare for SATs and improve their grades.",
    CATEGORY: "Education",
    price_amount: 30.00,
    priceAmount: 30.00,
    serviceRadiusKm: 5,
    neighborhood: "University District",
    provider: {
      name: "David Chen",
      avatar: "https://i.pravatar.cc/150?u=david",
      rating: 5.0,
      reviewCount: 42,
      verified: false
    },
    location: { lat: 40.7148, lng: -74.0050 },
    distance: 0.8
  },
  {
    ID: 4,
    TITLE: "Deep House Cleaning Service",
    DESCRIPTION: "Thorough cleaning for move-ins/move-outs or weekly maintenance. I bring my own eco-friendly supplies.",
    CATEGORY: "Cleaning",
    price_amount: 25.00,
    priceAmount: 25.00,
    serviceRadiusKm: 8,
    neighborhood: "Suburbs",
    provider: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      rating: 4.7,
      reviewCount: 215,
      verified: true
    },
    location: { lat: 40.7118, lng: -74.0040 },
    distance: 2.1
  },
  {
    ID: 5,
    TITLE: "Lawn Mowing & Garden Care",
    DESCRIPTION: "Keep your yard looking great! I offer mowing, trimming, and seasonal cleanup services.",
    CATEGORY: "Gardening",
    price_amount: 40.00,
    priceAmount: 40.00,
    serviceRadiusKm: 3,
    neighborhood: "Green Hills",
    provider: {
      name: "Mike Green",
      avatar: "https://i.pravatar.cc/150?u=mike",
      rating: 4.6,
      reviewCount: 33,
      verified: false
    },
    location: { lat: 40.7158, lng: -74.0080 },
    distance: 4.5
  }
];

const SearchServicePage = () => {
  const { location, getLocation, error: locationError } = useGeoLocation();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(null); 
  const [selectedService, setSelectedService] = useState(null);

  // 1. Unified Fetch Logic (NOW MOCKED)
  const fetchServices = async (mode, params = {}) => {
    setLoading(true);
    
    // Simulate Network Delay
    setTimeout(() => {
        let results = [...MOCK_SERVICES];

        // Simulate Text Search Filtering
        if (mode === 'text' && params.q && params.q !== 'all') {
            const lowerQ = params.q.toLowerCase();
            results = results.filter(s => 
                s.TITLE.toLowerCase().includes(lowerQ) || 
                s.DESCRIPTION.toLowerCase().includes(lowerQ) ||
                s.CATEGORY.toLowerCase().includes(lowerQ)
            );
        }

        // Simulate Radius Filtering (Simple Logic)
        if (mode === 'nearby' && params.radius) {
            // In a real app, we'd calc distance here. 
            // For mock, we just filter services with distance < radius
            results = results.filter(s => s.distance <= params.radius);
        }

        setServices(results);
        setLoading(false);
    }, 600); // 600ms fake delay
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

    // Debounce simulation
    if (val.length === 0) {
        fetchServices('text', { q: 'all' });
    } else {
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
        // If getting location takes time, we just fetch anyway for demo
        fetchServices('nearby', { radius: km });
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
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
                        key={s.ID } 
                        service={s} 
                        onBook={() => setSelectedService(s)} 
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
      {selectedService && (
        <BookingModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </div>
  );
};

export default SearchServicePage;