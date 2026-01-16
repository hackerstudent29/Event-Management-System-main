import React, { createContext, useContext } from 'react';
import { ToastProvider as OriginalToastProvider, useToast as useOriginalToast } from '@/components/ui/toast';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    return (
        <OriginalToastProvider>
            <MessageContextWrapper>
                {children}
            </MessageContextWrapper>
        </OriginalToastProvider>
    );
};

const MessageContextWrapper = ({ children }) => {
    const { showToast } = useOriginalToast();

    // Adapter to match expected signature: showMessage(msg, { type: 'success' })
    const showMessage = (msg, config = {}) => {
        showToast(msg, config.type || 'info');
    };

    return (
        <MessageContext.Provider value={{ showMessage }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context;
};
