import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../api/client';
import { User, Save, Loader } from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await profileAPI.update({ full_name: fullName, bio });
            setUser(res.data);
            setMsg("Profil yangilandi!");
        } catch (err) {
            setMsg(err.response?.data?.detail || 'Xatolik');
        }
        setSaving(false);
    };

    return (
        <div className="profile-page container animate-fade">
            <div className="profile-wrapper">
                <div className="profile-card card">
                    <div className="profile-header">
                        <div className="avatar-circle">
                            <User size={32} />
                        </div>
                        <h1>{user?.full_name}</h1>
                        <p className="phone">{user?.phone}</p>
                        <span className={`badge ${user?.role === 'admin' ? 'badge-accent' : 'badge-info'}`}>{user?.role}</span>
                    </div>

                    {msg && <div className="profile-msg">{msg}</div>}

                    <form onSubmit={handleSave} className="profile-form">
                        <div className="form-group">
                            <label>To'liq ism</label>
                            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Bio</label>
                            <textarea className="input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="O'zingiz haqingizda..." />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                            {saving ? <Loader size={18} className="spin" /> : <><Save size={18} /> Saqlash</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
