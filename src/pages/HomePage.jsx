import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { BookOpen, Code, Monitor, Scissors, ArrowRight, Users, Award, Zap, ChevronRight } from 'lucide-react';
import './HomePage.css';

// Typewriter
function Typewriter({ text, delay = 40, className = '' }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const letters = text.split('');

  useEffect(() => {
    setVisibleCount(0);
    const timers = letters.map((_, i) => setTimeout(() => setVisibleCount(i + 1), i * delay));
    return () => timers.forEach(clearTimeout);
  }, [text, delay]);

  return (
    <span className={className}>
      {letters.slice(0, visibleCount).map((char, i) => (
        <span key={`${text}-${i}`} className="typewriter-char" style={{ animationDelay: '0ms' }}>
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
            if (current >= target) { setCount(target); clearInterval(timer); }
            else setCount(current);
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

const techItems = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Python', 'FastAPI',
  'Word', 'Excel', 'PowerPoint', 'Canva', 'CapCut', 'Premiere Pro',
  'Node.js', 'Git', 'VS Code', 'Figma'
];

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLang();

  const modules = [
    { icon: <Monitor size={32} />, title: t('compLit'), desc: t('compLitDesc'), price: "100,000", color: "#10b981" },
    { icon: <Code size={32} />, title: t('programming'), desc: t('progDesc'), price: "130,000", color: "#6c5ce7" },
    { icon: <Scissors size={32} />, title: t('editing'), desc: t('editDesc'), price: "90,000", color: "#f59e0b" },
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
              <Zap size={14} /> {t('heroBadge')}
            </div>
            <h1 className="hero-title">
              <Typewriter text={t('heroTitle1')} delay={50} />
              <span className="gradient-text">
                <Typewriter text={t('heroTitle2')} delay={50} />
              </span>
              <br />
              <Typewriter text={t('heroTitle3')} delay={50} />
            </h1>
            <p className="hero-desc">{t('heroDesc')}</p>
            <div className="hero-actions">
              {user ? (
                <Link to="/modules" className="btn btn-primary btn-lg hero-btn-pulse">
                  {t('goToLessons')} <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg hero-btn-pulse">
                  {t('start')} <ArrowRight size={18} />
                </Link>
              )}
              <Link to="/rating" className="btn btn-secondary btn-lg">
                {t('viewRating')}
              </Link>
            </div>
          </div>

          <div className="hero-stats scroll-animate">
            <div className="stat-item">
              <BookOpen size={24} className="stat-icon" />
              <div><AnimatedCount target={3} /><span>{t('module')}</span></div>
            </div>
            <div className="stat-item">
              <Users size={24} className="stat-icon" />
              <div><AnimatedCount target={100} suffix="+" /><span>{t('students')}</span></div>
            </div>
            <div className="stat-item">
              <Award size={24} className="stat-icon" />
              <div><strong>24/7</strong><span>{t('support247')}</span></div>
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
          <h2 className="section-title scroll-animate">{t('ourModules')}</h2>
          <p className="section-desc scroll-animate">{t('modulesSubtitle')}</p>
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
                  <span className="price-label"> {t('som')}</span>
                </div>
                <Link to="/modules" className="btn btn-secondary" style={{ width: '100%' }}>
                  {t('details')} <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title scroll-animate">{t('whyChooseUs')}</h2>
          <div className="features-grid stagger-children">
            {[
              { icon: "📹", title: t('videoLessons'), desc: t('videoLessonsDesc') },
              { icon: "📝", title: t('tests'), desc: t('testsDesc') },
              { icon: "🎮", title: t('games'), desc: t('gamesDesc') },
              { icon: "📋", title: t('tasks'), desc: t('tasksDesc') },
              { icon: "🏆", title: t('ratingTitle'), desc: t('ratingDesc') },
              { icon: "📊", title: t('exams'), desc: t('examsDesc') },
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
          <h2 className="section-title scroll-animate">{t('howItWorks')}</h2>
          <div className="how-steps stagger-children">
            {[
              { num: "01", icon: "📝", title: t('step1'), desc: t('step1Desc') },
              { num: "02", icon: "💳", title: t('step2'), desc: t('step2Desc') },
              { num: "03", icon: "📹", title: t('step3'), desc: t('step3Desc') },
              { num: "04", icon: "🏆", title: t('step4'), desc: t('step4Desc') },
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

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content scroll-animate">
              <h2>{t('startNow')}</h2>
              <p>{t('ctaDesc')}</p>
              <div className="cta-actions">
                {user ? (
                  <Link to="/modules" className="btn btn-primary btn-lg">
                    {t('goToLessons')} <ChevronRight size={18} />
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-lg">
                    {t('freeRegister')} <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
