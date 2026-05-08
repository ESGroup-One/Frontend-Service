import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import '../../styles/Header.css';
import { useAuth } from '../../context/AuthContext';

import fallbackImage from "../../pages/user/styles/Avatar.png";

const Header = () => {
  const location = useLocation()
  const { user } = useAuth();

  const userName = user?.fullName || 'No name';
  const userEmail = user?.email || 'No email';
  const userImage = user?.image || fallbackImage;

  const getPageTitle = () => {
    if (location.pathname === '/user/explore') {
      return 'All Courses'
    }
    if (location.pathname === '/user/profile') {
      return 'Profile'
    }
    if (location.pathname === '/user') {
      return 'Home'
    }
    return ''
  }

  const pageTitle = getPageTitle()

  return (
    <div className="header">
      <div className="header-content">
        {pageTitle && <h1 className="header-title">{pageTitle}</h1>}
        <div className="user-info">
          <div className="user-avatar">
            <img src={userImage} alt="" className='avatar-icon' />
          </div>
          <div className="user-details">
            <div className="user-name">{userName || 'No name'}</div>
            <div className="user-email">{userEmail || 'No email'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
