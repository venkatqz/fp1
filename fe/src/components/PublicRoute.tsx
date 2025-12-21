import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute Component
 * 
 * Guards routes that should NOT be accessible if the user is already authenticated.
 * Examples: Login Page, Register Page.
 * 
 * Behavior:
 * - If user is authenticated: Redirects to Home (/).
 * - If user is NOT authenticated: Renders the child component (Outlet).
 */
const PublicRoute: React.FC = () => {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated) {
        // User is already logged in, redirect them based on role
        if (user?.role === 'HOTEL_MANAGER') {
            return <Navigate to="/manager/dashboard" replace />;
        }
        return <Navigate to="/search" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
