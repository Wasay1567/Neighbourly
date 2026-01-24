import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ShieldAlert, UserX, CheckCircle } from 'lucide-react';

const ModeratorDashboard = () => {
  const [users, setUsers] = useState([]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users'); // You'll need this backend endpoint
        setUsers(data);
      } catch (err) {
        toast.error("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  // Suspend Logic
  const toggleSuspend = async (userId, currentStatus) => {
    try {
      // Optimistic Update (Update UI before API finishes for speed)
      setUsers(users.map(u => 
        u.ID === userId ? { ...u, IS_SUSPENDED: !currentStatus } : u
      ));
      
      await api.patch(`/admin/users/${userId}/suspend`, { suspend: !currentStatus });
      toast.success(`User ${!currentStatus ? 'suspended' : 'activated'}`);
    } catch (err) {
      toast.error("Action failed");
      // Revert if failed
      setUsers(users.map(u => 
        u.ID === userId ? { ...u, IS_SUSPENDED: currentStatus } : u
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="text-red-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Moderator Control Center</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">User</th>
                <th className="p-4 font-semibold text-gray-600">Email</th>
                <th className="p-4 font-semibold text-gray-600">Role</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.ID} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{user.NAME}</td>
                  <td className="p-4 text-gray-600">{user.EMAIL}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">
                      {user.ROLE}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.IS_SUSPENDED ? (
                      <span className="text-red-600 font-semibold flex items-center gap-1">
                        <UserX size={16}/> Suspended
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle size={16}/> Active
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleSuspend(user.ID, user.IS_SUSPENDED)}
                      className={`px-3 py-1 rounded text-sm font-semibold transition ${
                        user.IS_SUSPENDED 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {user.IS_SUSPENDED ? "Activate" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;