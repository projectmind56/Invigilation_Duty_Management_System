import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

function AddTimeTable() {
  const [timeTable, setTimeTable] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState({ day: "", period: 0 });
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false); // 👈 Track if we are editing
  const [editEntryId, setEditEntryId] = useState(null); // 👈 ID for editing

  const staffId = localStorage.getItem("staffId") || 1;
  const API_BASE = "http://localhost:5277/api/Staff";

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  // Fetch timetable
  const fetchTimeTable = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/get-staff-time-table/${staffId}`);
      if (!res.ok) throw new Error("Failed to fetch timetable");
      const data = await res.json();

      const grouped = {};
      (data || []).forEach((item) => {
        if (!grouped[item.day]) grouped[item.day] = {};
        grouped[item.day][item.period] = item;
      });
      setTimeTable(grouped);
    } catch (err) {
      toast.error("Failed to fetch timetable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeTable();
  }, []);

  // 🟢 Open modal for Add
  const handleAddClick = (day, period) => {
    setEditMode(false);
    setSelectedSlot({ day, period });
    setSubjectName("");
    setShowModal(true);
  };

  // 🟡 Open modal for Edit
  const handleEditClick = (entry) => {
    setEditMode(true);
    setEditEntryId(entry.id);
    setSelectedSlot({ day: entry.day, period: entry.period });
    setSubjectName(entry.subjectName || "");
    setShowModal(true);
  };

  // 🧩 Handle Save (both Add & Edit)
// 🧩 Handle Save (both Add & Edit)
const handleSubmit = async () => {
  if (!subjectName.trim()) {
    toast.error("Please enter a subject name");
    return;
  }

  const payload = {
    id: editMode ? editEntryId : 0,
    staffId: parseInt(staffId),
    subjectName: subjectName, // 👈 send subjectName instead of subjectId
    day: selectedSlot.day,
    period: selectedSlot.period,
  };

  try {
    let res;

    if (editMode) {
      // 🔹 Update existing
      res = await fetch(`${API_BASE}/update-staff-time-table/${editEntryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // 🔸 Add new
      res = await fetch(`${API_BASE}/create-staff-time-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) throw new Error("Failed to save timetable entry");

    toast.success(editMode ? "Time table updated!" : "Time table entry added!");
    setShowModal(false);
    setSubjectName("");
    fetchTimeTable();
  } catch (err) {
    toast.error(editMode ? "Error updating entry." : "Error creating entry.");
  }
};

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" />
      <h3 className="text-center mb-4">Staff Time Table</h3>

      {loading ? (
        <div className="text-center my-4">Loading...</div>
      ) : (
        <Table bordered hover responsive className="text-center align-middle">
          <thead className="table-dark">
            <tr>
              <th>Day</th>
              {periods.map((p) => (
                <th key={p}>Period {p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td><b>{day}</b></td>
                {periods.map((period) => {
                  const entry = timeTable[day]?.[period];
                  return (
                    <td key={period}>
                      {entry ? (
                        <div>
                          <span>{entry.subjectName || "Subject"}</span>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="ms-2"
                            onClick={() => handleEditClick(entry)} // 👈 Edit instead of direct PUT
                          >
                            ✏️ Edit
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleAddClick(day, period)}
                        >
                          ➕ Add
                        </Button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? "Edit Subject" : "Add Subject"} — {selectedSlot.day} (Period {selectedSlot.period})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Subject Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter subject name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editMode ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AddTimeTable;
