import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/signupForm.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

import {
  FORGOT_PASSWORD_SEND_OTP_URL,
  FORGOT_PASSWORD_VERIFY_OTP_URL,
  FORGOT_PASSWORD_SET_NEW_URL,
} from "../../constant";

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidIndexNumber = (value) => /^\d{11}$/.test(value);

const getErrorMessage = (err, fallback) => {
  const data = err.response?.data;

  if (typeof data === "string") return data;

  return data?.message || data?.detail || data?.error || fallback;
};

export default function ForgotPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const toastStyle = {
    background: "#fff",
    color: "#000",
    borderRadius: "8px",
  };

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();

    const trimmedIdentifier = identifier.trim();
    const newErrors = {};

    if (!trimmedIdentifier) {
      newErrors.identifier = "Please enter your Index Number or Email.";
    } else if (
      !isValidEmail(trimmedIdentifier) &&
      !isValidIndexNumber(trimmedIdentifier)
    ) {
      newErrors.identifier =
        "Enter a valid email or an 11-digit index number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(FORGOT_PASSWORD_SEND_OTP_URL, {
        identifier: trimmedIdentifier,
      });

      toast.success(res.data.message || "OTP sent successfully.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });

      setIdentifier(trimmedIdentifier);
      setOtp(["", "", "", "", "", ""]);
      setErrors({});
      setStep(2);
    } catch (err) {
      const msg = getErrorMessage(
        err,
        "Error sending OTP. Please check the identifier."
      );

      toast.error(msg, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });

      setErrors({ identifier: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();

    const pastedValue = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) return;

    const nextOtp = ["", "", "", "", "", ""];
    pastedValue.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);

    const nextIndex = Math.min(pastedValue.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");
    const newErrors = {};

    if (otpCode.length !== 6) {
      newErrors.otp = "Enter the 6-digit OTP.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(FORGOT_PASSWORD_VERIFY_OTP_URL, {
        identifier: identifier.trim(),
        otp: otpCode,
      });

      toast.success(res.data.message || "OTP verified successfully.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });

      setResetToken(res.data.token);
      setErrors({});
      setStep(3);
    } catch (err) {
      const msg = getErrorMessage(
        err,
        "OTP verification failed. Please try again."
      );

      toast.error(msg, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });

      setErrors({ otp: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;

    if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be 8-12 characters with at least one uppercase letter, number, and special character.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!resetToken) {
      newErrors.general = "Reset session expired. Please restart the process.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(FORGOT_PASSWORD_SET_NEW_URL(resetToken), {
        password,
      });

      toast.success(
        res.data.message || "Password reset successfully. Please login.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
          style: toastStyle,
        }
      );

      setErrors({});

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (err) {
      const msg = getErrorMessage(
        err,
        "Could not set new password. Please restart the process."
      );

      toast.error(msg, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });

      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (step === 1) {
      return (
        <>
          <div className="login-subtitle-wrapper">
            <div className="subtitle-line"></div>
            <h2 className="login-subtitle">Forgot Password</h2>
            <div className="subtitle-line"></div>
          </div>

          <form onSubmit={handleIdentifierSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="identifier" className="form-label">
                Index Number or Email
              </label>
              <input
                type="text"
                id="identifier"
                className="form-input"
                placeholder="Enter your index number or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="off"
              />
              {errors.identifier && (
                <p className="error-message">{errors.identifier}</p>
              )}
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Sending..." : "Submit"}
            </button>

            <p className="signup-text">
              Remember your password?{" "}
              <Link to="/" className="signup-link">
                Login
              </Link>
            </p>
          </form>
        </>
      );
    }

    if (step === 2) {
      const displayIdentifier = identifier.includes("@")
        ? identifier.replace(/^(.{2})[^@]+/, "$1****")
        : identifier;

      return (
        <>
          <div className="login-subtitle-wrapper">
            <div className="subtitle-line"></div>
            <h2 className="login-subtitle">Verify your account</h2>
            <div className="subtitle-line"></div>
          </div>

          <form onSubmit={handleOtpVerification} className="login-form">
            <div className="otp-info">
              <p className="otp-message">
                We have sent a 6-digit code to the email associated with{" "}
                {displayIdentifier}
              </p>
            </div>

            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  required
                />
              ))}
            </div>

            {errors.otp && <p className="error-message">{errors.otp}</p>}

            <p className="otp-instruction">
              Enter the 6-digit code we sent to your email.
            </p>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <div className="login-subtitle-wrapper">
            <div className="subtitle-line"></div>
            <h2 className="login-subtitle">Set your new password</h2>
            <div className="subtitle-line"></div>
          </div>

          <form onSubmit={handleSetNewPassword} className="login-form">
            <div className="form-group" style={{ position: "relative" }}>
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
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px",
                  zIndex: 10,
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#777" />
                ) : (
                  <Eye size={20} color="#777" />
                )}
              </button>
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>

            <div className="form-group" style={{ position: "relative" }}>
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
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px",
                  zIndex: 10,
                }}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#777" />
                ) : (
                  <Eye size={20} color="#777" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.general && (
              <p className="error-message">{errors.general}</p>
            )}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Resetting..." : "Confirm"}
            </button>
          </form>
        </>
      );
    }

    return null;
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <img src="/logo.png" alt="NSPS Logo" className="login-logo" />
          <h1 className="login-brand-text">NSPS</h1>
        </div>

        {renderContent()}

        <ToastContainer />
      </div>
    </div>
  );
}
