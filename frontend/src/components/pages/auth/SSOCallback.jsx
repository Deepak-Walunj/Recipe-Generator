import { useEffect } from "react";
import { useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { userRegistrationApi } from "@repositories/UserRepo";

export default function SSOCallback() {
    const { user, isLoaded } = useUser()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLoaded || !user) return;

        const registerUser = async () => {
            const payload = {
                email: user.primaryEmailAddress?.emailAddress,
                username: user.fullName || user.username,
                auth_provider: "google"
            }
            const response = await userRegistrationApi(payload)
            if (response.success) {
                navigate("/dashboard")
            } else {
                navigate("/ulogin")
            }
        }
        registerUser()
    }, [user, isLoaded])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg font-medium">Processing Google Sign-In...</p>
            </div>
        </div>
    )
}