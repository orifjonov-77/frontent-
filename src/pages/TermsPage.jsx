import { BookOpen, Shield, Clock, CheckCircle, AlertCircle, CreditCard, Star, Award, FileText, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './TermsPage.css';

export default function TermsPage() {
    return (
        <div className="terms-page animate-fade">
            <div className="terms-hero">
                <div className="terms-hero-bg" />
                <h1>📋 Platforma qoidalari</h1>
                <p>MDev Academy platformasida o'qish tartibi va qoidalar</p>
            </div>

            <div className="terms-grid">
                {/* Registration */}
                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                        <Shield size={24} />
                    </div>
                    <h3>Ro'yxatdan o'tish</h3>
                    <ul>
                        <li>Telegram orqali ro'yxatdan o'tiladi</li>
                        <li>Telefon raqam va to'liq ism talab qilinadi</li>
                        <li>SMS orqali tasdiqlash kodi yuboriladi</li>
                        <li>Har bir foydalanuvchi faqat 1 ta akkauntga ega bo'ladi</li>
                    </ul>
                </div>

                {/* Payment */}
                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <CreditCard size={24} />
                    </div>
                    <h3>To'lov tartibi</h3>
                    <ul>
                        <li>Kompyuter savodxonligi — <strong>100,000 so'm</strong></li>
                        <li>Dasturlash — <strong>130,000 so'm</strong></li>
                        <li>Montaj — <strong>90,000 so'm</strong></li>
                        <li>To'lov qilingandan keyin modul umrbod ochiladi</li>
                        <li>Chekni "To'lov" bo'limidan yuboring</li>
                        <li>Admin tasdiqlashi kerak (1-24 soat ichida)</li>
                    </ul>
                </div>

                {/* Lessons */}
                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <BookOpen size={24} />
                    </div>
                    <h3>Darslar tartibi</h3>
                    <ul>
                        <li>Har bir darsda: <strong>Video → Test → Vazifa</strong></li>
                        <li>Avval videoni ko'ring, keyin testni yeching</li>
                        <li>Test yechganingizdan keyin vazifa topshiring</li>
                        <li>Admin vazifani tasdiqlagandan keyin keyingi video ochiladi</li>
                        <li>To'lov qilgan modulning barcha darslari umrbod ochiladi</li>
                    </ul>
                </div>

                {/* Tests */}
                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <FileText size={24} />
                    </div>
                    <h3>Test qoidalari</h3>
                    <ul>
                        <li>Har bir testda <strong>10 ta savol</strong> bo'ladi</li>
                        <li>Vaqt: <strong>7 daqiqa</strong> (avtomatik boshlanadi)</li>
                        <li>Har bir darsda faqat <strong>1 marta</strong> test yechiladi</li>
                        <li>Test vaqtida boshqa sahifaga <strong>o'tib bo'lmaydi</strong></li>
                        <li>Sahifadan chiqsangiz test <strong>avtomatik topshiriladi</strong></li>
                        <li><strong>0-3 to'g'ri = Baho 1</strong> (Qoniqarli)</li>
                        <li><strong>4-6 to'g'ri = Baho 2</strong> (Yaxshi)</li>
                        <li><strong>7+ to'g'ri = Baho 3</strong> (A'lo)</li>
                    </ul>
                </div>

                {/* Homework */}
                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                        <CheckCircle size={24} />
                    </div>
                    <h3>Vazifa tartibi</h3>
                    <ul>
                        <li>Vazifani <strong>matn</strong> yoki <strong>fayl yuklash</strong> orqali topshiring</li>
                        <li>Fayl hajmi <strong>10MB</strong> dan oshmasin</li>
                        <li>Admin vazifani tekshiradi va baho qo'yadi</li>
                        <li><strong>Baho: 0, 1 yoki 2</strong> (admin tomonidan)</li>
                        <li>Vazifa <strong>tasdiqlangandan keyin</strong> keyingi video ochiladi</li>
                        <li>Agar natija qoniqarsiz bo'lsa, qayta topshirish mumkin</li>
                    </ul>
                </div>

                {/* Rating & Bonus */}
                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                        <Award size={24} />
                    </div>
                    <h3>Reyting va Bonus</h3>
                    <ul>
                        <li>Barcha o'quvchilar test va vazifa baholari bo'yicha <strong>reytingda</strong></li>
                        <li>Reyting har <strong>hafta</strong> yangilanadi</li>
                        <li>Haftaning <strong>1-o'rindagi</strong> o'quvchisi <strong>bonus</strong> oladi</li>
                        <li>Bonus = <strong>1 ta vazifani bajarmasdan</strong> keyingi videoni ko'rish</li>
                        <li>Bonus faqat 1 marta ishlatiladi</li>
                    </ul>
                </div>

                {/* Chat */}
                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                        <MessageCircle size={24} />
                    </div>
                    <h3>Yordam va chat</h3>
                    <ul>
                        <li>AI chatbot 3 tilda javob beradi: <strong>O'zbek, Rus, Ingliz</strong></li>
                        <li>Kurs, narx, to'lov haqida savollar berish mumkin</li>
                        <li>Murakkab savollar <strong>admin</strong>ga yo'naltiriladi</li>
                        <li>Admin ishchi kunlarda <strong>24 soat ichida</strong> javob beradi</li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="terms-card">
                    <div className="terms-card-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                        <Star size={24} />
                    </div>
                    <h3>Aloqa</h3>
                    <ul>
                        <li>O'qituvchi: <strong>Muhammaddiyor Orifjonov</strong></li>
                        <li>3+ yil IT sohasida tajriba</li>
                        <li>Full-stack developer</li>
                        <li>Savollar uchun chat yoki Telegram orqali murojaat qiling</li>
                    </ul>
                </div>
            </div>

            <div className="terms-footer">
                <p>Platformadan foydalanish orqali siz ushbu qoidalarga rozilik bildirasiz.</p>
                <Link to="/modules" className="btn btn-primary btn-lg">
                    Darslarga o'tish →
                </Link>
            </div>
        </div>
    );
}
