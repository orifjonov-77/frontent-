import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../api/client';
import { MessageCircle, X, Send, Loader, Bot, User } from 'lucide-react';
import './ChatWidget.css';

const QUICK_QUESTIONS = [
    "Kurslar narxi qancha?",
    "To'lov qanday qilinadi?",
    "Dars ochilmayapti",
    "Dasturlash kursi haqida",
    "Sertifikat qanday olinadi?",
];

export default function ChatWidget() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [unread, setUnread] = useState(0);
    const [typing, setTyping] = useState(false);
    const endRef = useRef(null);

    // Unread count — only when chat is closed
    useEffect(() => {
        if (!user || open) return;
        const fetchUnread = async () => {
            try {
                const res = await chatAPI.getUnread();
                setUnread(res.data.unread || 0);
            } catch { }
        };
        fetchUnread();
        const iv = setInterval(fetchUnread, 60000); // 60s (was 30s)
        return () => clearInterval(iv);
    }, [user, open]);

    // Load messages when chat opens
    useEffect(() => {
        if (!open || !user) return;
        loadMessages();
        const iv = setInterval(loadMessages, 15000); // 15s polling (was 8s)
        return () => clearInterval(iv);
    }, [open, user]);

    // Auto-scroll
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs, typing]);

    const loadMessages = async () => {
        try {
            const res = await chatAPI.getMy();
            setMsgs(res.data || []);
            setUnread(0);
        } catch { }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            return d.toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    const handleSend = async (message) => {
        const msg = message || text.trim();
        if (!msg || sending) return;
        setText('');
        setSending(true);
        setTyping(true);

        // Show user message immediately
        setMsgs(prev => [...prev, {
            is_mine: true,
            is_from_admin: false,
            message: msg,
            created_at: new Date().toISOString(),
            sender_id: user?.id
        }]);

        try {
            await chatAPI.send({ message: msg });
            await loadMessages();
            setTyping(false);
            setTimeout(() => loadMessages(), 3000);
        } catch {
            setMsgs(prev => [...prev, {
                is_mine: false,
                is_from_admin: true,
                sender_id: 0,
                message: 'Xabar yuborilmadi. Qaytadan urinib ko\'ring.'
            }]);
            setTyping(false);
        }
        setSending(false);
    };

    // Close chat + clear messages
    const closeChat = () => {
        setOpen(false);
        setMsgs([]);
        setTyping(false);
        setText('');
    };

    const toggleChat = () => {
        if (open) {
            closeChat();
        } else {
            setOpen(true);
        }
    };

    return (
        <div className="chat-widget-wrapper">
            {user && (
                <button className="chat-fab" onClick={toggleChat}>
                    {open ? <X size={24} /> : <MessageCircle size={24} />}
                    {unread > 0 && !open ? <span className="chat-badge">{unread}</span> : null}
                </button>
            )}

            {user && open ? (
                <div className="chat-window">
                    <div className="chat-header">
                        <Bot size={20} />
                        <div>
                            <h4>MDev AI Yordamchi</h4>
                            <span>{typing ? '✍️ Yozmoqda...' : '🟢 Online'}</span>
                        </div>
                        <button className="chat-header-close" onClick={closeChat}><X size={16} /></button>
                    </div>

                    <div className="chat-messages">
                        {msgs.length === 0 ? (
                            <div className="chat-empty">
                                <Bot size={40} />
                                <h4>Salom! 👋</h4>
                                <p>Men MDev AI yordamchiman. Savollaringizga javob beraman!</p>
                            </div>
                        ) : null}

                        {msgs.map((m, i) => (
                            <div key={m.id || i} className={`chat-msg ${m.is_mine ? 'mine' : 'other'}`}>
                                <div className="msg-icon">
                                    {m.is_mine ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className="msg-content">
                                    {!m.is_mine && (
                                        <span className="msg-sender">{m.sender_id === 0 ? '🤖 AI' : '👨‍💼 Admin'}</span>
                                    )}
                                    <div className="msg-bubble">{m.message}</div>
                                    <span className="msg-time">{formatTime(m.created_at)}</span>
                                </div>
                            </div>
                        ))}

                        {typing && (
                            <div className="chat-msg other bot">
                                <div className="msg-icon"><Bot size={14} /></div>
                                <div className="msg-content">
                                    <div className="msg-bubble typing-bubble">
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {msgs.length === 0 ? (
                        <div className="chat-quick">
                            {QUICK_QUESTIONS.map((q, i) => (
                                <button key={i} className="quick-btn" onClick={() => handleSend(q)}>{q}</button>
                            ))}
                        </div>
                    ) : null}

                    <div className="chat-input-row">
                        <input
                            className="chat-input"
                            placeholder="Xabar yozing..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={sending}
                        />
                        <button className="chat-send" onClick={() => handleSend()} disabled={sending || !text.trim()}>
                            {sending ? <Loader size={18} className="spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
