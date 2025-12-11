import React, { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode"; // Install: npm install jwt-decode
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ForgotPassword() {
  const [tokenValid, setTokenValid] = useState(false);
  const [userId, setUserId] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔍 Load token on page load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Token not found. Please login again to update your password.");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (!decoded.nameid) {
        toast.error("Invalid token. Please login again.");
        return;
      }

      setUserId(decoded.nameid);
      setTokenValid(true);

    } catch (err) {
      toast.error("Token is invalid. Please login again.");
    }
  }, []);

  // 🔐 Submit new password
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 4 || password.length > 10) {
      toast.warning("Password must be between 4 and 10 characters.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5277/api/Staff/updatePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          newPassword: password,
        }),
      });

      if (!response.ok) throw new Error("Failed to update password");

      toast.success("Password updated successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

    } catch (err) {
      toast.error("Failed to update password");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <ToastContainer />

      {!tokenValid ? (
        <div className="alert alert-danger text-center">
          <strong>Token Not Found!</strong> <br />
          Login again to update your password.
          <br />
          <button
            className="btn btn-primary btn-sm mt-3"
            onClick={() => (window.location.href = "/login")}
          >
            Go to Login
          </button>
        </div>
      ) : (
        <div className="card p-4 shadow-sm">
          <h4 className="text-center text-primary">Reset Password</h4>

          <form onSubmit={handleSubmit}>
            {/* Password Input */}
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={password}
                  minLength={4}
                  maxLength={10}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="input-group-text"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
              <small className="text-muted">
                Password must be 4–10 characters.
              </small>
            </div>

            <button type="submit" className="btn btn-success w-100">
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
