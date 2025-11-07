// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ element, role, allowedRole }) {
    
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  if (role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  return element;
}
