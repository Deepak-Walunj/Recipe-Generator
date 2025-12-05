import { NavLink, Outlet } from "react-router-dom";
import '@components/pages/css/EntityDashboardPage.css';
import user_dashboard_bg from "@assets/backgrounds/user_dashboard_bg.jpg";
import { logOut } from "@/utils/AuthUtils";

export default function UserDashboard() {
    const handleLogout = () => {
        logOut(false, []);
        window.location.href = "/";
    }
    return(
        <div className="entity_dashboard_wrapper" style={{backgroundImage: `url(${user_dashboard_bg})`}}>
            <div className="entity_dashboard">
                <aside className="entity_sidebar">
                    <div className="entity_sidebar_header">
                        Hey User!
                    </div>
                    <div className="entity_sidebar_menu">
                        <NavLink to="/me" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            My Profile
                        </NavLink>
                        <NavLink to="/cuisines" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            Explore Cuisines
                        </NavLink>
                        <NavLink to="/ingredients" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            Explore Ingredients
                        </NavLink>
                        <NavLink to="/recipes" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            Explore Recipes
                        </NavLink>
                        <NavLink to="/srecipes" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            Suggest Recipes
                        </NavLink>
                        <NavLink className={"entity_menu_logout"} onClick={() => handleLogout()}>
                            Logout
                        </NavLink>
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