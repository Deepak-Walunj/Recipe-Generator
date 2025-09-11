import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegistrationPage from "@components/user/RegistrationPage";

const router = createBrowserRouter([
  { path: "/register", element: <RegistrationPage /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
