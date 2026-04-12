import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../api/client';
import { Phone, Key, Loader, ArrowRight, Bot } from 'lucide-react';
import myLogo from '../assets/mylogo.png';
import './LoginPage.css';

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [botLink, setBotLink] = useState('');
  const [isNew, setIsNew] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();
  const toast = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register({ phone, full_name: fullName || null });
      setBotLink(res.data.bot_link);
      setIsNew(res.data.is_new);
      setStep(2);
      toast.success(res.data.is_new ? t('registered') : t('welcome'));
    } catch (err) {
      const msg = err.response?.data?.detail || t('errorOccurred');
      setError(msg);
      toast.error(msg);
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
      toast.success(t('welcome'));
      navigate('/modules');
    } catch (err) {
      const msg = err.response?.data?.detail || t('wrongCode');
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <div style={{ minHeight: '50px' }}>
            <img src={myLogo} alt="MDev" className="login-logo" />
          </div>
          <h1>{t('platformTitle')}</h1>
          <p>{t('platformSubtitle')}</p>
        </div>

        {error ? <div className="login-error">{error}</div> : null}

        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label><Phone size={14} /> <span>{t('yourName')}</span></label>
              <input
                className="input"
                placeholder={t('yourName')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label><Phone size={14} /> <span>{t('phoneNumber')}</span></label>
              <input
                className="input"
                placeholder="998901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading
                ? <Loader size={18} className="spin" />
                : <span><ArrowRight size={18} /> <span>{t('continue')}</span></span>
              }
            </button>
          </form>
        </div>

        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <div className="login-step2">
            <div className="bot-instructions">
              <Bot size={32} className="bot-icon" />
              <h3>{isNew ? t('registered') : t('welcome')}</h3>
              <p>{t('botStep1')}</p>
              <p>{t('botStep2')}</p>
              <p>{t('botStep3')}</p>
              <p>{t('botStep4')}</p>
              <a
                href={botLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent btn-lg"
                style={{ width: '100%' }}
              >
                <Bot size={18} /> <span>{t('goToBot')}</span>
              </a>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label><Key size={14} /> <span>{t('enterCode')}</span></label>
                <input
                  className="input code-input"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading
                  ? <Loader size={18} className="spin" />
                  : <span><Key size={18} /> <span>{t('login')}</span></span>
                }
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
                onClick={() => { setStep(1); setError(''); }}
              >
                <span>{t('back')}</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
