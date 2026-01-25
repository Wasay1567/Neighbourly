import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { 
  Shield, 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [moderators, setModerators] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalMods: 0, reports: 0 });
  const [loading, setLoading] = useState(true);
  
  // Promote User State
  const [promoteEmail, setPromoteEmail] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real data
      // If these endpoints don't exist yet, it will fall back to the catch block
      const [modsRes, statsRes] = await Promise.all([
        api.get('/admin/moderators'),
        api.get('/admin/stats')
      ]);
      
      setModerators(modsRes.data.data.moderators);
      setStats(statsRes.data.data.stats);

    } catch (err) {
      console.warn("Backend admin endpoints not found. Using Demo Data.");
      // --- DEMO DATA FALLBACK (So you can see the UI) ---
      setModerators([
        { id: 101, first_name: "Jawad", last_name: "Ahmed", email: "jawad@example.com", created_at: "2024-01-15" },
        { id: 102, first_name: "Rafay", last_name: "Jamal", email: "rafay@example.com", created_at: "2024-02-20" }
      ]);
      setStats({ totalUsers: 1543, totalMods: 2, reports: 5 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Promote User to Moderator
  const handlePromote = async (e) => {
    e.preventDefault();
    if (!promoteEmail) return;

    try {
      setIsPromoting(true);
      await api.patch('/admin/promote', { email: promoteEmail });
      toast.success(`${promoteEmail} is now a Moderator`);
      setPromoteEmail("");
      fetchData(); // Refresh list
    } catch (err) {
      // Demo fallback for testing UI
      if(err.response?.status === 404) {
          toast.success(`[DEMO] ${promoteEmail} would be promoted!`);
          setPromoteEmail("");
      } else {
          toast.error(err.response?.data?.message || "Failed to promote user");
      }
    } finally {
      setIsPromoting(false);
    }
  };

  // 3. Demote Moderator
  const handleDemote = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from Moderators?`)) return;

    try {
      await api.patch(`/admin/demote/${userId}`);
      toast.success(`${name} was demoted to User`);
      setModerators(prev => prev.filter(m => m.id !== userId));
    } catch (err) {
       // Demo fallback
       if(err.response?.status === 404) {
          toast.success(`[DEMO] ${name} would be demoted!`);
          setModerators(prev => prev.filter(m => m.id !== userId));
       } else {
          toast.error("Failed to demote user");
       }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <Shield size={32} className="text-indigo-600" /> 
                    Admin Portal
                </h1>
                <p className="text-gray-500 mt-1">Manage platform safety and staff access.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                System Status: <span className="font-bold text-gray-800">Operational</span>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition hover:shadow-md">
                <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
                    <Users size={28} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Users</p>
                    <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalUsers}</h3>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition hover:shadow-md">
                <div className="bg-purple-50 p-4 rounded-xl text-purple-600">
                    <Shield size={28} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Moderators</p>
                    <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalMods || moderators.length}</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition hover:shadow-md">
                <div className="bg-amber-50 p-4 rounded-xl text-amber-600">
                    <AlertTriangle size={28} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Flagged Items</p>
                    <h3 className="text-3xl font-extrabold text-gray-900">{stats.reports}</h3>
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Moderator List */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Moderator Team</h3>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                        {moderators.length} Active
                    </span>
                </div>
                
                <div className="overflow-x-auto flex-1">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">User Profile</th>
                                <th className="px-6 py-4 text-left">Role Added</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="3" className="p-8 text-center text-gray-400">Loading team...</td></tr>
                            ) : moderators.length > 0 ? (
                                moderators.map((mod) => (
                                    <tr key={mod.id} className="hover:bg-gray-50/80 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                                    {mod.first_name?.[0] || mod.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{mod.first_name} {mod.last_name}</p>
                                                    <p className="text-xs text-gray-500">{mod.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(mod.created_at || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDemote(mod.id, mod.first_name || mod.email)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                                title="Revoke Moderator Access"
                                            >
                                                <UserMinus size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Users size={48} className="mb-3 opacity-20" />
                                            <p>No moderators found.</p>
                                            <p className="text-sm">Use the form to add your first team member.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Col: Add Mod Form */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <UserPlus size={20} className="text-indigo-600"/> Add Moderator
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Grant moderation privileges to an existing user. They will gain access to report management.
                    </p>
                    
                    <form onSubmit={handlePromote} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">User Email Address</label>
                            <div className="relative group">
                                <input 
                                    type="email"
                                    required
                                    value={promoteEmail}
                                    onChange={(e) => setPromoteEmail(e.target.value)}
                                    placeholder="e.g. alex@company.com"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                                />
                                <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            </div>
                        </div>
                        <button 
                            disabled={isPromoting}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isPromoting ? <span className="animate-pulse">Processing...</span> : "Promote to Moderator"}
                        </button>
                    </form>
                </div>

                <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <h4 className="font-bold mb-2 flex items-center gap-2 relative z-10">
                        <Shield size={18} /> Security Note
                    </h4>
                    <p className="text-sm text-indigo-100 leading-relaxed relative z-10 opacity-90">
                        Moderators can delete reviews, ban users, and resolve disputes. Only grant this role to trusted staff members.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;