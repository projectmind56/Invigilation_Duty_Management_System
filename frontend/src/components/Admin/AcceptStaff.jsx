import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AcceptStaff() {
    const [staffList, setStaffList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [rejectionInputs, setRejectionInputs] = useState({});
    const [loadingStaffId, setLoadingStaffId] = useState(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await fetch('http://localhost:5277/api/Admin/staff');
            const data = await response.json();
            setStaffList(data);
        } catch (error) {
            toast.error('Error fetching staff data.');
        }
    };

    const handleApprovalChange = async (staffId, value) => {
        if (value === 'Reject') {
            setRejectionInputs((prev) => ({ ...prev, [staffId]: '' }));
        } else if (value === 'Accept') {
            setLoadingStaffId(staffId);
            try {
                const response = await fetch('http://localhost:5277/api/Admin/approve', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        staffId,
                        status: 'Accept',
                    }),
                });

                if (response.ok) {
                    toast.success('Staff approved successfully!');
                    setStaffList((prevList) =>
                        prevList.map((staff) =>
                            staff.staffId === staffId
                                ? { ...staff, approvalStatus: 'Accept' }
                                : staff
                        )
                    );
                } else {
                    toast.error('Failed to approve staff.');
                }
            } catch (error) {
                toast.error('Error approving staff.');
            } finally {
                setLoadingStaffId(null);
            }
        }
    };

    const handleSubmitRejection = async (staffId) => {
        const reason = rejectionInputs[staffId];
        if (!reason.trim()) {
            toast.warn('Please enter a reason for rejection.');
            return;
        }

        setLoadingStaffId(staffId);
        try {
            const response = await fetch('http://localhost:5277/api/Admin/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    staffId,
                    status: 'Reject',
                    rejectionReason: reason,
                }),
            });

            if (response.ok) {
                toast.success('Staff rejected successfully.');
                setStaffList((prevList) =>
                    prevList.map((staff) =>
                        staff.staffId === staffId
                            ? {
                                  ...staff,
                                  approvalStatus: 'Reject',
                                  rejectionReason: reason,
                              }
                            : staff
                    )
                );
                setRejectionInputs((prev) => {
                    const updated = { ...prev };
                    delete updated[staffId];
                    return updated;
                });
            } else {
                toast.error('Failed to reject staff.');
            }
        } catch (error) {
            toast.error('Error rejecting staff.');
        } finally {
            setLoadingStaffId(null);
        }
    };

    const handleRejectionInputChange = (staffId, value) => {
        setRejectionInputs((prev) => ({ ...prev, [staffId]: value }));
    };

    const handleCancelRejection = (staffId) => {
        setRejectionInputs((prev) => {
            const updated = { ...prev };
            delete updated[staffId];
            return updated;
        });
    };

    const handleDeleteStaff = (staffId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this staff member?');
        if (!confirmDelete) return;

        setStaffList((prevList) => prevList.filter((staff) => staff.staffId !== staffId));
        toast.info('Staff removed from UI.');
    };

    const filteredStaff = staffList.filter((staff) =>
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="mb-3 d-flex justify-content-between gap-2">
                <div>
                    <h3 className="mb-4 text-primary">Pending Staff Approvals</h3>
                </div>
                <div className="mb-3 d-flex gap-2">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search by email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setSearchTerm(searchTerm.trim())}
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-hover table-sm align-middle small">
                    <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Approval Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No staff found.
                                </td>
                            </tr>
                        ) : (
                            filteredStaff.map((staff, index) => {
                                const isInputMode = rejectionInputs.hasOwnProperty(staff.staffId);
                                const isFinalized =
                                    staff.approvalStatus === 'Accept' ||
                                    staff.approvalStatus === 'Reject';

                                return (
                                    <tr key={staff.staffId}>
                                        <td>{index + 1}</td>
                                        <td>{staff.email}</td>
                                        <td>{staff.department}</td>
                                        <td>{staff.role}</td>
                                        <td>
                                            {isFinalized ? (
                                                <span
                                                    className={`badge bg-${
                                                        staff.approvalStatus === 'Accept'
                                                            ? 'success'
                                                            : 'danger'
                                                    }`}
                                                >
                                                    {staff.approvalStatus}
                                                </span>
                                            ) : isInputMode ? (
                                                <div className="d-flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Reason for rejection"
                                                        value={rejectionInputs[staff.staffId]}
                                                        onChange={(e) =>
                                                            handleRejectionInputChange(
                                                                staff.staffId,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() =>
                                                            handleSubmitRejection(staff.staffId)
                                                        }
                                                        disabled={loadingStaffId === staff.staffId}
                                                    >
                                                        {loadingStaffId === staff.staffId ? (
                                                            <span
                                                                className="spinner-border spinner-border-sm"
                                                                role="status"
                                                                aria-hidden="true"
                                                            ></span>
                                                        ) : (
                                                            'Submit'
                                                        )}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() =>
                                                            handleCancelRejection(staff.staffId)
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <select
                                                    className="form-select form-select-sm"
                                                    defaultValue={staff.approvalStatus || ''}
                                                    onChange={(e) =>
                                                        handleApprovalChange(
                                                            staff.staffId,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        {staff.approvalStatus || 'Select'}
                                                    </option>
                                                    <option value="Accept">Accept</option>
                                                    <option value="Reject">Reject</option>
                                                </select>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDeleteStaff(staff.staffId)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AcceptStaff;
