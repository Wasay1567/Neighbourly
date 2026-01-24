import React, { useEffect, useState } from "react";
import { Search, MapPin, Navigation, RotateCcw } from "lucide-react"; // Added Navigation & RotateCcw
import BookingModal from "../components/BookingModal";
import { API_URL } from "../conf/conf.js";
import ServiceCard from "../components/ServiceCard";
import useGeoLocation from "../hooks/useGeoLocation";

const SearchServicePage = () => {
  // 1. Initialize Location Hook
  const { location, getLocation, error: locationError } = useGeoLocation();

  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 2. Radius State (null = Global/No filter)
  const [radius, setRadius] = useState(null);

  // 3. The Fetch Logic
  const fetchServices = async (lat = null, lng = null, dist = null) => {
    setLoading(true);
    try {
      let url = `${API_URL}/services/retrieve`;

      // If we have location data, append it to URL query string
      if (lat && lng && dist) {
        url += `?lat=${lat}&lng=${lng}&radius=${dist}`;
        console.log("Fetching geospatial:", url);
      } else {
        console.log("Fetching global services");
      }

      const res = await fetch(url);
      
      // Handle non-200 responses
      if (!res.ok) {
         // Fallback for demo if backend isn't ready
         console.warn("Backend fetch failed, falling back to mock data");
         loadMockData(); 
         return;
      }

      const data = await res.json();
      setServices(data);
      setFilteredServices(data); // Update filtered list too
    } catch (err) {
      console.error(err);
      loadMockData(); // Fallback on error
    } finally {
      setLoading(false);
    }
  };

  // Helper: Load Mock Data (moved out of useEffect for reuse)
  const loadMockData = () => {
    const mockData = [
      { "ID": 1, "TITLE": "Backyard Lawn Mowing", "DESCRIPTION": "Professional mower available.", "CATEGORY": "Gardening", "AUTHORID": 101 },
      { "ID": 2, "TITLE": "High School Math Tutoring", "DESCRIPTION": "Algebra, Geometry, Calculus.", "CATEGORY": "Education", "AUTHORID": 102 },
      { "ID": 3, "TITLE": "Plumbing Quick Fix", "DESCRIPTION": "Leaky faucet repair.", "CATEGORY": "Repair", "AUTHORID": 103 },
      { "ID": 4, "TITLE": "Dog Walking", "DESCRIPTION": "30 min walks.", "CATEGORY": "Pet Care", "AUTHORID": 101 },
    ];
    setServices(mockData);
    setFilteredServices(mockData);
    setLoading(false);
  };

  // 4. Initial Load (Global)
  useEffect(() => {
    fetchServices(); 
  }, []);

  // 5. Effect: Trigger Search when Location is successfully loaded
  useEffect(() => {
    if (location.loaded && location.coordinates.lat && radius) {
      fetchServices(
        location.coordinates.lat, 
        location.coordinates.lng, 
        radius
      );
    }
  }, [location, radius]); 

  // 6. Handle Radius Button Click
  const handleRadiusChange = (km) => {
    setRadius(km);
    // If we don't have permission yet, ask for it.
    // The useEffect above will trigger the actual fetch once coordinates arrive.
    if (!location.loaded) {
        getLocation(); 
    }
  };

  // 7. Clear Location Filter
  const handleClearLocation = () => {
      setRadius(null);
      fetchServices(); // Reset to global search
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = services.filter((service) => {
      const title = service.TITLE?.toLowerCase() || "";
      const category = service.CATEGORY?.toLowerCase() || "";
      return title.includes(query) || category.includes(query);
    });
    setFilteredServices(filtered);
  };

  // Modal State
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Explore Neighborhood Services
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover help right around the corner. Search for skills, tools, and local experts.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition outline-none"
              placeholder="Try 'Gardening' or 'Repair'..."
            />
          </div>

          {/* --- NEW: Radius Filter Buttons --- */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-200">
                {/* Global / Reset Button */}
                <button
                    onClick={handleClearLocation}
                    className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                        radius === null 
                        ? "bg-gray-800 text-white" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    <RotateCcw size={14} /> Global
                </button>

                {/* Radius Options */}
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
            
            {/* Location Status / Error Message */}
            {locationError ? (
                <p className="text-red-500 text-xs flex items-center gap-1">
                    <MapPin size={12} /> Location access denied. Showing global results.
                </p>
            ) : radius && location.loaded ? (
                <p className="text-teal-600 text-xs flex items-center gap-1 animate-in fade-in">
                    <MapPin size={12} /> Showing results within {radius}km of your location.
                </p>
            ) : null}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
           <div className="text-center py-20">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
             <p className="mt-4 text-gray-500">Scanning neighborhood...</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.length > 0 ? (
                filteredServices.map((s) => (
                    <ServiceCard 
                        key={s.ID} 
                        service={s} 
                        onBook={() => setSelectedService(s)} 
                    />
                ))
            ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">
                    No results found {radius ? `within ${radius}km` : `for "${searchQuery}"`}
                    </p>
                    <button 
                        onClick={() => { setSearchQuery(""); handleClearLocation(); }}
                        className="mt-2 text-blue-600 font-medium hover:underline"
                    >
                        Clear filters
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