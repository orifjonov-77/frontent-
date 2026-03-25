import { useState, useEffect, useRef } from 'react';

/**
 * Portal container — creates a dedicated div for React portals
 * instead of rendering directly to document.body (which causes
 * removeChild errors in React 19)
 */
function PortalContainer({ children, isOpen }) {
    const elRef = useRef(null);

    useEffect(() => {
        const el = document.createElement('div');
        el.id = 'modal-portal';
        document.body.appendChild(el);
        elRef.current = el;
        return () => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        };
    }, []);

    if (!isOpen || !elRef.current) return null;

    const { createPortal } = require('react-dom');
    return createPortal(children, elRef.current);
}

export default function Modal({ isOpen, onClose, title, message, icon, type = 'info', actions, children }) {
    if (!isOpen) return null;

    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        confirm: '🤔'
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-icon">{icon || iconMap[type]}</div>
                {title && <h3>{title}</h3>}
                {message && <p>{message}</p>}
                {children}
                <div className="modal-actions">
                    {actions || (
                        <button className="btn btn-primary" onClick={onClose}>OK</button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Hook for easy modal usage
export function useModal() {
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    const showModal = (type, title, message) => {
        setModal({ isOpen: true, type, title, message });
    };

    const showSuccess = (title, message) => showModal('success', title, message);
    const showError = (title, message) => showModal('error', title, message);
    const showWarning = (title, message) => showModal('warning', title, message);

    const closeModal = () => setModal(m => ({ ...m, isOpen: false }));

    const ModalComponent = (
        <Modal
            isOpen={modal.isOpen}
            onClose={closeModal}
            type={modal.type}
            title={modal.title}
            message={modal.message}
        />
    );

    return { showSuccess, showError, showWarning, closeModal, ModalComponent };
}
