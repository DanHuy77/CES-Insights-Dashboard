import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import { b64_md5 } from "../utils/GenerateHash";

export const PublicRoute = () => {
  const { token } = useAuth();

  if (token && JSON.parse(token) === b64_md5("kanban-chart")) {
    return <Navigate to="/" />;
  }
  // If not authenticated, render the child routes
  return <Outlet />;
};
