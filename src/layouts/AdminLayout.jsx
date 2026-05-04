import React from 'react';
import Sidebar from '../components/navigation/AdminSidebar';
import Header from '../components/navigation/AdminHeader';
import '../styles/layout.css';

const AdminLayout = ({ children }) => {
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

export default AdminLayout
