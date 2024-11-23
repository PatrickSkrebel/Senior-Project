import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const PrivateRoute = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>; // Optional: Replace with a spinner or loading indicator
  }

  if (!session) {
    return <Navigate to="/user/signin" replace />; // Redirect unauthenticated users to sign-in
  }

  return <>{children}</>;
};

export default PrivateRoute;
