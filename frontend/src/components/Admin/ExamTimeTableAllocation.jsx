import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://localhost:5277';

function ExamTimeTableAllocation() {
    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        session: '',
        semester: '',
        subjectCode: '',
        subjectName: '',
        departmentName: '',
        branchName: '',
        year: '',
        examDate: '',
        staffId: '',
        className: ''
    });

    const [dataList, setDataList] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [filters, setFilters] = useState({
        session: '',
        semester: '',
        subjectCode: '',
        subjectName: '',
        departmentName: '',
        branchName: '',
        year: '',
        examDate: '',
        staffId: '',
        className: ''
    });


    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Admin/allExamTimeTableAllocations`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            setDataList(data);
        } catch (err) {
            console.error(err);
            toast.error('Error fetching data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const requestDelete = (id) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Admin/deleteExamTimeTableAllocation/${deleteId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Delete failed');
            toast.success('Deleted successfully');
            fetchData();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setShowDeleteConfirm(false);
            setDeleteId(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { semester, year, examDate, staffId } = formData;

        if (semester < 1 || semester > 10) {
            toast.warning('Semester must be between 1 and 10');
            return;
        }

        if (year < 1 || year > 5) {
            toast.warning('Year must be between 1 and 5');
            return;
        }

        if (isNaN(staffId) || staffId <= 0) {
            toast.warning('Staff ID must be a valid number');
            return;
        }

        const selected = new Date(examDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
            toast.warning('Exam date cannot be in the past');
            return;
        }

        try {
            const url = isEditing
                ? `${API_BASE_URL}/api/Admin/updateExamTimeTableAllocation/${editId}`
                : `${API_BASE_URL}/api/Admin/addExamTimeTableAllocation`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Operation failed');
            }

            toast.success(isEditing ? 'Updated successfully' : 'Added successfully');

            setFormData({
                session: '',
                semester: '',
                subjectCode: '',
                subjectName: '',
                departmentName: '',
                branchName: '',
                year: '',
                examDate: '',
                staffId: '',
                className: ''
            });
            setShowPopup(false);
            setIsEditing(false);
            setEditId(null);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    const handleEdit = (data) => {
        setFormData({
            session: data.session,
            semester: data.semester,
            subjectCode: data.subjectCode,
            subjectName: data.subjectName,
            departmentName: data.departmentName,
            branchName: data.branchName,
            year: data.year,
            examDate: data.examDate.split('T')[0],
            staffId: data.staffId,
            className: data.className
        });
        setEditId(data.id);
        setIsEditing(true);
        setShowPopup(true);
    };

    const filteredData = dataList.filter(item => {
        return Object.keys(filters).every(key => {
            if (!filters[key]) return true;
            if (key === 'examDate') {
                return item.examDate.split('T')[0].includes(filters[key]);
            } else {
                return item[key]?.toString().toLowerCase().includes(filters[key].toString().toLowerCase());
            }
        });
    });

    return (
        <div className="container-fluid mt-4" style={{ height: '80vh', overflowY: 'auto' }}>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
                <h4 className="text-primary mb-2 mb-md-0">Exam Timetable Allocations</h4>

                <div className="d-flex flex-wrap gap-2">
                    {[
                        { name: 'session', label: 'Session', type: 'select', options: ['', 'Forenoon', 'Afternoon'] },
                        { name: 'semester', label: 'Semester', type: 'number' },
                        { name: 'subjectCode', label: 'Subject Code', type: 'text' },
                        { name: 'subjectName', label: 'Subject Name', type: 'text' },
                        { name: 'year', label: 'Year', type: 'number' },
                        { name: 'examDate', label: 'Exam Date', type: 'date' },
                        { name: 'staffId', label: 'Staff ID', type: 'number' },
                        { name: 'className', label: 'Class Name', type: 'text' },

                    ].map(({ name, label, type, options }) => (
                        <div key={name} style={{ minWidth: '110px' }}>
                            {type === 'select' ? (
                                <select
                                    className="form-select form-select-sm"
                                    name={name}
                                    value={filters[name]}
                                    onChange={handleFilterChange}
                                >
                                    {options.map(opt => (
                                        <option key={opt} value={opt}>{opt || 'All'}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={type}
                                    className="form-control form-control-sm"
                                    name={name}
                                    value={filters[name]}
                                    onChange={handleFilterChange}
                                    placeholder={label}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setFilters({
                        session: '',
                        semester: '',
                        subjectCode: '',
                        subjectName: '',
                        departmentName: '',
                        branchName: '',
                        year: '',
                        examDate: '',
                        staffId: '',
                        className: ''
                    })}
                >
                    Clear Filters
                </button>

                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setShowPopup(true);
                        setIsEditing(false);
                        setEditId(null);
                        setFormData({
                            session: '',
                            semester: '',
                            subjectCode: '',
                            subjectName: '',
                            departmentName: '',
                            branchName: '',
                            year: '',
                            examDate: '',
                            staffId: '',
                            className: ''
                        });
                    }}
                >
                    Add
                </button>
            </div>

            <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="table table-bordered table-hover table-sm mb-0">
                    <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                            <th>#</th>
                            <th>Session</th>
                            <th>Semester</th>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Department</th>
                            <th>Branch</th>
                            <th>Year</th>
                            <th>Exam Date</th>
                            <th>Staff ID</th>
                            <th>ReallcocatedStaff ID</th>
                            <th>Class Number</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="12" className="text-center">No matching records found.</td>
                            </tr>
                        ) : (
                            filteredData.map((data, index) => (
                                <tr key={data.id}>
                                    <td>{index + 1}</td>
                                    <td>{data.session}</td>
                                    <td>{data.semester}</td>
                                    <td>{data.subjectCode}</td>
                                    <td>{data.subjectName}</td>
                                    <td>{data.departmentName}</td>
                                    <td>{data.branchName}</td>
                                    <td>{data.year}</td>
                                    <td>{data.examDate.split('T')[0]}</td>
                                    <td>{data.staffId}</td>
                                    <td>{data.reallocatedStaffId}</td>
                                    <td>{data.className}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(data)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => requestDelete(data.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showPopup && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
                    style={{ zIndex: 2000 }}
                >
                    <div className="bg-white p-3 rounded shadow" style={{ width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h5 className="mb-2 text-center">{isEditing ? 'Edit' : 'Add'} Exam Timetable Allocation</h5>
                        <form onSubmit={handleSubmit}>
                            {["session", "semester", "subjectCode", "subjectName", "departmentName", "branchName", "year", "examDate", "staffId", "className"].map((field, idx) => (
                                <div className="mb-1" key={idx}>
                                    <label className="form-label mb-0" style={{ fontSize: '0.85rem' }}>
                                        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                                    </label>
                                    {field === "session" ? (
                                        <select
                                            className="form-select form-select-sm"
                                            name={field}
                                            value={formData[field]}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Session</option>
                                            <option value="Forenoon">Forenoon</option>
                                            <option value="Afternoon">Afternoon</option>
                                        </select>
                                    ) : (
                                        <input
                                            type={
                                                field === "semester" || field === "year" || field === "staffId"
                                                    ? "number"
                                                    : field === "examDate"
                                                        ? "date"
                                                        : "text"
                                            }
                                            className="form-control form-control-sm"
                                            name={field}
                                            value={formData[field]}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="d-flex justify-content-between mt-2">
                                <button type="submit" className="btn btn-success btn-sm">
                                    {isEditing ? 'Update' : 'Submit'}
                                </button>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPopup(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
                    style={{ zIndex: 2100 }}
                >
                    <div className="bg-white p-4 rounded shadow" style={{ width: '300px' }}>
                        <h6 className="text-center mb-3">Are you sure you want to delete this entry?</h6>
                        <div className="d-flex justify-content-around">
                            <button className="btn btn-danger btn-sm" onClick={confirmDelete}>Yes</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExamTimeTableAllocation;
