import React from 'react';
import { useSelector } from 'react-redux';
import SeekerDashboard from './SeekerDashboard';
import ProviderDashboard from './ProviderDashboard';

const UserDashboard = ({ viewMode }) => {
  const { userData } = useSelector((state) => state.user);
  
  // 1. Determine Role Priority
  // If 'viewMode' prop is passed (from DashboardWrapper), use it.
  // Otherwise, fallback to the Redux state role.
  const activeView = viewMode || userData?.ROLE?.toLowerCase() || 'seeker';

  // 2. Render appropriate dashboard
  if (activeView === 'provider') {
      return <ProviderDashboard />;
  }

  return <SeekerDashboard />;
};

export default UserDashboard;