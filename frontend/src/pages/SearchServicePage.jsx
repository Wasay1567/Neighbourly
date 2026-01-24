import React, { useState, useEffect } from "react";
import SearchForm from "../components/SearchForm";
import { useNavigate } from "react-router-dom";

const SearchServicePage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch services from API (replace URL with real API)
  const fetchServices = async () => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts?_limit=10"
      );
      const data = await response.json();

      const mappedServices = data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.body,
        category: "General", // placeholder
        status: "Active",
      }));

      setServices(mappedServices);
      setFilteredServices(mappedServices);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching services:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Search function
  const handleSearch = (query) => {
    const filtered = services.filter(
      (service) =>
        service.title.toLowerCase().includes(query.toLowerCase()) ||
        service.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleBook = (service) => {
    alert(`Booking service: ${service.title} (not implemented)`);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-blue-600">Search Services</h1>
        <button
          onClick={handleBack}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Back
        </button>
      </nav>

      <SearchForm onSearch={handleSearch} />

      {loading ? (
        <p className="text-center text-gray-500">Loading services...</p>
      ) : filteredServices.length === 0 ? (
        <p className="text-center text-gray-500">No services found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold mb-2">{service.title}</h4>
              <p className="text-gray-600 mb-2">{service.description}</p>
              <p className="text-gray-500 text-sm mb-2">Category: {service.category}</p>
              <p className="text-gray-500 text-sm mb-2">Status: {service.status}</p>
              <button
                onClick={() => handleBook(service)}
                className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
              >
                Book Service
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchServicePage;
