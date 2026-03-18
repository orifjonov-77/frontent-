import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../api/client';
import { MessageCircle, Send, X, Loader, Bot, Sparkles } from 'lucide-react';
import './ChatWidget.css';

export default function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef(null);
    const refreshRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        loadUnread();
        const interval = setInterval(loadUnread, 15000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (isOpen && user) {
            loadMessages();
            // Auto-refresh har 5 sekundda chat ochiq bo'lganda
            refreshRef.current = setInterval(loadMessages, 5000);
        } else {
            if (refreshRef.current) clearInterval(refreshRef.current);
        }
        return () => {
            if (refreshRef.current) clearInterval(refreshRef.current);
        };
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadUnread = async () => {
        try {
            const res = await chatAPI.getUnread();
            setUnread(res.data.unread);
        } catch { }
    };

    const loadMessages = async () => {
        try {
            const res = await chatAPI.getMy();
            setMessages(res.data);
            setUnread(0);
        } catch { }
    };

    const handleSend = async () => {
        if (!text.trim()) return;
        setSending(true);
        try {
            await chatAPI.send({ message: text.trim() });
            setText('');
            // Kichik delay - AI javob kelishini kutish
            setTimeout(loadMessages, 1500);
        } catch { }
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getSenderInfo = (msg) => {
        if (msg.is_mine) return null;
        // sender_id 0 = AI bot
        if (msg.sender_id === 0) {
            return { name: '🤖 AI Yordamchi', isBot: true };
        }
        return { name: '👨‍💼 Admin', isBot: false };
    };

    if (!user) return null;

    return (
        <>
            {/* Floating button */}
            <button className={`chat-fab ${unread > 0 ? 'has-unread' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                {unread > 0 && !isOpen && <span className="unread-badge">{unread}</span>}
            </button>

            {/* Chat panel */}
            {isOpen && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <div className="chat-header-left">
                            <Sparkles size={18} />
                            <div>
                                <span className="chat-title">Yordam chat</span>
                                <span className="chat-subtitle">AI va Admin javob beradi</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="chat-close"><X size={18} /></button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="chat-empty">
                                <div className="chat-empty-icon">
                                    <Bot size={36} />
                                </div>
                                <h4>Assalomu alaykum! 👋</h4>
                                <p>Savolingiz bormi? Bu yerga yozing!</p>
                                <div className="quick-questions">
                                    {['Narxlar qancha?', 'Karta raqami?', 'Sertifikat olish'].map((q, i) => (
                                        <button key={i} className="quick-q" onClick={() => { setText(q); }}>
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map(m => {
                                const sender = getSenderInfo(m);
                                return (
                                    <div key={m.id} className={`chat-msg ${m.is_mine ? 'mine' : 'theirs'} ${sender?.isBot ? 'bot' : ''}`}>
                                        <div className="msg-bubble">
                                            {sender && (
                                                <span className={`msg-sender ${sender.isBot ? 'bot-label' : 'admin-label'}`}>
                                                    {sender.name}
                                                </span>
                                            )}
                                            <p>{m.message}</p>
                                            <span className="msg-time">
                                                {new Date(m.created_at).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {sending && (
                            <div className="chat-msg theirs bot">
                                <div className="msg-bubble typing-bubble">
                                    <span className="msg-sender bot-label">🤖 AI Yordamchi</span>
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-wrapper">
                        <textarea className="chat-input" rows={1} placeholder="Xabar yozing..."
                            value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown} />
                        <button className="chat-send-btn" onClick={handleSend} disabled={sending || !text.trim()}>
                            {sending ? <Loader size={18} className="spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
