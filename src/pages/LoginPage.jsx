import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import { Phone, Key, Loader, ArrowRight, Bot } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1=phone, 2=code
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [botLink, setBotLink] = useState('');
  const [isNew, setIsNew] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register({
        phone,
        full_name: fullName || null,
      });
      setBotLink(res.data.bot_link);
      setIsNew(res.data.is_new);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Xatolik yuz berdi");
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login({ phone, code });
      login(res.data.access_token, res.data.user);
      navigate('/modules');
    } catch (err) {
      setError(err.response?.data?.detail || "Kod noto'g'ri");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card card animate-fade">
        <div className="login-header">
          <img src="../src/assets/mylogo.png" alt="MDev" className="login-logo" onError={(e) => { e.target.style.display = 'none'; }} />
          <h1>MDev Platform</h1>
          <p>Online ta'lim platformasi</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label><Phone size={14} /> Ismingiz</label>
              <input className="input" placeholder="Ismingiz"
                value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="form-group">
              <label><Phone size={14} /> Telefon raqam</label>
              <input className="input" placeholder="998901234567" required
                value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <Loader size={18} className="spin" /> : <><ArrowRight size={18} /> Davom etish</>}
            </button>
          </form>
        ) : (
          <div className="login-step2">
            <div className="bot-instructions">
              <Bot size={32} className="bot-icon" />
              <h3>{isNew ? "Ro'yxatdan o'tdingiz!" : "Xush kelibsiz!"}</h3>
              <p>1. Quyidagi tugmani bosib botga o'ting</p>
              <p>2. Telefon raqamingizni yuboring</p>
              <p>3. Bot sizga 6 raqamli kod beradi</p>
              <p>4. Kodni pastga kiriting</p>
              <a href={botLink} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-lg" style={{ width: '100%' }}>
                <Bot size={18} /> Telegram Botga o'tish
              </a>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label><Key size={14} /> Kodni kiriting</label>
                <input className="input code-input" placeholder="123456" maxLength={6} required
                  value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? <Loader size={18} className="spin" /> : <><Key size={18} /> Kirish</>}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%' }}
                onClick={() => { setStep(1); setError(''); }}>
                ← Orqaga
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
