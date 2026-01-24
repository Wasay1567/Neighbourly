import React, { useEffect, useState } from "react";
import { Search, MapPin } from "lucide-react";
import BookingModal from "../components/BookingModal";
import { API_URL } from "../conf/conf.js"; // Keep this import for when you switch back to real data
import ServiceCard from "../components/ServiceCard";

const SearchServicePage = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // State for Modal
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    // Mock Data for Testing
    const mockData = [
      {
        "ID": 1,
        "TITLE": "Backyard Lawn Mowing",
        "DESCRIPTION": "I have a professional mower and can handle medium-sized yards. Available weekends.",
        "CATEGORY": "Gardening",
        "AUTHORID": 101
      },
      {
        "ID": 2,
        "TITLE": "High School Math Tutoring",
        "DESCRIPTION": "Certified teacher offering help with Algebra, Geometry, and Calculus. $20/hr.",
        "CATEGORY": "Education",
        "AUTHORID": 102
      },
      {
        "ID": 3,
        "TITLE": "Plumbing Quick Fix",
        "DESCRIPTION": "Leaky faucet? Clogged drain? I can stop by and fix it in under an hour.",
        "CATEGORY": "Repair",
        "AUTHORID": 103
      },
      {
        "ID": 4,
        "TITLE": "Dog Walking - North Side",
        "DESCRIPTION": "I love dogs! Will walk your furry friend for 30 or 60 minutes.",
        "CATEGORY": "Pet Care",
        "AUTHORID": 101
      },
      {
        "ID": 5,
        "TITLE": "Organic Garden Setup",
        "DESCRIPTION": "I will help you plan and plant a vegetable garden in your backyard.",
        "CATEGORY": "Gardening",
        "AUTHORID": 104
      },
      {
        "ID": 6,
        "TITLE": "Laptop Screen Repair",
        "DESCRIPTION": "Cracked screen? I can replace screens for Dell and HP laptops.",
        "CATEGORY": "Repair",
        "AUTHORID": 105
      },
      {
        "ID": 7,
        "TITLE": "Guitar Lessons for Beginners",
        "DESCRIPTION": "Learn the basics of acoustic guitar. Instruments provided for the first lesson.",
        "CATEGORY": "Music",
        "AUTHORID": 106
      },
      {
        "ID": 8,
        "TITLE": "Move-out Cleaning",
        "DESCRIPTION": "Deep cleaning for apartments to help you get your deposit back.",
        "CATEGORY": "Cleaning",
        "AUTHORID": 107
      }
    ];

    // Simulate loading delay for realism
    setTimeout(() => {
        setServices(mockData);
        setFilteredServices(mockData);
        setLoading(false);
    }, 500);
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* --- RESTORED HEADER & SEARCH UI --- */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Explore Neighborhood Services
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover help right around the corner. Search for skills, tools, and local experts.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
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
        </div>
        {/* --- END RESTORED UI --- */}

        {/* Results Grid */}
        {loading ? (
           <div className="text-center py-20">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
             <p className="mt-4 text-gray-500">Loading services...</p>
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
                    No results found for "{searchQuery}"
                    </p>
                    <button 
                    onClick={() => { setSearchQuery(""); setFilteredServices(services); }}
                    className="mt-2 text-blue-600 font-medium hover:underline"
                    >
                    Clear search
                    </button>
                </div>
            )}
          </div>
        )}
      </div>

      {/* Render Modal if a service is selected */}
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