import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search, Calendar, MapPin, ArrowRight } from "lucide-react";

const SeekerDashboard = () => {
  const { userData } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Seeker Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 pb-24 pt-12 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="max-w-6xl mx-auto text-white relative z-10">
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight">
                Hello, {userData?.firstName || "Neighbor"}! 👋
            </h2>
            <p className="text-emerald-50 text-lg font-medium opacity-90 max-w-xl">
                What do you need help with today? Find trusted local experts in your neighborhood.
            </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        {/* Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            
            {/* Find Services Card */}
            <Link
                to="/search-services"
                className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
                <div className="flex items-center gap-5">
                    <div className="bg-blue-50 p-5 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <Search size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-xl mb-1">Find Services</h3>
                        <p className="text-gray-500 group-hover:text-blue-600 transition">Browse plumbers, tutors & more</p>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-full p-2 text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                    <ArrowRight size={20} />
                </div>
            </Link>

            {/* My Bookings Card */}
            <Link
                to="/my-bookings"
                className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
                <div className="flex items-center gap-5">
                    <div className="bg-purple-50 p-5 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                        <Calendar size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-xl mb-1">My Bookings</h3>
                        <p className="text-gray-500 group-hover:text-purple-600 transition">View upcoming appointments</p>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-full p-2 text-gray-300 group-hover:bg-purple-50 group-hover:text-purple-600 transition">
                    <ArrowRight size={20} />
                </div>
            </Link>
        </section>

        {/* Recent Activity / Promo Section */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
            <div className="inline-block p-3 bg-amber-50 rounded-full text-amber-500 mb-4">
                 <MapPin size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">New to the neighborhood?</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Explore services available within a 5km radius of your location.
            </p>
            <Link to="/search-services" className="text-emerald-600 font-bold hover:underline">
                Explore Map View
            </Link>
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;