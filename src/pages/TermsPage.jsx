import { BookOpen, Shield, Clock, CheckCircle, AlertCircle, CreditCard, Star, Award, FileText, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import './TermsPage.css';

export default function TermsPage() {
    const { t } = useLang();

    return (
        <div className="terms-page animate-fade">
            <div className="terms-hero">
                <div className="terms-hero-bg" />
                <h1>{t('termsTitle')}</h1>
                <p>{t('termsSubtitle')}</p>
            </div>

            <div className="terms-grid">
                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                        <Shield size={24} />
                    </div>
                    <h3>{t('registration')}</h3>
                    <ul>
                        <li>{t('t_reg1')}</li>
                        <li>{t('t_reg2')}</li>
                        <li>{t('t_reg3')}</li>
                        <li>{t('t_reg4')}</li>
                    </ul>
                </div>

                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <CreditCard size={24} />
                    </div>
                    <h3>{t('paymentRules')}</h3>
                    <ul>
                        <li><strong>{t('t_pay1')}</strong></li>
                        <li><strong>{t('t_pay2')}</strong></li>
                        <li><strong>{t('t_pay3')}</strong></li>
                        <li>{t('t_pay4')}</li>
                        <li>{t('t_pay5')}</li>
                        <li>{t('t_pay6')}</li>
                    </ul>
                </div>

                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <BookOpen size={24} />
                    </div>
                    <h3>{t('lessonsOrder')}</h3>
                    <ul>
                        <li><strong>{t('t_les1')}</strong></li>
                        <li>{t('t_les2')}</li>
                        <li>{t('t_les3')}</li>
                        <li>{t('t_les4')}</li>
                    </ul>
                </div>

                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <FileText size={24} />
                    </div>
                    <h3>{t('testRules')}</h3>
                    <ul>
                        <li>{t('t_test1')}</li>
                        <li>{t('t_test2')}</li>
                        <li>{t('t_test3')}</li>
                        <li>{t('t_test4')}</li>
                    </ul>
                </div>

                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                        <CheckCircle size={24} />
                    </div>
                    <h3>{t('hwOrder')}</h3>
                    <ul>
                        <li>{t('t_hw1')}</li>
                        <li>{t('t_hw2')}</li>
                        <li>{t('t_hw3')}</li>
                    </ul>
                </div>

                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                        <Award size={24} />
                    </div>
                    <h3>{t('ratingBonus')}</h3>
                    <ul>
                        <li>{t('t_rat1')}</li>
                        <li>{t('t_rat2')}</li>
                    </ul>
                </div>

                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                        <MessageCircle size={24} />
                    </div>
                    <h3>{t('helpChat')}</h3>
                    <ul>
                        <li>{t('t_chat1')}</li>
                        <li>{t('t_chat2')}</li>
                    </ul>
                </div>

                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                        <Star size={24} />
                    </div>
                    <h3>{t('contact')}</h3>
                    <ul>
                        <li><strong>Muhammaddiyor Orifjonov</strong></li>
                        <li>Full-stack developer</li>
                        <li>📞 +998889810206</li>
                    </ul>
                </div>
            </div>

            <div className="terms-footer">
                <p>{t('termsAgree')}</p>
                <Link to="/modules" className="btn btn-primary btn-lg">
                    {t('goToLessons')} →
                </Link>
            </div>
        </div>
    );
}
