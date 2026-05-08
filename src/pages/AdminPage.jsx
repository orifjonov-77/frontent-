import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI, coursesAPI, clearApiCache } from '../api/client';
import {
    LayoutDashboard, Users, BookOpen, FileText, CreditCard, Gamepad2, Award,
    Plus, Trash2, Check, X, Eye, EyeOff, Loader, Send, Edit3, ChevronDown, ChevronRight, ChevronUp,
    Layers, FolderOpen, PlayCircle, Save, RefreshCw, AlertCircle, Search,
    MessageCircle, ArrowLeft, ExternalLink, TrendingUp, BarChart3, DollarSign,
    Clock, CheckCircle, XCircle, Activity
} from 'lucide-react';
import { chatAPI } from '../api/client';
import './AdminPage.css';

// IMPORTANT: Modal TASHQARIDA e'lon qilingan — har safar qaytadan yaratilmaydi
function Modal({ open, title, children, onClose }) {
    if (!open) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('dashboard');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    // Select dropdown data
    const [modules, setModules] = useState([]);
    const [courses, setCourses] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [students, setStudents] = useState([]);

    // Cascading select states
    const [selModule, setSelModule] = useState('');
    const [selCourse, setSelCourse] = useState('');
    const [selLesson, setSelLesson] = useState('');

    // Form data
    const [formData, setFormData] = useState({});

    // Content sub-tabs
    const [contentTab, setContentTab] = useState('modules');

    // Edit mode
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');

    // Chat state
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatReply, setChatReply] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    // Check image modal
    const [checkImageUrl, setCheckImageUrl] = useState(null);

    // Test questions form
    const [testQuestions, setTestQuestions] = useState([]);

    // Existing content lists
    const [existingModules, setExistingModules] = useState([]);
    const [existingCourses, setExistingCourses] = useState([]);
    const [existingLessons, setExistingLessons] = useState([]);

    // Student detail modal
    const [studentDetail, setStudentDetail] = useState(null);
    const [studentDetailLoading, setStudentDetailLoading] = useState(false);

    // Existing test for editing
    const [existingTest, setExistingTest] = useState(null);

    // Payment statistics
    const [paymentStats, setPaymentStats] = useState(null);

    // Toggle visibility for dashboard sections
    const [showPayments, setShowPayments] = useState(true);
    const [showStudents, setShowStudents] = useState(true);

    useEffect(() => {
        if (!isAdmin) { navigate('/'); return; }
        loadTab();
    }, [tab, isAdmin]);

    useEffect(() => { loadSelectData(); }, []);

    useEffect(() => {
        if (selModule) {
            adminAPI.getCoursesSelect(selModule).then(r => setCourses(r.data)).catch(() => { });
        } else { setCourses([]); }
    }, [selModule]);

    useEffect(() => {
        if (selCourse) {
            adminAPI.getLessonsSelect(selCourse).then(r => setLessons(r.data)).catch(() => { });
            loadLessonsForCourse(selCourse);
        } else { setLessons([]); }
    }, [selCourse]);

    const loadSelectData = async () => {
        try {
            const [mRes, sRes] = await Promise.all([
                adminAPI.getModulesSelect(),
                adminAPI.getStudentsSelect()
            ]);
            setModules(mRes.data);
            setStudents(sRes.data);
        } catch { }
    };

    const loadLessonsForCourse = async (courseId) => {
        try {
            const r = await adminAPI.getLessons(courseId);
            setExistingLessons(r.data);
        } catch { }
    };

    const loadTab = async () => {
        setLoading(true); setMsg('');
        try {
            switch (tab) {
                case 'dashboard': {
                    const [dashRes, payRes] = await Promise.all([
                        adminAPI.dashboard(),
                        adminAPI.getPayments()
                    ]);
                    setData(dashRes.data);
                    // Compute payment statistics
                    const payments = payRes.data || [];
                    const now = new Date();
                    const thisMonth = now.getMonth();
                    const thisYear = now.getFullYear();
                    const approved = payments.filter(p => p.status === 'approved' || p.status === 'auto_approved');
                    const monthPayments = approved.filter(p => {
                        const d = new Date(p.created_at);
                        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
                    });
                    const totalRevenue = approved.reduce((s, p) => s + (p.amount || 0), 0);
                    const monthRevenue = monthPayments.reduce((s, p) => s + (p.amount || 0), 0);
                    // Module profitability
                    const moduleMap = {};
                    approved.forEach(p => {
                        const name = p.module_name || 'Noma\'lum';
                        if (!moduleMap[name]) moduleMap[name] = { name, revenue: 0, count: 0 };
                        moduleMap[name].revenue += (p.amount || 0);
                        moduleMap[name].count += 1;
                    });
                    const moduleStats = Object.values(moduleMap).sort((a, b) => b.revenue - a.revenue);
                    const maxRevenue = moduleStats.length > 0 ? moduleStats[0].revenue : 1;
                    setPaymentStats({
                        totalPayments: approved.length,
                        monthPayments: monthPayments.length,
                        totalRevenue,
                        monthRevenue,
                        pendingCount: payments.filter(p => p.status === 'pending').length,
                        rejectedCount: payments.filter(p => p.status === 'rejected').length,
                        moduleStats,
                        maxRevenue,
                        recentPayments: approved.slice(0, 6)
                    });
                    break;
                }
                case 'students': setData((await adminAPI.getStudents()).data); break;
                case 'payments': setData((await adminAPI.getPayments()).data); break;
                case 'homework': setData((await adminAPI.getHomeworkSubmissions()).data); break;
                case 'certificates': setData((await adminAPI.getCertificates()).data); break;
                case 'content': await loadContentData(); break;
                case 'chat': await loadConversations(); break;
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const loadContentData = async () => {
        try {
            const mRes = await coursesAPI.getModules();
            setExistingModules(mRes.data);
            const allCourses = [];
            mRes.data.forEach(m => { if (m.courses) allCourses.push(...m.courses.map(c => ({ ...c, module_name: m.name }))); });
            setExistingCourses(allCourses);
        } catch { }
    };

    const loadConversations = async () => {
        try {
            const res = await chatAPI.getConversations();
            setConversations(res.data);
        } catch (err) { console.error(err); }
    };

    const openChat = async (studentId) => {
        setChatLoading(true);
        setSelectedChat(studentId);
        try {
            const res = await chatAPI.getStudentMessages(studentId);
            setChatMessages(res.data);
        } catch (err) { console.error(err); }
        setChatLoading(false);
    };

    const sendReply = async () => {
        if (!chatReply.trim() || !selectedChat) return;
        try {
            await chatAPI.adminReply(selectedChat, { message: chatReply });
            setChatReply('');
            const res = await chatAPI.getStudentMessages(selectedChat);
            setChatMessages(res.data);
            await loadConversations();
        } catch (err) { showMsg('Xabar yuborilmadi', true); }
    };

    const showMsg = (text, isError = false) => {
        setMsg(isError ? '❌ ' + text : '✅ ' + text);
        setTimeout(() => setMsg(''), 4000);
    };

    const loadStudentDetail = async (studentId) => {
        setStudentDetailLoading(true);
        try {
            const res = await adminAPI.getStudent(studentId);
            setStudentDetail(res.data);
        } catch (err) { showMsg('Talaba ma\'lumotlari yuklanmadi', true); }
        setStudentDetailLoading(false);
    };

    const loadTestForLesson = async (lessonId) => {
        try {
            const les = lessons.find(l => l.id === parseInt(lessonId));
            if (les?.has_test) {
                // We need to find the test for this lesson
                const res = await adminAPI.getLessons(selCourse);
                const lesData = res.data.find(l => l.id === parseInt(lessonId));
                if (lesData) {
                    // Try fetching existing test
                    try {
                        // Search for test by iterating tests endpoint - admin has test get by id
                        // But we need to use the lesson's test - let's try getTest via course lessons
                    } catch { }
                }
            }
            setExistingTest(null);
        } catch { setExistingTest(null); }
    };

    // Open modal
    const openModal = (type) => {
        setModalType(type);
        setFormData({});
        // Always start with exactly 10 questions for tests
        if (type === 'test') {
            const qs = [];
            for (let i = 0; i < 10; i++) {
                qs.push({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', order: i + 1 });
            }
            setTestQuestions(qs);
        } else {
            setTestQuestions([]);
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalType('');
        setFormData({});
    };

    // Add test question
    const addQuestion = () => {
        setTestQuestions(prev => [...prev, {
            question: '', option_a: '', option_b: '', option_c: '', option_d: '',
            correct_option: 'a', order: prev.length + 1
        }]);
    };

    const updateQuestion = (index, field, value) => {
        setTestQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
    };

    const removeQuestion = (index) => {
        setTestQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const handleAction = async (action, ...args) => {
        setSubmitting(true);
        try {
            switch (action) {
                case 'approvePayment': await adminAPI.reviewPayment(args[0], { status: 'approved', admin_comment: 'Tasdiqlandi' }); break;
                case 'rejectPayment': {
                    const reason = prompt("Rad etish sababi:");
                    if (!reason) { setSubmitting(false); return; }
                    await adminAPI.reviewPayment(args[0], { status: 'rejected', admin_comment: reason }); break;
                }
                case 'gradeHomework': await adminAPI.gradeHomework(args[0], { score: parseInt(args[1]), admin_comment: args[2] }); break;
                case 'deleteStudent': if (confirm("O'chirishni tasdiqlang")) await adminAPI.deleteStudent(args[0]); break;
                case 'toggleStudent': await adminAPI.updateStudent(args[0], { is_active: args[1] }); break;
                case 'createModule': await adminAPI.createModule(formData); closeModal(); break;
                case 'updateModule': await adminAPI.updateModule(args[0], editData); setEditingId(null); break;
                case 'deleteModule': if (confirm("Modulni o'chirasizmi?")) await adminAPI.deleteModule(args[0]); break;
                case 'createCourse': await adminAPI.createCourse({ ...formData, module_id: parseInt(selModule) }); closeModal(); break;
                case 'updateCourse': await adminAPI.updateCourse(args[0], editData); setEditingId(null); break;
                case 'deleteCourse': if (confirm("Kursni o'chirasizmi?")) await adminAPI.deleteCourse(args[0]); break;
                case 'createLesson': await adminAPI.createLesson({ ...formData, course_id: parseInt(selCourse) }); closeModal(); break;
                case 'updateLesson': await adminAPI.updateLesson(args[0], editData); setEditingId(null); break;
                case 'deleteLesson': if (confirm("Darsni o'chirasizmi?")) await adminAPI.deleteLesson(args[0]); break;
                case 'createTest': {
                    // Validate exactly 10 questions
                    const validQs = testQuestions.filter(q => q.question.trim() && q.option_a.trim() && q.option_b.trim() && q.option_c.trim() && q.option_d.trim());
                    if (validQs.length !== 10) {
                        showMsg(`Aynan 10 ta to'liq savol kerak! Hozir ${validQs.length} ta to'ldirilgan`, true);
                        setSubmitting(false);
                        return;
                    }
                    await adminAPI.createTest({
                        lesson_id: parseInt(selLesson),
                        title: formData.title || 'Test',
                        time_limit: parseInt(formData.time_limit) || 420,
                        passing_score: parseInt(formData.passing_score) || 7,
                        questions: validQs
                    });
                    closeModal(); break;
                }
                case 'deleteTestByLesson': await adminAPI.deleteTestByLesson(args[0]); if (selCourse) { adminAPI.getLessonsSelect(selCourse).then(r => setLessons(r.data)).catch(() => { }); } break;
                case 'deleteTest': if (confirm("Testni o'chirasizmi?")) await adminAPI.deleteTest(args[0]); break;
                case 'createHomework': await adminAPI.createHomework({
                    lesson_id: parseInt(selLesson),
                    title: formData.title,
                    description: formData.description,
                    deadline_hours: parseInt(formData.deadline_hours) || 24
                }); closeModal(); break;
                case 'deleteHomework': if (confirm("Vazifani o'chirasizmi?")) await adminAPI.deleteHomework(args[0]); break;
                case 'createGame': await adminAPI.createGame({
                    lesson_id: parseInt(selLesson),
                    title: formData.title,
                    description: formData.description,
                    task_data: formData.task_data
                }); closeModal(); break;
                case 'deleteGame': if (confirm("O'yinni o'chirasizmi?")) await adminAPI.deleteGame(args[0]); break;
                case 'sendCert': await adminAPI.sendCertificate(formData.user_id, formData.cert_title, formData.file_url, formData.cert_desc); closeModal(); break;
                case 'deleteCert': await adminAPI.deleteCertificate(args[0]); break;
            }
            showMsg('Muvaffaqiyatli!');
            setFormData({});
            clearApiCache(); // Keshni tozalash
            loadTab();
            loadSelectData();
            if (selCourse) loadLessonsForCourse(selCourse);
        } catch (err) { showMsg(err.response?.data?.detail || 'Xatolik', true); }
        setSubmitting(false);
    };

    const tabs = [
        { id: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
        { id: 'students', icon: <Users size={16} />, label: "O'quvchilar" },
        { id: 'payments', icon: <CreditCard size={16} />, label: "To'lovlar" },
        { id: 'content', icon: <BookOpen size={16} />, label: 'Kontent' },
        { id: 'homework', icon: <FileText size={16} />, label: 'Vazifalar' },
    ];

    const contentTabs = [
        { id: 'modules', icon: <Layers size={14} />, label: 'Modullar' },
        { id: 'courses', icon: <FolderOpen size={14} />, label: 'Kurslar' },
        { id: 'lessons', icon: <PlayCircle size={14} />, label: 'Darslar' },
        { id: 'tests', icon: <FileText size={14} />, label: 'Testlar' },
        { id: 'homeworkTab', icon: <BookOpen size={14} />, label: 'Vazifalar' },
    ];

    // Cascading Selects — inline JSX (agar component qilsak, har safar qaytadan yaratiladi)
    const renderCascadingSelects = (showLesson = false) => (
        <div className="cascading-selects">
            <select className="input" value={selModule} onChange={e => { setSelModule(e.target.value); setSelCourse(''); setSelLesson(''); }}>
                <option value="">📦 Modul tanlang</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {selModule && (
                <select className="input" value={selCourse} onChange={e => { setSelCourse(e.target.value); setSelLesson(''); }}>
                    <option value="">📚 Kurs tanlang</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            )}
            {showLesson && selCourse && (
                <select className="input" value={selLesson} onChange={e => setSelLesson(e.target.value)}>
                    <option value="">📖 Dars tanlang</option>
                    {lessons.map(l => <option key={l.id} value={l.id}>
                        #{l.order} — {l.title} {l.course_name ? `(${l.course_name})` : ''} {l.has_test ? '✅' : ''} {l.has_homework ? '📝' : ''} {l.has_game ? '🎮' : ''}
                    </option>)}
                </select>
            )}
        </div>
    );


    return (
        <div className="admin-page container animate-fade">
            <h1 className="admin-title section-title"><LayoutDashboard size={24} /> Admin Panel</h1>

            <div className="admin-tabs">
                {tabs.map(t => (
                    <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {msg && <div className={`admin-msg ${msg.startsWith('✅') ? 'success' : 'error'}`}>{msg}</div>}

            <div className="admin-content">
                {loading && tab !== 'content' ? (
                    <div className="page-loader"><div className="branded-loader"><img src="/logo.png" alt="MDev" className="branded-loader-logo" /><span className="branded-loader-text">MDev...</span><div className="branded-loader-dots"><span></span><span></span><span></span></div></div></div>
                ) : (
                    <>
                        {/* ============ DASHBOARD ============ */}
                        {tab === 'dashboard' && data && (
                            <div className="dashboard-stats">
                                {/* Hero Stat Cards */}
                                <div className="hero-stats stagger-children">
                                    {/* O'quvchilar soni — toggle */}
                                    <div className={`hero-stat-card hero-stat-primary ${!showStudents ? 'hero-stat-hidden' : ''}`}
                                        onClick={() => setShowStudents(prev => !prev)}
                                        style={{ cursor: 'pointer' }}>
                                        <div className="hero-stat-icon"><Users size={22} /></div>
                                        <div className="hero-stat-content">
                                            {showStudents ? (
                                                <>
                                                    <span className="hero-stat-value">{data.total_students}</span>
                                                    <span className="hero-stat-label">Jami o'quvchilar</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="hero-stat-value">***</span>
                                                    <span className="hero-stat-label">Jami o'quvchilar</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="hero-stat-toggle">
                                            {showStudents ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </div>
                                        <div className="hero-stat-decoration"></div>
                                    </div>

                                    {/* Tasdiqlangan to'lovlar — toggle */}
                                    <div className={`hero-stat-card hero-stat-success ${!showPayments ? 'hero-stat-hidden' : ''}`}
                                        onClick={() => setShowPayments(prev => !prev)}
                                        style={{ cursor: 'pointer' }}>
                                        <div className="hero-stat-icon"><CheckCircle size={22} /></div>
                                        <div className="hero-stat-content">
                                            {showPayments ? (
                                                <>
                                                    <span className="hero-stat-value">{paymentStats?.totalPayments || data.approved_payments}</span>
                                                    <span className="hero-stat-label">Tasdiqlangan to'lovlar</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="hero-stat-value">***</span>
                                                    <span className="hero-stat-label">Tasdiqlangan to'lovlar</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="hero-stat-toggle">
                                            {showPayments ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </div>
                                        <div className="hero-stat-decoration"></div>
                                    </div>

                                    {/* Kutilayotgan to'lovlar — toggle */}
                                    <div className={`hero-stat-card hero-stat-warning ${!showPayments ? 'hero-stat-hidden' : ''}`}
                                        onClick={() => setShowPayments(prev => !prev)}
                                        style={{ cursor: 'pointer' }}>
                                        <div className="hero-stat-icon"><Clock size={22} /></div>
                                        <div className="hero-stat-content">
                                            {showPayments ? (
                                                <>
                                                    <span className="hero-stat-value">{paymentStats?.pendingCount || data.pending_payments}</span>
                                                    <span className="hero-stat-label">Kutilayotgan to'lovlar</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="hero-stat-value">***</span>
                                                    <span className="hero-stat-label">Kutilayotgan to'lovlar</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="hero-stat-toggle">
                                            {showPayments ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </div>
                                        <div className="hero-stat-decoration"></div>
                                    </div>

                                    {/* Jami daromad — toggle */}
                                    <div className={`hero-stat-card hero-stat-info ${!showPayments ? 'hero-stat-hidden' : ''}`}
                                        onClick={() => setShowPayments(prev => !prev)}
                                        style={{ cursor: 'pointer' }}>
                                        <div className="hero-stat-icon"><DollarSign size={22} /></div>
                                        <div className="hero-stat-content">
                                            {showPayments ? (
                                                <>
                                                    <span className="hero-stat-value">{paymentStats?.totalRevenue?.toLocaleString() || '0'}</span>
                                                    <span className="hero-stat-label">Jami daromad (so'm)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="hero-stat-value">***</span>
                                                    <span className="hero-stat-label">Jami daromad (so'm)</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="hero-stat-toggle">
                                            {showPayments ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </div>
                                        <div className="hero-stat-decoration"></div>
                                    </div>
                                </div>

                                {/* Monthly Summary */}
                                {paymentStats && (
                                    <div className="month-summary-row stagger-children">
                                        <div className="month-card card">
                                            <div className="month-card-header">
                                                <Activity size={18} />
                                                <span>Shu oy statistikasi</span>
                                            </div>
                                            <div className="month-stats-grid">
                                                <div className="month-stat">
                                                    <span className="month-stat-num">{showPayments ? paymentStats.monthPayments : '***'}</span>
                                                    <span className="month-stat-label">To'lovlar soni</span>
                                                </div>
                                                <div className="month-stat-divider"></div>
                                                <div className="month-stat">
                                                    <span className="month-stat-num">{showPayments ? paymentStats.monthRevenue?.toLocaleString() : '***'}</span>
                                                    <span className="month-stat-label">Daromad (so'm)</span>
                                                </div>
                                                <div className="month-stat-divider"></div>
                                                <div className="month-stat">
                                                    <span className="month-stat-num">{data.total_modules}</span>
                                                    <span className="month-stat-label">Modullar</span>
                                                </div>
                                                <div className="month-stat-divider"></div>
                                                <div className="month-stat">
                                                    <span className="month-stat-num">{data.total_lessons}</span>
                                                    <span className="month-stat-label">Darslar</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Module Profitability + Recent Payments Row */}
                                {paymentStats && (
                                    <div className="dashboard-bottom-row">
                                        {/* Module Profitability */}
                                        <div className="module-profit-card card">
                                            <div className="profit-header">
                                                <BarChart3 size={18} />
                                                <span>Modul daromadlari</span>
                                            </div>
                                            {paymentStats.moduleStats.length === 0 ? (
                                                <p className="empty-text">Hali to'lovlar yo'q</p>
                                            ) : (
                                                <div className="profit-bars">
                                                    {paymentStats.moduleStats.map((m, i) => (
                                                        <div key={m.name} className="profit-bar-row" style={{ animationDelay: `${i * 0.1}s` }}>
                                                            <div className="profit-bar-label">
                                                                <span className="profit-bar-name">{m.name}</span>
                                                                <span className="profit-bar-amount">{m.revenue?.toLocaleString()} so'm</span>
                                                            </div>
                                                            <div className="profit-bar-track">
                                                                <div
                                                                    className="profit-bar-fill"
                                                                    data-percent={`${Math.round((m.revenue / paymentStats.maxRevenue) * 100)}%`}
                                                                    style={{
                                                                        '--target-width': `${Math.max((m.revenue / paymentStats.maxRevenue) * 100, 8)}%`,
                                                                        animationDelay: `${0.3 + i * 0.15}s`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className="profit-bar-count">{m.count} ta to'lov</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Recent Payments */}
                                        <div className="recent-payments-card card">
                                            <div className="profit-header">
                                                <TrendingUp size={18} />
                                                <span>Oxirgi to'lovlar</span>
                                            </div>
                                            {paymentStats.recentPayments.length === 0 ? (
                                                <p className="empty-text">Hali to'lovlar yo'q</p>
                                            ) : (
                                                <div className="recent-list">
                                                    {paymentStats.recentPayments.map((p, i) => (
                                                        <div key={p.id} className="recent-item" style={{ animationDelay: `${i * 0.08}s` }}>
                                                            <div className="recent-item-avatar">
                                                                {p.user_name?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                            <div className="recent-item-info">
                                                                <span className="recent-item-name">{p.user_name}</span>
                                                                <span className="recent-item-module">{p.module_name}</span>
                                                            </div>
                                                            <div className="recent-item-amount">
                                                                <span className="recent-amount-value">+{p.amount?.toLocaleString()}</span>
                                                                <span className="recent-amount-date">{p.created_at?.slice(0, 10)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ============ STUDENTS ============ */}
                        {tab === 'students' && (
                            <div className="table-wrap">
                                <table className="admin-table">
                                    <thead><tr><th>Ism</th><th>Telefon</th><th>Status</th><th>To'lagan</th><th>Sana</th><th>Amal</th></tr></thead>
                                    <tbody>
                                        {Array.isArray(data) && data.map(s => (
                                            <tr key={s.id}>
                                                <td><strong>{s.full_name}</strong></td>
                                                <td>{s.phone}</td>
                                                <td><span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>{s.is_active ? 'Aktiv' : 'Bloklangan'}</span></td>
                                                <td><span className="badge badge-info">{s.paid_modules} modul</span></td>
                                                <td className="td-sm">{s.created_at?.slice(0, 10)}</td>
                                                <td>
                                                    <div className="action-btns">
                                                        <button className="btn btn-sm btn-info" onClick={() => loadStudentDetail(s.id)}>
                                                            <Eye size={14} /> Batafsil
                                                        </button>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => handleAction('toggleStudent', s.id, !s.is_active)}>
                                                            {s.is_active ? 'Bloklash' : 'Ochish'}
                                                        </button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleAction('deleteStudent', s.id)}><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ============ PAYMENTS ============ */}
                        {tab === 'payments' && (
                            <div className="table-wrap">
                                <table className="admin-table">
                                    <thead><tr><th>O'quvchi</th><th>Modul</th><th>Summa</th><th>Status</th><th>AI</th><th>Chek</th><th>Amal</th></tr></thead>
                                    <tbody>
                                        {Array.isArray(data) && data.map(p => (
                                            <tr key={p.id}>
                                                <td>
                                                    <strong>{p.user_name}</strong><br />
                                                    <small>{p.user_phone}</small>
                                                    {p.telegram_link && (
                                                        <a href={p.telegram_link} target="_blank" rel="noopener" className="tg-link" title="Telegramda yozish">
                                                            💬 Telegram <ExternalLink size={10} />
                                                        </a>
                                                    )}
                                                </td>
                                                <td>{p.module_name}</td>
                                                <td>{p.amount?.toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge ${p.status === 'approved' || p.status === 'auto_approved' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                                                        {p.status === 'auto_approved' ? '🤖 AI' : p.status}
                                                    </span>
                                                </td>
                                                <td className="td-sm">{p.ai_comment && <span title={p.ai_comment}>🤖 {p.ai_verified ? '✅' : '❌'}</span>}</td>
                                                <td>
                                                    {p.check_image_url && (
                                                        <button className="btn btn-sm btn-secondary" onClick={() => setCheckImageUrl(p.check_image_url)}>
                                                            <Eye size={14} /> Ko'rish
                                                        </button>
                                                    )}
                                                </td>
                                                <td>
                                                    {(p.status === 'pending' || p.status === 'auto_approved') && (
                                                        <div className="action-btns">
                                                            <button className="btn btn-sm btn-success" onClick={() => handleAction('approvePayment', p.id)}><Check size={14} /> Ha</button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleAction('rejectPayment', p.id)}><X size={14} /> Yo'q</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ============ CHAT ============ */}
                        {tab === 'chat' && (
                            <div className="admin-chat-section">
                                {!selectedChat ? (
                                    <div className="chat-conversations stagger-children">
                                        <h3><MessageCircle size={18} /> Suhbatlar ({conversations.length})</h3>
                                        {conversations.length === 0 && <p className="empty-text">Hali xabar yo'q</p>}
                                        {conversations.map(c => (
                                            <div key={c.student_id} className="conv-card card">
                                                <div className="conv-info" onClick={() => openChat(c.student_id)} style={{ cursor: 'pointer', flex: 1 }}>
                                                    <strong>{c.student_name}</strong>
                                                    <small>{c.student_phone}</small>
                                                    <p className="conv-last">{c.last_message}</p>
                                                </div>
                                                <div className="conv-meta">
                                                    {c.unread > 0 && <span className="unread-dot">{c.unread}</span>}
                                                    {c.telegram_link && (
                                                        <a href={c.telegram_link} target="_blank" rel="noopener noreferrer"
                                                            className="btn btn-sm btn-primary" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                                                            onClick={e => e.stopPropagation()}>
                                                            📱 Telegram
                                                        </a>
                                                    )}
                                                    <small>{c.last_time?.slice(0, 10)}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="chat-detail">
                                        <div className="chat-detail-header">
                                            <button className="btn btn-sm btn-secondary" onClick={() => { setSelectedChat(null); setChatMessages([]); }}>
                                                <ArrowLeft size={14} /> Orqaga
                                            </button>
                                            <span className="chat-detail-name">
                                                {conversations.find(c => c.student_id === selectedChat)?.student_name}
                                                <small style={{ marginLeft: '0.5rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                                    {conversations.find(c => c.student_id === selectedChat)?.student_phone}
                                                </small>
                                            </span>
                                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                {conversations.find(c => c.student_id === selectedChat)?.telegram_link && (
                                                    <a href={conversations.find(c => c.student_id === selectedChat)?.telegram_link}
                                                        target="_blank" rel="noopener noreferrer"
                                                        className="btn btn-sm btn-primary" style={{ fontSize: '0.75rem' }}>
                                                        📱 TG
                                                    </a>
                                                )}
                                                <button className="btn btn-sm btn-secondary" onClick={() => openChat(selectedChat)}>
                                                    <RefreshCw size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="chat-detail-messages">
                                            {chatLoading && <div className="page-loader"><div className="spinner" /></div>}
                                            {chatMessages.map(m => (
                                                <div key={m.id} className={`admin-chat-msg ${m.is_from_admin ? 'admin' : 'student'} ${m.sender_id === 0 ? 'bot' : ''}`}>
                                                    <div className="msg-label">
                                                        {m.sender_id === 0 ? '🤖 AI Bot' : m.is_from_admin ? '👨‍💼 Admin' : '👤 Student'}
                                                    </div>
                                                    <div className="msg-text">{m.message}</div>
                                                    <div className="msg-time-sm">{m.created_at?.slice(11, 16)}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="chat-reply-bar">
                                            <input className="input" placeholder="Javob yozing..." value={chatReply}
                                                onChange={e => setChatReply(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && sendReply()} />
                                            <button className="btn btn-primary" onClick={sendReply} disabled={!chatReply.trim()}>
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ============ HOMEWORK SUBMISSIONS ============ */}
                        {tab === 'homework' && (
                            <div className="table-wrap">
                                <table className="admin-table">
                                    <thead><tr><th>O'quvchi</th><th>Vazifa</th><th>Javob</th><th>Fayl</th><th>Sana</th><th>Baho</th><th>Amal</th></tr></thead>
                                    <tbody>
                                        {Array.isArray(data) && data.map(s => (
                                            <tr key={s.id}>
                                                <td><strong>{s.user_name}</strong></td>
                                                <td>{s.homework_title}</td>
                                                <td className="td-text">{s.answer_text ? s.answer_text.slice(0, 150) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td>
                                                    {s.file_url ? (
                                                        <a href={`${import.meta.env.VITE_API_URL}${s.file_url}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                                                            <Eye size={14} /> Fayl
                                                        </a>
                                                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                </td>
                                                <td className="td-sm">{s.submitted_at?.slice(0, 16).replace('T', ' ')}</td>
                                                <td>{s.is_graded ? <span className="badge badge-success">{s.score}/2</span> : <span className="badge badge-warning">Kutilmoqda</span>}</td>
                                                <td>
                                                    {!s.is_graded ? (
                                                        <div className="grade-form">
                                                            <select id={`score-${s.id}`} className="input" style={{ width: '55px' }}>
                                                                <option value="0">0</option>
                                                                <option value="1">1</option>
                                                                <option value="2">2</option>
                                                            </select>
                                                            <input id={`comment-${s.id}`} className="input" placeholder="Izoh..." style={{ width: '120px' }} />
                                                            <button className="btn btn-sm btn-primary" onClick={() =>
                                                                handleAction('gradeHomework', s.id, document.getElementById(`score-${s.id}`).value, document.getElementById(`comment-${s.id}`).value || '')
                                                            }>✅ Baho</button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.admin_comment || '✅ Baholangan'}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {Array.isArray(data) && data.length === 0 && (
                                            <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Hali topshirilgan vazifalar yo'q</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ============ CERTIFICATES ============ */}
                        {tab === 'certificates' && (
                            <div className="cert-section">
                                <button className="btn btn-primary" onClick={() => openModal('cert')}><Plus size={16} /> Sertifikat yuborish</button>
                                <div className="table-wrap" style={{ marginTop: '1rem' }}>
                                    <table className="admin-table">
                                        <thead><tr><th>O'quvchi</th><th>Sertifikat</th><th>Fayl</th><th>Sana</th><th>Amal</th></tr></thead>
                                        <tbody>
                                            {Array.isArray(data) && data.map(c => (
                                                <tr key={c.id}>
                                                    <td><strong>{c.user_name}</strong></td>
                                                    <td>{c.title}</td>
                                                    <td><a href={c.file_url} target="_blank" className="btn btn-sm btn-secondary"><Eye size={14} /></a></td>
                                                    <td className="td-sm">{c.issued_at?.slice(0, 10)}</td>
                                                    <td><button className="btn btn-sm btn-danger" onClick={() => handleAction('deleteCert', c.id)}><Trash2 size={14} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ============ CONTENT MANAGEMENT ============ */}
                        {tab === 'content' && (
                            <div className="content-management">
                                <div className="content-tabs">
                                    {contentTabs.map(ct => (
                                        <button key={ct.id} className={`content-tab ${contentTab === ct.id ? 'active' : ''}`}
                                            onClick={() => setContentTab(ct.id)}>
                                            {ct.icon} {ct.label}
                                        </button>
                                    ))}
                                </div>

                                {/* ---- MODULES ---- */}
                                {contentTab === 'modules' && (
                                    <div className="content-section stagger-children">
                                        <div className="section-header">
                                            <h3><Layers size={16} /> Modullar <span className="badge badge-info">{existingModules.length}</span></h3>
                                            <button className="btn btn-primary btn-sm" onClick={() => openModal('module')}><Plus size={14} /> Modul</button>
                                        </div>
                                        {existingModules.map(m => (
                                            <div key={m.id} className="list-item card">
                                                {editingId === `module-${m.id}` ? (
                                                    <div className="edit-form">
                                                        <input className="input" value={editData.name || ''} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} placeholder="Nomi" />
                                                        <input className="input" type="number" value={editData.price || ''} onChange={e => setEditData(p => ({ ...p, price: parseInt(e.target.value) || 0 }))} placeholder="Narx" />
                                                        <div className="edit-actions">
                                                            <button className="btn btn-sm btn-success" onClick={() => handleAction('updateModule', m.id)}><Save size={14} /> Saqlash</button>
                                                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}><X size={14} /></button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="list-item-content">
                                                        <div className="list-item-info">
                                                            <strong>{m.name}</strong>
                                                            <span className="badge badge-info">{m.price?.toLocaleString()} so'm</span>
                                                            <span className="badge badge-accent">{m.courses?.length || 0} kurs</span>
                                                        </div>
                                                        <div className="action-btns">
                                                            <button className="btn btn-sm btn-secondary" onClick={() => { setEditingId(`module-${m.id}`); setEditData({ name: m.name, price: m.price }); }}><Edit3 size={14} /></button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleAction('deleteModule', m.id)}><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ---- COURSES ---- */}
                                {contentTab === 'courses' && (
                                    <div className="content-section stagger-children">
                                        <div className="section-header">
                                            <h3><FolderOpen size={16} /> Kurslar <span className="badge badge-info">{existingCourses.length}</span></h3>
                                            <button className="btn btn-primary btn-sm" onClick={() => openModal('course')}><Plus size={14} /> Kurs</button>
                                        </div>
                                        {existingCourses.map(c => (
                                            <div key={c.id} className="list-item card">
                                                {editingId === `course-${c.id}` ? (
                                                    <div className="edit-form">
                                                        <input className="input" value={editData.name || ''} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} placeholder="Nomi" />
                                                        <div className="edit-actions">
                                                            <button className="btn btn-sm btn-success" onClick={() => handleAction('updateCourse', c.id)}><Save size={14} /> Saqlash</button>
                                                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}><X size={14} /></button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="list-item-content">
                                                        <div className="list-item-info">
                                                            <strong>{c.name}</strong>
                                                            <span className="badge badge-accent">{c.module_name}</span>
                                                        </div>
                                                        <div className="action-btns">
                                                            <button className="btn btn-sm btn-secondary" onClick={() => { setEditingId(`course-${c.id}`); setEditData({ name: c.name }); }}><Edit3 size={14} /></button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleAction('deleteCourse', c.id)}><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ---- LESSONS ---- */}
                                {contentTab === 'lessons' && (
                                    <div className="content-section stagger-children">
                                        <div className="section-header">
                                            <h3><PlayCircle size={16} /> Darslar</h3>
                                            <button className="btn btn-primary btn-sm" onClick={() => openModal('lesson')}><Plus size={14} /> Dars</button>
                                        </div>
                                        {renderCascadingSelects()}
                                        {selCourse && (
                                            <>
                                                <div className="list-header">
                                                    <span className="badge badge-info">{existingLessons.length} ta dars</span>
                                                    <button className="btn btn-sm btn-secondary" onClick={() => loadLessonsForCourse(selCourse)}><RefreshCw size={14} /></button>
                                                </div>
                                                {existingLessons.length === 0 && <p className="empty-text">Bu kursda hali dars yo'q</p>}
                                                {existingLessons.map(l => (
                                                    <div key={l.id} className="list-item card">
                                                        {editingId === `lesson-${l.id}` ? (
                                                            <div className="edit-form">
                                                                <input className="input" value={editData.title || ''} onChange={e => setEditData(p => ({ ...p, title: e.target.value }))} placeholder="Sarlavha" />
                                                                <input className="input" value={editData.video_url || ''} onChange={e => setEditData(p => ({ ...p, video_url: e.target.value }))} placeholder="Video URL" />
                                                                <label className="checkbox-label">
                                                                    <input type="checkbox" checked={editData.is_free || false}
                                                                        onChange={e => setEditData(p => ({ ...p, is_free: e.target.checked }))} /> Bepul
                                                                </label>
                                                                <div className="edit-actions">
                                                                    <button className="btn btn-sm btn-success" onClick={() => handleAction('updateLesson', l.id)}><Save size={14} /> Saqlash</button>
                                                                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}><X size={14} /></button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="list-item-content">
                                                                <div className="list-item-info">
                                                                    <span className="lesson-order">#{l.order}</span>
                                                                    <strong>{l.title}</strong>
                                                                    {l.is_free && <span className="badge badge-success">Bepul</span>}
                                                                    {l.video_url && <span className="badge badge-info">🎥</span>}
                                                                    {l.has_test && <span className="badge badge-accent">📝 Test</span>}
                                                                    {l.has_homework && <span className="badge badge-warning">📋 Vazifa</span>}
                                                                    {l.has_game && <span className="badge badge-info">🎮 O'yin</span>}
                                                                </div>
                                                                <div className="action-btns">
                                                                    <button className="btn btn-sm btn-secondary" onClick={() => {
                                                                        setEditingId(`lesson-${l.id}`);
                                                                        setEditData({ title: l.title, video_url: l.video_url || '', is_free: l.is_free });
                                                                    }}><Edit3 size={14} /></button>
                                                                    <button className="btn btn-sm btn-danger" onClick={() => handleAction('deleteLesson', l.id)}><Trash2 size={14} /></button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ---- TESTS ---- */}
                                {contentTab === 'tests' && (
                                    <div className="content-section stagger-children">
                                        <div className="section-header">
                                            <h3><FileText size={16} /> Testlar</h3>
                                            <button className="btn btn-primary btn-sm" onClick={() => openModal('test')}><Plus size={14} /> Test qo'shish</button>
                                        </div>
                                        <p className="form-hint">⚠️ Avval Modul → Kurs → Dars tanlang, keyin "Test qo'shish" tugmasini bosing</p>
                                        {renderCascadingSelects(true)}
                                        {selLesson && (() => {
                                            const les = lessons.find(l => l.id === parseInt(selLesson));
                                            return (
                                                <div className="attachments-status card">
                                                    <h4>📖 Dars: <strong>{les?.title}</strong></h4>
                                                    <div className="status-badges">
                                                        <span className={`badge ${les?.has_test ? 'badge-success' : 'badge-danger'}`}>{les?.has_test ? '✅ Test bor' : '❌ Test yo\'q'}</span>
                                                        <span className={`badge ${les?.has_homework ? 'badge-success' : 'badge-danger'}`}>{les?.has_homework ? '✅ Vazifa bor' : '❌ Vazifa yo\'q'}</span>
                                                        <span className={`badge ${les?.has_game ? 'badge-success' : 'badge-danger'}`}>{les?.has_game ? '✅ O\'yin bor' : '❌ O\'yin yo\'q'}</span>
                                                    </div>
                                                    {les?.has_test && (
                                                        <div className="action-btns" style={{ marginTop: '0.75rem' }}>
                                                            <button className="btn btn-sm btn-danger" onClick={() => {
                                                                if (confirm("Testni o'chirasizmi?")) {
                                                                    // Find the test ID — we have lesson_id, need to find test
                                                                    handleAction('deleteTestByLesson', parseInt(selLesson));
                                                                }
                                                            }}><Trash2 size={14} /> Testni o'chirish</button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* ---- HOMEWORK ---- */}
                                {contentTab === 'homeworkTab' && (
                                    <div className="content-section stagger-children">
                                        <div className="section-header">
                                            <h3><BookOpen size={16} /> Uy vazifalari</h3>
                                            <button className="btn btn-primary btn-sm" onClick={() => openModal('homework')}><Plus size={14} /> Vazifa qo'shish</button>
                                        </div>
                                        <p className="form-hint">Avval Modul → Kurs → Dars tanlang</p>
                                        {renderCascadingSelects(true)}
                                        {selLesson && (() => {
                                            const les = lessons.find(l => l.id === parseInt(selLesson));
                                            return les?.has_homework ? (
                                                <div className="attachments-status card">
                                                    <h4>✅ Bu darsda vazifa bor</h4>
                                                    <div className="action-btns" style={{ marginTop: '0.5rem' }}>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleAction('deleteHomework', selLesson)}><Trash2 size={14} /> Vazifani o'chirish</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="attachments-status card">
                                                    <h4>❌ Bu darsda vazifa yo'q — yuqoridagi tugma bilan qo'shing</h4>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* ---- GAMES ---- */}
                                {contentTab === 'games' && (
                                    <div className="content-section stagger-children">
                                        <div className="section-header">
                                            <h3><Gamepad2 size={16} /> O'yinlar</h3>
                                            <button className="btn btn-primary btn-sm" onClick={() => openModal('game')}><Plus size={14} /> O'yin qo'shish</button>
                                        </div>
                                        <p className="form-hint">Avval Modul → Kurs → Dars tanlang</p>
                                        {renderCascadingSelects(true)}
                                        {selLesson && (() => {
                                            const les = lessons.find(l => l.id === parseInt(selLesson));
                                            return les?.has_game ? (
                                                <div className="attachments-status card">
                                                    <h4>✅ Bu darsda o'yin bor</h4>
                                                    <div className="action-btns" style={{ marginTop: '0.5rem' }}>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleAction('deleteGame', selLesson)}><Trash2 size={14} /> O'yinni o'chirish</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="attachments-status card">
                                                    <h4>❌ Bu darsda o'yin yo'q — yuqoridagi tugma bilan qo'shing</h4>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ============ MODALS ============ */}

            {/* Module Modal */}
            <Modal open={modalOpen && modalType === 'module'} title="Yangi Modul" onClose={closeModal}>
                <div className="modal-form">
                    <div className="form-group"><label>Modul nomi</label><input className="input" placeholder="masalan: Dasturlash" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
                    <div className="form-group"><label>Slug</label><input className="input" placeholder="masalan: dasturlash" value={formData.slug || ''} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} /></div>
                    <div className="form-row">
                        <div className="form-group"><label>Narx (so'm)</label><input className="input" type="number" value={formData.price || ''} onChange={e => setFormData(p => ({ ...p, price: parseInt(e.target.value) || 0 }))} /></div>
                        <div className="form-group"><label>Tartib</label><input className="input" type="number" value={formData.order || ''} onChange={e => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} /></div>
                    </div>
                    <div className="form-group"><label>Tavsif</label><textarea className="input" rows={2} value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={closeModal}>Bekor</button>
                        <button className="btn btn-primary" onClick={() => handleAction('createModule')} disabled={submitting}>
                            {submitting ? <Loader size={16} className="spin" /> : <><Check size={16} /> Saqlash</>}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Course Modal */}
            <Modal open={modalOpen && modalType === 'course'} title="Yangi Kurs" onClose={closeModal}>
                <div className="modal-form">
                    {renderCascadingSelects()}
                    {selModule && <>
                        <div className="form-group"><label>Kurs nomi</label><input className="input" placeholder="masalan: Frontend" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
                        <div className="form-group"><label>Slug</label><input className="input" placeholder="masalan: frontend" value={formData.slug || ''} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} /></div>
                        <div className="form-group"><label>Tavsif</label><textarea className="input" rows={2} value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={closeModal}>Bekor</button>
                            <button className="btn btn-primary" onClick={() => handleAction('createCourse')} disabled={submitting || !selModule}>
                                {submitting ? <Loader size={16} className="spin" /> : <><Check size={16} /> Saqlash</>}
                            </button>
                        </div>
                    </>}
                </div>
            </Modal>

            {/* Lesson Modal */}
            <Modal open={modalOpen && modalType === 'lesson'} title="Yangi Dars" onClose={closeModal}>
                <div className="modal-form">
                    {renderCascadingSelects()}
                    {selCourse && <>
                        <div className="form-group"><label>Dars sarlavhasi</label><input className="input" placeholder="masalan: HTML kirish" value={formData.title || ''} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
                        <div className="form-group"><label>Slug</label><input className="input" placeholder="masalan: html-kirish" value={formData.slug || ''} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} /></div>
                        <div className="form-group"><label>Video URL (YouTube embed)</label><input className="input" placeholder="https://www.youtube.com/embed/..." value={formData.video_url || ''} onChange={e => setFormData(p => ({ ...p, video_url: e.target.value }))} /></div>
                        <div className="form-row">
                            <div className="form-group"><label>Tartib raqam</label><input className="input" type="number" value={formData.order || ''} onChange={e => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} /></div>
                            <label className="checkbox-label" style={{ marginTop: 'auto' }}>
                                <input type="checkbox" checked={formData.is_free || false} onChange={e => setFormData(p => ({ ...p, is_free: e.target.checked }))} />
                                🔓 Bepul dars
                            </label>
                        </div>
                        <div className="form-group"><label>Tavsif</label><textarea className="input" rows={2} value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={closeModal}>Bekor</button>
                            <button className="btn btn-primary" onClick={() => handleAction('createLesson')} disabled={submitting || !selCourse}>
                                {submitting ? <Loader size={16} className="spin" /> : <><Check size={16} /> Saqlash</>}
                            </button>
                        </div>
                    </>}
                </div>
            </Modal>

            {/* Test Modal — with individual question fields like teacher project */}
            <Modal open={modalOpen && modalType === 'test'} title="Yangi Test" onClose={closeModal}>
                <div className="modal-form">
                    {!selLesson && <p className="form-hint" style={{ color: 'var(--danger)' }}>⚠️ Avval Content → Testlar tabida Modul → Kurs → Dars tanlang</p>}
                    {selLesson && <>
                        <div className="form-row">
                            <div className="form-group"><label>Test sarlavhasi</label><input className="input" value={formData.title || ''} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
                            <div className="form-group"><label>Vaqt, soniya (ixtiyoriy, default: 420)</label><input className="input" type="number" placeholder="420" value={formData.time_limit || ''} onChange={e => setFormData(p => ({ ...p, time_limit: e.target.value }))} /></div>
                            <div className="form-group"><label>O'tish bali (ixtiyoriy, default: 7)</label><input className="input" type="number" placeholder="7" value={formData.passing_score || ''} onChange={e => setFormData(p => ({ ...p, passing_score: e.target.value }))} /></div>
                        </div>

                        <div className="questions-section">
                            <div className="section-header">
                                <h4>📝 Savollar ({testQuestions.length}/10) — aynan 10 ta bo'lishi shart</h4>
                            </div>

                            {testQuestions.map((q, i) => (
                                <div key={i} className="question-card card">
                                    <div className="question-header">
                                        <span className="q-number">{i + 1}</span>
                                    </div>
                                    <div className="form-group">
                                        <label>Savol matni</label>
                                        <textarea className="input" rows={2} value={q.question} onChange={e => updateQuestion(i, 'question', e.target.value)} placeholder="Savol..." />
                                    </div>
                                    <div className="form-row four-cols">
                                        <div className="form-group"><label>A</label><input className="input" value={q.option_a} onChange={e => updateQuestion(i, 'option_a', e.target.value)} /></div>
                                        <div className="form-group"><label>B</label><input className="input" value={q.option_b} onChange={e => updateQuestion(i, 'option_b', e.target.value)} /></div>
                                        <div className="form-group"><label>C</label><input className="input" value={q.option_c} onChange={e => updateQuestion(i, 'option_c', e.target.value)} /></div>
                                        <div className="form-group"><label>D</label><input className="input" value={q.option_d} onChange={e => updateQuestion(i, 'option_d', e.target.value)} /></div>
                                    </div>
                                    <div className="form-group" style={{ maxWidth: '150px' }}>
                                        <label>To'g'ri javob</label>
                                        <select className="input" value={q.correct_option} onChange={e => updateQuestion(i, 'correct_option', e.target.value)}>
                                            <option value="a">A</option>
                                            <option value="b">B</option>
                                            <option value="c">C</option>
                                            <option value="d">D</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={closeModal}>Bekor</button>
                            <button className="btn btn-primary" onClick={() => handleAction('createTest')} disabled={submitting || testQuestions.filter(q => q.question.trim()).length !== 10}>
                                {submitting ? <Loader size={16} className="spin" /> : <span><Check size={16} /> 10 ta savol bilan saqlash</span>}
                            </button>
                        </div>
                    </>}
                </div>
            </Modal>

            {/* Homework Modal */}
            <Modal open={modalOpen && modalType === 'homework'} title="Yangi Vazifa" onClose={closeModal}>
                <div className="modal-form">
                    {!selLesson && <p className="form-hint" style={{ color: 'var(--danger)' }}>⚠️ Avval Content → Vazifalar tabida Modul → Kurs → Dars tanlang</p>}
                    {selLesson && <>
                        <div className="form-group"><label>Vazifa sarlavhasi</label><input className="input" value={formData.title || ''} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
                        <div className="form-group"><label>Tavsif / Topshiriq matni</label><textarea className="input" rows={4} value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Vazifa nima ekanligini batafsil yozing..." /></div>
                        <div className="form-group"><label>Muddat (soat)</label><input className="input" type="number" placeholder="24" value={formData.deadline_hours || ''} onChange={e => setFormData(p => ({ ...p, deadline_hours: e.target.value }))} /></div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={closeModal}>Bekor</button>
                            <button className="btn btn-primary" onClick={() => handleAction('createHomework')} disabled={submitting}>
                                {submitting ? <Loader size={16} className="spin" /> : <><Check size={16} /> Saqlash</>}
                            </button>
                        </div>
                    </>}
                </div>
            </Modal>

            {/* Game Modal */}
            <Modal open={modalOpen && modalType === 'game'} title="Yangi O'yin" onClose={closeModal}>
                <div className="modal-form">
                    {!selLesson && <p className="form-hint" style={{ color: 'var(--danger)' }}>⚠️ Avval Content → O'yinlar tabida Modul → Kurs → Dars tanlang</p>}
                    {selLesson && <>
                        <div className="form-group"><label>O'yin sarlavhasi</label><input className="input" value={formData.title || ''} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
                        <div className="form-group"><label>Tavsif</label><textarea className="input" rows={2} value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
                        <div className="form-group"><label>Topshiriq matni (task_data)</label><textarea className="input" rows={4} value={formData.task_data || ''} onChange={e => setFormData(p => ({ ...p, task_data: e.target.value }))} placeholder="O'yin topshiriq matni..." /></div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={closeModal}>Bekor</button>
                            <button className="btn btn-primary" onClick={() => handleAction('createGame')} disabled={submitting}>
                                {submitting ? <Loader size={16} className="spin" /> : <><Check size={16} /> Saqlash</>}
                            </button>
                        </div>
                    </>}
                </div>
            </Modal>

            {/* Certificate Modal */}
            <Modal open={modalOpen && modalType === 'cert'} title="Sertifikat yuborish" onClose={closeModal}>
                <div className="modal-form">
                    <div className="form-group">
                        <label>O'quvchi tanlang</label>
                        <select className="input" value={formData.user_id || ''} onChange={e => setFormData(p => ({ ...p, user_id: parseInt(e.target.value) }))}>
                            <option value="">Tanlang...</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label>Sertifikat nomi</label><input className="input" value={formData.cert_title || ''} onChange={e => setFormData(p => ({ ...p, cert_title: e.target.value }))} /></div>
                    <div className="form-group"><label>Fayl URL (PNG/PDF)</label><input className="input" value={formData.file_url || ''} onChange={e => setFormData(p => ({ ...p, file_url: e.target.value }))} /></div>
                    <div className="form-group"><label>Izoh</label><input className="input" value={formData.cert_desc || ''} onChange={e => setFormData(p => ({ ...p, cert_desc: e.target.value }))} /></div>
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={closeModal}>Bekor</button>
                        <button className="btn btn-primary" onClick={() => handleAction('sendCert')} disabled={submitting}>
                            {submitting ? <Loader size={16} className="spin" /> : <><Send size={16} /> Yuborish</>}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Check Image Modal */}
            {checkImageUrl && (
                <div className="modal-overlay" onClick={() => setCheckImageUrl(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>📸 To'lov cheki</h3>
                            <button className="modal-close" onClick={() => setCheckImageUrl(null)}><X size={18} /></button>
                        </div>
                        <div className="modal-body" style={{ textAlign: 'center', padding: '1rem' }}>
                            <img src={checkImageUrl} alt="To'lov cheki" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Student Detail Modal */}
            <Modal open={!!studentDetail} title={`👤 ${studentDetail?.full_name || 'Talaba'}`} onClose={() => setStudentDetail(null)}>
                {studentDetailLoading ? (
                    <div className="page-loader"><div className="branded-loader"><img src="/logo.png" alt="MDev" className="branded-loader-logo" /><span className="branded-loader-text">MDev...</span><div className="branded-loader-dots"><span></span><span></span><span></span></div></div></div>
                ) : studentDetail ? (
                    <div className="student-detail-content">
                        {/* Basic Info */}
                        <div className="detail-section">
                            <h4>📋 Asosiy ma'lumotlar</h4>
                            <div className="detail-grid">
                                <div className="detail-item"><span>Ism:</span><strong>{studentDetail.full_name}</strong></div>
                                <div className="detail-item"><span>Telefon:</span><strong>{studentDetail.phone}</strong></div>
                                <div className="detail-item"><span>Status:</span><span className={`badge ${studentDetail.is_active ? 'badge-success' : 'badge-danger'}`}>{studentDetail.is_active ? 'Aktiv' : 'Bloklangan'}</span></div>
                                <div className="detail-item"><span>Ro'yxatdan o'tgan:</span><strong>{studentDetail.created_at?.slice(0, 10)}</strong></div>
                                {studentDetail.telegram_link && (
                                    <div className="detail-item"><span>Telegram:</span><a href={studentDetail.telegram_link} target="_blank" rel="noopener" className="btn btn-sm btn-info">💬 Telegram <ExternalLink size={10} /></a></div>
                                )}
                            </div>
                        </div>

                        {/* Payments */}
                        <div className="detail-section">
                            <h4>💰 To'lovlar ({studentDetail.payments?.length || 0})</h4>
                            {studentDetail.payments?.length > 0 ? (
                                <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                                    <thead><tr><th>Modul</th><th>Summa</th><th>Status</th><th>Sana</th></tr></thead>
                                    <tbody>
                                        {studentDetail.payments.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.module_id}</td>
                                                <td>{p.amount?.toLocaleString()}</td>
                                                <td><span className={`badge ${p.status === 'approved' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{p.status}</span></td>
                                                <td className="td-sm">{p.created_at?.slice(0, 10)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="empty-text">To'lovlar yo'q</p>}
                        </div>

                        {/* Test Results */}
                        <div className="detail-section">
                            <h4>📝 Test natijalari ({studentDetail.test_submissions?.length || 0})</h4>
                            {studentDetail.test_submissions?.length > 0 ? (
                                <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                                    <thead><tr><th>Test ID</th><th>Ball</th><th>Natija</th></tr></thead>
                                    <tbody>
                                        {studentDetail.test_submissions.map(t => (
                                            <tr key={t.id}>
                                                <td>#{t.test_id}</td>
                                                <td><strong>{t.score}/{t.total}</strong></td>
                                                <td><span className={`badge ${t.passed ? 'badge-success' : 'badge-danger'}`}>{t.passed ? '✅ O\'tdi' : '❌ O\'tmadi'}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="empty-text">Test topshiriqlar yo'q</p>}
                        </div>

                        {/* Homework */}
                        <div className="detail-section">
                            <h4>📋 Uyga vazifalar ({studentDetail.homework_submissions?.length || 0})</h4>
                            {studentDetail.homework_submissions?.length > 0 ? (
                                <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                                    <thead><tr><th>Vazifa ID</th><th>Baho</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {studentDetail.homework_submissions.map(h => (
                                            <tr key={h.id}>
                                                <td>#{h.homework_id}</td>
                                                <td>{h.score !== null ? <strong>{h.score}/2</strong> : '—'}</td>
                                                <td><span className={`badge ${h.is_graded ? 'badge-success' : 'badge-warning'}`}>{h.is_graded ? '✅ Baholangan' : '⏳ Kutilmoqda'}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="empty-text">Vazifa topshiriqlar yo'q</p>}
                        </div>

                        {/* Lesson Progress */}
                        <div className="detail-section">
                            <h4>📊 Dars progressi ({studentDetail.lesson_progress?.length || 0})</h4>
                            {studentDetail.lesson_progress?.length > 0 ? (
                                <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                                    <thead><tr><th>Dars</th><th>Video</th><th>Test</th><th>Vazifa</th><th>Tugallandi</th></tr></thead>
                                    <tbody>
                                        {studentDetail.lesson_progress.map((lp, i) => (
                                            <tr key={i}>
                                                <td>#{lp.lesson_id}</td>
                                                <td>{lp.video_watched ? '✅' : '❌'}</td>
                                                <td>{lp.test_passed ? '✅' : '❌'}</td>
                                                <td>{lp.homework_submitted ? '✅' : '❌'}</td>
                                                <td><span className={`badge ${lp.is_completed ? 'badge-success' : 'badge-warning'}`}>{lp.is_completed ? '✅' : '⏳'}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="empty-text">Progress yo'q</p>}
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
