import React, { useEffect } from 'react';
import './Toast.css';

function Toast({ mensaje, tipo, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast-container ${tipo}`}>
            <div className="toast-icon">
                {tipo === 'success' ? '✅' : '❌'}
            </div>
            <div className="toast-mensaje">{mensaje}</div>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
}

export default Toast;