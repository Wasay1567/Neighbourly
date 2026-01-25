import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

const ModeratorDashboard = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null); // Track which dispute is being resolved
  const [resolutionText, setResolutionText] = useState("");

  // 1. Fetch Disputes
  const fetchDisputes = async () => {
    setLoading(true);
    try {
      // Note: Backend requires 'neighborhoodIds' query param. 
      // For Stage 2 demo, we hardcode '1' or grab it from user profile if available.
      const { data } = await api.get('/disputes/regional?neighborhoodIds=1');
      setDisputes(data.data.disputes);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  // 2. Assign to Self
  const handleAssign = async (id) => {
    try {
      await api.post(`/disputes/${id}/assign`);
      toast.success("Dispute assigned to you");
      fetchDisputes(); // Refresh list
    } catch (err) {
      toast.error("Failed to assign dispute");
    }
  };

  // 3. Resolve Dispute
  const handleResolve = async (id) => {
    if (!resolutionText.trim()) return toast.error("Please enter a resolution");
    try {
      await api.post(`/disputes/${id}/resolve`, { resolution: resolutionText });
      toast.success("Dispute resolved & closed");
      setResolvingId(null);
      setResolutionText("");
      fetchDisputes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resolve");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-3 rounded-lg text-white shadow-lg shadow-purple-200">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Moderator Console</h1>
              <p className="text-gray-500 text-sm">Overview of regional disputes</p>
            </div>
          </div>
          <button onClick={fetchDisputes} className="p-2 hover:bg-gray-200 rounded-full transition">
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Dispute List */}
        {loading ? (
           <div className="text-center py-20">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
           </div>
        ) : (
          <div className="grid gap-6">
            {disputes.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
                    <CheckCircle className="mx-auto text-green-500 mb-3" size={48}/>
                    <h3 className="text-lg font-bold text-gray-900">All Clear!</h3>
                    <p className="text-gray-500">No active disputes in your region.</p>
                </div>
            ) : (
                disputes.map((dispute) => (
                <div key={dispute._id || dispute.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                dispute.status === 'open' ? 'bg-red-100 text-red-700' : 
                                dispute.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {dispute.status}
                            </span>
                            <span className="text-sm text-gray-500 font-mono">ID: {dispute._id || dispute.id}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-700 capitalize">{dispute.category.replace('_', ' ')}</span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                        <p className="text-gray-800 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            "{dispute.description}"
                        </p>
                        
                        <div className="flex gap-6 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16}/> 
                                Raised by User <span className="font-mono text-gray-700">{dispute.raisedBy || dispute.raised_by}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserCheck size={16}/> 
                                Against User <span className="font-mono text-gray-700">{dispute.againstUserId || dispute.against_user_id}</span>
                            </div>
                        </div>

                        {/* Action Area */}
                        {dispute.status !== 'resolved' && (
                            <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-3">
                                {!dispute.assignedModeratorId && (
                                    <button 
                                        onClick={() => handleAssign(dispute._id || dispute.id)}
                                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition"
                                    >
                                        Assign to Me
                                    </button>
                                )}
                                
                                {resolvingId === (dispute._id || dispute.id) ? (
                                    <div className="flex-1 flex gap-2 animate-in slide-in-from-right fade-in">
                                        <input 
                                            type="text" 
                                            className="flex-1 border rounded px-3 py-2 text-sm"
                                            placeholder="Enter resolution details..."
                                            value={resolutionText}
                                            onChange={(e) => setResolutionText(e.target.value)}
                                        />
                                        <button 
                                            onClick={() => handleResolve(dispute._id || dispute.id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700"
                                        >
                                            Confirm
                                        </button>
                                        <button 
                                            onClick={() => setResolvingId(null)}
                                            className="text-gray-500 px-3 hover:bg-gray-100 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setResolvingId(dispute._id || dispute.id)}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 transition shadow-md shadow-purple-200"
                                    >
                                        Resolve Dispute
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {dispute.resolution && (
                            <div className="mt-4 bg-green-50 border border-green-100 p-3 rounded text-sm text-green-800">
                                <strong>Resolution:</strong> {dispute.resolution}
                            </div>
                        )}
                    </div>
                </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorDashboard;