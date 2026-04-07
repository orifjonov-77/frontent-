import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI } from '../api/client';
import { BookOpen, Code, Monitor, Scissors, ArrowRight, Star, Users, Award, Zap, CheckCircle, PlayCircle } from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);

  useEffect(() => {
    coursesAPI.getModules()
      .then(res => setModules(res.data))
      .catch(() => { });
  }, []);

  const iconMap = {
    0: <Monitor size={32} />,
    1: <Code size={32} />,
    2: <Scissors size={32} />,
  };
  const colorMap = ['#10b981', '#6c5ce7', '#f59e0b', '#e11d48', '#3b82f6'];

  // Marquee items
  const marqueeItems = [
    { icon: '🚀', text: 'Professional IT kurslar' },
    { icon: '📹', text: 'Sifatli video darslar' },
    { icon: '📝', text: 'Interaktiv testlar' },
    { icon: '🏆', text: "Reyting tizimi" },
    { icon: '🎮', text: "Amaliy mashg'ulotlar" },
    { icon: '📋', text: 'Uy vazifalari' },
    { icon: '🤖', text: 'AI yordamchi' },
    { icon: '📊', text: 'Imtihonlar' },
    { icon: '🎯', text: '24/7 qo\'llab-quvvatlash' },
    { icon: '⚡', text: 'Tezkor natijalar' },
  ];

  return (
    <div className="home">
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
              <div><strong>{modules.length || 3}</strong><span>Modul</span></div>
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

      {/* Modules — prices from API */}
      <section className="modules-section">
        <div className="container">
          <h2 className="section-title">Bizning modullar</h2>
          <p className="section-desc">Har bir modul professional darajada tayyorlangan</p>

          <div className="modules-grid stagger-slide">
            {(modules.length > 0 ? modules : [
              { id: 1, name: "Kompyuter savodxonligi", description: "Word, Excel, PowerPoint, Canva", price: 0 },
              { id: 2, name: "Dasturlash", description: "HTML, CSS, JS, React, Python, FastAPI", price: 0 },
              { id: 3, name: "Montaj", description: "CapCut, Premiere Pro, video montaj", price: 0 },
            ]).map((m, i) => (
              <div key={m.id || i} className="module-card card card-interactive">
                <div className="module-icon" style={{ background: `${colorMap[i % 5]}15`, color: colorMap[i % 5] }}>
                  {iconMap[i] || <Zap size={32} />}
                </div>
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <div className="module-price">
                  <span className="price-amount">{m.price ? m.price.toLocaleString() : '—'}</span>
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
