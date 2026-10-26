import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { coursesAPI } from '../api/client';
import { BookOpen, ArrowRight, PlayCircle, Layers, RefreshCw, WifiOff } from 'lucide-react';
import myLogo from '../assets/mylogo.png';
import teacherImg from '../assets/teacher.jpg';
import './ModulesPage.css';

export default function ModulesPage() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLang();
    const toast = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await coursesAPI.getModules();
            setModules(res.data);
        } catch (err) {
            console.error(err);
            setError(true);
            toast.error(t('loadError'));
        }
        setLoading(false);
    };

    if (loading) return (
        <div className="page-loader">
            <div className="branded-loader">
                <img src={myLogo} alt="MDev" className="branded-loader-logo" />
                <span className="branded-loader-text">MDev...</span>
                <div className="branded-loader-dots"><span></span><span></span><span></span></div>
            </div>
        </div>
    );

    if (error || modules.length === 0) return (
        <div className="modules-page container animate-fade">
            <div className="page-header">
                <h1>{t('modules')}</h1>
            </div>
            <div className="modules-empty">
                <WifiOff size={48} className="modules-empty-icon" />
                <h3>{t('loadError')}</h3>
                <p>{t('loadErrorDesc')}</p>
                <button className="btn btn-primary" onClick={loadData}>
                    <RefreshCw size={16} /> {t('retry')}
                </button>
            </div>
        </div>
    );

    const gradients = [
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #6c5ce7, #a29bfe)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
        'linear-gradient(135deg, #e11d48, #f43f5e)',
        'linear-gradient(135deg, #0ea5e9, #0284c7)',
    ];
    const icons = ['💻', '⚡', '🎬', '🎯', '🚀'];

    return (
        <div className="modules-page container animate-fade">
            <div className="page-header">
                <h1>{t('modules')}</h1>
                <p>{t('chooseModule')}</p>
            </div>

            <div className="modules-list">
                {modules.map((m, i) => (
                    <div key={m.id} className="module-block card">
                        <div className="module-block-inner">
                            <div className="module-block-left">
                                <div className="module-header">
                                    <div className="module-emoji" style={{ background: `${gradients[i % 5].replace('linear-gradient(135deg, ', '').split(',')[0]}15`, color: gradients[i % 5].replace('linear-gradient(135deg, ', '').split(',')[0] }}>
                                        {icons[i % 5]}
                                    </div>
                                    <div className="module-info">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <h2>{m.name}</h2>
                                            {m.is_paid ? (
                                                <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                                                    ✅ {t('paid')}
                                                </span>
                                            ) : (
                                                <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                                                    💳 {m.price?.toLocaleString()} {t('som')}
                                                </span>
                                            )}
                                        </div>
                                        <p>{m.description}</p>
                                        <div className="module-stats" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <span className="module-lessons-badge">
                                                <Layers size={13} />
                                                {m.courses?.reduce((sum, c) => sum + (c.lessons_count || 0), 0)} {t('lesson')}
                                            </span>
                                            {!m.is_paid && (
                                                <Link to={`/payment/${m.id}`} className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
                                                    💳 {t('pay')} ({m.price?.toLocaleString()} {t('som')})
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {m.courses?.length > 0 && (
                                    <div className="courses-grid">
                                        {m.courses.map((c, ci) => (
                                            <div key={c.id} className="course-card" onClick={() => navigate(`/course/${c.id}`)}
                                                style={{ '--card-gradient': gradients[(i + ci) % 5] }}>
                                                <div className="course-card-bg" style={{ background: gradients[(i + ci) % 5] }} />
                                                <div className="course-card-content">
                                                    <div className="course-card-icon">
                                                        <PlayCircle size={24} />
                                                    </div>
                                                    <h3>{c.name}</h3>

                                                    <div className="course-card-footer">
                                                        <span className="course-lessons-count">
                                                            <Layers size={12} /> {c.lessons_count || 0} {t('lesson')}
                                                        </span>
                                                        <ArrowRight size={16} className="course-card-arrow" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="module-teacher-photo">
                                <div className="teacher-photo-frame" style={{ '--frame-gradient': gradients[i % 5] }}>
                                    <img src={teacherImg} alt="O'qituvchi" />
                                </div>
                                <span className="teacher-label">O'qituvchi</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
