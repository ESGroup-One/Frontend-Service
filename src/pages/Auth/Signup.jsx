import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/signupForm.css";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:8000/api/student";
const API_SEND_OTP = `${API_BASE_URL}/send-otp`;
const API_REGISTER_STUDENT = `${API_BASE_URL}/verify-otp`;

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [indexNumber, setIndexNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const toastStyle = {
    background: "#fff",
    color: "#000",
    borderRadius: "8px",
  };

  const handleIndexSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (indexNumber.length !== 12) {
      newErrors.indexNumber = "Index number must be exactly 12 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await axios.post(API_SEND_OTP, {
        indexNumber: indexNumber,
      });
      toast.success(res.data.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });
      setErrors({});
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || "Error sending OTP. Please try again.";
      toast.error(msg, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });
      setErrors({ indexNumber: msg });
    }
  };

  const handleChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPandPasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      newErrors.otp = "Enter the 6-digit OTP";
    }

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
      const res = await axios.post(API_REGISTER_STUDENT, {
        indexNumber: indexNumber,
        otp: otpCode,
        password: password,
      });

      toast.success(res.data.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        style: toastStyle,
      });
      setErrors({});
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
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

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">EduConnect</h1>

        {step === 1 && (
          <>
            <div className="login-subtitle-wrapper">
              <div className="subtitle-line"></div>
              <h2 className="login-subtitle">Sign Up</h2>
              <div className="subtitle-line"></div>
            </div>

            <form onSubmit={handleIndexSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="indexNumber" className="form-label">
                  Index Number
                </label>
                <input
                  type="text"
                  id="indexNumber"
                  className="form-input"
                  placeholder="Enter your index number"
                  value={indexNumber}
                  onChange={(e) => setIndexNumber(e.target.value)}
                  required
                  autoComplete="off"
                />
                {errors.indexNumber && <p className="error-message">{errors.indexNumber}</p>}
              </div>

              <button type="submit" className="login-button">
                Continue
              </button>

              <p className="signup-text">
                Already have an account?{" "}
                <a href="/" className="signup-link">
                  Login
                </a>
              </p>

              <p className="terms-text">
                By clicking "Continue", you acknowledge that you have read and accept the{" "}
                <a href="#" className="terms-link">
                  Terms of Service
                </a>{" "}
                and our{" "}
                <a href="#" className="terms-link">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="login-subtitle-wrapper">
              <div className="subtitle-line"></div>
              <h2 className="login-subtitle">Complete Registration</h2>
              <div className="subtitle-line"></div>
            </div>

            <form onSubmit={handleOTPandPasswordSubmit} className="login-form">
              <div className="otp-info">
                <p className="otp-message">
                  We have sent a 6-digit code to the email associated with index {indexNumber}
                </p>
              </div>

              {/* OTP Inputs */}
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
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    required
                  />
                ))}
              </div>
              {errors.otp && <p className="error-message">{errors.otp}</p>}
              <p className="otp-instruction">Use the 6-digit code we sent to your email</p>

              {/* Password Inputs */}
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
                Sign up
              </button>

              <p className="signup-text">
                Already have an account?{" "}
                <a href="/" className="signup-link">
                  Login
                </a>
              </p>

              <p className="terms-text">
                By clicking "Sign up", you acknowledge that you have read and accept the{" "}
                <a href="#" className="terms-link">
                  Terms of Service
                </a>{" "}
                and our{" "}
                <a href="#" className="terms-link">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </>
        )}
        <ToastContainer />
      </div>
    </div>
  );
}