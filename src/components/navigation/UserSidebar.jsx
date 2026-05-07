import { NavLink } from 'react-router-dom';
import { Home, Search, User, LogOut } from 'lucide-react';
import styles from '../../styles/AdminSidebar.module.css';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { to: "/user", icon: Home, label: 'Home' },
    { to: "/user/explore", icon: Search, label: 'Explore Courses' },
    { to: "/user/profile", icon: User, label: 'Profile' },
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

      {/* Navigation Links */}
      <nav className={styles.sidebarNav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.active}`
                : styles.navLink
            }
            end={to === "/user"} // Use 'end' for the base route to ensure it's only active at /user
          >
            <Icon size={20} className={styles.navIcon} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Section */}
      <div className={styles.sidebarFooter}>
        <div
          className={styles.navLink}
          onClick={logout}
        >
          <LogOut size={20} className={styles.navIcon} />
          <span>Log out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;