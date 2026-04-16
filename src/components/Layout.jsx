import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import {
    Home, BookOpen, Trophy, User, Shield,
    Sun, Moon, Menu, X, LogOut, FileText, Globe
} from 'lucide-react';
import myLogo from '../assets/mylogo.png';
import AnimatedBackground from './AnimatedBackground';
import './Layout.css';

export default function Layout() {
    const { user, logout, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t, nextLang } = useLang();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Scroll animation observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        // Small delay to let DOM render
        const timer = setTimeout(() => {
            const targets = document.querySelectorAll('.scroll-animate, .stagger-children');
            targets.forEach(el => observer.observe(el));
        }, 100);

        return () => { clearTimeout(timer); observer.disconnect(); };
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const navItems = [
        { path: '/', icon: <Home size={17} />, label: t('home') },
        { path: '/modules', icon: <BookOpen size={17} />, label: t('modules') },
        { path: '/rating', icon: <Trophy size={17} />, label: t('rating') },
        { path: '/terms', icon: <FileText size={17} />, label: t('rules') },
    ];

    const marqueeItems = [
        { icon: '🚀', text: t('m1') },
        { icon: '📹', text: t('m2') },
        { icon: '📝', text: t('m3') },
        { icon: '🏆', text: t('m4') },
        { icon: '🎮', text: t('m5') },
        { icon: '📋', text: t('m6') },
        { icon: '🤖', text: t('m7') },
        { icon: '📊', text: t('m8') },
        { icon: '🎯', text: t('m9') },
        { icon: '⚡', text: t('m10') },
    ];

    return (
        <div>
            <AnimatedBackground />
            <nav className="nav">
                <div className="nav-inner">
                    <Link to="/" className="nav-logo">
                        <img src={myLogo} alt="MDev" className="nav-logo-img" />
                        <span className="nav-logo-text">MDev</span>
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
                                {t('profile')}
                            </Link>
                        )}

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className={`nav-link ${isActive('/admin')}`}
                            >
                                <Shield size={17} />
                                {t('admin')}
                            </Link>
                        )}
                    </div>

                    <div className="nav-actions">
                        <button
                            className="btn-icon lang-toggle"
                            onClick={nextLang}
                            title="Language"
                            aria-label="Switch language"
                        >
                            <Globe size={16} />
                            <span className="lang-label">{t('lang')}</span>
                        </button>

                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                        </button>

                        {user && (
                            <button
                                className="btn-icon"
                                onClick={logout}
                                title={t('logout')}
                                aria-label={t('logout')}
                            >
                                <LogOut size={17} />
                            </button>
                        )}

                        <button
                            className="nav-mobile-toggle"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(v => !v);
                            }}
                            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Marquee Banner */}
            <div className="marquee-wrapper">
                <div className="marquee-track">
                    {[...marqueeItems, ...marqueeItems].map((item, i) => (
                        <div key={i} className="marquee-item">
                            <span className="marquee-icon">{item.icon}</span>
                            <span className="marquee-text">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <main className="page">
                <div className="container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
