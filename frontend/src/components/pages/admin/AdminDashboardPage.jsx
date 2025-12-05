import { NavLink, Outlet } from "react-router-dom";
import '@components/pages/css/AdminDashboardPage.css';
import admin_dashboard_bg from "@assets/backgrounds/admin_dashboard_bg.jpeg";
export default function AdminDashboard() {
    return (
        <div className="admin_dashboard_wrapper" style={{backgroundImage: `url(${admin_dashboard_bg})`}}>
            <div className="admin_dashboard">
                <aside className="admin_sidebar">
                    <div className="admin_sidebar_header">
                        Recipe Admin
                    </div>
                    <div className="admin_sidebar_menu">
                        <NavLink to="/me" className={({ isActive }) => isActive ? "admin_menu_item active" : "admin_menu_item"}>
                            My Profile
                        </NavLink>
                        <NavLink to="/users" className={({ isActive }) => isActive ? "admin_menu_item active" : "admin_menu_item"}>
                            Manage Users
                        </NavLink>
                        <NavLink to="/recipes" className={({ isActive }) => isActive ? "admin_menu_item active" : "admin_menu_item"}>
                            Manage Recipes
                        </NavLink>
                    </div>
                </aside>
                <main className="admin_content">
                    <div className="admin_inner_content">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}