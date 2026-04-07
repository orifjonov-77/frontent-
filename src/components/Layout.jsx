import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Home, BookOpen, Trophy, User, Shield,
    Sun, Moon, Menu, X, LogOut, FileText
} from 'lucide-react';
import './Layout.css';

export default function Layout() {
    const { user, logout, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Close menu on outside click
    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e) => {
            if (!e.target.closest('.nav-links') && !e.target.closest('.nav-mobile-toggle')) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [menuOpen]);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const navItems = [
        { path: '/',        icon: <Home size={17} />,     label: 'Bosh sahifa' },
        { path: '/modules', icon: <BookOpen size={17} />, label: 'Modullar' },
        { path: '/rating',  icon: <Trophy size={17} />,   label: 'Reyting' },
        { path: '/terms',   icon: <FileText size={17} />, label: 'Qoidalar' },
    ];

    return (
        <div>
            <nav className="nav">
                <div className="nav-inner">
                    <Link to="/" className="nav-logo">
                        MDev Academy
                    </Link>

                    <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${isActive(item.path)}`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}

                        {user && (
                            <Link
                                to="/profile"
                                className={`nav-link ${isActive('/profile')}`}
                            >
                                <User size={17} />
                                Profil
                            </Link>
                        )}

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className={`nav-link ${isActive('/admin')}`}
                            >
                                <Shield size={17} />
                                Admin
                            </Link>
                        )}
                    </div>

                    <div className="nav-actions">
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? "Kunduzgi rejim" : "Tungi rejim"}
                            aria-label="Rejim almashtirish"
                        >
                            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                        </button>

                        {user && (
                            <button
                                className="btn-icon"
                                onClick={logout}
                                title="Chiqish"
                                aria-label="Chiqish"
                            >
                                <LogOut size={17} />
                            </button>
                        )}

                        <button
                            className="nav-mobile-toggle"
                            onClick={() => setMenuOpen(v => !v)}
                            aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="page">
                <div className="container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
