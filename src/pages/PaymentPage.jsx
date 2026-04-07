import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI, coursesAPI } from '../api/client';
import { getModulePrice } from '../config/prices';
import { CreditCard, Upload, Loader, CheckCircle, AlertCircle, ArrowLeft, Clock, Image, Copy, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import './PaymentPage.css';

export default function PaymentPage() {
    const { moduleId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cardInfo, setCardInfo] = useState(null);
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadData();
    }, [moduleId]);

    const loadData = async () => {
        try {
            const [cardRes, modulesRes] = await Promise.all([
                paymentsAPI.getCardInfo(),
                coursesAPI.getModules()
            ]);
            setCardInfo(cardRes.data);
            setModules(modulesRes.data);
            const m = modulesRes.data.find(m => m.id === parseInt(moduleId));
            setSelectedModule(m);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(f);
        }
    };

    const handleCopyCard = async () => {
        if (!cardInfo) return;
        try {
            await navigator.clipboard.writeText(cardInfo.card_number.replace(/\s/g, ''));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        setSubmitting(true);
        setResult(null);

        const formData = new FormData();
        formData.append('module_id', parseInt(moduleId));
        formData.append('check_image', file);

        try {
            const res = await paymentsAPI.submitCheck(formData);
            const data = res.data;
            setResult({
                success: true,
                message: data.message || "✅ To'lov cheki yuborildi! Admin tekshirib tasdiqlagandan so'ng kurslar ochiladi.",
                aiComment: data.ai_comment
            });
        } catch (err) {
            const detail = err.response?.data?.detail || 'Xatolik yuz berdi';
            setResult({ success: false, message: detail });
        }
        setSubmitting(false);
    };

    if (!user) { navigate('/login'); return null; }
    if (loading) return (
        <div className="page-loader">
            <div className="branded-loader">
                <img src="/logo.png" alt="MDev" className="branded-loader-logo" />
                <span className="branded-loader-text">MDev...</span>
                <div className="branded-loader-dots"><span></span><span></span><span></span></div>
            </div>
        </div>
    );

    return (
        <div className="payment-page container animate-fade">
            <button onClick={() => navigate(-1)} className="back-link"><ArrowLeft size={16} /> Orqaga</button>

            <div className="payment-wrapper">
                {/* Stepper */}
                <div className="payment-stepper">
                    <div className={`step ${!result ? 'active' : 'done'}`}>
                        <div className="step-num">{!result ? '1' : <Check size={14} />}</div>
                        <span>Pul o'tkazing</span>
                    </div>
                    <div className="step-line" />
                    <div className={`step ${!result ? '' : 'active'}`}>
                        <div className="step-num">2</div>
                        <span>Chek yuklang</span>
                    </div>
                    <div className="step-line" />
                    <div className="step">
                        <div className="step-num">3</div>
                        <span>Admin tasdiqlaydi</span>
                    </div>
                </div>

                <div className="payment-card card">
                    <h1><CreditCard size={24} /> To'lov</h1>
                    {selectedModule && (
                        <div className="module-info-pay">
                            <div className="module-pay-icon">💳</div>
                            <h3>{selectedModule.name}</h3>
                            <p className="price">{getModulePrice(selectedModule.name, selectedModule.price).toLocaleString()} so'm</p>
                        </div>
                    )}

                    {/* Card Info */}
                    {cardInfo && (
                        <div className="card-info-box">
                            <h4>💳 Karta ma'lumotlari</h4>
                            <div className="card-detail card-number-row">
                                <span>Karta raqam:</span>
                                <div className="card-number-copy">
                                    <strong>{cardInfo.card_number}</strong>
                                    <button className="copy-btn" onClick={handleCopyCard} title="Nusxa olish">
                                        {copied ? <Check size={14} className="copy-done" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="card-detail">
                                <span>Egasi:</span>
                                <strong>{cardInfo.card_holder}</strong>
                            </div>
                            <div className="card-detail">
                                <span>Muddat:</span>
                                <strong>{cardInfo.card_expiry}</strong>
                            </div>
                            <p className="card-note">
                                <ShieldCheck size={14} /> Yuqoridagi kartaga pul o'tkazing va chek skrinshotini yuklang
                            </p>
                        </div>
                    )}

                    {result ? (
                        <div className={`result-box ${result.success ? 'pending' : 'error'}`}>
                            {result.success ? <Clock size={36} /> : <AlertCircle size={36} />}
                            <p className="result-msg">{result.message}</p>
                            {result.aiComment && (
                                <p className="ai-comment">🤖 AI izoh: {result.aiComment}</p>
                            )}
                            <div className="result-actions">
                                <button onClick={() => navigate('/modules')} className="btn btn-primary">
                                    Modullarga qaytish <ArrowRight size={16} />
                                </button>
                                <button onClick={() => { setResult(null); setFile(null); setPreview(null); }} className="btn btn-secondary">
                                    Yana yuklash
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="upload-form">
                            <div className="form-group">
                                <label>To'lov cheki (screenshot)</label>
                                <div className={`file-upload ${preview ? 'has-file' : ''}`}>
                                    <input type="file" accept="image/*" onChange={handleFileChange} required />
                                    <div className="file-label">
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="check-preview" />
                                        ) : (
                                            <>
                                                <div className="upload-icon-wrapper">
                                                    <Upload size={28} />
                                                </div>
                                                <span className="upload-text">Rasmni tanlang yoki bu yerga tashlang</span>
                                                <span className="upload-hint">PNG, JPG, WEBP — 10MB gacha</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {file && <p className="file-name"><Image size={14} /> {file.name}</p>}
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={submitting || !file}>
                                {submitting ? (
                                    <><Loader size={18} className="spin" /> Yuborilmoqda...</>
                                ) : (
                                    <><Upload size={18} /> Chekni yuborish</>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
