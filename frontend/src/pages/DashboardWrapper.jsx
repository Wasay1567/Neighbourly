import React from 'react';
import { useSelector } from 'react-redux';
import AdminDashboard from './AdminDashboard';

// Import your different dashboards
// (If you haven't built Moderator/Admin dashboard files yet, create placeholders)
import UserDashboard from './UserDashboard'; 
import ModeratorDashboard from './ModeratorDashboard'; 

const DashboardWrapper = () => {
  const { userData } = useSelector((state) => state.user);

  console.log("Dashboard Loaded for User:", userData); // Debugging

  if (!userData) {
    return <div className="p-10 text-center">Please log in.</div>;
  }

  // Ensure these cases match the mock data in Login.jsx
  switch (userData.ROLE) {
    case 'MODERATOR':
      return <ModeratorDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'USER':
    case 'SEEKER':
    case 'PROVIDER':
    default:
      return <UserDashboard />;
  }
};

export default DashboardWrapper;