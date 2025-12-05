import React, {useState} from "react";
import login_bg from "@assets/backgrounds/login_bg.jpeg";
import "@components/pages/css/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "@predefined/Toast.jsx";
import { useUser } from "@components/contexts/UserContext";

import { adminLoginApi } from "@repositories/AuthRepo";

import { handleLoginSuccess } from "@utils/AuthUtils";
import Constants from "@utils/Constants";

export default function AdminLoginPage(){
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
            const data = await adminLoginApi(email, password);
            if (data.success){
                console.log(data);
                const access_token = data.data.access_token;
                handleLoginSuccess(Constants.ENTITY.ADMIN, access_token, setUser);
                showToast("Login successful!", "success");
                navigate("/admin/dashboard");
            }else{
                console.log(data);
                setError(data.message || "Login failed. Please try again.");
                showToast(data.message || "Login failed. Please try again.", "error");
            }
        }catch(err){
            console.log(err);
            setError(err.message || "Login failed. Please try again.");
            showToast(err.message || "Login failed. Please try again.", "error");
        }finally{
            setLoading(false);
        }
    }

    return(
        <main className="login" style={{backgroundImage: `url(${login_bg})`}}>
            <div className="login_overlay"></div>
            <div className="login_card">
                <h1 className="login_title">Admin Login</h1>
                <p className="login_subtitle">
                    This is the admin login page. Please enter your credentials to access the admin panel.
                </p>
                {error && (
                    <p style={{ color: "salmon", textAlign: "center" }}>
                        {error}
                    </p>
                )}
                <form className="login_form" onSubmit={handleSubmit}>
                    <div className="login_form_label">
                        <label>Email</label>
                        <input 
                        type="email" 
                        placeholder="Enter email" 
                        value={email} onChange={(e) => setEmail(e.target.value)} 
                        required
                        />
                    </div>
                    <div>
                        <label className="login_form_label">Password</label>
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
            </div>
        </main>
    )
}