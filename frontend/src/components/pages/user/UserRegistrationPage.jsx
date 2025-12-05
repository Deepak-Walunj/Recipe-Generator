import React, { useState } from "react";
import registration_bg from "@assets/backgrounds/registration_bg.jpeg";
import { useNavigate } from "react-router-dom";
import { userRegistrationApi } from "@repositories/UserRepo";
import { useToast } from "@predefined/Toast.jsx";
import Constants from "@utils/Constants";

export default function UserRegistrationPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [username, setUsername] = useState("");
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");
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
            };
            const response = await userRegistrationApi(payload);
            console.log("User registered successfully:", response.data);
            if (response.success){
                showToast("Registration successful!", "success");
                navigate("/ulogin");
            }else{
              showToast(response.message || "Registration failed", "error");
              setError(response.message || "Registration failed.");
            }
        } 
        catch (err) {
            showToast(err.message || "Registration failed", "error");
            setError(err.message || "Registration failed.");
        }
        finally {
            setLoading(false);
        }
    };

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
