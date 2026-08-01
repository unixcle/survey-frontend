import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute() {
  const location = useLocation();
  const { access, refresh } = useSelector((s) => s.auth);

  // اگر هیچ توکنی نداریم => اصلاً نذار route محافظت‌شده رندر بشه
  if (!access && !refresh) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
