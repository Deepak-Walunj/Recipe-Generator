import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UnderConstruction from "@/components/error/UnderConstruction";
import UnknownPage from "./components/error/UnknownPage";
import RootLayout from "@/layouts/RootLayout";

import RegistrationPage from "@components/pages/user/UserRegistrationPage.jsx";
import LandingPage from "@components/pages/auth/LandingPage";
import AdminLoginPage from "@components/pages/auth/AdminLoginPage";
import UserLoginPage from "@components/pages/auth/UserLoginPage";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <UnderConstruction />,   // route-level failure
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/alogin", element: <AdminLoginPage />},
      { path: "/ulogin", element: <UserLoginPage />},
      { path: "/uregister", element: <RegistrationPage /> },
      // Add more below
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
