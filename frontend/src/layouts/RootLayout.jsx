import ErrorBoundary from "@/components/error/ErrorBoundary";
import { Outlet } from "react-router-dom";
export default function RootLayout() {
  return (
  <ErrorBoundary>
    <Outlet />
  </ErrorBoundary>
  )
}
