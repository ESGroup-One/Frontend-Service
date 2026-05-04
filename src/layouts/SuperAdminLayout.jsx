import React from 'react'
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import '../styles/layout.css';

const SuperAdminLayout = ({ children }) => {
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

export default SuperAdminLayout
