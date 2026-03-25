import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../api/client';
import { MessageCircle, X, Send, Loader, Bot, User } from 'lucide-react';
import './ChatWidget.css';

const QUICK_QUESTIONS = [
    "Kurslar narxi qancha?",
    "To'lov qanday qilinadi?",
    "Dars ochilmayapti",
];

export default function ChatWidget() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [unread, setUnread] = useState(0);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        const fetchUnread = async () => {
            try {
                const res = await chatAPI.getUnread();
                setUnread(res.data.unread_count || 0);
            } catch { }
        };
        fetchUnread();
        const iv = setInterval(fetchUnread, 30000);
        return () => clearInterval(iv);
    }, [user]);

    useEffect(() => {
        if (!open || !user) return;
        loadMessages();
        const iv = setInterval(loadMessages, 10000);
        return () => clearInterval(iv);
    }, [open, user]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs]);

    const loadMessages = async () => {
        setLoadingMsgs(true);
        try {
            const res = await chatAPI.getMy();
            setMsgs(res.data || []);
            setUnread(0);
        } catch { }
        setLoadingMsgs(false);
    };

    const handleSend = async (message) => {
        const msg = message || text.trim();
        if (!msg) return;
        setText('');
        setSending(true);

        // Optimistic UI
        setMsgs(prev => [...prev, { sender_type: 'student', message: msg, created_at: new Date().toISOString() }]);

        try {
            await chatAPI.send({ message: msg });
            // Reload after delay for AI response
            setTimeout(loadMessages, 2000);
        } catch {
            setMsgs(prev => [...prev, { sender_type: 'system', message: 'Xabar yuborilmadi. Qaytadan urinib ko\'ring.' }]);
        }
        setSending(false);
    };

    if (!user) return <div style={{ display: 'none' }} />;

    return (
        <>
            {/* Chat button */}
            <button className="chat-fab" onClick={() => setOpen(!open)}>
                {open ? <X size={24} /> : <MessageCircle size={24} />}
                {unread > 0 && !open && <span className="chat-badge">{unread}</span>}
            </button>

            {/* Chat window */}
            {open && (
                <div className="chat-window">
                    <div className="chat-header">
                        <Bot size={20} />
                        <div>
                            <h4>MDev Yordamchi</h4>
                            <span>AI + Admin</span>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {loadingMsgs && msgs.length === 0 && (
                            <div className="chat-loading"><Loader size={20} className="spin" /></div>
                        )}

                        {msgs.length === 0 && !loadingMsgs && (
                            <div className="chat-empty">
                                <Bot size={32} />
                                <p>Salom! 👋</p>
                                <p>Savolingiz bormi? Yozing!</p>
                            </div>
                        )}

                        {msgs.map((m, i) => (
                            <div key={i} className={`chat-msg ${m.sender_type === 'student' ? 'mine' : 'other'}`}>
                                <div className="msg-icon">
                                    {m.sender_type === 'student' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className="msg-bubble">{m.message}</div>
                            </div>
                        ))}
                        <div ref={endRef} />
                    </div>

                    {/* Quick questions */}
                    {msgs.length === 0 && (
                        <div className="chat-quick">
                            {QUICK_QUESTIONS.map((q, i) => (
                                <button key={i} className="quick-btn" onClick={() => handleSend(q)}>{q}</button>
                            ))}
                        </div>
                    )}

                    <div className="chat-input-row">
                        <input
                            className="chat-input"
                            placeholder="Xabar yozing..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button className="chat-send" onClick={() => handleSend()} disabled={sending || !text.trim()}>
                            {sending ? <Loader size={18} className="spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
