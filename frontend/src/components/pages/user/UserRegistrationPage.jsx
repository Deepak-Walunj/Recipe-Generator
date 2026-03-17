import React, { useState } from "react";
import registration_bg from "@assets/backgrounds/registration_bg.jpeg";
import { useNavigate } from "react-router-dom";
import { userRegistrationApi } from "@repositories/UserRepo";
import { resendVerificationApi } from "@repositories/AuthRepo"
import { useToast } from "@predefined/Toast.jsx";
import Constants from "@utils/Constants";
import "@components/pages/css/RegistrationPage.css";

export default function UserRegistrationPage() {

    const navigate = useNavigate();
    const { showToast } = useToast();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [entityType, setEntityType] = useState("")
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [view, setView] = useState("form");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const payload = {
                username,
                email,
                password,
                entity_type: Constants.ENTITY.USER
            };
            const response = await userRegistrationApi(payload);
            if (response.success) {
                setEntityType(Constants.ENTITY.USER)
                showToast("Verification email sent!", "success");
                setView("verify");
            } else {
                showToast(response.message || "Registration failed", "error");
                setError(response.message || "Registration failed.");
            }
        } catch (err) {
            showToast(err.message || "Registration failed", "error");
            setError(err.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    const resendVerificationEmail = async () => {
        setResending(true);
        try {
            const response = await resendVerificationApi( email, entityType );
            if (response.success) {
                if (response.data?.already_verified) {
                    setView("already_verified");
                    showToast("Email already verified. Please login.", "success");
                } else {
                    setView("verify");
                    showToast("Verification email sent!", "success");
                }
            } else {
                showToast(response.message || "Failed to resend email", "error");
            }
        } catch (err) {
            showToast(err.message || "Failed to resend email", "error");
        } finally {
            setResending(false);
        }
    };
    if (view === "already_verified") {
        return (
            <main className="register" style={{ backgroundImage: `url(${registration_bg})` }}>
                <div className="register_overlay"></div>
                <div className="register_card verify_card">
                    <h2 className="verify_title">✅ Email Already Verified</h2>
                    <p className="verify_text">
                        Your email is already verified. You can log in to your account.
                    </p>
                    <div className="verify_actions">
                        <button
                            className="register_btn"
                            onClick={() => navigate("/ulogin")}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (view === "verify") {
        return (
            <main className="register" style={{ backgroundImage: `url(${registration_bg})` }}>
                <div className="register_overlay"></div>
                <div className="register_card verify_card">
                    <h2 className="verify_title">📧 Verify Your Email</h2>
                    <p className="verify_text">
                        We sent a verification link to
                    </p>
                    <p className="verify_email">{email}</p>
                    <p className="verify_text">
                        Click the link in the email to activate your account.
                    </p>
                    <div className="verify_actions">
                        <button
                            className="register_btn"
                            onClick={() => navigate("/ulogin")}
                        >
                            Go to Login
                        </button>

                        <button
                            className="register_btn_secondary"
                            onClick={resendVerificationEmail}
                            disabled={resending}
                        >
                            {resending ? "Resending..." : "Resend Email"}
                        </button>
                    </div>
                    <p className="verify_hint">
                        Didn't receive the email? Check your spam folder.
                    </p>
                </div>
            </main>
        );
    }

    if (view === "form"){
        return (
            <main className="register" style={{ backgroundImage: `url(${registration_bg})` }}>
                <div className="register_overlay"></div>
                <div className="register_card">
                    <h1 className="register_title">Create an Account</h1>
                    <p className="register_subtitle">
                        Join RecipeGen to explore, save, and master recipes.
                    </p>
                    {error && <p className="register_error">{error}</p>}
                    <form className="register_form" onSubmit={handleSubmit}>
                        <div>
                            <label className="register_label">Full Name</label>
                            <input
                                type="text"
                                className="register_input"
                                placeholder="Enter your full name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="register_label">Email</label>
                            <input
                                type="email"
                                className="register_input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="register_label">Password</label>
                            <input
                                type="password"
                                className="register_input"
                                placeholder="Enter password (min 6 chars)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="register_btn" disabled={loading}>
                            {loading ? "Creating Account..." : "Register"}
                        </button>
                    </form>
                    <div className="register_footer">
                        Already have an account?{" "}
                        <a href="/ulogin">Login here</a>
                    </div>
                </div>
            </main>
        );
    }
}