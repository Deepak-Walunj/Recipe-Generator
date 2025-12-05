import { useState, useEffect } from "react";
import { getMeApi } from "@repositories/AdminRepo";
import { useUser } from "@components/contexts/UserContext";
import { useToast } from "@predefined/Toast.jsx";
import '@components/pages/css/AdminMePage.css';

export default function AdminMePage(){
    const {user} = useUser();
    const {showToast} = useToast();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const getProfile = async () => {
            try{
                const token = user?.access_token
                const resp = await getMeApi(token);
                console.log(resp);
                if (resp.success){
                    setProfile(resp.data);
                    showToast("Profile fetched successfully.", "success");
                    setError("");
                }else{
                    setError(resp.message || "Failed to fetch profile.");
                    showToast(resp.message || "Failed to fetch profile.", "error");
                }
            }catch(err){
                console.log(err);
                setError(err.message || "Failed to fetch profile.");
                showToast(err.message || "Failed to fetch profile.", "error");
            }finally{
                setLoading(false);
            }
        }
        getProfile();
    }, [])
    if (loading){
        return <p>Loading...</p>;
    }
    if (error){
        return <p style={{ color: "salmon" }}>{error}</p>;
    }
    return (
        <div className="admin_me_main">
            <h2 className="admin_me_title">
                Hey Admin 👋
            </h2>
            <div className="admin_me_subtitle">
                Welcome to your profile page. Here are your details:
            </div>
            <div className="admin_me_profile_card">
                <p><strong>Name:</strong> {profile.name || "Admin"}</p>
                <p><strong>Email:</strong> {profile?.email}</p>
                <p><strong>Role:</strong> {profile.role || "Administrator"}</p>
            </div>
            <div className="admin_header_logout">
                <button>Logout</button>
            </div>
        </div>
    )
}