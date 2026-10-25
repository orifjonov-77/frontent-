import { useState, useEffect } from 'react';
import { resultsAPI } from '../api/client';
import { useLang } from '../context/LangContext';
import { FileText, BookOpen, Gamepad2, CheckCircle, XCircle, Clock, Trophy, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import myLogo from '../assets/mylogo.png';
import './ResultsPage.css';

export default function ResultsPage() {
    const { t } = useLang();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState('tests');

    useEffect(() => { loadResults(); }, []);

    const loadResults = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await resultsAPI.getMy();
            setData(res.data);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-loader">
                <div className="branded-loader">
                    <img src={myLogo} alt="MDev" className="branded-loader-logo" />
                    <span className="branded-loader-text">MDev...</span>
                    <div className="branded-loader-dots"><span></span><span></span><span></span></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="results-page container animate-fade">
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <h2 style={{ marginBottom: '0.5rem' }}>⚠️ {t('loadError')}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('loadErrorDesc')}</p>
                    <button onClick={loadResults} className="btn btn-primary">
                        <RefreshCw size={16} /> {t('retry')}
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'tests', icon: <FileText size={16} />, label: t('tests'), count: data?.tests?.length || 0 },
        { id: 'homework', icon: <BookOpen size={16} />, label: t('tasks'), count: data?.homework?.length || 0 },
        { id: 'games', icon: <Gamepad2 size={16} />, label: t('games'), count: data?.games?.length || 0 },
    ];

    return (
        <div className="results-page container animate-fade">
            <Link to="/profile" className="back-link"><ArrowLeft size={16} /> {t('profile')}</Link>

            <div className="results-header">
                <div className="results-header-icon"><Trophy size={28} /></div>
                <div>
                    <h1>{t('myResults')}</h1>
                    <p>{t('resultsDesc')}</p>
                </div>
            </div>

            {/* Stats summary */}
            <div className="results-stats">
                {tabs.map(tab => (
                    <div key={tab.id} className="results-stat-card card" onClick={() => setActiveTab(tab.id)}>
                        {tab.icon}
                        <span className="stat-num">{tab.count}</span>
                        <span className="stat-lbl">{tab.label}</span>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="results-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`results-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon} {tab.label} <span className="tab-count">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Test Results */}
            {activeTab === 'tests' && (
                <div className="results-list stagger-children">
                    {(!data?.tests || data.tests.length === 0) && (
                        <div className="empty-state card">
                            <FileText size={32} />
                            <p>{t('noTestResults')}</p>
                        </div>
                    )}
                    {data?.tests?.map(item => (
                        <div key={item.id} className={`result-card card ${item.passed ? 'passed' : 'failed'}`}>
                            <div className="result-icon">
                                {item.passed ? <CheckCircle size={20} /> : <XCircle size={20} />}
                            </div>
                            <div className="result-info">
                                <h4>{item.lesson_title}</h4>
                                <span className="result-sub">{item.test_title}</span>
                            </div>
                            <div className="result-score">
                                <span className="score-num">{item.score}/{item.total}</span>
                                <span className={`badge ${item.passed ? 'badge-success' : 'badge-danger'}`}>
                                    {item.passed ? t('testSuccess') : t('testFailed')}
                                </span>
                            </div>
                            <div className="result-date">
                                <Clock size={12} /> {item.submitted_at?.slice(0, 10)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Homework Results */}
            {activeTab === 'homework' && (
                <div className="results-list stagger-children">
                    {(!data?.homework || data.homework.length === 0) && (
                        <div className="empty-state card">
                            <BookOpen size={32} />
                            <p>{t('noHwResults')}</p>
                        </div>
                    )}
                    {data?.homework?.map(h => (
                        <div key={h.id} className={`result-card card ${h.is_graded ? (h.score >= 1 ? 'passed' : 'failed') : 'pending'}`}>
                            <div className="result-icon">
                                {h.is_graded ? (h.score >= 1 ? <CheckCircle size={20} /> : <XCircle size={20} />) : <Clock size={20} />}
                            </div>
                            <div className="result-info">
                                <h4>{h.lesson_title}</h4>
                                <span className="result-sub">{h.homework_title}</span>
                                {h.answer_text && <p className="result-answer">{h.answer_text}</p>}
                            </div>
                            <div className="result-score">
                                {h.is_graded ? (
                                    <>
                                        <span className="score-num">{h.score}/2</span>
                                        <span className={`badge ${h.score >= 1 ? 'badge-success' : 'badge-danger'}`}>{t('grade')}</span>
                                    </>
                                ) : (
                                    <span className="badge badge-warning">{t('checking')}</span>
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
                    {(!data?.games || data.games.length === 0) && (
                        <div className="empty-state card">
                            <Gamepad2 size={32} />
                            <p>{t('noExamResults')}</p>
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
                                    {g.completed ? t('approved') : t('checking')}
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
