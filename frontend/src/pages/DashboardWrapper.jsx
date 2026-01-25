import React, { use } from 'react';
import { useSelector } from 'react-redux';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard'; 
import ModeratorDashboard from './ModeratorDashboard'; 

const DashboardWrapper = () => {
  const { userData } = useSelector((state) => state.user);

  console.log("Dashboard Loaded for User:", userData);

  if (!userData) {
    return <div className="p-10 text-center text-xl tracking-tight">Please log in.</div>;
  }

  const role = userData.role?.toUpperCase();

  switch (role) {
    case 'MODERATOR':
      return <ModeratorDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'USER':
    case 'NEIGHBOR':
    case 'SEEKER':
    case 'PROVIDER':
    default:
      return <UserDashboard />;
  }
};

export default DashboardWrapper;