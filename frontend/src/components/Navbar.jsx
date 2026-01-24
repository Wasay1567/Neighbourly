import React from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // later: clear auth / token
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1
        onClick={() => navigate("/dashboard")}
        className="text-xl font-bold text-blue-600 cursor-pointer"
      >
        Neighbourly
      </h1>
        <NavLink
        to={"/"}
        className="ml-auto rounded-full bg-blue-500 p-3 mx-5 text-white">
            Home
        </NavLink>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
