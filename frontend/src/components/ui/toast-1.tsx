import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    };

    // Attach to window for easy access from non-component logic if needed
    useEffect(() => {
        window.toast = showToast;
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onClose }) => {
    const icons = {
        success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        error: <AlertCircle className="w-4 h-4 text-red-500" />,
        info: <Info className="w-4 h-4 text-blue-500" />,
    };

    const colors = {
        success: 'border-emerald-100 bg-emerald-50 text-emerald-900',
        error: 'border-red-100 bg-red-50 text-red-900',
        info: 'border-blue-100 bg-blue-50 text-blue-900',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-slate-200/50 min-w-[280px] ${colors[toast.type]}`}
        >
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="text-sm font-semibold flex-1">{toast.message}</p>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                <X className="w-3.5 h-3.5 opacity-50" />
            </button>
        </motion.div>
    );
};

export const useToast = () => useContext(ToastContext);
export const showMessage = (msg, type) => window.toast && window.toast(msg, type);
