import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

function Staff() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Set default active tab on page load
    useEffect(() => {
        if (location.pathname === '/staff') {
            navigate('/staff/accept-hall-arrangement', { replace: true });
        }
    }, [location.pathname, navigate]);

    const handleLogout = () => {
        // Remove token from local storage
        localStorage.removeItem('token'); // adjust key if different
        // Redirect to login page
        navigate('/login', { replace: true });
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-primary">Staff Dashboard</h2>
                <button className="btn btn-danger" onClick={() => setShowLogoutModal(true)}>
                    Logout
                </button>
            </div>

            {/* Bootstrap Nav */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <NavLink
                        to="/staff/accept-hall-arrangement"
                        className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                    >
                        Accept Hall Allocations
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        to="/staff/add-time-table"
                        className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                    >
                        Add Time Table
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        to="/staff/accept-hall-re-arrangement"
                        className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                    >
                        Accept Hall Re Allocations
                    </NavLink>
                </li>
            </ul>

            {/* Page content */}
            <Outlet />

            {/* Logout Confirmation Modal */}
            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <>
                    {/* Backdrop first (behind modal) */}
                    <div
                        className="modal-backdrop fade show"
                        style={{ zIndex: 1040 }}
                        onClick={() => setShowLogoutModal(false)}
                    ></div>

                    {/* Modal itself */}
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                        style={{ zIndex: 1050 }}
                    >
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirm Logout</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowLogoutModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p>Are you sure you want to logout?</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowLogoutModal(false)}
                                    >
                                        No
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleLogout}
                                    >
                                        Yes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}

export default Staff;
