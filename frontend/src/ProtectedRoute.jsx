// src/utils/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    if (allowedRoles.includes(userRole)) {
      return <Outlet />; // render nested routes
    } else {
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    console.error('Invalid token', err);
    return <Navigate to="/login" replace />;
  }
}
