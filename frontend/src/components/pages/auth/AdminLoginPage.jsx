import React, {useState} from "react";
import login_bg from "@/assets/backgrounds/login_bg.jpeg";
import "@/components/pages/auth/LoginPage.css";
import { useNavigate } from "react-router-dom";

import { useUser } from "@/components/contexts/UserContext";

import { adminLoginApi } from "@/repositories/AuthRepo";

import { handleLoginSuccess } from "@/utils/AuthUtils";
import Constants from "@utils/Constants";

export default function AdminLoginPage(){
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
            console.log("Access_token:", data.data.access_token);
            const access_token = data.data.access_token;
            handleLoginSuccess(Constants.ENTITY.ADMIN, access_token, setUser);
            navigate("/admin/dashboard");
        }catch(err){
            setError(err.message || "Login failed. Please try again.");
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