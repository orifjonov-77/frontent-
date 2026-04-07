import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../api/client';
import { MessageCircle, X, Send, Loader, Bot, User, Sparkles } from 'lucide-react';
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
    const inputRef = useRef(null);

    useEffect(() => {
        if (!user || open) return;
        const fetchUnread = async () => {
            try {
                const res = await chatAPI.getUnread();
                setUnread(res.data.unread || 0);
            } catch { }
        };
        fetchUnread();
        const iv = setInterval(fetchUnread, 60000);
        return () => clearInterval(iv);
    }, [user, open]);

    useEffect(() => {
        if (!open || !user) return;
        loadMessages();
        const iv = setInterval(loadMessages, 15000);
        return () => clearInterval(iv);
    }, [open, user]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs, typing]);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [open]);

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

        setMsgs(prev => [...prev, {
            id: `tmp-${Date.now()}`,
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
                id: `err-${Date.now()}`,
                is_mine: false,
                is_from_admin: true,
                sender_id: 0,
                message: "Xabar yuborilmadi. Qaytadan urinib ko'ring.",
                created_at: new Date().toISOString(),
            }]);
            setTyping(false);
        }
        setSending(false);
    };

    const closeChat = () => {
        setOpen(false);
        setMsgs([]);
        setTyping(false);
        setText('');
    };

    const toggleChat = () => open ? closeChat() : setOpen(true);

    if (!user) return null;

    return (
        <div className="chat-widget-wrapper">
            <button className="chat-fab" onClick={toggleChat} aria-label="Chat">
                {open ? <X size={22} /> : <MessageCircle size={22} />}
                {unread > 0 && !open && (
                    <span className="chat-badge">{unread > 9 ? '9+' : unread}</span>
                )}
            </button>

            {open && (
                <div className="chat-window" role="dialog" aria-label="Chat oynasi">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-avatar">
                            <Bot size={18} />
                        </div>
                        <div>
                            <h4>MDev AI Yordamchi</h4>
                            <span className="chat-status">
                                {typing ? (
                                    <>✍️ Yozmoqda...</>
                                ) : (
                                    <><span className="chat-status-dot" /> Online</>
                                )}
                            </span>
                        </div>
                        <button className="chat-header-close" onClick={closeChat} aria-label="Yopish">
                            <X size={15} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {msgs.length === 0 && (
                            <div className="chat-empty">
                                <div className="chat-empty-icon">
                                    <Sparkles size={24} />
                                </div>
                                <h4>Salom! 👋</h4>
                                <p>Men MDev AI yordamchiman. Savollaringizga javob beraman!</p>
                            </div>
                        )}

                        {msgs.map((m, i) => (
                            <div key={m.id || i} className={`chat-msg ${m.is_mine ? 'mine' : 'other'}`}>
                                <div className="msg-icon">
                                    {m.is_mine ? <User size={13} /> : <Bot size={13} />}
                                </div>
                                <div className="msg-content">
                                    {!m.is_mine && (
                                        <span className="msg-sender">
                                            {m.sender_id === 0 ? '🤖 AI' : '👨‍💼 Admin'}
                                        </span>
                                    )}
                                    <div className="msg-bubble">{m.message}</div>
                                    <span className="msg-time">{formatTime(m.created_at)}</span>
                                </div>
                            </div>
                        ))}

                        {typing && (
                            <div className="chat-msg other">
                                <div className="msg-icon"><Bot size={13} /></div>
                                <div className="msg-content">
                                    <div className="msg-bubble typing-bubble">
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Quick questions */}
                    {msgs.length === 0 && (
                        <div className="chat-quick">
                            {QUICK_QUESTIONS.map((q, i) => (
                                <button key={i} className="quick-btn" onClick={() => handleSend(q)}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="chat-input-row">
                        <input
                            ref={inputRef}
                            className="chat-input"
                            placeholder="Xabar yozing..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            disabled={sending}
                            maxLength={1000}
                        />
                        <button
                            className="chat-send"
                            onClick={() => handleSend()}
                            disabled={sending || !text.trim()}
                            aria-label="Yuborish"
                        >
                            {sending ? <Loader size={17} className="spin" /> : <Send size={17} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
