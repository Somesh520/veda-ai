'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmOptions(options);
    setIsConfirmLoading(false);
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmOptions) return;
    try {
      setIsConfirmLoading(true);
      await confirmOptions.onConfirm();
      setConfirmOptions(null);
    } catch (error) {
      console.error('Error executing confirmation action:', error);
      showToast('error', 'Operation failed. Please try again.');
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const handleCancelAction = () => {
    if (!confirmOptions) return;
    if (confirmOptions.onCancel) {
      confirmOptions.onCancel();
    }
    setConfirmOptions(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Toast Portal Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none no-print">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmOptions && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-backdrop-in no-print">
          <div className="bg-white border border-slate-100 rounded-[28px] max-w-md w-full shadow-2xl p-6.5 relative overflow-hidden animate-modal-in">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-[100px] -z-10"></div>
            
            <div className="flex flex-col items-center text-center">
              {/* Variant Icon Circle */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${
                confirmOptions.variant === 'danger'
                  ? 'bg-rose-50 border border-rose-100 text-rose-500'
                  : confirmOptions.variant === 'info'
                  ? 'bg-blue-50 border border-blue-100 text-blue-500'
                  : 'bg-amber-50 border border-amber-100 text-amber-500'
              }`}>
                {confirmOptions.variant === 'danger' && <AlertTriangle className="w-7 h-7 animate-pulse" />}
                {confirmOptions.variant === 'info' && <Info className="w-7 h-7" />}
                {confirmOptions.variant === 'warning' && <AlertTriangle className="w-7 h-7" />}
                {!confirmOptions.variant && <AlertTriangle className="w-7 h-7" />}
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-slate-800 font-sans tracking-tight mb-2">
                {confirmOptions.title}
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8 max-w-xs">
                {confirmOptions.message}
              </p>

              {/* Actions Button Bar */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={handleCancelAction}
                  disabled={isConfirmLoading}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full py-3.5 px-6 font-semibold text-xs transition-all border border-slate-100 cursor-pointer disabled:opacity-50"
                >
                  {confirmOptions.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={isConfirmLoading}
                  className={`flex-1 text-white rounded-full py-3.5 px-6 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] ${
                    confirmOptions.variant === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-500 hover:shadow-rose-100'
                      : confirmOptions.variant === 'info'
                      ? 'bg-slate-900 hover:bg-slate-800'
                      : 'bg-amber-600 hover:bg-amber-500'
                  } disabled:opacity-50`}
                >
                  {isConfirmLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    confirmOptions.confirmText || 'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const intervalTime = 20;
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
        setIsExiting(true);
        setTimeout(onClose, 250);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.duration, onClose]);

  const handleManualClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 250);
  };

  // Icon selector
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  // Border theme
  const getThemeClass = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-50 bg-white/95 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.12)]';
      case 'error':
        return 'border-rose-50 bg-white/95 shadow-[0_10px_30px_-10px_rgba(244,63,94,0.12)]';
      case 'warning':
        return 'border-amber-50 bg-white/95 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.12)]';
      case 'info':
        return 'border-blue-50 bg-white/95 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.12)]';
    }
  };

  // Progress Bar theme
  const getProgressThemeClass = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-rose-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`pointer-events-auto flex flex-col border rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300 w-full relative ${getThemeClass()} ${
        isExiting ? 'animate-fade-out scale-95 opacity-0' : 'animate-slide-in'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {getIcon()}
        
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold text-slate-700 leading-normal font-sans text-left">
            {toast.message}
          </p>
        </div>

        <button
          onClick={handleManualClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Shrinking progress bar indicating toast expiry */}
      <div className="h-[3px] w-full bg-slate-100/50 mt-auto overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ease-linear ${getProgressThemeClass()}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
