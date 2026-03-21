import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, testsAPI, homeworkAPI } from '../api/client';
import { Play, CheckCircle, Clock, FileText, BookOpen, ArrowLeft, AlertCircle, Send, Loader, Upload } from 'lucide-react';
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
    const [homework, setHomework] = useState(null);
    const [hwText, setHwText] = useState('');
    const [hwFileUrl, setHwFileUrl] = useState('');
    const [hwStatus, setHwStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');
    const timerRef = useRef(null);

    useEffect(() => {
        loadLesson();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [lessonId]);

    // Prevent leaving page during test
    useEffect(() => {
        if (!testStarted) return;
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Test davom etmoqda! Sahifani tark etmoqchimisiz?';
        };
        const handleVisibilityChange = () => {
            if (document.hidden && testStarted) {
                setMsg('⚠️ Sahifadan chiqmang! Test davom etmoqda.');
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [testStarted]);

    const loadLesson = async () => {
        try {
            const progRes = await coursesAPI.getProgress(lessonId);
            setProgress(progRes.data);
            try { const t = await testsAPI.getForLesson(lessonId); setTest(t.data); } catch { }
            try {
                const h = await homeworkAPI.getForLesson(lessonId);
                setHomework(h.data);
                if (h.data) { try { const s = await homeworkAPI.getStatus(h.data.id); setHwStatus(s.data); } catch { } }
            } catch { }
            if (progRes.data.test_passed) {
                try {
                    // test ni olish kerak avval
                    const tRes = await testsAPI.getForLesson(lessonId);
                    if (tRes.data?.id) {
                        const r = await testsAPI.getResult(tRes.data.id);
                        setTestResult(r.data);
                    }
                } catch { }
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const markWatched = async () => {
        try {
            const res = await coursesAPI.watchVideo(lessonId);
            setProgress(prev => ({ ...prev, video_watched: true, video_watched_at: res.data.video_watched_at }));
            setMsg("✅ Video ko'rildi! Endi testni yechishingiz mumkin.");
        } catch (err) { setMsg(err.response?.data?.detail || 'Xatolik'); }
    };

    const startTest = async () => {
        try {
            await testsAPI.start(test.id);
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
            // Ensure keys are strings for backend compatibility
            const stringAnswers = {};
            for (const [key, val] of Object.entries(testAnswers)) {
                stringAnswers[String(key)] = String(val);
            }
            const res = await testsAPI.submit(test.id, stringAnswers);
            setTestResult(res.data);
            setTestStarted(false);
            if (res.data.passed) {
                setProgress(prev => ({ ...prev, test_passed: true }));
                setMsg(`✅ Test muvaffaqiyatli! ${res.data.score}/${res.data.total}`);
            } else {
                setMsg(`❌ Test yechilmadi. ${res.data.score}/${res.data.total}. Qayta urinib ko'ring!`);
            }
        } catch (err) { setMsg(err.response?.data?.detail || 'Xatolik'); }
        setSubmitting(false);
    };

    const submitHomework = async () => {
        if (!hwText.trim() && !hwFileUrl.trim()) {
            setMsg('❌ Javob matni yoki fayl havola kiriting');
            return;
        }
        setSubmitting(true);
        try {
            await homeworkAPI.submit(homework.id, {
                answer_text: hwText || null,
                file_url: hwFileUrl || null
            });
            setProgress(prev => ({ ...prev, homework_submitted: true }));
            setMsg("✅ Vazifa topshirildi! Admin tekshirishini kuting.");
            const s = await homeworkAPI.getStatus(homework.id);
            setHwStatus(s.data);
        } catch (err) { setMsg(err.response?.data?.detail || 'Xatolik'); }
        setSubmitting(false);
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;

    // YouTube URL normalization
    const normalizeVideoUrl = (url) => {
        if (!url) return null;
        let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
        match = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
        return url;
    };

    const videoUrl = normalizeVideoUrl(progress?.video_url);

    return (
        <div className={`lesson-page container animate-fade ${testStarted ? 'test-mode' : ''}`}>
            {!testStarted && <Link to={-1} className="back-link"><ArrowLeft size={16} /> Orqaga</Link>}

            {msg && <div className="lesson-msg card-glass">{msg}</div>}

            {/* Tabs */}
            {!testStarted && (
                <div className="lesson-tabs">
                    <button className={`tab ${activeTab === 'video' ? 'active' : ''}`} onClick={() => setActiveTab('video')}>
                        <Play size={16} /> Video
                    </button>
                    {test && (
                        <button className={`tab ${activeTab === 'test' ? 'active' : ''} ${progress?.test_passed ? 'completed' : ''}`} onClick={() => setActiveTab('test')}>
                            <FileText size={16} /> Test {progress?.test_passed && <CheckCircle size={12} />}
                        </button>
                    )}
                    {homework && (
                        <button className={`tab ${activeTab === 'homework' ? 'active' : ''} ${hwStatus?.is_graded ? 'completed' : ''}`} onClick={() => setActiveTab('homework')}>
                            <BookOpen size={16} /> Vazifa {hwStatus?.is_graded && <CheckCircle size={12} />}
                        </button>
                    )}
                </div>
            )}

            {/* Tab Content */}
            <div className="tab-content card">
                {activeTab === 'video' && !testStarted && (
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
                            <div className="video-description">
                                <h3>📝 Dars haqida</h3>
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
                        {testResult && testResult.passed ? (
                            <div className="test-result">
                                <div className="result-badge passed">✅ Test muvaffaqiyatli!</div>
                                <p className="result-score">{testResult.score}/{testResult.total}</p>
                            </div>
                        ) : testResult && !testResult.passed ? (
                            <div className="test-result">
                                <div className="result-badge failed">❌ O'tmadingiz</div>
                                <p className="result-score">{testResult.score}/{testResult.total}</p>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    Kamida {test.passing_score} ta to'g'ri javob kerak
                                </p>
                                <button onClick={() => { setTestResult(null); setTestAnswers({}); }} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                    🔄 Qayta urinish
                                </button>
                            </div>
                        ) : !testStarted ? (
                            <div className="test-start">
                                <h3>{test.title}</h3>
                                <p>{test.questions?.length || 10} ta savol · {Math.floor(test.time_limit / 60)} daqiqa</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    ⏱️ Vaqt tugaganda test avtomatik topshiriladi
                                </p>
                                <button onClick={startTest} className="btn btn-primary btn-lg" disabled={!progress?.video_watched}>
                                    Testni boshlash
                                </button>
                                {!progress?.video_watched && (
                                    <p style={{ color: 'var(--warning)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                        <AlertCircle size={14} /> Avval videoni ko'ring
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="test-questions">
                                <div className="test-timer">
                                    <Clock size={16} /> {formatTime(testTimer)}
                                </div>
                                <div className="test-progress-bar">
                                    <div className="test-progress-fill" style={{
                                        width: `${(Object.keys(testAnswers).length / (test.questions?.length || 1)) * 100}%`
                                    }} />
                                </div>
                                <p className="test-answered">
                                    {Object.keys(testAnswers).length}/{test.questions?.length || 0} savolga javob berildi
                                </p>
                                {test.questions?.map((q, i) => (
                                    <div key={q.id} className="question-card">
                                        <p className="q-num">{i + 1}. {q.question}</p>
                                        <div className="options">
                                            {['a', 'b', 'c', 'd'].map(opt => (
                                                <label key={opt} className={`option ${testAnswers[String(q.id)] === opt ? 'selected' : ''}`}>
                                                    <input type="radio" name={`q_${q.id}`} value={opt}
                                                        onChange={() => setTestAnswers(prev => ({ ...prev, [String(q.id)]: opt }))} />
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

                {activeTab === 'homework' && homework && (
                    <div className="homework-section">
                        <h3>{homework.title}</h3>
                        {homework.description && <p className="hw-desc">{homework.description}</p>}
                        {hwStatus?.submitted ? (
                            <div className="hw-result">
                                {hwStatus.is_graded ? (
                                    <>
                                        <div className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                            <CheckCircle size={14} /> Tasdiqlandi
                                        </div>
                                        <p className="hw-grade">Baho: <strong>{hwStatus.score}/10</strong></p>
                                        {hwStatus.admin_comment && <p className="hw-comment">Izoh: {hwStatus.admin_comment}</p>}
                                    </>
                                ) : (
                                    <div className="hw-pending">
                                        <div className="badge badge-warning" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                            <Clock size={14} /> Tekshirilmoqda (Pending)
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                            Admin tekshirib, baho qo'yganidan keyin dars yakunlanadi
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hw-form">
                                <div className="form-group">
                                    <label>Javob matni</label>
                                    <textarea className="input" rows={5} placeholder="Vazifa javobini yozing..."
                                        value={hwText} onChange={e => setHwText(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label><Upload size={14} /> Fayl havolasi (ixtiyoriy)</label>
                                    <input className="input" placeholder="https://drive.google.com/... yoki boshqa havola"
                                        value={hwFileUrl} onChange={e => setHwFileUrl(e.target.value)} />
                                    <small style={{ color: 'var(--text-muted)' }}>Google Drive, Telegram yoki boshqa xizmatga faylni yuklang va havolani kiriting</small>
                                </div>
                                <button onClick={submitHomework} className="btn btn-primary" disabled={submitting || !progress?.video_watched}>
                                    {submitting ? <Loader size={18} className="spin" /> : <><Send size={18} /> Topshirish</>}
                                </button>
                                {!progress?.video_watched && (
                                    <p style={{ color: 'var(--warning)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                        <AlertCircle size={14} /> Avval videoni ko'ring
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
