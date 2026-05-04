import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/loginForm.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

export default function SetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (!isLoading && isAuthenticated) {
      let redirectPath = '/';
      if (userRole === 'student') {
        redirectPath = '/user';
      } else if (userRole === 'admin') {
        redirectPath = '/admin';
      } else if (userRole === 'superAdmin') {
        redirectPath = '/superadmin';
      }
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, userRole, isLoading, navigate]);

  const validateForm = () => {
    const newErrors = {};

    // Password validation - at least 8 characters (as per backend requirement)
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!token) {
      toast.error("Invalid or missing token. Please check your email link.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/set-password/${token}`,
        { password: password }
      );

      if (response.data.token) {
        // Don't store auth data - user should log in fresh
        // Clear any existing auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');

        toast.success(response.data.message || "Password set successfully! Please login with your credentials.", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });

        window.dispatchEvent(new Event("authChanged"));

        // Redirect to login page
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to set password.");
      }
    } catch (error) {
      console.error("Set password error:", error);
      const errorMessage = error.response?.data?.message || "Something went wrong. The token may be invalid or expired.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prevState => !prevState);
  };

  return (
    <div className="login-container">
      <h1 className="login-title">EduConnect</h1>

      <div className="login-subtitle-wrapper">
        <span className="subtitle-line"></span>
        <p className="login-subtitle">Set Your Password</p>
        <span className="subtitle-line"></span>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            style={{
              position: 'absolute',
              right: '10px',
              top: '75%',
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
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            className="form-input"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            style={{
              position: 'absolute',
              right: '10px',
              top: '75%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              zIndex: 10,
            }}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={20} color="#777" /> : <Eye size={20} color="#777" />}
          </button>
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
        </div>

        {errors.general && (
          <p className="error-message" style={{ textAlign: 'center', marginBottom: '16px' }}>
            {errors.general}
          </p>
        )}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Setting Password..." : "Set Password"}
        </button>
      </form>

      <p className="signup-text">
        Remember your password?{" "}
        <a href="/" className="signup-link">
          Login
        </a>
      </p>
      <ToastContainer />
    </div>
  );
}

