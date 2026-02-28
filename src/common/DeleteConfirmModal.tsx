import React from "react";
import ReactDOM from "react-dom";
import "../assets/css/deleteConfirmModal.css";

import { TiWarning } from "react-icons/ti";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  onClose,
  onConfirm,
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="delete-modal-overlay">
      <div className="delete-modal-card">
        <div className="delete-modal-card-icon">
          <TiWarning />
        </div>

        <h3 className="delete-modal-title">{title}</h3>
        <p className="delete-modal-description">{message}</p>
        <div className="delete-modal-actions">
          <button className="delete-btn delete-btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button className="delete-btn delete-btn-danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
