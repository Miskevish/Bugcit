import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
