import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { OpenAPI } from '../client';
import { useUI } from './UIContext';

// Define the shape of our User object (can import from client types if available)
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const { showToast } = useUI();
    const isRedirecting = useRef(false);

    // Update OpenAPI token whenever token changes
    useEffect(() => {
        OpenAPI.TOKEN = token || undefined;
        console.log('[AuthContext] Token updated:', token ? `${token.substring(0, 20)}...` : 'null');
        console.log('[AuthContext] OpenAPI.TOKEN set to:', OpenAPI.TOKEN ? `${String(OpenAPI.TOKEN).substring(0, 20)}...` : 'undefined');
    }, [token]);

    useEffect(() => {
        // Initialize from sessionStorage on mount
        const storedToken = sessionStorage.getItem('token');
        const storedUser = sessionStorage.getItem('user');

        console.log('[AuthContext] Initializing from sessionStorage');
        console.log('[AuthContext] Stored token:', storedToken ? `${storedToken.substring(0, 20)}...` : 'null');

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from storage", e);
                sessionStorage.removeItem('user');
            }
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        console.log('[AuthContext] Login called with token:', newToken ? `${newToken.substring(0, 20)}...` : 'null');
        sessionStorage.setItem('token', newToken);
        sessionStorage.setItem('user', JSON.stringify(newUser));
        OpenAPI.TOKEN = newToken; // Set immediately to avoid race condition
        console.log('[AuthContext] OpenAPI.TOKEN immediately set to:', OpenAPI.TOKEN ? `${String(OpenAPI.TOKEN).substring(0, 20)}...` : 'undefined');
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
        // Use window.location for logout to ensure clean state reset
        window.location.href = '/login';
    };

    // Global Event Listener for Session Expiry (401/403 from request.ts)
    useEffect(() => {
        const handleAuthError = (event: Event) => {
            // Debounce at the listener level to strictly prevent multiple toasts/redirects
            if (isRedirecting.current) return;
            isRedirecting.current = true;

            const customEvent = event as CustomEvent;
            const { message } = customEvent.detail;

            showToast({ type: 'error', msg: message || 'Session expired. Please login again.' });

            // Allow current operations to settle/fail before redirecting
            setTimeout(() => {
                logout();
                // Reset after a reasonable timeout
                setTimeout(() => { isRedirecting.current = false; }, 5000);
            }, 100);
        };

        window.addEventListener('auth:unauthorized', handleAuthError);

        return () => {
            window.removeEventListener('auth:unauthorized', handleAuthError);
        };
    }, [showToast, logout]); // Added logout to dependencies

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
