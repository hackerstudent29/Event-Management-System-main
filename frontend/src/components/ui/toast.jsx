import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    };

    useEffect(() => {
        window.toast = showToast;

        const handleShowToastEvent = (event) => {
            const { message, type = 'info', duration = 3000 } = event.detail;
            showToast(message, type, duration);
        };

        window.addEventListener('show-toast', handleShowToastEvent);
        return () => window.removeEventListener('show-toast', handleShowToastEvent);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onClose }) => {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    };

    const colors = {
        success: 'border-emerald-100 bg-white text-emerald-900',
        error: 'border-red-100 bg-white text-red-900',
        info: 'border-blue-100 bg-white text-blue-900',
        warning: 'border-amber-100 bg-white text-amber-900',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl shadow-slate-200/50 min-w-[320px] pointer-events-auto",
                colors[toast.type] || colors.info
            )}
        >
            <div className="shrink-0">{icons[toast.type] || icons.info}</div>
            <p className="text-sm font-semibold flex-1 leading-tight">{toast.message}</p>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4 opacity-50" />
            </button>
        </motion.div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        return {
            showToast: (message, type = 'info', duration = 3000) => {
                if (window.toast) window.toast(message, type, duration);
                else console.warn("ToastProvider not found and window.toast not initialized");
            }
        };
    }
    return context;
};

// Legacy Export for ToastContainer (to avoid breaking App.jsx immediately if not updated)
export const ToastContainer = () => null;
