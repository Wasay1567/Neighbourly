import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { 
  Shield, 
  Users, 
  UserPlus, 
  UserMinus, 
  AlertTriangle,
  Building, 
  MapPin, // <--- New Icon for Neighborhoods
  X
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [moderators, setModerators] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalMods: 0, reports: 0 });
  const [loading, setLoading] = useState(true);
  
  // Promote User State
  const [promoteEmail, setPromoteEmail] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);

  // --- CITY STATE ---
  const [showCityModal, setShowCityModal] = useState(false);
  const [cityForm, setCityForm] = useState({
      name: "",
      stateProvince: "",
      country: "Pakistan",
      countryCode: "PK",
      timezone: "GMT +5:00"
  });
  const [isAddingCity, setIsAddingCity] = useState(false);

  // --- NEW: NEIGHBORHOOD STATE ---
  const [showNeighModal, setShowNeighModal] = useState(false);
  const [neighForm, setNeighForm] = useState({
      cityId: "1", // Default to 1 (Karachi)
      name: "",
      description: "",
      coordinates: "[[24.9150, 67.2050], [24.9150, 67.2150], [24.9080, 67.2150], [24.9080, 67.2050]]"
  });
  const [isAddingNeigh, setIsAddingNeigh] = useState(false);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [modsRes, statsRes] = await Promise.all([
        api.get('/admin/moderators'),
        api.get('/admin/stats')
      ]);
      setModerators(modsRes.data.data.moderators);
      setStats(statsRes.data.data.stats);
    } catch (err) {
      console.warn("Backend admin endpoints not found. Using Demo Data.");
      setModerators([
        { id: 101, first_name: "Sarah", last_name: "Connor", email: "sarah@example.com", created_at: "2024-01-15" }
      ]);
      setStats({ totalUsers: 1543, totalMods: 2, reports: 5 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Promote/Demote User Logic
  const handlePromote = async (e) => {
    e.preventDefault();
    if (!promoteEmail) return;
    try {
      setIsPromoting(true);
      await api.patch('/admin/promote', { email: promoteEmail });
      toast.success(`${promoteEmail} is now a Moderator`);
      setPromoteEmail("");
      fetchData(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to promote user");
    } finally {
      setIsPromoting(false);
    }
  };

  const handleDemote = async (userId, name) => {
    if (!window.confirm(`Remove ${name} from Moderators?`)) return;
    try {
      await api.patch(`/admin/demote/${userId}`);
      toast.success(`${name} demoted`);
      setModerators(prev => prev.filter(m => m.id !== userId));
    } catch (err) {
      toast.error("Failed to demote");
    }
  };

  // 3. Handle Add CITY
  const handleAddCity = async (e) => {
      e.preventDefault();
      setIsAddingCity(true);
      try {
          const payload = {
              name: cityForm.name,
              stateProvince: cityForm.stateProvince,
              country: cityForm.country,
              countryCode: cityForm.countryCode,
              timezone: cityForm.timezone
          };
          await api.post('/locations/cities', payload);
          toast.success(`City "${cityForm.name}" added!`);
          setShowCityModal(false);
          setCityForm({ name: "", stateProvince: "", country: "Pakistan", countryCode: "PK", timezone: "GMT +5:00" });
      } catch (err) {
          toast.error(err.response?.data?.message || "Failed to add city");
      } finally {
          setIsAddingCity(false);
      }
  };

  // 4. NEW: Handle Add NEIGHBORHOOD
  const handleAddNeighborhood = async (e) => {
      e.preventDefault();
      setIsAddingNeigh(true);

      try {
          // Parse coordinates from string to JSON array
          let parsedCoords;
          try {
              parsedCoords = JSON.parse(neighForm.coordinates);
          } catch (error) {
              toast.error("Invalid Coordinates format. Must be [[lat, lng], ...]");
              setIsAddingNeigh(false);
              return;
          }

          const payload = {
              cityId: neighForm.cityId,
              name: neighForm.name,
              description: neighForm.description,
              coordinates: parsedCoords
          };

          await api.post('/locations/neighborhoods', payload);
          toast.success(`Neighborhood "${neighForm.name}" added!`);
          setShowNeighModal(false);
          // Reset only name/desc, keep ID and coords example for convenience
          setNeighForm(prev => ({ ...prev, name: "", description: "" }));

      } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || "Failed to add neighborhood");
      } finally {
          setIsAddingNeigh(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <Shield size={32} className="text-indigo-600" /> 
                    Admin Portal
                </h1>
                <p className="text-gray-500 mt-1">Manage users, moderators, and service locations.</p>
            </div>
            
            <div className="flex gap-3">
                {/* BUTTON: Add City */}
                <button 
                    onClick={() => setShowCityModal(true)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                >
                    <Building size={18} /> Add City
                </button>

                {/* BUTTON: Add Neighborhood */}
                <button 
                    onClick={() => setShowNeighModal(true)}
                    className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-600/20"
                >
                    <MapPin size={18} /> Add Neighborhood
                </button>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div className="bg-blue-50 p-4 rounded-xl text-blue-600"><Users size={28} /></div>
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase">Total Users</p>
                    <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalUsers}</h3>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div className="bg-purple-50 p-4 rounded-xl text-purple-600"><Shield size={28} /></div>
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase">Moderators</p>
                    <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalMods || moderators.length}</h3>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div className="bg-amber-50 p-4 rounded-xl text-amber-600"><AlertTriangle size={28} /></div>
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase">Reports</p>
                    <h3 className="text-3xl font-extrabold text-gray-900">{stats.reports}</h3>
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Moderator Team</h3>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                        {moderators.length} Active
                    </span>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4 text-left">User</th>
                                <th className="px-6 py-4 text-left">Role Added</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {moderators.map((mod) => (
                                <tr key={mod.id} className="hover:bg-gray-50/80 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                                                {mod.first_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{mod.first_name}</p>
                                                <p className="text-xs text-gray-500">{mod.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(mod.created_at || Date.now()).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDemote(mod.id, mod.first_name)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded">
                                            <UserMinus size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <UserPlus size={20} className="text-indigo-600"/> Add Moderator
                    </h3>
                    <form onSubmit={handlePromote} className="space-y-4">
                        <input 
                            type="email"
                            required
                            value={promoteEmail}
                            onChange={(e) => setPromoteEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                        <button disabled={isPromoting} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
                            {isPromoting ? "Processing..." : "Promote User"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </div>

      {/* --- ADD CITY MODAL --- */}
      {showCityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Building size={20} /> Add New City
                    </h3>
                    <button onClick={() => setShowCityModal(false)} className="text-emerald-100 hover:text-white transition"><X size={24} /></button>
                </div>
                
                <form onSubmit={handleAddCity} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City Name</label>
                            <input type="text" placeholder="Karachi" value={cityForm.name} onChange={(e) => setCityForm({...cityForm, name: e.target.value})} required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">State / Province</label>
                            <input type="text" placeholder="Sindh" value={cityForm.stateProvince} onChange={(e) => setCityForm({...cityForm, stateProvince: e.target.value})} required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Country</label>
                            <input type="text" placeholder="Pakistan" value={cityForm.country} onChange={(e) => setCityForm({...cityForm, country: e.target.value})} required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Code</label>
                            <input type="text" placeholder="PK" value={cityForm.countryCode} onChange={(e) => setCityForm({...cityForm, countryCode: e.target.value})} required maxLength={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 uppercase" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Timezone</label>
                        <input type="text" placeholder="GMT +5:00" value={cityForm.timezone} onChange={(e) => setCityForm({...cityForm, timezone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={isAddingCity} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition">
                            {isAddingCity ? "Adding..." : "Create City"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- ADD NEIGHBORHOOD MODAL --- */}
      {showNeighModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-teal-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <MapPin size={20} /> Add Neighborhood
                    </h3>
                    <button onClick={() => setShowNeighModal(false)} className="text-teal-100 hover:text-white transition"><X size={24} /></button>
                </div>
                
                <form onSubmit={handleAddNeighborhood} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City ID</label>
                            <input 
                                type="text" 
                                value={neighForm.cityId}
                                onChange={(e) => setNeighForm({...neighForm, cityId: e.target.value})}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Neighborhood Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Clifton"
                                value={neighForm.name}
                                onChange={(e) => setNeighForm({...neighForm, name: e.target.value})}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <input 
                            type="text" 
                            placeholder="Brief description..."
                            value={neighForm.description}
                            onChange={(e) => setNeighForm({...neighForm, description: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Coordinates (JSON Array)</label>
                        <textarea 
                            rows="4"
                            value={neighForm.coordinates}
                            onChange={(e) => setNeighForm({...neighForm, coordinates: e.target.value})}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                            Required Format: <code>[[24.9, 67.2], [24.9, 67.3], [24.8, 67.3], [24.8, 67.2]]</code>
                        </p>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            disabled={isAddingNeigh}
                            className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition"
                        >
                            {isAddingNeigh ? "Adding..." : "Create Neighborhood"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;