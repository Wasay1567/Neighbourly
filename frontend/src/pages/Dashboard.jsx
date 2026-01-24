import React, { useEffect, useState } from "react";
import CreateForm from "../components/CreateForm";
import { API_URL } from "../conf/conf.js";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const user = useSelector((state) => state.user.userData);

  const fetchMyServices = async () => {
    try {
      const res = await fetch(`${API_URL}/services/retrieve`);
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();

      // Ensure user exists before filtering
      if (user?.ID) {
        const myServices = data.filter((s) => s.AUTHORID === user.ID);
        setServices(myServices);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error fetching services");
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, [user]); 

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-200 to-blue-300 p-10 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome, {user?.NAME}!</h2>
        <p className="text-gray-800 text-lg">
          Manage your services or explore what others are offering in your
          neighborhood.
        </p>
      </section>

      {/* Main Options */}
      <section className="p-6 max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => setShowCreate(true)}
          className="cursor-pointer bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between"
        >
          <h3 className="text-2xl font-semibold mb-2">Create a New Service</h3>
          <p className="text-gray-700 mb-4">
            List a new service that you offer to your neighbors.
          </p>
          <button className="mt-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            Create Service
          </button>
        </div>

        <div
          onClick={() => alert("Search / Book Service page (not implemented)")}
          className="cursor-pointer bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between"
        >
          <h3 className="text-2xl font-semibold mb-2">
            Search / Book a Service
          </h3>
          <p className="text-gray-700 mb-4">
            Browse services offered by your neighbors and book what you need.
          </p>
          <Link to="/search-services" className="mt-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
            Search Services
          </Link>
        </div>
      </section>

      {/* Your Services */}
      <section className="p-6 max-w-5xl mx-auto mt-10">
        <h3 className="text-2xl font-bold mb-4">Your Service Listings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.length > 0 ? (
            services.map((service) => (
              <div key={service.ID} className="bg-white p-4 rounded-lg shadow">
                {/* Note: Ensure these match your DB keys exactly */}
                <h4 className="font-semibold mb-2">{service.TITLE}</h4>
                <p className="text-gray-600 mb-2">{service.DESCRIPTION}</p>
                <p className="text-gray-500 text-sm">
                  Category: {service.CATEGORY}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">You have no services listed yet.</p>
          )}
        </div>
      </section>

      {/* CreateForm Modal Wrapper */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
           {/* We removed the white container here to avoid double-boxing */}
           <CreateForm
             setServices={setServices}
             closeForm={() => setShowCreate(false)}
           />
        </div>
      )}
    </div>
  );
};

export default Dashboard;