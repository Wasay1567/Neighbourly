import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";

const ProviderStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data } = await api.get('/transactions/earnings');
        setStats(data.data.summary);
      } catch (err) {
        console.error("Failed to load earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) return (
    <div className="animate-pulse flex gap-4 mb-8">
       <div className="h-32 bg-gray-200 rounded-xl flex-1"></div>
       <div className="h-32 bg-gray-200 rounded-xl flex-1"></div>
       <div className="h-32 bg-gray-200 rounded-xl flex-1"></div>
    </div>
  );

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Earnings */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign size={64} className="text-emerald-600"/>
        </div>
        <div className="relative z-10">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Earnings</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">
                ${stats.totalEarnings?.toFixed(2) || "0.00"}
            </h3>
            <div className="flex items-center gap-1 text-emerald-600 text-sm mt-2 font-medium">
                <TrendingUp size={16} />
                <span>Lifetime Income</span>
            </div>
        </div>
      </div>

      {/* Monthly Stats (Mocked if backend doesn't split it yet, or use real data) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Completed Jobs</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.completedJobs || 0}
                </h3>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <CreditCard size={24} />
            </div>
        </div>
        <p className="text-gray-400 text-xs mt-3">Transactions processed successfully</p>
      </div>

      {/* Pending / Active */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Payouts</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    ${stats.pendingAmount?.toFixed(2) || "0.00"}
                </h3>
            </div>
            <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                <Calendar size={24} />
            </div>
        </div>
        <p className="text-gray-400 text-xs mt-3">Held in escrow until completion</p>
      </div>
    </div>
  );
};

export default ProviderStats;