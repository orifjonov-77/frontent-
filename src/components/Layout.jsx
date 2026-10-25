import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import {
    Home, BookOpen, Trophy, User, Shield,
    Sun, Moon, Menu, X, LogOut, LogIn, FileText, Globe, Award
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

    // Close menu on Escape or outside click
    useEffect(() => {
        if (!menuOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        const handleClick = () => setMenuOpen(false);
        window.addEventListener('keydown', handleKey);
        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('click', handleClick);
        };
    }, [menuOpen]);

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

        const timer = setTimeout(() => {
            const targets = document.querySelectorAll('.scroll-animate, .stagger-children');
            targets.forEach(el => observer.observe(el));
        }, 100);

        return () => { clearTimeout(timer); observer.disconnect(); };
    }, [location.pathname]);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/' ? 'active' : '';
        return location.pathname.startsWith(path) ? 'active' : '';
    };

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
        <div className="app-shell">
            <AnimatedBackground />
            <nav className="nav" role="navigation" aria-label="Main navigation">
                <div className="nav-inner">
                    <Link to="/" className="nav-logo">
                        <img src={myLogo} alt="MDev Logo" className="nav-logo-img" />
                        <span className="nav-logo-text">MDev</span>
                    </Link>

                    <div
                        className={`nav-links ${menuOpen ? 'open' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
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
                            <>
                                <Link
                                    to="/results"
                                    className={`nav-link ${isActive('/results')}`}
                                >
                                    <Award size={17} />
                                    {t('myResults')}
                                </Link>
                                <Link
                                    to="/profile"
                                    className={`nav-link ${isActive('/profile')}`}
                                >
                                    <User size={17} />
                                    {t('profile')}
                                </Link>
                            </>
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

                        {!user && (
                            <Link
                                to="/login"
                                className="nav-link login-nav-link login-mobile-only"
                            >
                                <LogIn size={17} />
                                {t('login')}
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

                        {user ? (
                            <button
                                className="btn-icon"
                                onClick={logout}
                                title={t('logout')}
                                aria-label={t('logout')}
                            >
                                <LogOut size={17} />
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="btn btn-primary btn-sm login-desktop-btn"
                            >
                                <LogIn size={15} />
                                {t('login')}
                            </Link>
                        )}

                        <button
                            className="nav-mobile-toggle"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(v => !v);
                            }}
                            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Marquee Banner */}
            <div className="marquee-wrapper" aria-hidden="true">
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

            <footer className="site-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo-row">
                                <img src={myLogo} alt="MDev Logo" className="footer-logo-img" />
                                <h3>{t('platformTitle')}</h3>
                            </div>
                            <p>{t('footerDesc')}</p>
                        </div>
                        <div className="footer-links">
                            <Link to="/modules">{t('modules')}</Link>
                            <Link to="/rating">{t('rating')}</Link>
                            <Link to="/terms">{t('rules')}</Link>
                            {user && <Link to="/results">{t('myResults')}</Link>}
                        </div>
                        <div className="footer-contact">
                            <p>📞 +998 88 981 02 06</p>
                            <p>👨‍🏫 Muhammaddiyor Orifjonov</p>
                            <p>🤖 @mdevsayt_bot</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>{t('allRights')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
