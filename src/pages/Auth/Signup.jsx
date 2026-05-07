import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/signupForm.css";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { REGISTER_INITIATE_URL, REGISTER_COMPLETE_URL } from "../../constant";

const VERIFY_OTP_URL = "http://localhost:8081/authservice/api/auth/verify-otp";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [indexNumber, setIndexNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const toastStyle = { background: "#fff", color: "#000", borderRadius: "8px" };

  // Step 1: Submit index number → get OTP
  const handleIndexSubmit = async (e) => {
    e.preventDefault();
    if (indexNumber.length !== 11) {
      setErrors({ indexNumber: "Index number must be exactly 11 digits" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(REGISTER_INITIATE_URL(indexNumber));
      toast.success("OTP sent to your registered email!", { position: "top-right", autoClose: 3000, style: toastStyle });
      setErrors({});
      setStep(2);
    } catch (err) {
      const msg = err.response?.data || "Error sending OTP. Please try again.";
      toast.error(msg, { position: "top-right", autoClose: 3000, style: toastStyle });
      setErrors({ indexNumber: msg });
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP only (call new endpoint)
  const handleOtpVerify = (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setErrors({ otp: "Enter the 6-digit OTP" });
      return;
    }
    // OTP will be validated on /register/complete
    setErrors({});
    setStep(3);
  };

  // Step 3: Set password + confirm (complete registration)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = "Password must be 8-12 characters with at least one uppercase letter, number, and special character";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // re‑send OTP because backend expects it (or we could modify backend to not require OTP after verification)
      const otpCode = otp.join("");
      await axios.post(REGISTER_COMPLETE_URL, { indexNumber, otp: otpCode, password });
      toast.success("Registration successful! Redirecting to login...", { position: "top-right", autoClose: 3000, style: toastStyle });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      const msg = err.response?.data || "Registration failed. Please try again.";
      toast.error(msg, { position: "top-right", autoClose: 3000, style: toastStyle });
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">EduConnect</h1>

        {/* Step 1: Index Number */}
        {step === 1 && (
          <>
            <div className="login-subtitle-wrapper">
              <div className="subtitle-line"></div>
              <h2 className="login-subtitle">Sign Up</h2>
              <div className="subtitle-line"></div>
            </div>
            <form onSubmit={handleIndexSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Index Number</label>
                <input type="text" className="form-input" placeholder="Enter your 11-digit index number" value={indexNumber} onChange={(e) => setIndexNumber(e.target.value)} required />
                {errors.indexNumber && <p className="error-message">{errors.indexNumber}</p>}
              </div>
              <button type="submit" className="login-button" disabled={loading}>{loading ? "Sending OTP..." : "Continue"}</button>
              <p className="signup-text">Already have an account? <a href="/">Login</a></p>
            </form>
          </>
        )}

        {/* Step 2: OTP Verification (only) */}
        {step === 2 && (
          <>
            <div className="login-subtitle-wrapper">
              <div className="subtitle-line"></div>
              <h2 className="login-subtitle">Verify OTP</h2>
              <div className="subtitle-line"></div>
            </div>
            <form onSubmit={handleOtpVerify} className="login-form">
              <p className="otp-message">We have sent a 6-digit code to your email: {indexNumber}</p>
              <div className="otp-container">
                {otp.map((digit, idx) => (
                  <input key={idx} ref={(el) => (inputRefs.current[idx] = el)} type="text" inputMode="numeric" maxLength={1} className="otp-input" value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => handleKeyDown(idx, e)} required />
                ))}
              </div>
              {errors.otp && <p className="error-message">{errors.otp}</p>}
              <button type="submit" className="login-button" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</button>
            </form>
          </>
        )}

        {/* Step 3: Password Setup */}
        {step === 3 && (
          <>
            <div className="login-subtitle-wrapper">
              <div className="subtitle-line"></div>
              <h2 className="login-subtitle">Set Your Password</h2>
              <div className="subtitle-line"></div>
            </div>
            <form onSubmit={handlePasswordSubmit} className="login-form">
              <div className="form-group" style={{ position: "relative" }}>
                <label className="form-label">Password</label>
                <input type={showPassword ? "text" : "password"} className="form-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>
              <div className="form-group" style={{ position: "relative" }}>
                <label className="form-label">Confirm Password</label>
                <input type={showConfirmPassword ? "text" : "password"} className="form-input" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
              </div>
              {errors.general && <p className="error-message">{errors.general}</p>}
              <button type="submit" className="login-button" disabled={loading}>{loading ? "Registering..." : "Sign up"}</button>
            </form>
          </>
        )}
        <ToastContainer />
      </div>
    </div>
  );
}