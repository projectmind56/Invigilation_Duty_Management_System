import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function AddStaff() {
    const [showPopup, setShowPopup] = useState(false);
    const [formData, setFormData] = useState({
        session: '',
        semester: '',
        subjectCode: '',
        subjectName: '',
        department: '',
        branch: '',
        year: '',
        examDate: ''
    });

    const [dataList, setDataList] = useState([
        {
            session: 'Forenoon',
            semester: 1,
            subjectCode: 'CS101',
            subjectName: 'Intro to CS',
            department: 'Computer Science',
            branch: 'Software Engineering',
            year: 1,
            examDate: '2025-11-01'
        },
        {
            session: 'Afternoon',
            semester: 2,
            subjectCode: 'CS102',
            subjectName: 'Data Structures',
            department: 'Computer Science',
            branch: 'Information Tech',
            year: 2,
            examDate: '2025-11-03'
        },
        {
            session: 'Forenoon',
            semester: 3,
            subjectCode: 'EE101',
            subjectName: 'Circuit Analysis',
            department: 'Electrical',
            branch: 'Power Systems',
            year: 2,
            examDate: '2025-11-05'
        },
        {
            session: 'Afternoon',
            semester: 4,
            subjectCode: 'ME201',
            subjectName: 'Thermodynamics',
            department: 'Mechanical',
            branch: 'Manufacturing',
            year: 3,
            examDate: '2025-11-07'
        },
        {
            session: 'Forenoon',
            semester: 5,
            subjectCode: 'CE301',
            subjectName: 'Structural Engineering',
            department: 'Civil',
            branch: 'Construction',
            year: 4,
            examDate: '2025-11-09'
        },
    ]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setDataList(prev => [...prev, formData]);
        setFormData({
            session: '',
            semester: '',
            subjectCode: '',
            subjectName: '',
            department: '',
            branch: '',
            year: '',
            examDate: ''
        });
        setShowPopup(false);
    };

    const handleDelete = (indexToDelete) => {
        const updatedList = dataList.filter((_, index) => index !== indexToDelete);
        setDataList(updatedList);
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-primary">Exam Timetable Entries</h4>
                <button className="btn btn-primary" onClick={() => setShowPopup(true)}>Add</button>
            </div>

            {/* Table Display */}
            <div className="table-responsive">
                <table className="table table-bordered table-hover table-sm">
                    <thead className="table-light">
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
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataList.map((data, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{data.session}</td>
                                <td>{data.semester}</td>
                                <td>{data.subjectCode}</td>
                                <td>{data.subjectName}</td>
                                <td>{data.department}</td>
                                <td>{data.branch}</td>
                                <td>{data.year}</td>
                                <td>{data.examDate}</td>
                                <td>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(index)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Popup Form */}
            {showPopup && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">
                    <div className="bg-white p-4 rounded shadow" style={{ width: '400px' }}>
                        <h5 className="mb-3 text-center">Add Staff Entry</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <label className="form-label">Session</label>
                                <select className="form-select" name="session" value={formData.session} onChange={handleInputChange} required>
                                    <option value="">Select Session</option>
                                    <option value="Forenoon">Forenoon</option>
                                    <option value="Afternoon">Afternoon</option>
                                </select>
                            </div>

                            <div className="mb-2">
                                <label className="form-label">Semester</label>
                                <input type="number" className="form-control" name="semester" value={formData.semester} onChange={handleInputChange} required />
                            </div>

                            <div className="mb-2">
                                <label className="form-label">Subject Code</label>
                                <input type="text" className="form-control" name="subjectCode" value={formData.subjectCode} onChange={handleInputChange} required />
                            </div>

                            <div className="mb-2">
                                <label className="form-label">Subject Name</label>
                                <input type="text" className="form-control" name="subjectName" value={formData.subjectName} onChange={handleInputChange} required />
                            </div>

                            <div className="mb-2">
                                <label className="form-label">Department</label>
                                <input type="text" className="form-control" name="department" value={formData.department} onChange={handleInputChange} required />
                            </div>

                            <div className="mb-2">
                                <label className="form-label">Branch</label>
                                <input type="text" className="form-control" name="branch" value={formData.branch} onChange={handleInputChange} required />
                            </div>

                            <div className="mb-2">
                                <label className="form-label">Year</label>
                                <input type="number" className="form-control" name="year" value={formData.year} onChange={handleInputChange} required />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Exam Date</label>
                                <input type="date" className="form-control" name="examDate" value={formData.examDate} onChange={handleInputChange} required />
                            </div>

                            <div className="d-flex justify-content-between">
                                <button type="submit" className="btn btn-success">Submit</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPopup(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddStaff;
