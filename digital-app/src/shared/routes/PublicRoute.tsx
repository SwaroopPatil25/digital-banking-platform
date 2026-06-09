import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import type { ReactNode } from "react";

interface PublicRouteProps {
  children?: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PublicRoute;
