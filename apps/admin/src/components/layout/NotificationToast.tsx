import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface NotificationToastProps {
  message: string | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1080,
        background: '#10b981',
        color: '#fff',
        padding: '12px 18px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '420px',
        animation: 'slideUp 0.25s ease-out',
      }}
    >
      <CheckCircle2 size={18} />
      <span style={{ fontSize: '13px', fontWeight: 600 }}>{message}</span>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: '2px',
          marginLeft: 'auto',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
