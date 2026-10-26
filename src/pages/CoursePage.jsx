import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { coursesAPI, certificatesAPI } from '../api/client';
import { getModulePrice } from '../config/prices';
import { Play, Lock, CheckCircle, Clock, FileText, Gamepad2, BookOpen, ArrowLeft, ChevronDown, CreditCard, LogIn, RefreshCw, Award, Send, AlertCircle, ExternalLink, Loader } from 'lucide-react';
import myLogo from '../assets/mylogo.png';
import './CoursePage.css';

export default function CoursePage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [certStatus, setCertStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [expandedLesson, setExpandedLesson] = useState(null);
    const { user } = useAuth();
    const { t } = useLang();
    const toast = useToast();

    // Certificate Exam state
    const [examStarted, setExamStarted] = useState(false);
    const [examAnswers, setExamAnswers] = useState({});
    const [examTimer, setExamTimer] = useState(0);
    const [examSubmitting, setExamSubmitting] = useState(false);
    const [examResultMsg, setExamResultMsg] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        loadCourse();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [courseId]);

    const loadCourse = async () => {
        setLoading(true);
        setError(false);
        try {
            const [res, certRes] = await Promise.allSettled([
                coursesAPI.getOne(courseId),
                certificatesAPI.getCourseStatus(courseId),
            ]);
            if (res.status === 'fulfilled') {
                setCourse(res.value.data);
            } else {
                setError(true);
            }
            if (certRes.status === 'fulfilled') {
                setCertStatus(certRes.value.data);
            }
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const startCertExam = () => {
        if (!certStatus?.exam) {
            // If no exam questions added by admin yet, submit application directly
            submitCertExam({});
            return;
        }
        setExamAnswers({});
        setExamResultMsg(null);
        setExamStarted(true);
        const limit = certStatus.exam.time_limit || 1800;
        setExamTimer(limit);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setExamTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    submitCertExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const submitCertExam = async (overrideAnswers = null) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setExamSubmitting(true);
        try {
            const payload = overrideAnswers || examAnswers;
            const res = await certificatesAPI.submitCourseExam(courseId, payload);
            setExamStarted(false);
            setExamResultMsg(res.data);
            if (res.data.passed) {
                toast.success(res.data.message || "Sertifikatga so'rov yuborildi!");
            } else {
                toast.error(res.data.message || "O'tish bali yetarli emas");
            }
            const certRes = await certificatesAPI.getCourseStatus(courseId);
            setCertStatus(certRes.data);
        } catch (err) {
            toast.error(err.response?.data?.detail || t('errorOccurred'));
        } finally {
            setExamSubmitting(false);
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    const modulePrice = course ? getModulePrice(course.module_name, course.module_price) : 0;

    if (loading) return <div className="page-loader"><div className="branded-loader"><img src={myLogo} alt="MDev" className="branded-loader-logo" /><span className="branded-loader-text">MDev...</span><div className="branded-loader-dots"><span></span><span></span><span></span></div></div></div>;
    if (error || !course) {
        return (
            <div className="course-page container animate-fade">
                <Link to="/modules" className="back-link"><ArrowLeft size={16} /> {t('backToModules')}</Link>
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <h2 style={{ marginBottom: '0.5rem' }}>⚠️ {error ? t('loadError') : t('courseNotFound')}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('loadErrorDesc')}</p>
                    <button onClick={loadCourse} className="btn btn-primary">
                        <RefreshCw size={16} /> {t('retry')}
                    </button>
                </div>
            </div>
        );
    }

    // FULLSCREEN CERTIFICATE EXAM OVERLAY
    if (examStarted && certStatus?.exam) {
        const exam = certStatus.exam;
        return (
            <div className="test-fullscreen-overlay">
                <div className="test-fullscreen-container">
                    <div className="test-fullscreen-header">
                        <h2>🎓 {exam.title || 'Sertifikat imtihoni'}</h2>
                        <div className={`test-timer-big ${examTimer < 60 ? 'urgent' : examTimer < 180 ? 'warning' : ''}`}>
                            <Clock size={20} />
                            <span>{formatTime(examTimer)}</span>
                        </div>
                    </div>
                    <div className="test-progress-bar">
                        <div className="test-progress-fill" style={{
                            width: `${(Object.keys(examAnswers).length / (exam.questions?.length || 1)) * 100}%`
                        }} />
                    </div>
                    <p className="test-answered-count">
                        Javob berildi: {Object.keys(examAnswers).length}/{exam.questions?.length || 0} (O'tish uchun kamida {exam.min_correct} ta to'g'ri javob kerak)
                    </p>
                    <div className="test-fullscreen-questions">
                        {exam.questions?.map((q, i) => (
                            <div key={q.id} className={`question-card ${examAnswers[String(q.id)] ? 'answered' : ''}`}>
                                <p className="q-num">{i + 1}. {q.question}</p>
                                <div className="options">
                                    {['a', 'b', 'c', 'd'].map(opt => (
                                        <label key={opt} className={`option ${examAnswers[String(q.id)] === opt ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name={`cert_q_${q.id}`}
                                                value={opt}
                                                checked={examAnswers[String(q.id)] === opt}
                                                onChange={() => setExamAnswers(prev => ({ ...prev, [String(q.id)]: opt }))}
                                            />
                                            <span className="opt-letter">{opt.toUpperCase()}</span>
                                            <span>{q[`option_${opt}`]}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="test-fullscreen-footer" style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setExamStarted(false); }} className="btn btn-secondary btn-lg">
                                Bekor qilish
                            </button>
                            <button onClick={() => submitCertExam()} className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={examSubmitting}>
                                {examSubmitting ? <Loader size={18} className="spin" /> : <><Send size={18} /> Imtihonni yakunlash va topshirish</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const allLessonsDone = course.lessons?.length > 0 && course.lessons.every(l => l.progress?.is_completed);
    const showCertBlock = user && (allLessonsDone || certStatus?.all_lessons_completed || certStatus?.application || certStatus?.certificate || certStatus?.has_exam);

    return (
        <div className="course-page container animate-fade">
            <Link to="/modules" className="back-link"><ArrowLeft size={16} /> {t('backToModules')}</Link>

            <div className="course-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h1>{course.name}</h1>
                    {course.is_paid && (
                        <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                            ✅ {t('paid')}
                        </span>
                    )}
                </div>
                <p>{course.description}</p>
            </div>

            <div className="lessons-list">
                {course.lessons?.map((lesson) => {
                    const isLocked = !lesson.has_access;
                    const isFree = lesson.is_free;

                    return (
                        <div key={lesson.id} className={`lesson-item card ${isLocked ? 'locked' : ''} ${isFree ? 'free-lesson' : ''}`}>
                            <div className="lesson-header" onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}>
                                <div className="lesson-number">
                                    {lesson.progress?.is_completed ? (
                                        <CheckCircle size={20} className="completed-icon" />
                                    ) : !isLocked ? (
                                        <span className="num">{lesson.order}</span>
                                    ) : (
                                        <Lock size={16} className="lock-icon" />
                                    )}
                                </div>
                                <div className="lesson-info">
                                    <h3>{lesson.title}</h3>
                                    <div className="lesson-tags">
                                        {isFree && <span className="badge badge-success free-badge">🎁 {t('free')}</span>}
                                        {lesson.has_test && <span className="badge badge-info"><FileText size={10} /> {t('test')}</span>}
                                        {lesson.has_game && <span className="badge badge-accent"><Gamepad2 size={10} /> {t('game')}</span>}
                                        {lesson.has_homework && <span className="badge badge-warning"><BookOpen size={10} /> {t('homework')}</span>}
                                    </div>
                                </div>
                                <ChevronDown size={18} className={`expand-icon ${expandedLesson === lesson.id ? 'rotated' : ''}`} />
                            </div>

                            {expandedLesson === lesson.id && (
                                <div className="lesson-content">
                                    {!isLocked ? (
                                        <>
                                            {lesson.description && <p className="lesson-desc">{lesson.description}</p>}

                                            {lesson.progress && (
                                                <div className="progress-indicators">
                                                    <div className={`indicator ${lesson.progress.video_watched ? 'done' : ''}`}>
                                                        <Play size={14} /> {t('video')} {lesson.progress.video_watched ? '✓' : ''}
                                                    </div>
                                                    <div className={`indicator ${lesson.progress.test_passed ? 'done' : ''}`}>
                                                        <FileText size={14} /> {t('test')} {lesson.progress.test_passed ? '✓' : ''}
                                                    </div>
                                                    <div className={`indicator ${lesson.progress.game_completed ? 'done' : ''}`}>
                                                        <Gamepad2 size={14} /> {t('game')} {lesson.progress.game_completed ? '✓' : ''}
                                                    </div>
                                                    <div className={`indicator ${lesson.progress.homework_submitted ? 'done' : ''}`}>
                                                        <BookOpen size={14} /> {t('homework')} {lesson.progress.homework_submitted ? '✓' : ''}
                                                    </div>
                                                </div>
                                            )}

                                            {user ? (
                                                <Link to={`/lesson/${lesson.id}`} className="btn btn-primary">
                                                    <Play size={16} /> {t('goToLesson')}
                                                </Link>
                                            ) : (
                                                <Link to="/login" className="btn btn-primary">
                                                    <LogIn size={16} /> {t('loginToAccess')}
                                                </Link>
                                            )}
                                        </>
                                    ) : (
                                        <div className="locked-message-premium">
                                            <div className="locked-icon-wrap">
                                                <Lock size={28} />
                                            </div>
                                            <h4>{t('lockedTitle')}</h4>
                                            <p>{t('lockedMsg')}</p>

                                            {modulePrice > 0 && (
                                                <div className="locked-price-tag">
                                                    <span className="locked-price-amount">{modulePrice.toLocaleString()}</span>
                                                    <span className="locked-price-currency">{t('som')}</span>
                                                </div>
                                            )}

                                            {user ? (
                                                <Link to={`/payment/${course.module_id}`} className="btn btn-primary btn-lg locked-pay-btn">
                                                    <CreditCard size={16} /> {t('payAndAccess')}
                                                </Link>
                                            ) : (
                                                <Link to="/login" className="btn btn-primary btn-lg locked-pay-btn">
                                                    <LogIn size={16} /> {t('loginToAccess')}
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ============ CERTIFICATE APPLICATION & FINAL EXAM SECTION ============ */}
            {showCertBlock && (
                <div className="card animate-fade" style={{
                    marginTop: '2rem',
                    padding: '2rem',
                    border: '2px solid var(--primary)',
                    background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.08), rgba(16, 185, 129, 0.08))',
                    textAlign: 'center',
                    borderRadius: '16px'
                }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--primary)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(108, 92, 231, 0.35)'
                    }}>
                        <Award size={32} />
                    </div>

                    <h2 style={{ marginBottom: '0.5rem' }}>🎓 {course.name} — Sertifikat</h2>

                    {/* CASE 1: CERTIFICATE ALREADY ISSUED BY ADMIN */}
                    {(certStatus?.certificate || certStatus?.application?.status === 'issued') ? (
                        <div>
                            <div className="badge badge-success" style={{ fontSize: '0.95rem', padding: '0.5rem 1.2rem', marginBottom: '1rem' }}>
                                ✅ Sertifikatingiz tayyor!
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                                Tabriklaymiz! Siz kursni va yakuniy sinovni muvaffaqiyatli yakunladingiz. Sertifikatingiz Telegram botga ham yuborildi!
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {(certStatus?.certificate?.file_url || certStatus?.application?.image_url) && (
                                    <a
                                        href={certStatus.certificate?.file_url || certStatus.application?.image_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download="certificate.png"
                                        className="btn btn-primary btn-lg"
                                    >
                                        <ExternalLink size={18} /> 🖼 Sertifikat (Rasm)
                                    </a>
                                )}
                                {(certStatus?.certificate?.pdf_url || certStatus?.application?.pdf_url) && (
                                    <a
                                        href={certStatus.certificate?.pdf_url || certStatus.application?.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download="certificate.pdf"
                                        className="btn btn-secondary btn-lg"
                                    >
                                        <ExternalLink size={18} /> 📄 Sertifikat (PDF)
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : certStatus?.application?.status === 'pending' ? (
                        /* CASE 2: PASSED EXAM, WAITING FOR ADMIN TO UPLOAD CERTIFICATE */
                        <div>
                            <div className="badge badge-warning" style={{ fontSize: '0.95rem', padding: '0.5rem 1.2rem', marginBottom: '1rem' }}>
                                ⏳ Sertifikat kutilmoqda...
                            </div>
                            {certStatus.application.total > 0 && (
                                <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--success)' }}>
                                    ✅ Natijangiz: {certStatus.application.score} / {certStatus.application.total} (O'tish bali: {certStatus.application.min_required})
                                </p>
                            )}
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
                                Siz yakuniy sertifikat sinovidan muvaffaqiyatli o'tdingiz! Hozirda so'rovingiz adminga yuborilgan. Admin sertifikatingizni tasdiqlashi bilan shu yerda va <strong>@mdevsayt_bot</strong> Telegram botida rasm hamda PDF shakli paydo bo'ladi.
                            </p>
                        </div>
                    ) : (allLessonsDone || certStatus?.all_lessons_completed) ? (
                        /* CASE 3: ALL LESSONS COMPLETED -> READY TO TAKE CERTIFICATE EXAM / APPLY */
                        <div>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 1.25rem' }}>
                                🎉 Barakalla! Siz ushbu kursdagi barcha darslarni yakunladingiz!
                                {certStatus?.has_exam
                                    ? ` Sertifikat olish uchun yakuniy testda ${certStatus.exam.total_questions} ta savoldan kamida ${certStatus.exam.min_correct} tasiga to'g'ri javob bering.`
                                    : " Endi sertifikat olish uchun so'rov topshirishingiz mumkin."}
                            </p>

                            {examResultMsg && !examResultMsg.passed && (
                                <div className="card" style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid var(--danger)',
                                    padding: '1rem',
                                    marginBottom: '1.25rem',
                                    maxWidth: '500px',
                                    margin: '0 auto 1.25rem'
                                }}>
                                    <p style={{ color: 'var(--danger)', fontWeight: 600, margin: 0 }}>
                                        ❌ {examResultMsg.message}
                                    </p>
                                </div>
                            )}

                            {certStatus?.has_exam && (
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                                    <span className="badge badge-info" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                        📝 Jami savollar: {certStatus.exam.total_questions} ta
                                    </span>
                                    <span className="badge badge-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                        🎯 O'tish bali: kamida {certStatus.exam.min_correct} ta to'g'ri
                                    </span>
                                    <span className="badge badge-warning" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                        ⏱ Vaqt: {Math.floor((certStatus.exam.time_limit || 1800) / 60)} daqiqa
                                    </span>
                                </div>
                            )}

                            <button onClick={startCertExam} className="btn btn-primary btn-lg" disabled={examSubmitting} style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                                {examSubmitting ? <Loader size={18} className="spin" /> : <><Award size={20} /> 🏆 Sertifikatga topshirish</>}
                            </button>
                        </div>
                    ) : (
                        /* CASE 4: LESSONS NOT ALL COMPLETED YET */
                        <div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                Kurs sertifikatiga topshirish uchun barcha darslarni va vazifalarni yakunlang ({certStatus?.completed_lessons || 0} / {certStatus?.total_lessons || course.lessons?.length || 0} dars tugallangan).
                            </p>
                            <button className="btn btn-secondary" disabled style={{ opacity: 0.7 }}>
                                <Lock size={16} /> Sertifikatga topshirish (Barcha darslarni tugating)
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
