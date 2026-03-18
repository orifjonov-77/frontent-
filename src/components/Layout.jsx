import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User, Shield, Home, BookOpen, Trophy, Menu, X, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import './Layout.css';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="container nav-inner">
          <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
            <img src="../src/assets/mylogo.png" alt="MDev" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <span className="logo-text">MDev</span>
          </Link>

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
              <Home size={16} /> Bosh sahifa
            </Link>
            <Link to="/modules" className="nav-link" onClick={() => setMenuOpen(false)}>
              <BookOpen size={16} /> Modullar
            </Link>
            <Link to="/rating" className="nav-link" onClick={() => setMenuOpen(false)}>
              <Trophy size={16} /> Reyting
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="nav-link nav-admin" onClick={() => setMenuOpen(false)}>
                    <Shield size={16} /> Admin
                  </Link>
                )}
                <Link to="/results" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <BarChart3 size={16} /> Natijalar
                </Link>
                <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <User size={16} /> {user.full_name?.split(' ')[0]}
                </Link>
                <button className="nav-link nav-logout" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                  <LogOut size={16} /> Chiqish
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Kirish
              </Link>
            )}

            <button className="theme-toggle" onClick={toggleTheme} title="Tema o'zgartirish">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2026 MDev Online Teaching Platform. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
