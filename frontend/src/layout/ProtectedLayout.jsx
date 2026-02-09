import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";

const ProtectedLayout = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token && !userData) {
      console.warn("Unauthorized access attempt. Redirecting...");
      navigate("/");
    }
  }, [navigate, userData, token]);

  if (!token && !userData) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <Navbar />
      </header>
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-300">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Neighbourly. Local Trust, Global Standards.
      </footer>
    </div>
  );
};

export default ProtectedLayout;