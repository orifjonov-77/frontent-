import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import { adminAPI } from '../api/client';
import {
    Home, BookOpen, Trophy, User, Shield,
    Sun, Moon, Menu, X, LogOut, LogIn, FileText, Globe, Award, Download, Smartphone, Monitor, CheckCircle, Edit3, Save, Loader, HelpCircle
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
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [installGuideOpen, setInstallGuideOpen] = useState(false);
    const [showManualGuide, setShowManualGuide] = useState(false);
    const [siteSettings, setSiteSettings] = useState({
        platform_title: 'MDev Platform',
        footer_desc: "Online ta'lim platformasi — Professional IT ko'nikmalar",
        contact_phone: '+998 88 981 02 06',
        teacher_name: 'Muhammaddiyor Orifjonov',
        bot_username: '@mdevsayt_bot',
        copyright_text: '© 2024 MDev Platform. Barcha huquqlar himoyalangan.',
        card_number: '5614 6819 0511 2722',
        card_holder: 'Orifjonov Muhammaddiyor',
        card_expiry: '07/30',
    });
    const [footerEditOpen, setFooterEditOpen] = useState(false);
    const [footerForm, setFooterForm] = useState({});
    const [savingFooter, setSavingFooter] = useState(false);

    const loadSiteSettings = () => {
        adminAPI.getSiteSettings()
            .then(r => {
                if (r.data) setSiteSettings(prev => ({ ...prev, ...r.data }));
            })
            .catch(() => { });
    };

    useEffect(() => {
        loadSiteSettings();
        const handler = (e) => {
            if (e.detail) {
                setSiteSettings(prev => ({ ...prev, ...e.detail }));
            } else {
                loadSiteSettings();
            }
        };
        window.addEventListener('siteSettingsUpdated', handler);
        return () => window.removeEventListener('siteSettingsUpdated', handler);
    }, []);

    const handleSaveFooterSettings = async () => {
        setSavingFooter(true);
        try {
            const res = await adminAPI.updateSiteSettings(footerForm);
            if (res.data?.settings) {
                setSiteSettings(prev => ({ ...prev, ...res.data.settings }));
                window.dispatchEvent(new CustomEvent('siteSettingsUpdated', { detail: res.data.settings }));
            }
            setFooterEditOpen(false);
        } catch (err) {
            alert(err.response?.data?.detail || "Saqlashda xatolik yuz berdi");
        }
        setSavingFooter(false);
    };

    // PWA Install prompt listener
    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            setIsInstalled(true);
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            window.deferredPWAEvent = e;
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setInstallGuideOpen(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleDownloadApp = () => {
        // Avval tasdiqlash oynasini ochamiz ("Yuklab olasizmi? Ha / Yo'q")
        setShowManualGuide(false);
        setInstallGuideOpen(true);
    };

    const handleConfirmInstall = async () => {
        // Foydalanuvchi "Ha, yuklab olish" tugmasini bosganda:
        const promptEvent = deferredPrompt || window.deferredPWAEvent;
        if (promptEvent) {
            try {
                promptEvent.prompt();
                const { outcome } = await promptEvent.userChoice;
                if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                    window.deferredPWAEvent = null;
                    setIsInstalled(true);
                    setInstallGuideOpen(false);
                    return;
                }
            } catch (err) {
                console.log("Install prompt error:", err);
            }
        }
        // Agar brauzer nativ oynasi chiqmasa, qo'llanmani ko'rsatamiz
        setShowManualGuide(true);
    };

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

                        {!isInstalled && (
                            <button
                                type="button"
                                className="nav-link download-mobile-link"
                                onClick={() => {
                                    setMenuOpen(false);
                                    handleDownloadApp();
                                }}
                            >
                                <Download size={17} />
                                <span>Ilovani yuklab olish (Download)</span>
                            </button>
                        )}
                    </div>

                    <div className="nav-actions">
                        {!isInstalled && (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm nav-download-btn"
                                onClick={handleDownloadApp}
                                title="MDev ilovasini telefon yoki kompyuterga yuklab olish"
                            >
                                <Download size={15} />
                                <span className="download-btn-label">Yuklab olish</span>
                            </button>
                        )}

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
                                <h3>{siteSettings.platform_title || t('platformTitle')}</h3>
                            </div>
                            <p>{siteSettings.footer_desc || t('footerDesc')}</p>
                        </div>
                        <div className="footer-links">
                            <Link to="/modules">{t('modules')}</Link>
                            <Link to="/rating">{t('rating')}</Link>
                            <Link to="/terms">{t('rules')}</Link>
                            {user && <Link to="/results">{t('myResults')}</Link>}
                        </div>
                        <div className="footer-contact">
                            <p>📞 {siteSettings.contact_phone}</p>
                            <p>👨‍🏫 {siteSettings.teacher_name}</p>
                            <p>🤖 {siteSettings.bot_username}</p>
                            {isAdmin && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    style={{ marginTop: '0.5rem' }}
                                    onClick={() => {
                                        setFooterForm({ ...siteSettings });
                                        setFooterEditOpen(true);
                                    }}
                                >
                                    <Edit3 size={13} /> Ma'lumotlarni o'zgartirish
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>{siteSettings.copyright_text || t('allRights')}</p>
                    </div>
                </div>
            </footer>

            {/* Admin Quick Edit Footer / Contact Modal */}
            {footerEditOpen && isAdmin && (
                <div className="modal-overlay" onClick={() => setFooterEditOpen(false)}>
                    <div className="modal-content install-modal-box" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="install-modal-close"
                            onClick={() => setFooterEditOpen(false)}
                            aria-label="Yopish"
                        >
                            <X size={18} />
                        </button>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Edit3 size={18} /> Sayt va Aloqa Ma'lumotlarini O'zgartirish
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>📞 Telefon raqam (Footer va Aloqada)</label>
                                <input
                                    className="input"
                                    value={footerForm.contact_phone || ''}
                                    onChange={(e) => setFooterForm(p => ({ ...p, contact_phone: e.target.value }))}
                                    placeholder="+998 88 981 02 06"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>👨‍🏫 O'qituvchi / Muallif ismi</label>
                                <input
                                    className="input"
                                    value={footerForm.teacher_name || ''}
                                    onChange={(e) => setFooterForm(p => ({ ...p, teacher_name: e.target.value }))}
                                    placeholder="Muhammaddiyor Orifjonov"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>🤖 Telegram Bot nomi</label>
                                <input
                                    className="input"
                                    value={footerForm.bot_username || ''}
                                    onChange={(e) => setFooterForm(p => ({ ...p, bot_username: e.target.value }))}
                                    placeholder="@mdevsayt_bot"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>🏷 Platforma nomi</label>
                                <input
                                    className="input"
                                    value={footerForm.platform_title || ''}
                                    onChange={(e) => setFooterForm(p => ({ ...p, platform_title: e.target.value }))}
                                    placeholder="MDev Platform"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>📝 Pastki qisqa tavsif (Footer tavsifi)</label>
                                <input
                                    className="input"
                                    value={footerForm.footer_desc || ''}
                                    onChange={(e) => setFooterForm(p => ({ ...p, footer_desc: e.target.value }))}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>© Mualliflik huquqi yozuvi (Copyright)</label>
                                <input
                                    className="input"
                                    value={footerForm.copyright_text || ''}
                                    onChange={(e) => setFooterForm(p => ({ ...p, copyright_text: e.target.value }))}
                                />
                            </div>
                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>💳 To'lov karta raqami</label>
                                <input
                                    className="input"
                                    value={footerForm.card_number || ''}
                                    onChange={(e) => setFooterForm(p => ({ ...p, card_number: e.target.value }))}
                                    placeholder="5614 6819 0511 2722"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>👤 Karta egasi (F.I.SH)</label>
                                    <input
                                        className="input"
                                        value={footerForm.card_holder || ''}
                                        onChange={(e) => setFooterForm(p => ({ ...p, card_holder: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>📅 Karta muddati</label>
                                    <input
                                        className="input"
                                        value={footerForm.card_expiry || ''}
                                        onChange={(e) => setFooterForm(p => ({ ...p, card_expiry: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setFooterEditOpen(false)}>
                                Bekor qilish
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveFooterSettings} disabled={savingFooter}>
                                {savingFooter ? <Loader size={16} className="spin" /> : <><Save size={16} /> Saqlash</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Install App Confirm & Download Modal */}
            {installGuideOpen && (
                <div className="modal-overlay" onClick={() => setInstallGuideOpen(false)}>
                    <div className="modal-content install-modal-box" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="install-modal-close"
                            onClick={() => setInstallGuideOpen(false)}
                            aria-label="Yopish"
                        >
                            <X size={18} />
                        </button>
                        <div className="install-modal-header">
                            <img src={myLogo} alt="MDev" className="install-modal-logo" />
                            <div>
                                <h3>📲 MDev ilovasini yuklab olasizmi?</h3>
                                <p>Platformani telefon yoki kompyuteringizga tezkor ilova sifatida o'rnating!</p>
                            </div>
                        </div>

                        {/* Confirmation Banner */}
                        <div className="install-confirm-banner">
                            <p className="install-confirm-question">
                                <strong>MDev ilovasini qurilmangizga yuklab olmoqchimisiz?</strong>
                            </p>
                            <p className="install-confirm-desc">
                                Ilova orqali sayt tezroq ishlaydi, internet kam sarflanadi va brauzersiz bir klikda ochiladi.
                            </p>
                            
                            <div className="install-confirm-buttons">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg install-btn-yes"
                                    onClick={handleConfirmInstall}
                                >
                                    <Download size={18} /> <span>Ha, yuklab olish</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-lg install-btn-no"
                                    onClick={() => setInstallGuideOpen(false)}
                                >
                                    <X size={18} /> <span>Yo'q</span>
                                </button>
                            </div>
                        </div>

                        {!showManualGuide ? (
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn-link-help"
                                    onClick={() => setShowManualGuide(true)}
                                >
                                    <HelpCircle size={14} /> Qo'lda o'rnatish yo'riqnomasi kerakmi?
                                </button>
                            </div>
                        ) : (
                            <div className="install-steps-grid animate-fade" style={{ marginTop: '1rem' }}>
                                <div className="install-step-card">
                                    <div className="install-step-title">
                                        <Smartphone size={18} />
                                        <strong>Android / Samsung / Xiaomi</strong>
                                    </div>
                                    <ol>
                                        <li>Brauzerning o'ng tepa burchagidagi <strong>⋮ (3 nuqta)</strong> tugmasini bosing.</li>
                                        <li><strong>«Ilovani o'rnatish»</strong> (<em>Установить приложение</em> / <em>Add to Home screen</em>) ni tanlang.</li>
                                    </ol>
                                </div>

                                <div className="install-step-card">
                                    <div className="install-step-title">
                                        <Smartphone size={18} />
                                        <strong>iPhone / iPad (Safari)</strong>
                                    </div>
                                    <ol>
                                        <li>Pastdagi <strong>Ulashish (Share ⬆️)</strong> tugmasini bosing.</li>
                                        <li>Ro'yxatdan <strong>«Asosiy ekranga qo'shish»</strong> (<em>На экран «Домой»</em> / <em>Add to Home Screen</em>) ni bosing.</li>
                                    </ol>
                                </div>

                                <div className="install-step-card">
                                    <div className="install-step-title">
                                        <Monitor size={18} />
                                        <strong>Kompyuter / Noutbuk (Chrome / Edge)</strong>
                                    </div>
                                    <ol>
                                        <li>Manzil qatori (URL) o'ng tomonidagi <strong>📥 O'rnatish (Install MDev)</strong> belgisini bosing.</li>
                                        <li>Tasdiqlash oynasida <strong>«O'rnatish» (Install)</strong> tugmasini bosing.</li>
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
