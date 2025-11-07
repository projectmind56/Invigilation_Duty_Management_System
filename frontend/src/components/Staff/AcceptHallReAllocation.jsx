import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AcceptHallReAllocation() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStaffId, setCurrentStaffId] = useState(null);

  // Decode JWT token to get staffId
  const decodeToken = (token) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    const staffId = decoded?.nameid;
    setCurrentStaffId(staffId);

    if (!staffId) {
      setError("Invalid token. Could not extract staff ID.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5277/api/Staff/reallocationRequests/${staffId}`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reallocation requests");
        return res.json();
      })
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading reallocation requests");
        setLoading(false);
      });
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const res = await fetch(
        `http://localhost:5277/api/Staff/reallocationRequests/accept`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId }),
        }
      );

      if (!res.ok) throw new Error("Failed to accept request");

      toast.success("Reallocation request accepted!");
      setRequests((prev) =>
        prev.map((r) =>
          r.requestId === requestId ? { ...r, requestStatus: "approved" } : r
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Error accepting request");
    }
  };

  const handleReject = async (requestId) => {
    try {
      const res = await fetch(
        `http://localhost:5277/api/Staff/reallocationRequests/reject`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId }),
        }
      );

      if (!res.ok) throw new Error("Failed to reject request");

      toast.success("Reallocation request rejected!");
      setRequests((prev) =>
        prev.map((r) =>
          r.requestId === requestId ? { ...r, requestStatus: "rejected" } : r
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Error rejecting request");
    }
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (error)
    return (
      <div className="alert alert-danger mt-4 text-center" role="alert">
        {error}
      </div>
    );

  return (
    <div className="container-fluid mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="mb-4 text-center">Reallocation Requests</h2>

      {requests.length === 0 ? (
        <p className="text-center">No reallocation requests found.</p>
      ) : (
        <div className="table-responsive">
<table className="table table-striped table-bordered align-middle">
  <thead className="table-dark text-center">
    <tr>
      <th>Request ID</th>
      <th>From Staff Email</th>
      <th>Session</th>
      <th>Semester</th>
      <th>Subject Code</th>
      <th>Subject Name</th>
      <th>Department</th>
      <th>Class</th>
      <th>Branch</th>
      <th>Year</th>
      <th>Allocation Status</th>
      <th>Exam Date</th>
      <th>Request Status</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody className="text-center">
    {requests.map((r) => {
      let statusLabel = "";
      let statusClass = "";

      switch (r.requestStatus) {
        case "approved":
          statusLabel = "Accepted";
          statusClass = "bg-success";
          break;
        case "rejected":
          statusLabel = "Rejected";
          statusClass = "bg-danger";
          break;
        case "canceled":
          statusLabel = "Canceled";
          statusClass = "bg-danger";
          break;
        case "pending":
        default:
          statusLabel = "Pending";
          statusClass = "bg-warning text-dark";
      }

      return (
        <tr key={r.requestId}>
          <td>{r.requestId}</td>
          <td>{r.fromStaffEmail}</td>
          <td>{r.session}</td>
          <td>{r.semester}</td>
          <td>{r.subjectCode}</td>
          <td>{r.subjectName}</td>
          <td>{r.department}</td>
          <td>{r.className}</td>
          <td>{r.branch}</td>
          <td>{r.year}</td>
          <td>{r.allocationStatus}</td>
          <td>{new Date(r.examDate).toLocaleDateString()}</td>
          <td>
            <span className={`badge ${statusClass}`}>
              {statusLabel}
            </span>
          </td>
          <td>
            {r.requestStatus === "pending" ? (
              <div className="d-flex justify-content-center gap-2">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleAccept(r.requestId)}
                >
                  Accept
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleReject(r.requestId)}
                >
                  Reject
                </button>
              </div>
            ) : (
              <span className="text-muted">—</span>
            )}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

        </div>
      )}
    </div>
  );
}

export default AcceptHallReAllocation;
