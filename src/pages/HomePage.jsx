import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Code, Monitor, Scissors, ArrowRight, Users, Award, Zap, Shield, Star, ChevronRight } from 'lucide-react';
import './HomePage.css';

// Typewriter component — letter-by-letter animation
function Typewriter({ text, delay = 40, className = '' }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const letters = text.split('');

  useEffect(() => {
    setVisibleCount(0);
    const timers = [];
    letters.forEach((_, i) => {
      const t = setTimeout(() => setVisibleCount(i + 1), i * delay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [text, delay]);

  return (
    <span className={className}>
      {letters.slice(0, visibleCount).map((char, i) => (
        <span
          key={`${text}-${i}`}
          className="typewriter-char"
          style={{ animationDelay: `0ms` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

// Animated counter
function AnimatedCount({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let current = 0;
          const step = Math.ceil(target / 30);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(current);
            }
          }, 30);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <strong ref={ref}>{count}{suffix}</strong>;
}

// Tech marquee items
const techItems = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Python', 'FastAPI',
  'Word', 'Excel', 'PowerPoint', 'Canva', 'CapCut', 'Premiere Pro',
  'Node.js', 'Git', 'VS Code', 'Figma'
];

export default function HomePage() {
  const { user } = useAuth();

  const modules = [
    { icon: <Monitor size={32} />, title: "Kompyuter savodxonligi", desc: "Word, Excel, PowerPoint, Canva asoslari", price: "100,000", color: "#10b981", emoji: "💻" },
    { icon: <Code size={32} />, title: "Dasturlash", desc: "HTML, CSS, JS, React, Python, FastAPI", price: "130,000", color: "#6c5ce7", emoji: "⚡" },
    { icon: <Scissors size={32} />, title: "Montaj", desc: "CapCut, Premiere Pro, video montaj", price: "90,000", color: "#f59e0b", emoji: "🎬" },
  ];

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-floating-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={14} /> Online ta'lim platformasi
            </div>
            <h1 className="hero-title">
              <Typewriter text="Professional " delay={50} />
              <span className="gradient-text">
                <Typewriter text="IT ko'nikmalarni" delay={50} />
              </span>
              <br />
              <Typewriter text="o'rganishni boshlang" delay={50} />
            </h1>
            <p className="hero-desc">
              Kompyuter savodxonligi, dasturlash va montaj bo'yicha sifatli video darslar.
              Testlar, vazifalar va interaktiv mashqlar bilan bilimingizni mustahkamlang.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/modules" className="btn btn-primary btn-lg hero-btn-pulse">
                  Darslarga o'tish <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg hero-btn-pulse">
                  Boshlash <ArrowRight size={18} />
                </Link>
              )}
              <Link to="/rating" className="btn btn-secondary btn-lg">
                Reyting ko'rish
              </Link>
            </div>
          </div>

          <div className="hero-stats scroll-animate">
            <div className="stat-item">
              <BookOpen size={24} className="stat-icon" />
              <div><AnimatedCount target={3} /><span>Modul</span></div>
            </div>
            <div className="stat-item">
              <Users size={24} className="stat-icon" />
              <div><AnimatedCount target={100} suffix="+" /><span>O'quvchilar</span></div>
            </div>
            <div className="stat-item">
              <Award size={24} className="stat-icon" />
              <div><strong>24/7</strong><span>Qo'llab-quvvatlash</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Marquee */}
      <section className="tech-marquee-section">
        <div className="tech-marquee-track">
          {[...techItems, ...techItems, ...techItems].map((tech, i) => (
            <div key={i} className="tech-marquee-chip">
              <Code size={14} />
              <span>{tech}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="modules-section">
        <div className="container">
          <h2 className="section-title scroll-animate">Bizning modullar</h2>
          <p className="section-desc scroll-animate">Har bir modul professional darajada tayyorlangan</p>

          <div className="modules-grid stagger-children">
            {modules.map((m, i) => (
              <div key={i} className="module-card card">
                <div className="module-card-glow" style={{ background: `${m.color}20` }}></div>
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
          <h2 className="section-title scroll-animate">Nima uchun bizni tanlashadi?</h2>
          <div className="features-grid stagger-children">
            {[
              { icon: "📹", title: "Video darslar", desc: "Professional sifatli video darslar" },
              { icon: "📝", title: "Testlar", desc: "Har darsda 10 ta test savol (7 daqiqa)" },
              { icon: "🎮", title: "O'yin misollari", desc: "Interaktiv mashq va misollar" },
              { icon: "📋", title: "Vazifalar", desc: "Amaliy topshiriqlar va uy vazifalari" },
              { icon: "🏆", title: "Reyting", desc: "O'quvchilar o'rtasida raqobat" },
              { icon: "📊", title: "Imtihonlar", desc: "Har 12 darsda imtihon" },
            ].map((f, i) => (
              <div key={i} className="feature-item card">
                <span className="feature-emoji">{f.icon}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title scroll-animate">Qanday ishlaydi?</h2>
          <div className="how-steps stagger-children">
            {[
              { num: "01", icon: "📝", title: "Ro'yxatdan o'ting", desc: "Telefon raqamingizni kiriting va Telegram bot orqali tasdiqlang" },
              { num: "02", icon: "💳", title: "Modulni tanlang", desc: "O'zingizga mos modulni tanlab, to'lov qiling" },
              { num: "03", icon: "📹", title: "Video darslarni ko'ring", desc: "Professional video darslarni tomosha qilib o'rganing" },
              { num: "04", icon: "🏆", title: "Natijaga erishing", desc: "Test va vazifalarni bajaring, sertifikat oling" },
            ].map((s, i) => (
              <div key={i} className="how-step card">
                <div className="how-step-num">{s.num}</div>
                <span className="how-step-icon">{s.icon}</span>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content scroll-animate">
              <h2>Hoziroq boshlang!</h2>
              <p>Professional IT ko'nikmalarni egallash uchun birinchi qadamni tashlang</p>
              <div className="cta-actions">
                {user ? (
                  <Link to="/modules" className="btn btn-primary btn-lg">
                    Darslarga o'tish <ChevronRight size={18} />
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Bepul ro'yxatdan o'tish <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>MDev Platform</h3>
              <p>Online ta'lim platformasi — Professional IT ko'nikmalar</p>
            </div>
            <div className="footer-links">
              <Link to="/modules">Modullar</Link>
              <Link to="/rating">Reyting</Link>
              <Link to="/terms">Qoidalar</Link>
            </div>
            <div className="footer-contact">
              <p>📞 +998889810206</p>
              <p>👨‍🏫 Muhammaddiyor Orifjonov</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 MDev Platform. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
