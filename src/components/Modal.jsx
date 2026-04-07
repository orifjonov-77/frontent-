import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/* ── Inline styles (no separate CSS needed) ── */
const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        animation: 'overlayIn 0.2s ease',
    },
    content: {
        background: 'var(--bg-card, #ffffff)',
        borderRadius: '20px',
        padding: '2rem',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        boxShadow:
            '0 4px 6px -1px rgba(0,0,0,0.1), 0 32px 64px -12px rgba(0,0,0,0.22)',
        border: '1px solid rgba(255,255,255,0.15)',
        animation: 'modalIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
    },
    closeBtn: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'var(--bg-input, #f1f5f9)',
        color: 'var(--text-muted, #64748b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.18s, transform 0.18s',
    },
    iconWrap: {
        fontSize: '2.5rem',
        lineHeight: 1,
        marginBottom: '0.25rem',
        animation: 'iconBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both',
    },
    title: {
        margin: 0,
        fontSize: '1.15rem',
        fontWeight: 700,
        textAlign: 'center',
        color: 'var(--text, #0f172a)',
        letterSpacing: '-0.02em',
    },
    message: {
        margin: 0,
        fontSize: '0.9rem',
        textAlign: 'center',
        color: 'var(--text-muted, #64748b)',
        lineHeight: 1.6,
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '0.5rem',
        width: '100%',
    },
    btnPrimary: {
        flex: 1,
        padding: '0.65rem 1.25rem',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
        color: '#fff',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.15s',
        boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
        letterSpacing: '-0.01em',
    },
    btnSecondary: {
        flex: 1,
        padding: '0.65rem 1.25rem',
        borderRadius: '12px',
        border: '1.5px solid rgba(0,0,0,0.1)',
        background: 'transparent',
        color: 'var(--text-muted, #64748b)',
        fontSize: '0.9rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.18s, border-color 0.18s',
    },
};

/* Inject keyframes once */
const injectKeyframes = () => {
    if (document.getElementById('modal-keyframes')) return;
    const s = document.createElement('style');
    s.id = 'modal-keyframes';
    s.textContent = `
        @keyframes overlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        @keyframes modalIn {
            from { opacity: 0; transform: translateY(16px) scale(0.95); }
            to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes iconBounce {
            from { opacity: 0; transform: scale(0.4) rotate(-10deg); }
            to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
    `;
    document.head.appendChild(s);
};

const ICON_MAP = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    confirm: '🤔',
};

const TYPE_COLORS = {
    success: '#16a34a',
    error: '#dc2626',
    warning: '#d97706',
    info: '#6366f1',
    confirm: '#7c3aed',
};

export default function Modal({ isOpen, onClose, title, message, icon, type = 'info', actions, children }) {
    useEffect(() => { injectKeyframes(); }, []);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const accentColor = TYPE_COLORS[type] || '#6366f1';

    return createPortal(
        <div style={styles.overlay} onClick={onClose}>
            <div
                style={{
                    ...styles.content,
                    boxShadow: `0 4px 6px -1px rgba(0,0,0,0.1), 0 32px 64px -12px rgba(0,0,0,0.22), 0 0 0 1px ${accentColor}18`,
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    style={styles.closeBtn}
                    onClick={onClose}
                    aria-label="Yopish"
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'rotate(90deg) scale(1.05)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'var(--bg-input, #f1f5f9)';
                        e.currentTarget.style.transform = 'none';
                    }}
                >
                    <X size={15} />
                </button>

                <div style={styles.iconWrap}>{icon || ICON_MAP[type]}</div>

                {title && <h3 style={{ ...styles.title, color: accentColor }}>{title}</h3>}
                {message && <p style={styles.message}>{message}</p>}
                {children}

                <div style={styles.actions}>
                    {actions || (
                        <button
                            style={styles.btnPrimary}
                            onClick={onClose}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(99,102,241,0.45)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.35)';
                            }}
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ── Confirm modal variant ── */
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Ha", cancelLabel = "Yo'q" }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            type="confirm"
            title={title}
            message={message}
            actions={
                <>
                    <button style={styles.btnSecondary} onClick={onClose}>{cancelLabel}</button>
                    <button
                        style={styles.btnPrimary}
                        onClick={() => { onConfirm?.(); onClose?.(); }}
                    >
                        {confirmLabel}
                    </button>
                </>
            }
        />
    );
}

/* ── Hook ── */
export function useModal() {
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    const showModal = useCallback((type, title, message) => {
        setModal({ isOpen: true, type, title, message });
    }, []);

    const showSuccess = useCallback((title, message) => showModal('success', title, message), [showModal]);
    const showError   = useCallback((title, message) => showModal('error',   title, message), [showModal]);
    const showWarning = useCallback((title, message) => showModal('warning', title, message), [showModal]);
    const showInfo    = useCallback((title, message) => showModal('info',    title, message), [showModal]);

    const closeModal = useCallback(() => setModal(m => ({ ...m, isOpen: false })), []);

    const ModalComponent = (
        <Modal
            isOpen={modal.isOpen}
            onClose={closeModal}
            type={modal.type}
            title={modal.title}
            message={modal.message}
        />
    );

    return { showSuccess, showError, showWarning, showInfo, closeModal, ModalComponent };
}
