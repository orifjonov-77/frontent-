import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, testsAPI, homeworkAPI, clearApiCache } from '../api/client';
import { useModal } from '../components/Modal';
import { Play, CheckCircle, Clock, FileText, BookOpen, ArrowLeft, AlertCircle, Send, Loader, Upload, Lock, X, File as FileIcon } from 'lucide-react';
import './LessonPage.css';

export default function LessonPage() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
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
    const [hwFile, setHwFile] = useState(null);
    const [hwFileUrl, setHwFileUrl] = useState('');
    const [hwStatus, setHwStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const timerRef = useRef(null);
    const testAnswersRef = useRef({});
    const testRef = useRef(null);
    const testStartedRef = useRef(false);
    const fileInputRef = useRef(null);

    const { showSuccess, showError, showWarning, ModalComponent } = useModal();

    // Keep refs in sync with state
    useEffect(() => { testAnswersRef.current = testAnswers; }, [testAnswers]);
    useEffect(() => { testStartedRef.current = testStarted; }, [testStarted]);

    useEffect(() => {
        loadLesson();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [lessonId]);

    // FULL BLOCK — prevent ALL navigation during test
    useEffect(() => {
        if (!testStarted) return;

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Test davom etmoqda! Sahifani tark etmoqchimisiz?';
        };

        const handleVisibilityChange = () => {
            if (document.hidden && testStartedRef.current && testRef.current) {
                // AUTO-SUBMIT when user leaves the tab
                autoSubmitTest();
            }
        };

        // Block browser back button
        const handlePopState = (e) => {
            if (testStartedRef.current) {
                e.preventDefault();
                window.history.pushState(null, '', window.location.href);
                autoSubmitTest();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('popstate', handlePopState);
        window.history.pushState(null, '', window.location.href);

        // Disable keyboard shortcuts
        const handleKeyDown = (e) => {
            if (testStartedRef.current) {
                // Block Ctrl+W, Ctrl+T, Alt+Tab, F5, etc.
                if ((e.ctrlKey && (e.key === 'w' || e.key === 't' || e.key === 'n')) ||
                    e.key === 'F5' || (e.altKey && e.key === 'Tab') ||
                    (e.altKey && e.key === 'F4')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [testStarted]);

    const autoSubmitTest = async () => {
        if (!testRef.current) return;
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const stringAnswers = {};
            for (const [key, val] of Object.entries(testAnswersRef.current)) {
                stringAnswers[String(key)] = String(val);
            }
            const res = await testsAPI.forceSubmit(testRef.current.id, stringAnswers);
            setTestResult(res.data);
            setTestStarted(false);
            if (res.data.passed) {
                setProgress(prev => ({ ...prev, test_passed: true }));
            }
        } catch (err) {
            console.error('Auto-submit error:', err);
        }
    };

    const loadLesson = async () => {
        try {
            clearApiCache(); // Always fetch fresh data
            // Parallel API calls for speed
            const [progRes, testRes, hwRes] = await Promise.allSettled([
                coursesAPI.getProgress(lessonId),
                testsAPI.getForLesson(lessonId),
                homeworkAPI.getForLesson(lessonId),
            ]);

            // Progress
            if (progRes.status === 'fulfilled') {
                const prog = progRes.value.data;
                setProgress(prog);

                // If test passed, load result
                if (prog.test_passed && testRes.status === 'fulfilled' && testRes.value.data?.id) {
                    try {
                        const r = await testsAPI.getResult(testRes.value.data.id);
                        setTestResult(r.data);
                    } catch { }
                }
            }

            // Test
            if (testRes.status === 'fulfilled' && testRes.value.data) {
                setTest(testRes.value.data);
                testRef.current = testRes.value.data;
            }

            // Homework
            if (hwRes.status === 'fulfilled' && hwRes.value.data) {
                setHomework(hwRes.value.data);
                try {
                    const s = await homeworkAPI.getStatus(hwRes.value.data.id);
                    setHwStatus(s.data);
                } catch { }
            } else if (progRes.status === 'fulfilled' && progRes.value.data?.has_homework) {
                // Progress says homework exists but homework API failed — retry once
                try {
                    const hwRetry = await homeworkAPI.getForLesson(lessonId);
                    if (hwRetry.data) {
                        setHomework(hwRetry.data);
                        try {
                            const s = await homeworkAPI.getStatus(hwRetry.data.id);
                            setHwStatus(s.data);
                        } catch { }
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
            showSuccess("Video ko'rildi!", "Endi testni yechishingiz va vazifani topshirishingiz mumkin.");
        } catch (err) {
            showError('Xatolik', err.response?.data?.detail || 'Video belgilashda xatolik');
        }
    };

    const startTest = async () => {
        try {
            await testsAPI.start(test.id);
            setTestStarted(true);
            setTestTimer(test.time_limit);
            timerRef.current = setInterval(() => {
                setTestTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        submitTest();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            showError('Test boshlanmadi', err.response?.data?.detail || 'Xatolik');
        }
    };

    const submitTest = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setSubmitting(true);
        try {
            const stringAnswers = {};
            for (const [key, val] of Object.entries(testAnswers)) {
                stringAnswers[String(key)] = String(val);
            }
            const res = await testsAPI.submit(test.id, stringAnswers);
            setTestResult(res.data);
            setTestStarted(false);
            if (res.data.passed) {
                setProgress(prev => ({ ...prev, test_passed: true }));
                showSuccess('Test muvaffaqiyatli!', `Natija: ${res.data.score}/${res.data.total} — Baho: ${res.data.grade}`);
            } else {
                showWarning('Test yechilmadi', `Natija: ${res.data.score}/${res.data.total} — Baho: ${res.data.grade}`);
            }
        } catch (err) {
            showError('Xatolik', err.response?.data?.detail || 'Test topshirishda xatolik');
        }
        setSubmitting(false);
    };

    const getGradeEmoji = (grade) => {
        if (grade >= 3) return '🌟';
        if (grade >= 2) return '👍';
        return '📚';
    };

    const getGradeLabel = (grade) => {
        if (grade >= 3) return "A'lo";
        if (grade >= 2) return "Yaxshi";
        return "Qoniqarli";
    };

    const submitHomework = async () => {
        if (!hwText.trim() && !hwFile && !hwFileUrl.trim()) {
            showError('Xatolik', 'Javob matni yoki fayl yuklang');
            return;
        }
        setSubmitting(true);
        try {
            const formData = new FormData();
            if (hwText.trim()) formData.append('answer_text', hwText);
            if (hwFile) {
                formData.append('file', hwFile);
            } else if (hwFileUrl.trim()) {
                formData.append('file_url', hwFileUrl);
            }
            await homeworkAPI.submit(homework.id, formData);
            setProgress(prev => ({ ...prev, homework_submitted: true }));
            showSuccess('Vazifa topshirildi!', 'Admin tekshirishini kuting. Tasdiqlangandan keyin keyingi video ochiladi.');
            const s = await homeworkAPI.getStatus(homework.id);
            setHwStatus(s.data);
        } catch (err) {
            showError('Xatolik', err.response?.data?.detail || 'Vazifa topshirishda xatolik');
        }
        setSubmitting(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showError('Xatolik', 'Fayl hajmi 10MB dan oshmasin');
                return;
            }
            setHwFile(file);
            setHwFileUrl('');
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    if (loading) return <div className="page-loader"><div className="branded-loader"><img src="/logo.png" alt="MDev" className="branded-loader-logo" /><span className="branded-loader-text">MDev...</span><div className="branded-loader-dots"><span></span><span></span><span></span></div></div></div>;

    // Video URL rendering — supports YouTube and direct video links
    const renderVideo = (url) => {
        if (!url) return (
            <div className="video-placeholder">
                <Lock size={48} />
                <p>Video mavjud emas</p>
            </div>
        );

        // Check for direct video files
        if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) {
            return (
                <div className="video-wrapper">
                    <video controls className="video-player" controlsList="nodownload">
                        <source src={url} />
                        Brauzeringiz video elementini qo'llab-quvvatlamaydi.
                    </video>
                </div>
            );
        }

        // YouTube URLs — normalize to embed
        let embedUrl = url;
        let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
        match = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
        if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
        match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
        if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;

        return (
            <div className="video-wrapper">
                <iframe
                    src={embedUrl}
                    title={progress?.title || "Video dars"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="video-iframe"
                />
            </div>
        );
    };

    // FULL SCREEN TEST MODE
    if (testStarted) {
        return (
            <div className="test-fullscreen-overlay">
                {ModalComponent}
                <div className="test-fullscreen-container">
                    <div className="test-fullscreen-header">
                        <h2>📝 {test.title}</h2>
                        <div className={`test-timer-big ${testTimer < 60 ? 'urgent' : testTimer < 120 ? 'warning' : ''}`}>
                            <Clock size={20} />
                            <span>{formatTime(testTimer)}</span>
                        </div>
                    </div>
                    <div className="test-progress-bar">
                        <div className="test-progress-fill" style={{
                            width: `${(Object.keys(testAnswers).length / (test.questions?.length || 1)) * 100}%`
                        }} />
                    </div>
                    <p className="test-answered-count">
                        {Object.keys(testAnswers).length}/{test.questions?.length || 0} javob berildi
                    </p>
                    <div className="test-fullscreen-questions">
                        {test.questions?.map((q, i) => (
                            <div key={q.id} className={`question-card ${testAnswers[String(q.id)] ? 'answered' : ''}`}>
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
                    </div>
                    <div className="test-fullscreen-footer">
                        <div className="test-warning-banner">
                            <AlertCircle size={16} />
                            <span>⚠️ Sahifadan chiqsangiz test avtomatik topshiriladi!</span>
                        </div>
                        <button onClick={submitTest} className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                            {submitting ? <Loader size={18} className="spin" /> : <><Send size={18} /> Topshirish</>}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="lesson-page animate-fade">
            {ModalComponent}

            <Link to={-1} className="back-link"><ArrowLeft size={16} /> Orqaga</Link>

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
                <button className={`tab ${activeTab === 'homework' ? 'active' : ''} ${hwStatus?.is_graded ? 'completed' : ''}`} onClick={() => setActiveTab('homework')}>
                    <BookOpen size={16} /> Vazifa {hwStatus?.is_graded && <CheckCircle size={12} />}
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content card">
                {activeTab === 'video' && (
                    <div className="video-section">
                        <h2 className="lesson-title">{progress?.title}</h2>
                        {renderVideo(progress?.video_url)}
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
                        {testResult ? (
                            <div className="test-result">
                                <div className={`result-badge ${testResult.passed ? 'passed' : 'failed'}`}>
                                    {testResult.passed ? '✅ Test muvaffaqiyatli!' : "❌ O'tmadingiz"}
                                </div>
                                <p className="result-score">{testResult.score}/{testResult.total}</p>
                                <div className="result-grade">
                                    <span className="grade-emoji">{getGradeEmoji(testResult.grade)}</span>
                                    <span className="grade-number">Baho: {testResult.grade}</span>
                                    <span className="grade-label">({getGradeLabel(testResult.grade)})</span>
                                </div>
                                {!testResult.passed && (
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                        Har bir video uchun faqat 1 marta test yechish mumkin
                                    </p>
                                )}
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                    ℹ️ Keyingi videoni ochish uchun vazifani topshiring.
                                </p>
                            </div>
                        ) : (
                            <div className="test-start">
                                <h3>{test.title}</h3>
                                <div className="test-info-cards">
                                    <div className="info-card">
                                        <FileText size={20} />
                                        <span>{test.questions?.length || 10} savol</span>
                                    </div>
                                    <div className="info-card">
                                        <Clock size={20} />
                                        <span>{Math.floor(test.time_limit / 60)} daqiqa</span>
                                    </div>
                                    <div className="info-card">
                                        <AlertCircle size={20} />
                                        <span>1 urinish</span>
                                    </div>
                                </div>
                                <div className="test-warnings">
                                    <p>🔒 Test vaqtida boshqa sahifaga o'tib bo'lmaydi</p>
                                    <p>⚠️ Sahifadan chiqsangiz test avtomatik topshiriladi</p>
                                    <p>⏱️ Vaqt tugaganda test avtomatik topshiriladi</p>
                                    <p>🔒 Har bir video uchun faqat 1 marta test yechish mumkin</p>
                                </div>
                                <button onClick={startTest} className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={!progress?.video_watched}>
                                    Testni boshlash
                                </button>
                                {!progress?.video_watched && (
                                    <p className="test-warning-msg">
                                        <AlertCircle size={14} /> Avval videoni ko'ring
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'homework' && (
                    <div className="homework-section">
                        <h3>{homework?.title || 'Uyga vazifa'}</h3>
                        {homework?.description && <p className="hw-desc">{homework.description}</p>}

                        {!homework && (
                            <div className="hw-info-banner" style={{ marginBottom: '1rem' }}>
                                <Loader size={16} className="spin" />
                                <span>Vazifa yuklanmoqda...</span>
                            </div>
                        )}

                        <div className="hw-info-banner">
                            <AlertCircle size={16} />
                            <span>Vazifani topshiring va admin tasdiqlasa, keyingi video ochiladi</span>
                        </div>

                        {hwStatus?.submitted ? (
                            <div className="hw-result">
                                {hwStatus.is_graded ? (
                                    <>
                                        <div className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                            <CheckCircle size={14} /> Tasdiqlandi ✅
                                        </div>
                                        <p className="hw-grade">Baho: <strong>{hwStatus.score}/2</strong></p>
                                        {hwStatus.admin_comment && <p className="hw-comment">Izoh: {hwStatus.admin_comment}</p>}
                                        <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                            ✅ Keyingi video ochildi!
                                        </p>
                                    </>
                                ) : (
                                    <div className="hw-pending">
                                        <div className="badge badge-warning" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                            <Clock size={14} /> Tekshirilmoqda (Pending)
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                                            Admin tekshirib, baho qo'yganidan keyin keyingi video ochiladi
                                        </p>
                                        <div className="hw-resubmit">
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1rem' }}>
                                                Boshqa javob yubormoqchimisiz?
                                            </p>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setHwStatus(null)}>
                                                📝 Qayta topshirish
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : homework ? (
                            <div className="hw-form">
                                <div className="form-group">
                                    <label>Javob matni</label>
                                    <textarea className="input" rows={5} placeholder="Vazifa javobini yozing..."
                                        value={hwText} onChange={e => setHwText(e.target.value)} />
                                </div>

                                {/* File Upload */}
                                <div className="form-group">
                                    <label><Upload size={14} /> Fayl yuklash</label>
                                    <div className="file-upload-area" onClick={() => fileInputRef.current?.click()}>
                                        {hwFile ? (
                                            <div className="file-selected">
                                                <FileIcon size={20} />
                                                <span>{hwFile.name}</span>
                                                <button className="file-remove" onClick={(e) => { e.stopPropagation(); setHwFile(null); }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="file-placeholder">
                                                <Upload size={24} />
                                                <p>Faylni tanlang yoki bu yerga tashlang</p>
                                                <small>Maksimal hajm: 10MB</small>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.txt,.zip,.rar,.png,.jpg,.jpeg,.py,.js,.html,.css"
                                        />
                                    </div>
                                </div>

                                {!hwFile && (
                                    <div className="form-group">
                                        <label>Yoki fayl havolasi (ixtiyoriy)</label>
                                        <input className="input" placeholder="https://drive.google.com/... yoki boshqa havola"
                                            value={hwFileUrl} onChange={e => setHwFileUrl(e.target.value)} />
                                    </div>
                                )}

                                <button onClick={submitHomework} className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting || !progress?.video_watched}>
                                    {submitting ? <Loader size={18} className="spin" /> : <><Send size={18} /> Topshirish</>}
                                </button>
                                {!progress?.video_watched && (
                                    <p className="test-warning-msg">
                                        <AlertCircle size={14} /> Avval videoni ko'ring
                                    </p>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
