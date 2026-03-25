import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Code, Monitor, Scissors, ArrowRight, Star, Users, Award } from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();

  const modules = [
    { icon: <Monitor size={32} />, title: "Kompyuter savodxonligi", desc: "Word, Excel, PowerPoint, Canva", price: "100,000", color: "#10b981" },
    { icon: <Code size={32} />, title: "Dasturlash", desc: "HTML, CSS, JS, React, Python, FastAPI", price: "130,000", color: "#6c5ce7" },
    { icon: <Scissors size={32} />, title: "Montaj", desc: "CapCut, Premiere Pro, video montaj", price: "90,000", color: "#f59e0b" },
  ];

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content animate-slide">
            <div className="hero-badge">🚀 Online ta'lim platformasi</div>
            <h1 className="hero-title">
              Professional <span className="gradient-text">IT ko'nikmalarni</span><br />
              o'rganishni boshlang
            </h1>
            <p className="hero-desc">
              Kompyuter savodxonligi, dasturlash va montaj bo'yicha sifatli video darslar.
              Testlar, vazifalar va interaktiv mashqlar bilan bilimingizni mustahkamlang.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/modules" className="btn btn-primary btn-lg">
                  Darslarga o'tish <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg">
                  Boshlash <ArrowRight size={18} />
                </Link>
              )}
              <Link to="/rating" className="btn btn-secondary btn-lg">
                Reyting ko'rish
              </Link>
            </div>
          </div>

          <div className="hero-stats stagger-children">
            <div className="stat-item">
              <BookOpen size={24} className="stat-icon" />
              <div><strong>3</strong><span>Modul</span></div>
            </div>
            <div className="stat-item">
              <Users size={24} className="stat-icon" />
              <div><strong>100+</strong><span>O'quvchilar</span></div>
            </div>
            <div className="stat-item">
              <Award size={24} className="stat-icon" />
              <div><strong>24/7</strong><span>Qo'llab-quvvatlash</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="modules-section">
        <div className="container">
          <h2 className="section-title">Bizning modullar</h2>
          <p className="section-desc">Har bir modul professional darajada tayyorlangan</p>

          <div className="modules-grid stagger-slide">
            {modules.map((m, i) => (
              <div key={i} className="module-card card card-interactive">
                <div className="module-icon" style={{ background: `${m.color}15`, color: m.color }}>
                  {m.icon}
                </div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <div className="module-price">
                  <span className="price-amount">{m.price}</span>
                  <span className="price-label">so'm</span>
                </div>
                <Link to="/modules" className="btn btn-secondary" style={{ width: '100%' }}>
                  Batafsil <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Nima uchun bizni tanlashadi?</h2>
          <div className="features-grid stagger-children">
            {[
              { icon: "📹", title: "Video darslar", desc: "Professional sifatli video darslar" },
              { icon: "📝", title: "Testlar", desc: "Har darsda 10 ta test savol (7 daqiqa)" },
              { icon: "🎮", title: "O'yin misollari", desc: "Interaktiv mashq va misollar" },
              { icon: "📋", title: "Vazifalar", desc: "Amaliy topshiriqlar va uy vazifalari" },
              { icon: "🏆", title: "Reyting", desc: "O'quvchilar o'rtasida raqobat" },
              { icon: "📊", title: "Imtihonlar", desc: "Har 12 darsda imtihon" },
            ].map((f, i) => (
              <div key={i} className="feature-item card card-interactive">
                <span className="feature-emoji">{f.icon}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
