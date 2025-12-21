import React, { createContext, useContext, useEffect, useState } from 'react';
import { uiEvents } from '../services/ui-events';
import type { ToastConfig } from '../services/ui-events';

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

    useEffect(() => {
        const unsubLoader = uiEvents.subscribeLoader((visible) => setIsLoading(visible));
        const unsubToast = uiEvents.subscribeToast((newToast) => {
            setToasts(prev => [...prev, newToast]);
            if (newToast.duration) {
                setTimeout(() => {
                    removeToast(newToast.id!);
                }, newToast.duration);
            }
        });

        return () => {
            unsubLoader();
            unsubToast();
        };
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Proxies to the        (so components can use context OR service directly)
    const showLoader = () => uiEvents.showLoader();
    const hideLoader = () => uiEvents.hideLoader();
    const showToast = (config: ToastConfig) => uiEvents.showToast(config);

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
