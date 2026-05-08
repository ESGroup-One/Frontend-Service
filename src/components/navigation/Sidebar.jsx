import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaBuilding,
  FaUsers
} from 'react-icons/fa';
import { LogOut, User } from 'lucide-react';
import styles from '../../styles/AdminSidebar.module.css';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { to: "/superadmin", icon: FaHome, label: 'Dashboard' },
    { to: "/superadmin/colleges", icon: FaBuilding, label: 'Colleges' },
    { to: "/superadmin/users", icon: FaUsers, label: 'Users' },
    { to: "/superadmin/profile", icon: User, label: 'My Profile' },
  ];

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarHeader}>
        <img
          src="/logo.png"
          alt="NSPS Logo"
          className={styles.logoImage}
        />
        <h1 className={styles.logoText}>NSPS</h1>
      </div>
      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
            end={item.to === "/superadmin"}
          >
            <item.icon size={20} className={styles.navIcon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.sidebarFooter}>
        <div
          className={styles.navLink}
          onClick={logout}
        >
          <LogOut size={20} className={styles.navIcon} />
          Log out
        </div>
      </div>
    </div>
  );
}

export default Sidebar
