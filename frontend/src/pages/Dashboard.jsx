// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateForm from "../components/CreateForm";

const Dashboard = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchMyServices = async () => {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts?_limit=5"
      );
      const data = await response.json();

      setServices(
        data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.body,
          status: "Active",
        }))
      );
    };

    fetchMyServices();
  }, []);

  const handleCreateSuccess = (newService) => {
    // add newly created service to UI instantly
    setServices((prev) => [newService, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-200 to-blue-300 p-10 text-center">
        <h2 className="text-4xl font-bold mb-2">Welcome to Neighbourly!</h2>
        <p>Manage your services or explore others nearby.</p>
      </section>

      {/* Actions */}
      <section className="p-6 max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <div
          onClick={() => setShowCreateForm(true)}
          className="bg-white p-6 rounded shadow hover:shadow-lg cursor-pointer"
        >
          <h3 className="text-2xl font-semibold mb-2">Create a New Service</h3>
          <p>List a new service you offer.</p>
        </div>

        <div
          onClick={() => navigate("/search-services")}
          className="bg-white p-6 rounded shadow hover:shadow-lg cursor-pointer"
        >
          <h3 className="text-2xl font-semibold mb-2">
            Search / Book a Service
          </h3>
          <p>Find services offered by others.</p>
        </div>
      </section>

      {/* Listings */}
      <section className="p-6 max-w-5xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">Your Service Listings</h3>

        <div className="grid md:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-4 rounded shadow">
              <h4 className="font-semibold">{service.title}</h4>
              <p className="text-gray-600">{service.description}</p>
              <p className="text-sm text-gray-500">
                Status: {service.status}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Overlay */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <CreateForm
            onSuccess={handleCreateSuccess}
            onClose={() => setShowCreateForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
