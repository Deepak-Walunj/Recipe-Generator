import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegistrationPage from "@components/auth/UserRegistrationPage";
import LandingPage from "@components/auth/LandingPage";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage />},
  { path: "/register", element: <RegistrationPage /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
