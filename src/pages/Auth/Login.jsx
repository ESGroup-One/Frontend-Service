import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "../../styles/loginForm.css";
import { Login_URL } from "../../constant";

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function UserLogin() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { isAuthenticated, userRole, isLoading } = useAuth();

    const validateForm = () => {
        const newErrors = {};

        const isIndexNumber = /^\d{11}$/.test(identifier);
        const isEmail = isValidEmail(identifier);

        if (!isIndexNumber && !isEmail) {
            newErrors.identifier = "Must be a valid 12-digit Index Number or a valid Email address.";
        }

        if (!password) {
            newErrors.password = "Password is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            let redirectPath = '/';
            if (userRole === 'student') {
                redirectPath = '/user';
            } else if (userRole === 'admin') {
                redirectPath = '/admin';
            } else if (userRole === 'superadmin' || userRole === 'superAdmin') {
                redirectPath = '/superadmin';
            }

            // Only navigate if the path is different to prevent navigation throttling
            if (window.location.pathname !== redirectPath) {
                navigate(redirectPath, { replace: true });
            }
        }
    }, [isAuthenticated, userRole, isLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        const isIndexNumber = /^\d{12}$/.test(identifier);

        // Send a payload that consistently matches Postman's expected keys
        const requestBody = {
            password,
            // Always send the identifier under 'indexNumber' if it's not an email, or pass it as email if your API requires an email key
            indexNumber: isIndexNumber ? identifier : identifier,
        };

        try {
            const response = await axios.post(`${Login_URL}`, requestBody);

            if (response.data.status === 'success' || response.status === 200) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userDetails', JSON.stringify(response.data.user));
                localStorage.setItem('userRole', response.data.user.role);

                toast.success("Login successful.", {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "light",
                });

                window.dispatchEvent(new Event("authChanged"));

                const role = response.data.user.role;
                let redirectPath = '/';
                if (role === 'student') {
                    redirectPath = '/user';
                } else if (role === 'admin') {
                    redirectPath = '/admin';
                } else if (role === 'superadmin') {
                    redirectPath = '/superadmin';
                }
                navigate(redirectPath);

            } else {
                toast.error(response.data.message || "Invalid credentials!");
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.message || "Something went wrong.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <img src="/logo.png" alt="NSPS Logo" className="login-logo" />
                <h1 className="login-brand-text">NSPS</h1>
            </div>

            <div className="login-subtitle-wrapper">
                <span className="subtitle-line"></span>
                <p className="login-subtitle">Login</p>
                <span className="subtitle-line"></span>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="identifier" className="form-label">
                        Email or Index Number
                    </label>
                    <input
                        type="text"
                        id="identifier"
                        placeholder="Enter your email or index number"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="form-input"
                    />
                    {errors.identifier && (
                        <p className="error-message">{errors.identifier}</p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '55%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '5px',
                            zIndex: 10,
                        }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff size={20} color="#777" /> : <Eye size={20} color="#777" />}
                    </button>
                    {errors.password && (
                        <p className="error-message">{errors.password}</p>
                    )}
                    <Link to="/forgot-password" className="forgot-password">
                        Forgot Password?
                    </Link>
                </div>

                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? "Logging in..." : "Log In"}
                </button>
            </form>

            <p className="signup-text">
                Don’t have an account?{" "}
                <Link to="/signup" className="signup-link">
                    Signup
                </Link>
            </p>
            <ToastContainer />
        </div>
    );
}
