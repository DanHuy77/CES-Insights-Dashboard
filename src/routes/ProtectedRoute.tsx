import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import { b64_md5 } from "../utils/GenerateHash";

export const ProtectedRoute = () => {
  const { token, setToken } = useAuth();

  if (!token || JSON.parse(token) !== b64_md5("kanban-chart")) {
    setToken("");
    return <Navigate to="/" />;
  }
  // If authenticated, render the child routes
  return <Outlet />;
};
