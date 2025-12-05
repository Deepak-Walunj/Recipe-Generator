import { useState, useEffect } from "react";
import { getMeApi, deleteMeApi } from "@repositories/AdminRepo";
import { useUser } from "@components/contexts/UserContext";
import { useToast } from "@predefined/Toast.jsx";
import { logOut } from "@/utils/AuthUtils";
import {useNavigate} from "react-router-dom";
import '@components/pages/css/AdminMePage.css';
import '@components/pages/css/Modal.css';

export default function AdminMePage(){
    const navigate = useNavigate();
    const {user} = useUser();
    const {showToast} = useToast();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const token = user?.access_token
        const getProfile = async () => {
            try{
                const resp = await getMeApi(token);
                console.log(resp);
                if (resp.success){
                    setProfile(resp.data);
                    // showToast("Profile fetched successfully.", "success");
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

    const handleDeleteAdmin = async () => {
        try{
            const response = await deleteMeApi(user?.access_token);
            console.log(response);
            if (response.success){
                logOut(true, []);
                showToast("Admin deleted successfully.", "success");
                setError("");
                setProfile(null);
                navigate("/");
            }else{
                setError(response.message || "Failed to delete admin.");
                showToast(response.message || "Failed to delete admin.", "error");
            }
        }catch(err){
            console.error(err);
            setError(err.message || "Failed to delete admin.");
            showToast(err.message || "Failed to delete admin.", "error");
        }finally{
            setLoading(false);
        }
    }

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
                <button className="admin_header_delete" onClick={() => setShowConfirm(true)}>Delete</button>
            </div>
            {showConfirm && (
                <div className="modal_overlay">
                    <div className="modal_box">
                        <h3>Are you sure?</h3>
                        <p>This action will parmanentaly delete your admin account</p>
                        <div className="modal_actions">
                            <button className="modal_cancel" onClick={()=>setShowConfirm(false)}>Cancel</button>
                            <button className="modal_confirm" onClick={()=>{setShowConfirm(false); handleDeleteAdmin();}}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="admin_actions_card">
                <h3 className="admin_actions_title">What Can You Do</h3>
                <div className="admin_action_item">
                    <div>
                        <h4>Manage Users</h4>
                        <p>You can view, edit, and delete user accounts from the system.</p>
                    </div>
                    <button className="admin_action_btn" onClick={() => navigate("/admin/dashboard/users")}>Go</button>
                </div>
                <div className="admin_action_item">
                    <div>
                        <h4>Manage Cuisines</h4>
                        <p>Add, edit, or remove cuisine types used in recipes.</p>
                    </div>
                    <button className="admin_action_btn" onClick={() => navigate("/admin/dashboard/cuisines")}>Go</button>
                </div>
                <div className="admin_action_item">
                    <div>
                        <h4>Manage Recipes</h4>
                        <p>Create, modify, approve, or delete recipes submitted by users.</p>
                    </div>
                    <button className="admin_action_btn" onClick={() => navigate("/admin/dashboard/recipes")}>Go</button>
                </div>
                <div className="admin_action_item">
                    <div>
                        <h4>Manage Ingredients</h4>
                        <p>Add or manage ingredients that can be used when creating recipes.</p>
                    </div>
                    <button className="admin_action_btn" onClick={() => navigate("/admin/dashboard/ingredients")}>Go</button>
                </div>
            </div>
        </div>
    )
}