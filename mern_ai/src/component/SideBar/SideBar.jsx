import React from 'react'
import styles from './SideBar.module.css';
import ArticleIcon from '@mui/icons-material/Article';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../utils/AuthContext';

const SideBar = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const { isLogin, setLogin, setUserInfo, userInfo } = useContext(AuthContext);

    const handleLogout = () => {
        localStorage.removeItem('isLogin');
        localStorage.removeItem('userInfo');
        setLogin(false);
        setUserInfo(null);
        navigate('/');
    }

    const navItems = [
        { path: '/dashboard', icon: <DashboardIcon sx={{ fontSize: 20 }} />, label: 'Dashboard' },
        { path: '/screen', icon: <FindInPageIcon sx={{ fontSize: 20 }} />, label: 'Screener', exact: true },
        { path: '/screen/history', icon: <WorkHistoryIcon sx={{ fontSize: 20 }} />, label: 'Screening History', matchPaths: ['/screen/history', '/screen/results'] },
        { path: '/history', icon: <ManageSearchIcon sx={{ fontSize: 20 }} />, label: 'History' },
    ];

    if (userInfo?.role === 'admin') {
        navItems.push({ path: '/admin', icon: <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />, label: 'Admin' });
    }

    const isActive = (item) => {
        if (item.matchPaths) {
            return item.matchPaths.some(p => location.pathname.startsWith(p));
        }
        if (item.exact) {
            return location.pathname === item.path;
        }
        return location.pathname === item.path;
    };

    if (location.pathname === '/' || !isLogin) {
        return null;
    }

    return (
        <nav className={styles.sidebar}>
            <div className={styles.sidebarInner}>
                {/* Logo */}
                <Link to="/dashboard" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <ArticleIcon sx={{ fontSize: 28 }} />
                    </div>
                    <span className={styles.logoText}>ResumeAI</span>
                </Link>

                {/* Navigation Links */}
                <div className={styles.navSection}>
                    <div className={styles.navLabel}>Menu</div>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`${styles.navItem} ${isActive(item) ? styles.navItemActive : ''}`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navText}>{item.label}</span>
                            {isActive(item) && <span className={styles.activeIndicator} />}
                        </Link>
                    ))}
                </div>

                {/* User & Logout */}
                <div className={styles.sidebarFooter}>
                    {userInfo && (
                        <div className={styles.userInfo}>
                            <img
                                className={styles.userAvatar}
                                src={userInfo.photoUrl}
                                alt={userInfo.name}
                                referrerPolicy="no-referrer"
                            />
                            <div className={styles.userMeta}>
                                <div className={styles.userName}>{userInfo.name}</div>
                                <div className={styles.userRole}>{userInfo.role || 'User'}</div>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogoutIcon sx={{ fontSize: 18 }} />
                        <span>Log out</span>
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className={styles.mobileNav}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`${styles.mobileNavItem} ${isActive(item) ? styles.mobileNavItemActive : ''}`}
                    >
                        {item.icon}
                        <span className={styles.mobileNavLabel}>{item.label}</span>
                    </Link>
                ))}
                <button onClick={handleLogout} className={styles.mobileNavItem}>
                    <LogoutIcon sx={{ fontSize: 20 }} />
                    <span className={styles.mobileNavLabel}>Logout</span>
                </button>
            </div>
        </nav>
    )
}

export default SideBar
