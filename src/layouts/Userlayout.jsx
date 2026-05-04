import React from 'react';
import Sidebar from '../components/navigation/UserSidebar';
import Header from '../components/navigation/UserHeader';
import '../styles/layout.css';

const UserLayout = ({ children }) => {
  return (
    <div className="super-admin-layout">
      <Sidebar />
      
      {/* Main Content */}
      <div className="main-content">
        <Header />
        
        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default UserLayout
