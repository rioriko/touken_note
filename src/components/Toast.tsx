import React from 'react';

export interface ToastMessage {
  id: number;
  text: string;
  type?: 'info' | 'success' | 'warning';
}

interface ToastProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="px-5 py-2.5 rounded-full text-sm font-medium shadow-lg backdrop-blur-md transition-all duration-300 animate-bounce-short bg-[var(--text-color)] text-[var(--card-bg)] border border-[var(--sakura-pink)]/30"
          style={{
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          }}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
};
