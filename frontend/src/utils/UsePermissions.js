import { useUser} from "@/components/contexts/UserContext";

export default function usePremissions(){
    const {user}= useUser();
    const userType = user?.userType || null;
    const isDemo = userType === "demo"
    const isLogged = userType === "logged"
    // console.log("Inside use permissions "+JSON.stringify(user))
    return {
        user,
        userType,
        isDemo,
        isLogged,
        canSuggestRecipe: isLogged,
        // canSaveRecipe: isLogged,
        // canManageAccount: isLogged,
    }
}