import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/router";

export default function RequireAdmin({ children }) {
  const currentUser = useSelector((state) => state.user.currentUser);
  const isAdmin =
    currentUser?.role === "admin" ||
    (localStorage.getItem("userRole") === "admin" &&
      !!localStorage.getItem("accessToken"));

  if (!isAdmin) {
    return <Navigate to={ROUTES.USER.LOGIN} replace />;
  }

  return children;
}
