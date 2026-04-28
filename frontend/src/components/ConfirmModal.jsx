import React from 'react';
import './ConfirmModal.css';

function ConfirmModal({ mensaje, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content confirm-modal">
                <div className="confirm-icon">⚠️</div>
                <h2>¿Estás seguro?</h2>
                <p>{mensaje}</p>
                <div className="modal-botones">
                    <button className="btn-confirmar" onClick={onConfirm}>Sí, eliminar</button>
                    <button className="btn-cancelar" onClick={onCancel}>No, cancelar</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;