import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        function loadAuth() {
            const token = localStorage.getItem("authToken");
            const role = localStorage.getItem("userRole");
            let user = localStorage.getItem("userDetails");
            user = JSON.parse(user);

            setIsAuthenticated(!!token);
            setUserRole(role || null);
            setUser(user || null);
            setIsLoading(false);
        }

        loadAuth();

        window.addEventListener("authChanged", loadAuth);

        return () => window.removeEventListener("authChanged", loadAuth);
    }, []);

    const updateUser = (newUserData) => {
        if (newUserData) {
            localStorage.setItem('userDetails', JSON.stringify(newUserData));
            setUser(newUserData);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userDetails');
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null);
        navigate('/');
    };

    const value = {
        isAuthenticated,
        userRole,
        user,
        isLoading,
        logout,
        updateUser,
        hasRole: (requiredRole) => userRole === requiredRole
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};