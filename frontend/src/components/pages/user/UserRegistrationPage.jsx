import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { userRegistrationApi } from "@repositories/UserRepo";
import { resendVerificationApi } from "@repositories/AuthRepo";
import { useToast } from "@predefined/Toast.jsx";
import Constants from "@utils/Constants";
import { useSignIn } from '@clerk/react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from "lucide-react";

import registration_bg from "@assets/backgrounds/registration_bg_new.png";
import g_logo from "@assets/backgrounds/g-logo.png";
import "@components/pages/css/RegistrationPage.css";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function UserRegistrationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { signIn } = useSignIn();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("form"); // "form" | "verify" | "already_verified"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        username,
        email,
        password,
        entity_type: Constants.ENTITY.USER,
        auth_provider: "email"
      };

      const response = await userRegistrationApi(payload);
      
      if (response.success) {
        showToast(response.message || "Account created successfully!", "success");
        setView("verify");
      } else {
        const errMsg = response.message || "Registration failed. Please try again.";
        setError(errMsg);
        showToast(errMsg, "error");
      }
    } catch (err) {
      const errMsg = err.message || "An unexpected error occurred.";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await resendVerificationApi(email, Constants.ENTITY.USER);
      if (response.success) {
        if (response.already_verified) {
          setView("already_verified");
          showToast("Account already verified. Please login.", "success");
        } else {
          showToast("Verification link sent to your inbox!", "success");
        }
      }
    } catch (err) {
      showToast(err.message || "Failed to resend link", "error");
    } finally {
      setResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (!signIn) {
          showToast("Auth provider not initialized", "error");
          return;
      }
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/sso-callback",
      });
    } catch (err) {
      console.error("Google Auth error:", err);
      showToast("Google connection failed", "error");
    }
  };

  return (
    <main className="register" style={{ backgroundImage: `url(${registration_bg})` }}>
      <div className="register_overlay"></div>
      
      <div className="register_container">
        <AnimatePresence mode="wait">
          {view === "form" && (
            <motion.div 
              key="form"
              className="register_card"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h1 className="register_title">Master Your Kitchen</h1>
              <p className="register_subtitle">
                Join thousands of home chefs creating magic every day.
              </p>

              <form className="register_form" onSubmit={handleSubmit}>
                <div className="input_group">
                  <label className="register_label flex items-center gap-2">
                    <User size={16} className="text-gray-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    className="register_input"
                    placeholder="Gordon Ramsay"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="input_group">
                  <label className="register_label flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    className="register_input"
                    placeholder="chef@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input_group">
                  <label className="register_label flex items-center gap-2">
                    <Lock size={16} className="text-gray-400" /> Secure Password
                  </label>
                  <input
                    type="password"
                    className="register_input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="register_error flex items-center justify-center gap-2"
                  >
                    <AlertCircle size={16} /> {error}
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  className="register_btn" 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>Create Account <ArrowRight size={20} /></>
                  )}
                </button>

                <div className="register_divider">
                  <span>Or join with</span>
                </div>

                <button
                  type="button"
                  className="google_btn"
                  onClick={handleGoogleLogin}
                >
                  <img src={g_logo} alt="Google" />
                  Continue with Google
                </button>
              </form>

              <div className="register_footer">
                Already part of the family?{" "}
                <a href="/ulogin">Sign in here</a>
              </div>
            </motion.div>
          )}

          {view === "verify" && (
            <motion.div 
              key="verify"
              className="register_card verify_card"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
              >
                <span className="verify_icon">📧</span>
              </motion.div>
              
              <h2 className="verify_title">Check Your Inbox</h2>
              <p className="verify_text">
                We've sent a special link to confirm your culinary journey.
              </p>
              <div className="verify_email">{email}</div>
              
              <div className="verify_actions">
                <button
                  className="register_btn"
                  onClick={() => navigate("/ulogin")}
                >
                  Go to Login <ArrowRight size={20} />
                </button>

                <button
                  className="register_btn_secondary flex items-center justify-center gap-2"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <><RefreshCw size={18} /> Resend verification link</>
                  )}
                </button>
              </div>
              
              <p className="verify_hint">
                Can't find it? Please check your spam folder just in case.
              </p>
            </motion.div>
          )}

          {view === "already_verified" && (
            <motion.div 
              key="already_verified"
              className="register_card verify_card"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-6" />
              <h2 className="verify_title">Welcome Back!</h2>
              <p className="verify_text">
                Your account is already verified and ready for some kitchen magic.
              </p>
              
              <div className="verify_actions">
                <button
                  className="register_btn"
                  onClick={() => navigate("/ulogin")}
                >
                  Jump to Login <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}