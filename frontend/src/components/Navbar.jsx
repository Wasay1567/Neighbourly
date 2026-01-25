import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/features/userSlice";
import { Home, Search, Calendar, LogOut, User, ChevronDown, Menu, X, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Link to your external chat app
  const CHAT_APP_URL = "http://localhost:5174/";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/");
    toast.success("Logged out successfully");
  };

  // Helper for Internal Links (Router)
  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
        ${isActive 
          ? "bg-teal-50 text-teal-700 shadow-sm" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  // Helper for External Links (New Tab)
  const ExternalNavItem = ({ href, icon: Icon, label }) => (
    <a
      href={href}
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200"
    >
      <Icon size={18} />
      <span>{label}</span>
    </a>
  );

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* 1. Logo Section */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/dashboard")}>
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center mr-2 shadow-lg shadow-teal-600/20">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Neighbourly
            </span>
          </div>

          {/* 2. Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavItem to="/dashboard" icon={Home} label="Home" />
            <NavItem to="/search-services" icon={Search} label="Explore" />
            <NavItem to="/my-bookings" icon={Calendar} label="Bookings" />
        {/* chat button             */}
            <ExternalNavItem href={"https://talk-a-tive-7fgq.onrender.com/"} icon={MessageSquare} label="Messages" />
          </div>

          {/* 3. User Profile Dropdown */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border border-gray-200 hover:shadow-md transition bg-white"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userData?.NAME?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {userData?.NAME || "User"}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{userData?.EMAIL}</p>
                  </div>
                  
                  <div className="p-1">
                    <NavLink to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <User size={16} /> My Profile
                    </NavLink>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button 
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Mobile Menu (Slide down) */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2 shadow-lg">
            <NavItem to="/dashboard" icon={Home} label="Home" />
            <NavItem to="/search-services" icon={Search} label="Explore Services" />
            <NavItem to="/my-bookings" icon={Calendar} label="My Bookings" />
            
            <ExternalNavItem href={CHAT_APP_URL} icon={MessageSquare} label="Messages" />

            <div className="h-px bg-gray-100 my-2" />
            <NavItem to="/profile" icon={User} label="My Profile" />
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
                <LogOut size={18} /> Sign Out
            </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;