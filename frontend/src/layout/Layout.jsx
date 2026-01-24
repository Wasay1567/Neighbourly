import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header>
        <Navbar />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
