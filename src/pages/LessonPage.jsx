import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, testsAPI, gamesAPI, homeworkAPI } from '../api/client';
import { Play, CheckCircle, Clock, FileText, Gamepad2, BookOpen, ArrowLeft, AlertCircle, Send, Loader } from 'lucide-react';
import './LessonPage.css';

export default function LessonPage() {
    const { lessonId } = useParams();
    const { user } = useAuth();
    const [progress, setProgress] = useState(null);
    const [activeTab, setActiveTab] = useState('video');
    const [test, setTest] = useState(null);
    const [testAnswers, setTestAnswers] = useState({});
    const [testResult, setTestResult] = useState(null);
    const [testStarted, setTestStarted] = useState(false);
    const [testTimer, setTestTimer] = useState(0);
    const [game, setGame] = useState(null);
    const [gameAnswer, setGameAnswer] = useState('');
    const [homework, setHomework] = useState(null);
    const [hwText, setHwText] = useState('');
    const [hwStatus, setHwStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');
    const timerRef = useRef(null);

    useEffect(() => {
        loadLesson();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [lessonId]);

    const loadLesson = async () => {
        try {
            const progRes = await coursesAPI.getProgress(lessonId);
            setProgress(progRes.data);
            try { const t = await testsAPI.getForLesson(lessonId); setTest(t.data); } catch { }
            try { const g = await gamesAPI.getForLesson(lessonId); setGame(g.data); } catch { }
            try { const h = await homeworkAPI.getForLesson(lessonId); setHomework(h.data); if (h.data) { try { const s = await homeworkAPI.getStatus(h.data.id); setHwStatus(s.data); } catch { } } } catch { }
            if (progRes.data.test_passed) { try { if (test?.id) { const r = await testsAPI.getResult(test.id); setTestResult(r.data); } } catch { } }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const markWatched = async () => {
        try {
            const res = await coursesAPI.watchVideo(lessonId);
            setProgress(prev => ({ ...prev, video_watched: true, video_watched_at: res.data.video_watched_at }));
            setMsg("Video ko'rildi! Endi testni yechishingiz mumkin (2 soat ichida)");
        } catch (err) { setMsg(err.response?.data?.detail || 'Xatolik'); }
    };

    const startTest = async () => {
        try {
            const res = await testsAPI.start(test.id);
            setTestStarted(true);
            setTestTimer(test.time_limit);
            timerRef.current = setInterval(() => {
                setTestTimer(prev => {
                    if (prev <= 1) { clearInterval(timerRef.current); submitTest(); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) { setMsg(err.response?.data?.detail || 'Xatolik'); }
    };

    const submitTest = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setSubmitting(true);
        try {
            const res = await testsAPI.submit(test.id, testAnswers);
            setTestResult(res.data);
            setTestStarted(false);
            if (res.data.passed) {
                setProgress(prev => ({ ...prev, test_passed: true }));
                setMsg(`Test muvaffaqiyatli! ${res.data.score}/${res.data.total}`);
            } else {
                setMsg(`Test yechilmadi. ${res.data.score}/${res.data.total}. Kamida ${test.passing_score} ta to'g'ri javob kerak.`);
            }
        } catch (err) { setMsg(err.response?.data?.detail || 'Xatolik'); }
        setSubmitting(false);
    };

    const submitGame = async () => {
        setSubmitting(true);
        try {
            await gamesAPI.start(game.id);
            await gamesAPI.submit(game.id, { answer_data: gameAnswer });
            setProgress(prev => ({ ...prev, game_completed: true }));
            setMsg("O'yin misoli muvaffaqiyatli topshirildi!");
        } catch (err) { setMsg(err.response?.data?.detail || 'Xatolik'); }
        setSubmitting(false);
    };

    const submitHomework = async () => {
        setSubmitting(true);
        try {
            await homeworkAPI.submit(homework.id, { answer_text: hwText });
            setProgress(prev => ({ ...prev, homework_submitted: true }));
            setMsg("Vazifa muvaffaqiyatli topshirildi!");
            const s = await homeworkAPI.getStatus(homework.id);
            setHwStatus(s.data);
        } catch (err) { setMsg(err.response?.data?.detail || 'Xatolik'); }
        setSubmitting(false);
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;

    // YouTube URL ni embed formatga o'zgartirish (fallback for legacy data)
    const normalizeVideoUrl = (url) => {
        if (!url) return null;
        // youtu.be/VIDEO_ID
        let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
        // youtube.com/watch?v=VIDEO_ID
        match = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
        // already embed format or other URL
        return url;
    };

    const videoUrl = normalizeVideoUrl(progress?.video_url);

    return (
        <div className="lesson-page container animate-fade">
            <Link to={-1} className="back-link"><ArrowLeft size={16} /> Orqaga</Link>

            {msg && <div className="lesson-msg card-glass">{msg}</div>}

            {/* Tabs */}
            <div className="lesson-tabs">
                <button className={`tab ${activeTab === 'video' ? 'active' : ''}`} onClick={() => setActiveTab('video')}>
                    <Play size={16} /> Video
                </button>
                {test && (
                    <button className={`tab ${activeTab === 'test' ? 'active' : ''} ${progress?.test_passed ? 'completed' : ''}`} onClick={() => setActiveTab('test')}>
                        <FileText size={16} /> Test {progress?.test_passed && <CheckCircle size={12} />}
                    </button>
                )}
                {game && (
                    <button className={`tab ${activeTab === 'game' ? 'active' : ''} ${progress?.game_completed ? 'completed' : ''}`} onClick={() => setActiveTab('game')}>
                        <Gamepad2 size={16} /> O'yin {progress?.game_completed && <CheckCircle size={12} />}
                    </button>
                )}
                {homework && (
                    <button className={`tab ${activeTab === 'homework' ? 'active' : ''} ${progress?.homework_submitted ? 'completed' : ''}`} onClick={() => setActiveTab('homework')}>
                        <BookOpen size={16} /> Vazifa {progress?.homework_submitted && <CheckCircle size={12} />}
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="tab-content card">
                {activeTab === 'video' && (
                    <div className="video-section">
                        <h2 className="lesson-title" style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>{progress?.title}</h2>
                        {videoUrl ? (
                            <div className="video-wrapper">
                                <iframe
                                    src={videoUrl}
                                    title={progress?.title || "Video dars"}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="video-iframe"
                                />
                            </div>
                        ) : (
                            <div className="video-placeholder">
                                <Play size={48} />
                                <p>Video dars</p>
                            </div>
                        )}
                        {progress?.description && (
                            <div className="video-description" style={{ marginTop: '1.2rem', padding: '1rem', borderRadius: '12px', background: 'var(--card-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border, rgba(255,255,255,0.1))' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>📝 Dars haqida</h3>
                                <p style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{progress.description}</p>
                            </div>
                        )}
                        {!progress?.video_watched ? (
                            <button onClick={markWatched} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }}>
                                <CheckCircle size={18} /> Video ko'rdim
                            </button>
                        ) : (
                            <div className="video-watched-badge">
                                <CheckCircle size={18} /> Video ko'rilgan
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'test' && test && (
                    <div className="test-section">
                        {testResult ? (
                            <div className="test-result">
                                <div className={`result-badge ${testResult.passed ? 'passed' : 'failed'}`}>
                                    {testResult.passed ? '✅ O\'tdingiz!' : '❌ O\'tmadingiz'}
                                </div>
                                <p className="result-score">{testResult.score}/{testResult.total}</p>
                            </div>
                        ) : !testStarted ? (
                            <div className="test-start">
                                <h3>{test.title}</h3>
                                <p>{test.questions?.length || 10} ta savol · {Math.floor(test.time_limit / 60)} daqiqa</p>
                                <p className="warning-text"><AlertCircle size={14} /> Video ko'rgandan 2 soat ichida yechish kerak</p>
                                <button onClick={startTest} className="btn btn-primary btn-lg" disabled={!progress?.video_watched}>
                                    Testni boshlash
                                </button>
                            </div>
                        ) : (
                            <div className="test-questions">
                                <div className="test-timer">
                                    <Clock size={16} /> {formatTime(testTimer)}
                                </div>
                                {test.questions?.map((q, i) => (
                                    <div key={q.id} className="question-card">
                                        <p className="q-num">{i + 1}. {q.question}</p>
                                        <div className="options">
                                            {['a', 'b', 'c', 'd'].map(opt => (
                                                <label key={opt} className={`option ${testAnswers[q.id] === opt ? 'selected' : ''}`}>
                                                    <input type="radio" name={`q_${q.id}`} value={opt}
                                                        onChange={() => setTestAnswers(prev => ({ ...prev, [q.id]: opt }))} />
                                                    <span className="opt-letter">{opt.toUpperCase()}</span>
                                                    <span>{q[`option_${opt}`]}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={submitTest} className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                                    {submitting ? <Loader size={18} className="spin" /> : <><Send size={18} /> Topshirish</>}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'game' && game && (
                    <div className="game-section">
                        <h3>{game.title}</h3>
                        {game.description && <p className="game-desc">{game.description}</p>}
                        {game.task_data && <div className="game-task card-glass"><pre>{game.task_data}</pre></div>}
                        {progress?.game_completed ? (
                            <div className="badge badge-success" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
                                <CheckCircle size={18} /> Bajarilgan
                            </div>
                        ) : (
                            <>
                                <textarea className="input" rows={4} placeholder="Javobingizni yozing..."
                                    value={gameAnswer} onChange={e => setGameAnswer(e.target.value)} />
                                <button onClick={submitGame} className="btn btn-primary" disabled={submitting || !progress?.video_watched}>
                                    {submitting ? <Loader size={18} className="spin" /> : <><Send size={18} /> Topshirish</>}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'homework' && homework && (
                    <div className="homework-section">
                        <h3>{homework.title}</h3>
                        {homework.description && <p className="hw-desc">{homework.description}</p>}
                        {hwStatus?.submitted ? (
                            <div className="hw-result">
                                <div className="badge badge-success"><CheckCircle size={14} /> Topshirilgan</div>
                                {hwStatus.is_graded && <p className="hw-grade">Baho: <strong>{hwStatus.score}/10</strong></p>}
                                {hwStatus.admin_comment && <p className="hw-comment">Izoh: {hwStatus.admin_comment}</p>}
                            </div>
                        ) : (
                            <>
                                <p className="warning-text"><Clock size={14} /> 24 soat ichida topshirish kerak</p>
                                <textarea className="input" rows={5} placeholder="Vazifa javobini yozing..."
                                    value={hwText} onChange={e => setHwText(e.target.value)} />
                                <button onClick={submitHomework} className="btn btn-primary" disabled={submitting || !progress?.video_watched}>
                                    {submitting ? <Loader size={18} className="spin" /> : <><Send size={18} /> Topshirish</>}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
