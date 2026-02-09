import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login, logout } from "./features/userSlice";
import api from "./utils/api";
import ProtectedLayout from "./layout/ProtectedLayout";
import { getSampleUserByRole } from "@/data/sampleUsers";
// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardWrapper from "./pages/DashboardWrapper";
import SearchServicePage from "./pages/SearchServicePage";
import ServiceDetails from "./pages/ServiceDetails";
import MyBookings from "./pages/MyBookings";
import PaymentPage from "./pages/PaymentPage";
import ProfilePage from "./pages/ProfilePage";

const DEV_MODE = import.meta.env.VITE_DEV_MODE === "TRUE";

const App = () => {
  const dispatch = useDispatch();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const restoreSession = async () => {
      if (!token) {
        setIsAuthChecked(true);
        return;
      }

      // In dev mode, restore sample users locally without hitting the backend
      if (DEV_MODE) {
        const devRole = localStorage.getItem("devRole");
        if (devRole) {
          const sample = getSampleUserByRole(devRole);
          if (sample) {
            const user = sample.user;
            const completeUser = {
              ...user,
              id: user.id,
              ID: user.id,
              role: user.role,
              ROLE: user.role?.toUpperCase(),
              NAME:
                `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            };

            dispatch(login(completeUser));
            setIsAuthChecked(true);
            console.log("Dev Mode :: session restored from sample user", {
              role: devRole,
            });
            return;
          }
        }
      }

      try {
        const { data } = await api.get("/auth/me");
        const user = data.data.user;

        const completeUser = {
          ...user,
          id: user.id,
          ID: user.id,
          role: user.role,
          ROLE: user.role?.toUpperCase(), // Ensure uppercase for DashboardWrapper
          NAME:
            user.name ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.email,
          firstName: user.firstName, // Ensure specific fields exist
          lastName: user.lastName,
        };

        dispatch(login(completeUser));
      } catch (err) {
        console.error("Session restore failed:", err);
        localStorage.removeItem("token");
        dispatch(logout());
      } finally {
        setIsAuthChecked(true);
      }
    };

    restoreSession();
  }, [dispatch]);

  // Prevent flicker: Don't render routes until we check auth
  if (!isAuthChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* --- PROTECTED ROUTES --- */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardWrapper />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search-services" element={<SearchServicePage />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Route>

      {/* --- 404 PAGE --- */}
      <Route path="*" element={
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
            <h1 className="text-6xl font-extrabold text-teal-600">404</h1>
            <p className="text-gray-500 mt-2 text-lg">Page not found</p>
        </div>
      } />
    </Routes>
  );
};

export default App;