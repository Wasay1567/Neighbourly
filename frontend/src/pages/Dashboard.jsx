// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  const fetchMyServices = async () => {
    try {
      // Replace this URL with your real API endpoint later
      const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
      const data = await response.json();

      // Map API response to match our service card format
      const mappedServices = data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.body,
        status: "Active",
      }));

      setServices(mappedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const handleLogout = () => {
    navigate("/"); // Go back to login page
  };

//   const handleCreateService = () => {
//      NavigatorLogin;
//   };

  const handleSearchService = () => {
    alert("Navigate to Search / Book Service page (not implemented)");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Neighbourly Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-200 to-blue-300 p-10 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Neighbourly!</h2>
        <p className="text-gray-800 text-lg">
          Manage your services or explore what others are offering in your neighborhood.
        </p>
      </section>

      {/* Main Options */}
      <section className="p-6 max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Service */}
        <Link
          to={"/create-service"}
          className="cursor-pointer bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between"
        >
          <h3 className="text-2xl font-semibold mb-2">Create a New Service</h3>
          <p className="text-gray-700 mb-4">
            List a new service that you offer to your neighbors.
          </p>
          <button
          to={"/create-service"}
          className="mt-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            Create Service
          </button>
        </Link>

        {/* Search / Book a Service */}
        <div
          onClick={handleSearchService}
          className="cursor-pointer bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between"
        >
          <h3 className="text-2xl font-semibold mb-2">Search / Book a Service</h3>
          <p className="text-gray-700 mb-4">
            Browse services offered by your neighbors and book what you need.
          </p>
          <button className="mt-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
            Search Services
          </button>
        </div>
      </section>

      {/* Your Services Section */}
      <section className="p-6 max-w-5xl mx-auto mt-10">
        <h3 className="text-2xl font-bold mb-4">Your Service Listings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.length > 0 ? (
            services.map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">{service.title}</h4>
                <p className="text-gray-600 mb-2">{service.description}</p>
                <p className="text-gray-500 text-sm">Status: {service.status}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Loading your services...</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
