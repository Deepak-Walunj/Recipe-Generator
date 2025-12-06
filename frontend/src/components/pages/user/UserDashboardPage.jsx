import { NavLink, Outlet } from "react-router-dom";
import '@components/pages/css/EntityDashboardPage.css';
import user_dashboard_bg from "@assets/backgrounds/user_dashboard_bg.jpg";
import { logOut } from "@utils/AuthUtils";
import usePermission from "@utils/UsePermissions.js";

export default function UserDashboard() {
    const { user, isDemo, canSuggestRecipe } = usePermission();
    // console.log("Inside user dashboard"+JSON.stringify({user, isDemo, canSuggestRecipe}))
    const handleLogout = () => {
        logOut(false, []);
        window.location.href = "/";
    }
    return(
        <div className="entity_dashboard_wrapper" style={{backgroundImage: `url(${user_dashboard_bg})`}}>
            <div className="entity_dashboard">
                <aside className="entity_sidebar">
                    <div className="entity_sidebar_header">
                        {isDemo?(
                            <NavLink to="/uregister" className={"entity_menu_item"}>
                                Create account
                            </NavLink>)
                            : "Hey User!"
                            }
                    </div>
                    <div className="entity_sidebar_menu">
                        <NavLink to="/user/dashboard/me" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            My Profile
                        </NavLink>
                        <NavLink to="/user/dashboard/cuisines" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            Explore Cuisines
                        </NavLink>
                        <NavLink to="/user/dashboard/ingredients" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            Explore Ingredients
                        </NavLink>
                        <NavLink to="/user/dashboard/recipes" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            Explore Recipes
                        </NavLink>
                        {canSuggestRecipe ?(
                            <NavLink to="/user/dashboard/srecipes" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                                Suggest Recipes
                            </NavLink>):
                        (
                            <div className="locked_item" title="Sign up to suggest recipes">
                                Suggest Recipes 🔒
                            </div>
                        )}
                        {isDemo? (
                            <NavLink className={"entity_menu_logout"} onClick={() => handleLogout()}>Logout Demo User</NavLink>
                        ):(
                            <NavLink className={"entity_menu_logout"} onClick={() => handleLogout()}>Logout User</NavLink>
                        )}
                    </div>
                </aside>
                <main className="entity_content">
                    <div className="entity_inner_content">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}