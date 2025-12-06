import { useState, useEffect, useDebugValue } from "react";
import { getMeApi, deleteUserApi } from "@repositories/UserRepo";
import { useUser } from "@components/contexts/UserContext";
import { useToast } from "@predefined/Toast.jsx";
import { logOut } from "@/utils/AuthUtils";
import {useNavigate} from "react-router-dom";
import '@components/pages/css/EntityMePage.css';
import '@components/pages/css/Modal.css';

export default function UserMePage(){
    const navigate = useNavigate()
    const {user} = useUser()
    // console.log(JSON.stringify(user.userType))
    const isDemo = user?.userType === "demo";
    const token = user?.access_token || null
    const {showToast} = useToast()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [profile, setProfile] = useState(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const demoProfile = {
        username: "Demo User",
        email: "demo@recipegencook.ai",
        role: "Demo",
    };
    useEffect(() => {
        if (isDemo){
            // console.log("Fetching profile for demo user")
            setProfile(demoProfile);
            setLoading(false);
            return;
        }
        const getProfile = async () => {
            try{
                const resp = await getMeApi(token)
                // console.log(resp)
                if(resp.success){
                    setProfile(resp.data)
                    setError("")
                }
            }catch(err){
                console.log(err)
                setError(err.message || "Failed to fetch user profile.")
                showToast(err.message || "Failed to fetch user profile.", "error")
            }finally{
                setLoading(false)
            }
        }
        getProfile()
    }, [isDemo, token])

    const handleDeleteUser = async () => {
        if (isDemo){
            showToast("Demo users cannot delete account. Create an account to unlock this.", "warning");
            return;
        }
        try{
            const response = await deleteUserApi(user?.access_token)
            console.log(response)
            if (response.success){
                logOut(true, [])
                showToast("User deleted successfully.", "success")
                setError("")
                setProfile(null)
                navigate("/")
            }else{
                setError(response.message || "Failed to delete user.")
                showToast(response.message || "Failed to delete user.", "error")
            }
        }catch(err){
            console.error(err)
            setError(err.message || "Failed to delete user.")
            showToast(err.message || "Failed to delete user.", "error")
        }finally{
            setLoading(false)
        }
    }

    if (loading){
        return <p>Loading profile...</p>
    }
    if (error){
        return <p style={{ color: "salmon" }}>{error}</p>
    }

    return (
        <div className="entity_me_main">
            <h2 className="entity_me_title">
                Hey {isDemo? "Demo User" : "User"} 👋
            </h2>
            <div className="entity_me_subtitle">
                Welcome to your profile page. Here are your details:
            </div>
            <div className="entity_me_profile_card">
                <p><strong>Name:</strong> {profile.username || "User"}</p>
                <p><strong>Email:</strong> {profile?.email}</p>
                <p><strong>Role:</strong> {isDemo? "Demo User" : "User"}</p>
                {!isDemo && (
                    <button className="entity_header_delete" onClick={() => setShowConfirm(true)}>
                        Delete
                    </button>
                )}
            </div>
            {showConfirm && !isDemo && (
                <div className="modal_overlay">
                    <div className="modal_box">
                        <h3>Are you sure?</h3>
                        <p>This action will permanently delete your user account.</p>
                        <div className="modal_actions">
                            <button className="modal_cancel" onClick={()=>setShowConfirm(false)}>Cancel</button>
                            <button className="modal_confirm" onClick={() => {setShowConfirm(false); handleDeleteUser()}}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="entity_actions_card">
                <h3 className="entity_actions_title">What Can We Do?</h3>
                <div className="entity_action_item">
                    <div>
                        <h4>Lets Explore Cuisines</h4>
                        <p>Lets Explore The Cuisines We Have For You</p>
                    </div>
                    <button className="entity_action_btn" onClick={() => navigate("user/dashboard/cuisines")}>Go</button>
                </div>
                <div className="entity_action_item">
                    <div>
                        <h4>Or Lets Explore Recipes</h4>
                        <p>Lets Explore All The Delicious And Tasty Recipes We Have For You.</p>
                    </div>
                    <button className="entity_action_btn" onClick={() => navigate("user/dashboard/recipes")}>Go</button>
                </div>
                <div className="entity_action_item">
                    <div>
                        <h4>Or Lets Explore Ingredient Catalogue</h4>
                        <p>Lets Explore All The Magic Ingredients With Which We Make Delicious Recipes.</p>
                    </div>
                    <button className="entity_action_btn" onClick={() => navigate("user/dashboard/ingredients")}>Go</button>
                </div>
                <div className="entity_action_item">
                    <div>
                        <h4>Or Want to Suggest Your Own Special Recipe?</h4>
                        <p>On RecipeGen You Can Suggest Your Own Tasty And Delicious Recipes.</p>
                    </div>
                    {isDemo? (
                        <button className="entity_action_btn disabled"
                            style={{ background: "#9ca3af", cursor: "not-allowed" }}>Locked</button>
                    ): (
                        <button className="entity_action_btn" onClick={() => navigate("user/dashboard/ingredients")}>Go</button>
                    )}
                    
                </div>
            </div>
        </div>
    )
}