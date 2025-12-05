import { useUser} from "@/components/contexts/UserContext";

export default function usePremissions(){
    const {user}= useUser();
    const userType = user?.userType || null;
    const isDemo = userType === "demo"
    const isLogged = userType === "logged"
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