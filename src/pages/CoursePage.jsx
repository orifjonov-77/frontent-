import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI } from '../api/client';
import { Play, Lock, CheckCircle, Clock, FileText, Gamepad2, BookOpen, ArrowLeft, ChevronDown } from 'lucide-react';
import './CoursePage.css';

export default function CoursePage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedLesson, setExpandedLesson] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        loadCourse();
    }, [courseId]);

    const loadCourse = async () => {
        try {
            const res = await coursesAPI.getOne(courseId);
            setCourse(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    if (loading) return <div className="page-loader"><div className="branded-loader"><img src="/logo.png" alt="MDev" className="branded-loader-logo" /><span className="branded-loader-text">MDev...</span><div className="branded-loader-dots"><span></span><span></span><span></span></div></div></div>;
    if (!course) return <div className="container"><p>Kurs topilmadi</p></div>;

    return (
        <div className="course-page container animate-fade">
            <Link to="/modules" className="back-link"><ArrowLeft size={16} /> Modullar</Link>

            <div className="course-header">
                <h1>{course.name}</h1>
                <p>{course.description}</p>
            </div>

            <div className="lessons-list">
                {course.lessons?.map((lesson, i) => (
                    <div key={lesson.id} className={`lesson-item card ${lesson.has_access ? '' : 'locked'}`}>
                        <div className="lesson-header" onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}>
                            <div className="lesson-number">
                                {lesson.progress?.is_completed ? (
                                    <CheckCircle size={20} className="completed-icon" />
                                ) : lesson.has_access ? (
                                    <span className="num">{lesson.order}</span>
                                ) : (
                                    <Lock size={16} className="lock-icon" />
                                )}
                            </div>
                            <div className="lesson-info">
                                <h3>{lesson.title}</h3>
                                <div className="lesson-tags">
                                    {lesson.is_free && <span className="badge badge-success">Bepul</span>}
                                    {lesson.has_test && <span className="badge badge-info"><FileText size={10} /> Test</span>}
                                    {lesson.has_game && <span className="badge badge-accent"><Gamepad2 size={10} /> O'yin</span>}
                                    {lesson.has_homework && <span className="badge badge-warning"><BookOpen size={10} /> Vazifa</span>}
                                </div>
                            </div>
                            <ChevronDown size={18} className={`expand-icon ${expandedLesson === lesson.id ? 'rotated' : ''}`} />
                        </div>

                        {expandedLesson === lesson.id && (
                            <div className="lesson-content">
                                {lesson.has_access ? (
                                    <>
                                        {lesson.description && <p className="lesson-desc">{lesson.description}</p>}

                                        {/* Progress indicators */}
                                        {lesson.progress && (
                                            <div className="progress-indicators">
                                                <div className={`indicator ${lesson.progress.video_watched ? 'done' : ''}`}>
                                                    <Play size={14} /> Video {lesson.progress.video_watched ? '✓' : ''}
                                                </div>
                                                <div className={`indicator ${lesson.progress.test_passed ? 'done' : ''}`}>
                                                    <FileText size={14} /> Test {lesson.progress.test_passed ? '✓' : ''}
                                                </div>
                                                <div className={`indicator ${lesson.progress.game_completed ? 'done' : ''}`}>
                                                    <Gamepad2 size={14} /> O'yin {lesson.progress.game_completed ? '✓' : ''}
                                                </div>
                                                <div className={`indicator ${lesson.progress.homework_submitted ? 'done' : ''}`}>
                                                    <BookOpen size={14} /> Vazifa {lesson.progress.homework_submitted ? '✓' : ''}
                                                </div>
                                            </div>
                                        )}

                                        <Link to={`/lesson/${lesson.id}`} className="btn btn-primary">
                                            <Play size={16} /> Darsga o'tish
                                        </Link>
                                    </>
                                ) : (
                                    <div className="locked-message">
                                        <Lock size={18} />
                                        <p>Bu darsga kirish uchun to'lov qiling yoki oldingi darslarni tugating</p>
                                        <Link to={`/payment/${course.module_id}`} className="btn btn-primary btn-sm">To'lash</Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
