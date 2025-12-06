import React, {use, useState} from "react";
import login_bg from "@assets/backgrounds/login_bg.jpeg";
import "@components/pages/css/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "@predefined/Toast.jsx";
import { useUser } from "@components/contexts/UserContext";
import { userLoginApi } from "@repositories/AuthRepo";
import { handleLoginSuccess } from "@utils/AuthUtils";
import Constants from "@utils/Constants";

export default function UserLoginPage(){
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try{
            const data = await userLoginApi(email, password);
            if (data.success){
                // console.log("Access_token:", data.data.access_token);
                const access_token = data.data.access_token;
                handleLoginSuccess(Constants.ENTITY.USER, access_token, setUser, "logged");
                showToast("Login successful!", "success");
                navigate("/user/dashboard");
            }else{
                setError(data.message || "Login failed. Please try again.");
                showToast(data.message || "Login failed. Please try again.", "error");
            }
        }catch(err){
            showToast(err.message || "Login failed. Please try again.", "error");
            setError(err.message || "Login failed. Please try again.");
        }finally{
            setLoading(false);
        }
    }
    return(
        <main className="login" style={{backgroundImage: `url(${login_bg})`}}>
            <div className="login_overlay"></div>
            <div className="login_card">
                <h1 className="login_title">User Login</h1>
                <p className="login_subtitle">
                    This is the user login page. Please enter your credentials to access the admin panel.
                </p>
                {error && (
                    <p style={{ color: "red", textAlign: "center" }}>
                        {error}
                    </p>
                )}
                <form className="login_form" onSubmit={handleSubmit}>
                    <div className="login_form_label">
                        <label>Email</label>
                        <input 
                        type="email" 
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        />
                    </div>
                    <div className="login_form_label">
                        <label>Password</label>
                        <input 
                        type="password" 
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        />
                    </div>
                    <button className="btn btn--primary">{loading ? "Logging in..." : "Login"}</button>
                </form>
                <div className="login_footer">
                    <small>
                        Don't have an account?{" "}
                        <a href="/uregister">Sign up</a>
                    </small>
                </div>
            </div>
        </main>
    )
}