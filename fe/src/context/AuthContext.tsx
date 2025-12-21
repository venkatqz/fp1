import React, { createContext, useContext, useState, useEffect } from 'react';
import { OpenAPI } from '../client';

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

    // Update OpenAPI token whenever token changes
    useEffect(() => {
        OpenAPI.TOKEN = token || undefined;
        console.log('[AuthContext] Token updated:', token ? `${token.substring(0, 20)}...` : 'null');
        console.log('[AuthContext] OpenAPI.TOKEN set to:', OpenAPI.TOKEN ? `${String(OpenAPI.TOKEN).substring(0, 20)}...` : 'undefined');
    }, [token]);

    useEffect(() => {
        // Initialize from localStorage on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        console.log('[AuthContext] Initializing from localStorage');
        console.log('[AuthContext] Stored token:', storedToken ? `${storedToken.substring(0, 20)}...` : 'null');

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from storage", e);
                localStorage.removeItem('user');
            }
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        console.log('[AuthContext] Login called with token:', newToken ? `${newToken.substring(0, 20)}...` : 'null');
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        OpenAPI.TOKEN = newToken; // Set immediately to avoid race condition
        console.log('[AuthContext] OpenAPI.TOKEN immediately set to:', OpenAPI.TOKEN ? `${String(OpenAPI.TOKEN).substring(0, 20)}...` : 'undefined');
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        // Use window.location for logout to ensure clean state reset
        window.location.href = '/login';
    };

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
