import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { profileAPI, certificatesAPI } from '../api/client';
import { User, Save, Loader, BookOpen, Award, Trophy, ArrowRight, ExternalLink } from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const { t } = useLang();
    const toast = useToast();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [saving, setSaving] = useState(false);
    const [myCourses, setMyCourses] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loadingExtra, setLoadingExtra] = useState(true);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '');
            setBio(user.bio || '');
        }
    }, [user]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [coursesRes, certsRes] = await Promise.allSettled([
                    profileAPI.courses(),
                    certificatesAPI.getMy(),
                ]);
                if (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value.data)) {
                    setMyCourses(coursesRes.value.data);
                }
                if (certsRes.status === 'fulfilled' && Array.isArray(certsRes.value.data)) {
                    setCertificates(certsRes.value.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingExtra(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await profileAPI.update({ full_name: fullName.trim(), bio: bio.trim() });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            toast.success(t('profileUpdated'));
        } catch (err) {
            toast.error(err.response?.data?.detail || t('errorOccurred'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="profile-page container animate-fade">
            <div className="profile-grid">
                {/* Left Column: Profile Form */}
                <div className="profile-card card">
                    <div className="profile-header">
                        <div className="avatar-circle">
                            <User size={32} />
                        </div>
                        <h1>{user?.full_name}</h1>
                        <p className="phone">{user?.phone}</p>
                        <span className={`badge ${user?.role === 'admin' ? 'badge-accent' : 'badge-info'}`}>
                            {user?.role}
                        </span>
                    </div>

                    <form onSubmit={handleSave} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="profile-fullname">{t('fullName')}</label>
                            <input
                                id="profile-fullname"
                                className="input"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile-bio">{t('bio')}</label>
                            <textarea
                                id="profile-bio"
                                className="input"
                                rows={3}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder={t('bioPlaceholder')}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                            {saving ? <Loader size={18} className="spin" /> : <><Save size={18} /> {t('save')}</>}
                        </button>
                    </form>

                    <div className="profile-quick-links">
                        <Link to="/results" className="btn btn-secondary" style={{ width: '100%' }}>
                            <Trophy size={16} /> {t('myResults')} <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>

                {/* Right Column: Enrolled Courses & Certificates */}
                <div className="profile-side">
                    <div className="card profile-section-card">
                        <div className="profile-section-head">
                            <h3><BookOpen size={18} /> {t('myCourses')}</h3>
                            <Link to="/modules" className="profile-link-sm">{t('modules')} →</Link>
                        </div>

                        {loadingExtra ? (
                            <div className="profile-empty"><Loader size={20} className="spin" /></div>
                        ) : myCourses.length === 0 ? (
                            <div className="profile-empty">
                                <p>{t('noCoursesYet')}</p>
                                <Link to="/modules" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                                    {t('goToLessons')}
                                </Link>
                            </div>
                        ) : (
                            <div className="profile-courses-list">
                                {myCourses.map((c) => (
                                    <Link key={c.id} to={`/course/${c.id}`} className="profile-course-item">
                                        <div>
                                            <h4>{c.title}</h4>
                                            {c.description && <p>{c.description}</p>}
                                        </div>
                                        <ArrowRight size={16} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card profile-section-card">
                        <div className="profile-section-head">
                            <h3><Award size={18} /> {t('certificates')}</h3>
                        </div>

                        {loadingExtra ? (
                            <div className="profile-empty"><Loader size={20} className="spin" /></div>
                        ) : certificates.length === 0 ? (
                            <div className="profile-empty">
                                <p>{t('noCertificatesYet')}</p>
                            </div>
                        ) : (
                            <div className="profile-courses-list">
                                {certificates.map((cert) => (
                                    <div key={cert.id} className="profile-course-item">
                                        <div>
                                            <h4>🏆 {cert.title}</h4>
                                            {cert.description && <p>{cert.description}</p>}
                                        </div>
                                        {cert.file_url && (
                                            <a
                                                href={cert.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary btn-sm"
                                            >
                                                <ExternalLink size={14} /> {t('downloadCert')}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
