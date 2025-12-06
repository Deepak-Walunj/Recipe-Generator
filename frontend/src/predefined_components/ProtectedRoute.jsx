import { Navigate } from "react-router-dom";
import { useUser } from "@components/contexts/UserContext";

/**
 * Protects a route that needs a logged user (access token).
 * If user is demo or not authenticated -> redirect to dashboard.
 */

export function ProtectedRoute({ children, requireAuth = true}){
    const {user} = useUser()
    const isLogged = user?.userType === "logged";
    const isDemo = user?.userType === "demo";
    if (requireAuth && !isLogged){
        if (user.userType === "demo") return <Navigate to="/uregister" />
        return <Navigate to="/ulogin"/>
    }
    return children
}