import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AcceptHallAllocation() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [currentAllocation, setCurrentAllocation] = useState(null);
  const [currentStaffId, setCurrentStaffId] = useState(null);

  // Decode JWT token
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

    fetch(
      `http://localhost:5277/api/Staff/allExamTimeTableAllocationsByStaffId/${staffId}`,
      { headers: { Accept: "application/json" } }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setAllocations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading data");
        setLoading(false);
      });
  }, []);

  const handleAccept = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5277/api/Staff/acceptExamTimeTableAllocation/${id}`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("Failed to accept allocation");

      toast.success("Allocation accepted successfully!");
      setAllocations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "accepted" } : a))
      );
    } catch (err) {
      toast.error("Error accepting allocation.");
      console.error(err);
    }
  };

  const handleReallocate = async (allocation) => {
    const { session, examDate, id: allocationId } = allocation;
    setCurrentAllocation(allocation); // store allocation for request

    try {
      const queryParams = new URLSearchParams({ session, examDate, allocationId }).toString();
      const res = await fetch(
        `http://localhost:5277/api/Staff/availableStaff?${queryParams}`
      );
      if (!res.ok) throw new Error("Failed to fetch available staff");

      const data = await res.json();

      // Remove current staff from the list

      const filtered = data.filter((s) => s.staffId !== Number(currentStaffId));

      setAvailableStaff(filtered);
      setSelectedStaffIds([]);
      setShowStaffModal(true);
    } catch (err) {
      toast.error("Error fetching available staff.");
      console.error(err);
    }
  };

  const handleCheckboxChange = (staffId) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleRequestReallocation = async (staffId) => {

    if (!currentAllocation || !staffId) return;

    const requestBody = {
      allocationId: currentAllocation.id,
      examId: currentAllocation.id, // make sure examId exists in allocation
      fromStaffId: parseInt(currentStaffId),
      toStaffIds: [staffId], // single staff for Send button
    };

    console.log(requestBody);


    try {
      const res = await fetch(
        "http://localhost:5277/api/Staff/requestReallocation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.message) {
          toast.warning(errorData.message); // show server warning
        }
        throw new Error("Failed to request reallocation");
      }

      toast.success("Reallocation request sent successfully!");
      // Optionally, update the staff's status locally
      setAvailableStaff((prev) =>
        prev.map((s) =>
          s.staffId === staffId ? { ...s, reallocationStatus: "pending" } : s
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Error sending reallocation request.");
    }
  };



  const closeModal = () => setShowStaffModal(false);

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
      <h2 className="mb-4 text-center">Exam Time Table Allocations</h2>

      {allocations.length === 0 ? (
        <p className="text-center">No allocations found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-dark text-center">
              <tr>
                <th>ID</th>
                <th>Session</th>
                <th>Semester</th>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Department</th>
                <th>Class</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Status</th>
                <th>Exam Date</th>
                <th>Rellocation Staff Id</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {allocations.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.session}</td>
                  <td>{a.semester}</td>
                  <td>{a.subjectCode}</td>
                  <td>{a.subjectName}</td>
                  <td>{a.departmentName}</td>
                  <td>{a.className}</td>
                  <td>{a.branchName}</td>
                  <td>{a.year}</td>
                  <td>
                    <span
                      className={`badge ${a.status === "accepted"
                        ? "bg-success"
                        : a.status === "pending"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                        }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>{new Date(a.examDate).toLocaleDateString()}</td>
                  <td>{a.reallocatedStaffId}</td>
                  <td>
                    {a.status === "pending" ? (
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleReallocate(a)}
                        >
                          Reallocate
                        </button>
                        {a.reallocatedStaffId == null && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAccept(a.id)}
                          >
                            Accept
                          </button>

                        )}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Available Staff */}
      {showStaffModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Available Staff</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {availableStaff.length === 0 ? (
                  <p>No staff available for this session and date.</p>
                ) : (
                  <table className="table table-bordered text-center">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>ID</th>
                        <th>Department</th>
                        <th>Email</th>
                        <th>status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableStaff.map((staff) => (
                        <tr key={staff.staffId}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedStaffIds.includes(staff.staffId)}
                              onChange={() => handleCheckboxChange(staff.staffId)}
                            />
                          </td>
                          <td>{staff.staffId}</td>
                          <td>{staff.department}</td>
                          <td>{staff.email}</td>
                          <td>
                            {staff.reallocationStatus ? (
                              <span
                                className={`badge ${staff.reallocationStatus === "approved"
                                  ? "bg-success"
                                  : staff.reallocationStatus === "pending"
                                    ? "bg-warning text-dark"
                                    : "bg-secondary"
                                  }`}
                              >
                                {staff.reallocationStatus}
                              </span>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleRequestReallocation(staff.staffId)}
                              >
                                Send
                              </button>
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
                {selectedStaffIds.length > 0 && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      selectedStaffIds.forEach(staffId => handleRequestReallocation(staffId));
                    }}
                  >
                    Request Reallocation
                  </button>

                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcceptHallAllocation;
