import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/signupForm.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

export default function ForgotPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState(""); // Token from Step 2 for Step 3
  const [errors, setErrors] = useState({});

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const toastStyle = {
    background: "#fff",
    color: "#000",
    borderRadius: "8px",
  };

  // --- Step 1: Handle Identifier Submission (Send OTP) ---
  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!identifier) {
      newErrors.identifier = "Please enter your Index Number or Email.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // NOTE: The API handles whether the input is an email or indexNumber
      const payload = identifier.includes('@')
        ? { email: identifier }
        : { indexNumber: identifier };

      const res = await axios.post(`${API_BASE_URL}/forgot-password/send-otp`, payload);

      toast.success(res.data.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });
      setErrors({});
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || "Error sending OTP. Please check the identifier.";
      toast.error(msg, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });
      setErrors({ identifier: msg });
    }
  };

  // Helper for OTP inputs
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --- Step 2: Handle OTP Verification ---
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      newErrors.otp = "Enter the 6-digit OTP";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // NOTE: We use identifier from step 1
      const payload = {
        identifier: identifier,
        otp: otpCode,
      };

      const res = await axios.post(`${API_BASE_URL}/forgot-password/verify-otp`, payload);

      toast.success(res.data.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });

      setResetToken(res.data.token); // Save the temporary token for step 3
      setErrors({});
      setStep(3); // Move to Set New Password step
    } catch (err) {
      const msg = err.response?.data?.message || "OTP verification failed. Please try again.";
      toast.error(msg, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });
      setErrors({ otp: msg });
    }
  };

  // --- Step 3: Handle Set New Password ---
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Password Validation (same as in Signup.jsx)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be 8-12 characters with at least one uppercase letter, number, and special character";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/forgot-password/set-new-password/${resetToken}`,
        { password: password }
      );

      toast.success(res.data.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });
      setErrors({});
      // Password reset successful, navigate to login page
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Could not set new password. Please restart the process.";
      toast.error(msg, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });
      setErrors({ general: msg });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prevState => !prevState);
  };

  const renderContent = () => {
    if (step === 1) {
      // Step 1: Input Identifier (Based on image_f1dd35.png)
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
              {errors.identifier && <p className="error-message">{errors.identifier}</p>}
            </div>

            <button type="submit" className="login-button">
              Submit
            </button>

            <p className="signup-text">
              Remember your password?{" "}
              <a href="/" className="signup-link">
                Login
              </a>
            </p>
          </form>
        </>
      );
    }

    if (step === 2) {
      // Step 2: Verify OTP (Based on image_f1dd32.png)
      // NOTE: We display the identifier but hide the full email for security
      const displayIdentifier = identifier.includes('@')
        ? identifier.replace(/^(.{2})[^@]+/, '$1****')
        : identifier;

      return (
        <>
          <div className="login-subtitle-wrapper">
            <div className="subtitle-line"></div>
            <h2 className="login-subtitle">Verify your account to set your password</h2>
            <div className="subtitle-line"></div>
          </div>

          <form onSubmit={handleOtpVerification} className="login-form">
            <div className="otp-info">
              <p className="otp-message">
                We have sent a 6-digit code to the email associated with {displayIdentifier}
              </p>
            </div>

            {/* OTP Inputs (Copied from Signup.jsx) */}
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
                  required
                />
              ))}
            </div>
            {errors.otp && <p className="error-message">{errors.otp}</p>}
            <p className="otp-instruction">Enter the 6-digit code we sent to your email</p>

            <button type="submit" className="login-button">
              Verify
            </button>
          </form>
        </>
      );
    }

    if (step === 3) {
      // Step 3: Set New Password (Based on image_f1dd30.png)
      return (
        <>
          <div className="login-subtitle-wrapper">
            <div className="subtitle-line"></div>
            <h2 className="login-subtitle">Set your new password</h2>
            <div className="subtitle-line"></div>
          </div>

          <form onSubmit={handleSetNewPassword} className="login-form">
            {/* Password Inputs (Copied from Signup.jsx) */}
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

            {errors.general && <p className="error-message">{errors.general}</p>}

            <button type="submit" className="login-button">
              Confirm
            </button>
          </form>
        </>
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">EduConnect</h1>
        {renderContent()}
        <ToastContainer />
      </div>
    </div>
  );
}