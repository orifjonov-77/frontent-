import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI, coursesAPI, clearApiCache } from '../api/client';
import {
    LayoutDashboard, Users, BookOpen, FileText, CreditCard, Gamepad2, Award,
    Plus, Trash2, Check, X, Eye, Loader, Send, Edit3, ChevronDown, ChevronRight,
    Layers, FolderOpen, PlayCircle, Save, RefreshCw, AlertCircle, Search,
    MessageCircle, ArrowLeft, ExternalLink
} from 'lucide-react';
import { chatAPI } from '../api/client';
import './AdminPage.css';

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

    useEffect(() => {
        if (!isAdmin) { navigate('/'); return; }
        loadTab();
    }, [tab, isAdmin]);

    useEffect(() => { loadSelectData(); }, []);

    useEffect(() => {
        if (selModule) {
            adminAPI.getCoursesSelect(selModule).then(r => setCourses(r.data)).catch(() => { });
        } else { setCourses([]); }
        setSelCourse(''); setSelLesson(''); setLessons([]);
    }, [selModule]);

    useEffect(() => {
        if (selCourse) {
            adminAPI.getLessonsSelect(selCourse).then(r => setLessons(r.data)).catch(() => { });
            loadLessonsForCourse(selCourse);
        } else { setLessons([]); }
        setSelLesson('');
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
                case 'dashboard': setData((await adminAPI.dashboard()).data); break;
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
            const res = await chatAPI.getMessages(studentId);
            setChatMessages(res.data);
        } catch (err) { console.error(err); }
        setChatLoading(false);
    };

    const sendReply = async () => {
        if (!chatReply.trim() || !selectedChat) return;
        try {
            await chatAPI.adminReply(selectedChat, { message: chatReply });
            setChatReply('');
            const res = await chatAPI.getMessages(selectedChat);
            setChatMessages(res.data);
            await loadConversations();
        } catch (err) { showMsg('Xabar yuborilmadi', true); }
    };

    const showMsg = (text, isError = false) => {
        setMsg(isError ? '❌ ' + text : '✅ ' + text);
        setTimeout(() => setMsg(''), 4000);
    };

    // Open modal
    const openModal = (type) => {
        setModalType(type);
        setFormData({});
        setTestQuestions([{ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', order: 1 }]);
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
                    const validQs = testQuestions.filter(q => q.question.trim());
                    await adminAPI.createTest({
                        lesson_id: parseInt(selLesson),
                        title: formData.title || 'Test',
                        time_limit: parseInt(formData.time_limit) || 300,
                        passing_score: parseInt(formData.passing_score) || 7,
                        questions: validQs
                    });
                    closeModal(); break;
                }
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
        { id: 'chat', icon: <MessageCircle size={16} />, label: 'Chat' },
        { id: 'homework', icon: <FileText size={16} />, label: 'Vazifalar' },
        { id: 'certificates', icon: <Award size={16} />, label: 'Sertifikat' },
    ];

    const contentTabs = [
        { id: 'modules', icon: <Layers size={14} />, label: 'Modullar' },
        { id: 'courses', icon: <FolderOpen size={14} />, label: 'Kurslar' },
        { id: 'lessons', icon: <PlayCircle size={14} />, label: 'Darslar' },
        { id: 'tests', icon: <FileText size={14} />, label: 'Testlar' },
        { id: 'homeworkTab', icon: <BookOpen size={14} />, label: 'Vazifalar' },
        { id: 'games', icon: <Gamepad2 size={14} />, label: "O'yinlar" },
    ];

    // Cascading Selects component
    const CascadingSelect = ({ showLesson = false }) => (
        <div className="cascading-selects">
            <select className="input" value={selModule} onChange={e => setSelModule(e.target.value)}>
                <option value="">📦 Modul tanlang</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {selModule && (
                <select className="input" value={selCourse} onChange={e => setSelCourse(e.target.value)}>
                    <option value="">📚 Kurs tanlang</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            )}
            {showLesson && selCourse && (
                <select className="input" value={selLesson} onChange={e => setSelLesson(e.target.value)}>
                    <option value="">📖 Dars tanlang</option>
                    {lessons.map(l => <option key={l.id} value={l.id}>
                        #{l.order} — {l.title} {l.has_test ? '✅' : ''} {l.has_homework ? '📝' : ''} {l.has_game ? '🎮' : ''}
                    </option>)}
                </select>
            )}
        </div>
    );

    // Modal component
    const Modal = ({ open, title, children }) => {
        if (!open) return null;
        return (
            <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-box" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>{title}</h3>
                        <button className="modal-close" onClick={closeModal}><X size={18} /></button>
                    </div>
                    <div className="modal-body">{children}</div>
                </div>
            </div>
        );
    };

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
                    <div className="page-loader"><div className="spinner" /></div>
                ) : (
                    <>
                        {/* ============ DASHBOARD ============ */}
                        {tab === 'dashboard' && data && (
                            <div className="stats-grid stagger-children">
                                {[
                                    { label: "O'quvchilar", value: data.total_students, color: '#6c5ce7' },
                                    { label: 'Modullar', value: data.total_modules, color: '#10b981' },
                                    { label: 'Kurslar', value: data.total_courses, color: '#3b82f6' },
                                    { label: 'Darslar', value: data.total_lessons, color: '#f59e0b' },
                                    { label: "Kutilayotgan to'lov", value: data.pending_payments, color: '#ef4444' },
                                    { label: "Tasdiqlangan to'lov", value: data.approved_payments, color: '#10b981' },
                                ].map((s, i) => (
                                    <div key={i} className="stat-card card">
                                        <span className="stat-label">{s.label}</span>
                                        <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
                                    </div>
                                ))}
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
                                            <div key={c.student_id} className="conv-card card" onClick={() => openChat(c.student_id)}>
                                                <div className="conv-info">
                                                    <strong>{c.student_name}</strong>
                                                    <small>{c.student_phone}</small>
                                                    <p className="conv-last">{c.last_message}</p>
                                                </div>
                                                <div className="conv-meta">
                                                    {c.unread > 0 && <span className="unread-dot">{c.unread}</span>}
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
                                            </span>
                                            <button className="btn btn-sm btn-secondary" onClick={() => openChat(selectedChat)}>
                                                <RefreshCw size={14} />
                                            </button>
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
                                    <thead><tr><th>O'quvchi</th><th>Vazifa</th><th>Javob</th><th>Baho</th><th>Amal</th></tr></thead>
                                    <tbody>
                                        {Array.isArray(data) && data.map(s => (
                                            <tr key={s.id}>
                                                <td><strong>{s.user_name}</strong></td>
                                                <td>{s.homework_title}</td>
                                                <td className="td-text">{s.answer_text?.slice(0, 100)}</td>
                                                <td>{s.is_graded ? <span className="badge badge-success">{s.score}/10</span> : <span className="badge badge-warning">—</span>}</td>
                                                <td>
                                                    {!s.is_graded && (
                                                        <div className="grade-form">
                                                            <select id={`score-${s.id}`} className="input" style={{ width: '60px' }}>
                                                                {[...Array(11)].map((_, i) => <option key={i} value={i}>{i}</option>)}
                                                            </select>
                                                            <button className="btn btn-sm btn-primary" onClick={() =>
                                                                handleAction('gradeHomework', s.id, document.getElementById(`score-${s.id}`).value, '')
                                                            }>Baho</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
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
                                        <CascadingSelect />
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
                                        <CascadingSelect showLesson />
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
                                        <CascadingSelect showLesson />
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
                                        <CascadingSelect showLesson />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ============ MODALS ============ */}

            {/* Module Modal */}
            <Modal open={modalOpen && modalType === 'module'} title="Yangi Modul">
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
            <Modal open={modalOpen && modalType === 'course'} title="Yangi Kurs">
                <div className="modal-form">
                    <CascadingSelect />
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
            <Modal open={modalOpen && modalType === 'lesson'} title="Yangi Dars">
                <div className="modal-form">
                    <CascadingSelect />
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
            <Modal open={modalOpen && modalType === 'test'} title="Yangi Test">
                <div className="modal-form">
                    {!selLesson && <p className="form-hint" style={{ color: 'var(--danger)' }}>⚠️ Avval Content → Testlar tabida Modul → Kurs → Dars tanlang</p>}
                    {selLesson && <>
                        <div className="form-row">
                            <div className="form-group"><label>Test sarlavhasi</label><input className="input" value={formData.title || ''} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
                            <div className="form-group"><label>Vaqt (soniya)</label><input className="input" type="number" placeholder="300" value={formData.time_limit || ''} onChange={e => setFormData(p => ({ ...p, time_limit: e.target.value }))} /></div>
                            <div className="form-group"><label>O'tish bali</label><input className="input" type="number" placeholder="7" value={formData.passing_score || ''} onChange={e => setFormData(p => ({ ...p, passing_score: e.target.value }))} /></div>
                        </div>

                        <div className="questions-section">
                            <div className="section-header">
                                <h4>📝 Savollar ({testQuestions.length})</h4>
                                <button className="btn btn-sm btn-secondary" onClick={addQuestion}><Plus size={14} /> Savol</button>
                            </div>

                            {testQuestions.map((q, i) => (
                                <div key={i} className="question-card card">
                                    <div className="question-header">
                                        <span className="q-number">{i + 1}</span>
                                        <button className="btn btn-sm btn-danger" onClick={() => removeQuestion(i)} style={{ marginLeft: 'auto' }}><Trash2 size={12} /></button>
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
                            <button className="btn btn-primary" onClick={() => handleAction('createTest')} disabled={submitting}>
                                {submitting ? <Loader size={16} className="spin" /> : <><Check size={16} /> {testQuestions.length} ta savol bilan saqlash</>}
                            </button>
                        </div>
                    </>}
                </div>
            </Modal>

            {/* Homework Modal */}
            <Modal open={modalOpen && modalType === 'homework'} title="Yangi Vazifa">
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
            <Modal open={modalOpen && modalType === 'game'} title="Yangi O'yin">
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
            <Modal open={modalOpen && modalType === 'cert'} title="Sertifikat yuborish">
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
        </div>
    );
}
