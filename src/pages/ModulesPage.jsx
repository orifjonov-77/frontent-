import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, paymentsAPI } from '../api/client';
import { BookOpen, Lock, CheckCircle, ArrowRight, Loader, CreditCard, PlayCircle, Layers } from 'lucide-react';
import './ModulesPage.css';

export default function ModulesPage() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myPayments, setMyPayments] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const promises = [coursesAPI.getModules()];
            if (user) promises.push(paymentsAPI.getMy());
            const results = await Promise.all(promises);
            setModules(results[0].data);
            if (user && results[1]) setMyPayments(results[1].data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const isPaid = (moduleId) => {
        return myPayments.some(p => p.module_id === moduleId && (p.status === 'approved' || p.status === 'auto_approved'));
    };
    const isPending = (moduleId) => {
        return myPayments.some(p => p.module_id === moduleId && p.status === 'pending');
    };

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;

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
                <h1>Modullar</h1>
                <p>O'zingizga mos modulni tanlang va o'rganishni boshlang</p>
            </div>

            <div className="modules-list">
                {modules.map((m, i) => (
                    <div key={m.id} className="module-block card">
                        <div className="module-header">
                            <div className="module-emoji" style={{ background: `${gradients[i % 5].replace('linear-gradient(135deg, ', '').split(',')[0]}15`, color: gradients[i % 5].replace('linear-gradient(135deg, ', '').split(',')[0] }}>
                                {icons[i % 5]}
                            </div>
                            <div className="module-info">
                                <h2>{m.name}</h2>
                                <p>{m.description}</p>
                            </div>
                            <div className="module-pricing">
                                <span className="price">{m.price?.toLocaleString()} so'm</span>
                                {isPaid(m.id) ? (
                                    <span className="badge badge-success"><CheckCircle size={12} /> To'langan</span>
                                ) : isPending(m.id) ? (
                                    <span className="badge badge-warning"><Loader size={12} /> Tekshirilmoqda</span>
                                ) : (
                                    <Link to={`/payment/${m.id}`} className="btn btn-primary btn-sm">
                                        <CreditCard size={14} /> To'lash
                                    </Link>
                                )}
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
                                            {c.description && <p className="course-card-desc">{c.description}</p>}
                                            <div className="course-card-footer">
                                                <span className="course-lessons-count">
                                                    <Layers size={12} /> {c.lessons_count || 0} dars
                                                </span>
                                                <ArrowRight size={16} className="course-card-arrow" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
