import { NavLink } from 'react-router-dom';
import { Compass, LayoutDashboard, FileText, User, LogOut } from 'lucide-react';
import styles from '../../styles/AdminSidebar.module.css';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  
  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: 'Dashboard' },
    { to: "/admin/courses", icon: Compass, label: 'Explore Courses' },
    { to: "/admin/applications", icon: FileText, label: 'View Applications' },
    { to: "/admin/profile", icon: User, label: 'My Profile' },
  ];

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarHeader}>
        <h1 className={styles.logo}>EduConnect</h1>
      </div>
      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
            end={item.to === "/admin"}
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
};

export default Sidebar;