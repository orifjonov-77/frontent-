import { useState, useEffect } from 'react';
import { resultsAPI } from '../api/client';
import { FileText, BookOpen, Gamepad2, CheckCircle, XCircle, Clock, Trophy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ResultsPage.css';

export default function ResultsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tests');

    useEffect(() => { loadResults(); }, []);

    const loadResults = async () => {
        try {
            const res = await resultsAPI.getMy();
            setData(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    if (loading) return <div className="page-loader"><div className="branded-loader"><img src="/logo.png" alt="MDev" className="branded-loader-logo" /><span className="branded-loader-text">MDev...</span><div className="branded-loader-dots"><span></span><span></span><span></span></div></div></div>;

    const tabs = [
        { id: 'tests', icon: <FileText size={16} />, label: 'Testlar', count: data?.tests?.length || 0 },
        { id: 'homework', icon: <BookOpen size={16} />, label: 'Vazifalar', count: data?.homework?.length || 0 },
        { id: 'games', icon: <Gamepad2 size={16} />, label: "O'yinlar", count: data?.games?.length || 0 },
    ];

    return (
        <div className="results-page container animate-fade">
            <Link to="/dashboard" className="back-link"><ArrowLeft size={16} /> Dashboard</Link>

            <div className="results-header">
                <div className="results-header-icon"><Trophy size={28} /></div>
                <div>
                    <h1>Mening Natijalarim</h1>
                    <p>Testlar, vazifalar va o'yinlar natijalari</p>
                </div>
            </div>

            {/* Stats summary */}
            <div className="results-stats">
                {tabs.map(t => (
                    <div key={t.id} className="results-stat-card card" onClick={() => setActiveTab(t.id)}>
                        {t.icon}
                        <span className="stat-num">{t.count}</span>
                        <span className="stat-lbl">{t.label}</span>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="results-tabs">
                {tabs.map(t => (
                    <button key={t.id} className={`results-tab ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.id)}>
                        {t.icon} {t.label} <span className="tab-count">{t.count}</span>
                    </button>
                ))}
            </div>

            {/* Test Results */}
            {activeTab === 'tests' && (
                <div className="results-list stagger-children">
                    {data?.tests?.length === 0 && (
                        <div className="empty-state card">
                            <FileText size={32} />
                            <p>Hali test topshirilmagan</p>
                        </div>
                    )}
                    {data?.tests?.map(t => (
                        <div key={t.id} className={`result-card card ${t.passed ? 'passed' : 'failed'}`}>
                            <div className="result-icon">
                                {t.passed ? <CheckCircle size={20} /> : <XCircle size={20} />}
                            </div>
                            <div className="result-info">
                                <h4>{t.lesson_title}</h4>
                                <span className="result-sub">{t.test_title}</span>
                            </div>
                            <div className="result-score">
                                <span className="score-num">{t.score}/{t.total}</span>
                                <span className={`badge ${t.passed ? 'badge-success' : 'badge-danger'}`}>
                                    {t.passed ? "O'tdi ✓" : "O'tmadi ✗"}
                                </span>
                            </div>
                            <div className="result-date">
                                <Clock size={12} /> {t.submitted_at?.slice(0, 10)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Homework Results */}
            {activeTab === 'homework' && (
                <div className="results-list stagger-children">
                    {data?.homework?.length === 0 && (
                        <div className="empty-state card">
                            <BookOpen size={32} />
                            <p>Hali vazifa topshirilmagan</p>
                        </div>
                    )}
                    {data?.homework?.map(h => (
                        <div key={h.id} className={`result-card card ${h.is_graded ? (h.score >= 5 ? 'passed' : 'failed') : 'pending'}`}>
                            <div className="result-icon">
                                {h.is_graded ? (h.score >= 5 ? <CheckCircle size={20} /> : <XCircle size={20} />) : <Clock size={20} />}
                            </div>
                            <div className="result-info">
                                <h4>{h.lesson_title}</h4>
                                <span className="result-sub">{h.homework_title}</span>
                                {h.answer_text && <p className="result-answer">{h.answer_text}</p>}
                            </div>
                            <div className="result-score">
                                {h.is_graded ? (
                                    <>
                                        <span className="score-num">{h.score}/10</span>
                                        <span className={`badge ${h.score >= 5 ? 'badge-success' : 'badge-danger'}`}>Baho</span>
                                    </>
                                ) : (
                                    <span className="badge badge-warning">Kutilmoqda</span>
                                )}
                            </div>
                            <div className="result-date">
                                <Clock size={12} /> {h.submitted_at?.slice(0, 10)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Game Results */}
            {activeTab === 'games' && (
                <div className="results-list stagger-children">
                    {data?.games?.length === 0 && (
                        <div className="empty-state card">
                            <Gamepad2 size={32} />
                            <p>Hali o'yin o'ynalmagan</p>
                        </div>
                    )}
                    {data?.games?.map(g => (
                        <div key={g.id} className={`result-card card ${g.completed ? 'passed' : 'failed'}`}>
                            <div className="result-icon">
                                {g.completed ? <CheckCircle size={20} /> : <XCircle size={20} />}
                            </div>
                            <div className="result-info">
                                <h4>{g.lesson_title}</h4>
                                <span className="result-sub">{g.game_title}</span>
                            </div>
                            <div className="result-score">
                                <span className="score-num">{g.score}</span>
                                <span className={`badge ${g.completed ? 'badge-success' : 'badge-danger'}`}>
                                    {g.completed ? "Bajarildi" : "Tugallanmadi"}
                                </span>
                            </div>
                            <div className="result-date">
                                <Clock size={12} /> {g.submitted_at?.slice(0, 10)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
