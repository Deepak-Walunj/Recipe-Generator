import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UnderConstruction from "@/components/error/UnderConstruction";
import UnknownPage from "./components/error/UnknownPage";
import RootLayout from "@/layouts/RootLayout";

import RegistrationPage from "@components/pages/user/UserRegistrationPage.jsx";
import LandingPage from "@components/pages/auth/LandingPage";
import AdminLoginPage from "@components/pages/auth/AdminLoginPage";
import UserLoginPage from "@components/pages/auth/UserLoginPage";
import AdminDashboard from "./components/pages/admin/AdminDashboardPage";
import AdminMePage from "./components/pages/admin/AdminMePage";
import UserDashboard from "./components/pages/user/UserDashboardPage";
import UserMePage from "./components/pages/user/UserMePage";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <UnderConstruction />,   // route-level failure
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/alogin", element: <AdminLoginPage />},
      { path: "/ulogin", element: <UserLoginPage />},
      { path: "/uregister", element: <RegistrationPage /> },
      { 
        path: "/admin/dashboard", 
        element: <AdminDashboard />,
        children: [
          { index: true, element: <AdminMePage />},
          { path: "/admin/dashboard/me", element: <AdminMePage />},
        ]
      },
      {
        path: "/user/dashboard",
        element: <UserDashboard/>,
        children: [
          { index: true, element: <UserMePage />},
        ]
      }
    ],
  },
  {
    path: "*",
    element: <UnknownPage />,   // fallback for unknown routes
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
