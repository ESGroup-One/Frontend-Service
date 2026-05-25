import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { SET_ADMIN_PASSWORD_URL } from "../../constant";
import "../../styles/loginForm.css";

const getRedirectPath = (role) => {
  const normalizedRole = role?.toLowerCase();

  if (normalizedRole === "student") return "/user";
  if (normalizedRole === "admin") return "/admin";
  if (normalizedRole === "superadmin") return "/superadmin";

  return "/";
};

export default function SetPassword() {
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = pathToken || searchParams.get("token");

  const navigate = useNavigate();
  const { isAuthenticated, userRole, isLoading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(getRedirectPath(userRole), { replace: true });
    }
  }, [isAuthenticated, userRole, isLoading, navigate]);

  const validateForm = () => {
    const newErrors = {};

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
      const message = "Invalid or missing token. Please check your email link.";
      setErrors({ general: message });
      toast.error(message);
      return;
    }

    setLoading(true);

    try {
      await axios.post(SET_ADMIN_PASSWORD_URL, {
        token,
        password,
      });

      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userDetails");

      window.dispatchEvent(new Event("authChanged"));

      toast.success("Password set successfully. Please login.", {
        position: "top-right",
        autoClose: 1500,
        theme: "light",
      });

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (error) {
      console.error("Set password error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data ||
        "Something went wrong. The token may be invalid or expired.";

      setErrors({ general: errorMessage });

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <img src="/logo.png" alt="NSPS Logo" className="login-logo" />
        <h1 className="login-brand-text">NSPS</h1>
      </div>

      <div className="login-subtitle-wrapper">
        <span className="subtitle-line"></span>
        <p className="login-subtitle">Set Your Password</p>
        <span className="subtitle-line"></span>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        {/* PASSWORD FIELD */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="form-input password-field-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-field-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={20} strokeWidth={2.2} />
              ) : (
                <Eye size={20} strokeWidth={2.2} />
              )}
            </button>
          </div>

          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        {/* CONFIRM PASSWORD FIELD */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>

          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="form-input password-field-input"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-field-toggle"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} strokeWidth={2.2} />
              ) : (
                <Eye size={20} strokeWidth={2.2} />
              )}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="error-message">{errors.confirmPassword}</p>
          )}
        </div>

        {errors.general && (
          <p
            className="error-message"
            style={{ textAlign: "center", marginBottom: "16px" }}
          >
            {errors.general}
          </p>
        )}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Setting Password..." : "Set Password"}
        </button>
      </form>

      <p className="signup-text">
        Remember your password?{" "}
        <Link to="/" className="signup-link">
          Login
        </Link>
      </p>

      <ToastContainer />
    </div>
  );
}