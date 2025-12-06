import { NavLink, Outlet } from "react-router-dom";
import '@components/pages/css/EntityDashboardPage.css';
import admin_dashboard_bg from "@assets/backgrounds/admin_dashboard_bg.jpeg";
import { logOut } from "@/utils/AuthUtils";

export default function AdminDashboard() {
    const handleLogOut = () => {
        logOut(true, []);
        window.location.href = "/";
    }
    return (
        <div className="entity_dashboard_wrapper" style={{backgroundImage: `url(${admin_dashboard_bg})`}}>
            <div className="entity_dashboard">
                <aside className="entity_sidebar">
                    <div className="entity_sidebar_header">
                        Recipe Admin
                    </div>
                    <div className="entity_sidebar_menu">
                        <NavLink to="/admin/dashboard/me" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            My Profile
                        </NavLink>
                        <NavLink to="/admin/dashboard/users" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            Manage Users
                        </NavLink>
                        <NavLink to="/admin/dashboard/cuisines" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            Manage Cuisines
                        </NavLink>
                        <NavLink to="/admin/dashboard/recipes" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            Manage Recipes
                        </NavLink>
                        <NavLink to="/admin/dashboard/ingredients" className={({ isActive }) => isActive ? "entity_menu_item active" : "entity_menu_item"}>
                            Manage Ingredients
                        </NavLink>
                        <NavLink className={"entity_menu_logout"} onClick={() => handleLogOut()}>
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