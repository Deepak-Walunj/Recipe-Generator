import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UnderConstruction from "@/components/error/UnderConstruction";
import RootLayout from "@/layouts/RootLayout";

import RegistrationPage from "@components/pages/user/UserRegistrationPage.jsx";
import LandingPage from "@components/pages/auth/LandingPage";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <UnderConstruction />,   // route-level failure
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/register", element: <RegistrationPage /> },
      // Add more below
    ],
  },
  {
    path: "*",
    element: <UnderConstruction />,   // fallback for unknown routes
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
