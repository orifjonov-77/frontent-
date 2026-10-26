import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../api/client';
import { Phone, Key, User, Loader, ArrowRight, Bot, LogIn, UserPlus, CheckCircle } from 'lucide-react';
import myLogo from '../assets/mylogo.png';
import './LoginPage.css';

export default function LoginPage() {
  // mode: 'register' (Ro'yxatdan o'tish: Ism + Nomer -> @mdevsayt_bot -> 6 xonali Kod)
  //       'login'    (Kirish: Nomer -> @mdevsayt_bot -> 6 xonali Kod)
  const [mode, setMode] = useState('register');
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [botLink, setBotLink] = useState('https://t.me/mdevsayt_bot?start=link');
  const [codeSent, setCodeSent] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/modules', { replace: true });
    }
  }, [user, navigate]);

  const cleanPhone = (val) => val.replace(/[^\d+]/g, '');

  // 1-QADAM: Ism + Nomer (Ro'yxatdan o'tish) YOKI faqat Nomer (Kirish) -> Botga kod yuborish
  const handleStep1 = async (e) => {
    e.preventDefault();
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 9) {
      setError(t('invalidPhone'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register({
        phone: cleanPhone(phone),
        full_name: mode === 'register' ? (fullName.trim() || null) : null,
      });
      if (res.data.bot_link) {
        setBotLink(res.data.bot_link);
      }
      setCodeSent(Boolean(res.data.linked));
      if (res.data.linked) {
        toast.success('Tasdiqlash kodi @mdevsayt_bot ga yuborildi!');
      }
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.detail || t('errorOccurred');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 2-QADAM: @mdevsayt_bot ga kelgan 6 xonali kodni tekshirib kirish (100% xavfsiz)
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (code.trim().length < 4) {
      setError(t('wrongCode'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register({
        phone: cleanPhone(phone),
        code: code.trim(),
        full_name: mode === 'register' ? (fullName.trim() || undefined) : undefined,
      });
      login(res.data.access_token, res.data.user);
      toast.success(t('welcome'));
      navigate(res.data.user?.role === 'admin' ? '/admin' : '/modules');
    } catch (err) {
      const msg = err.response?.data?.detail || t('wrongCode');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <div style={{ minHeight: '50px' }}>
            <img src={myLogo} alt="MDev Platform Logo" className="login-logo" />
          </div>
          <h1>{t('platformTitle')}</h1>
          <p>{t('platformSubtitle')}</p>
        </div>

        {/* Yonma-yon 2 ta tab: Ro'yxatdan o'tish | Kirish */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-mode-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setStep(1);
              setCode('');
              setError('');
            }}
          >
            <UserPlus size={16} />
            <span>{t('registration')}</span>
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setStep(1);
              setCode('');
              setError('');
            }}
          >
            <LogIn size={16} />
            <span>{t('login')}</span>
          </button>
        </div>

        {error ? <div className="login-error" role="alert">{error}</div> : null}

        {/* ====== 1-QADAM: Ro'yxatdan o'tish (Ism + Nomer) YOKI Kirish (Nomer) ====== */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="login-form">
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="auth-name">
                  <User size={14} /> <span>{t('yourName')}</span>
                </label>
                <input
                  id="auth-name"
                  className="input"
                  placeholder={t('yourName')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-phone">
                <Phone size={14} /> <span>{t('phoneNumber')}</span>
              </label>
              <input
                id="auth-phone"
                type="tel"
                className="input"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? (
                <Loader size={18} className="spin" />
              ) : (
                <>
                  <ArrowRight size={18} /> <span>{t('continue')}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ====== 2-QADAM: @mdevsayt_bot + 6 xonali kodni kiritish ====== */}
        {step === 2 && (
          <div className="login-step2">
            <div className="bot-instructions">
              <Bot size={34} className="bot-icon" />
              <h3>@mdevsayt_bot</h3>
              {codeSent ? (
                <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <CheckCircle size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  6 xonali kod Telegram botingizga yuborildi!
                </p>
              ) : null}
              <div className="bot-steps-list">
                <p>1. Quyidagi tugmani bosib <b>@mdevsayt_bot</b> ga o'ting</p>
                <p>2. Botda <b>"📱 Telefon raqamni ulash"</b> tugmasini bosing</p>
                <p>3. Bot sizga bergan <b>6 xonali kodni</b> pastga kiriting</p>
              </div>
              <a
                href={botLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Bot size={18} /> <span>@mdevsayt_bot ga o'tish</span>
              </a>
            </div>

            <form onSubmit={handleVerifyCode} className="login-form">
              <div className="form-group">
                <label htmlFor="auth-code">
                  <Key size={14} /> <span>{t('enterCode')}</span>
                </label>
                <input
                  id="auth-code"
                  type="text"
                  inputMode="numeric"
                  className="input code-input"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading || code.length < 4}
              >
                {loading ? (
                  <Loader size={18} className="spin" />
                ) : (
                  <>
                    <Key size={18} /> <span>{t('login')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
                onClick={() => {
                  setStep(1);
                  setCode('');
                  setError('');
                }}
              >
                <span>{t('back')}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
