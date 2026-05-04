import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ allowedRole }) {
    const { isAuthenticated, userRole, isLoading } = useAuth();

    // Wait for auth to load from localStorage before checking
    if (isLoading) {
        return <div>Loading...</div>; // Or a proper loading component
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRole && userRole !== allowedRole) {
        const redirectPaths = {
            student: "/user",
            admin: "/admin",
            superAdmin: "/superadmin",
        };
        return <Navigate to={redirectPaths[userRole] || "/"} replace />;
    }

    return <Outlet />;
}
