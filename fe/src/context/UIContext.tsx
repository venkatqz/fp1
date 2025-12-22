import React, { createContext, useContext, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
    id?: string;
    title?: string;
    msg: string;
    type: ToastType;
    duration?: number;
}

interface UIContextType {
    isLoading: boolean;
    toasts: ToastConfig[];
    showLoader: () => void;
    hideLoader: () => void;
    showToast: (config: ToastConfig) => void;
    removeToast: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [toasts, setToasts] = useState<ToastConfig[]>([]);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const showLoader = () => setIsLoading(true);
    const hideLoader = () => setIsLoading(false);

    const showToast = (config: ToastConfig) => {
        const id = config.id || Math.random().toString(36).substring(7);
        const duration = config.duration || 5000;
        const newToast = { ...config, id, duration };

        setToasts(prev => [...prev, newToast]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    return (
        <UIContext.Provider value={{ isLoading, toasts, showLoader, hideLoader, showToast, removeToast }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
