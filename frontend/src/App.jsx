import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedLayout from "./layout/ProtectedLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardWrapper from "./pages/DashboardWrapper";
import SearchServicePage from "./pages/SearchServicePage";
import ServiceDetails from "./pages/ServiceDetails";
import MyBookings from "./pages/MyBookings";
import PaymentPage from "./pages/PaymentPage";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedLayout />} >
        <Route path="/dashboard" element={<DashboardWrapper />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search-services" element={<SearchServicePage />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Route>
      <Route path="*" element={
          <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800">404</h1>
                    <p className="text-gray-600 mt-2">Page not found</p>
                </div>
            </div>
      }></Route>
    </Routes>
  );
};

export default App;
