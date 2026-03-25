import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, BookOpen, Trophy, User, Shield, Sun, Moon, Menu, X, LogOut, FileText } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const navItems = [
    { path: '/', icon: <Home size={18} />, label: 'Bosh sahifa' },
    { path: '/modules', icon: <BookOpen size={18} />, label: 'Modullar' },
    { path: '/rating', icon: <Trophy size={18} />, label: 'Reyting' },
    { path: '/terms', icon: <FileText size={18} />, label: 'Qoidalar' },
  ];

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">MDev Academy</Link>

          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path)}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            {user && (
              <Link to="/profile" className={`nav-link ${isActive('/profile')}`} onClick={() => setMenuOpen(false)}>
                <User size={18} /> Profil
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className={`nav-link ${isActive('/admin')}`} onClick={() => setMenuOpen(false)}>
                <Shield size={18} /> Admin
              </Link>
            )}
          </div>

          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Rejim almashtirish">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user && (
              <button className="btn-icon" onClick={logout} title="Chiqish">
                <LogOut size={18} />
              </button>
            )}

            <button className="nav-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="page">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </>
  );
}
