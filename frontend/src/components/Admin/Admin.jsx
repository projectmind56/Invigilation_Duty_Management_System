import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

function Admin() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Redirect to default tab when at /admin
    useEffect(() => {
        if (location.pathname === '/admin') {
            navigate('/admin/accept-staff', { replace: true });
        }
    }, [location.pathname, navigate]);

    const handleLogout = () => {
        // Remove token from local storage
        localStorage.removeItem('token'); 
        // Navigate to login
        navigate('/login', { replace: true });
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-primary">Admin Dashboard</h2>
                <button className="btn btn-danger" onClick={() => setShowLogoutModal(true)}>
                    Logout
                </button>
            </div>

            {/* Bootstrap Nav */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <NavLink
                        to="/admin/accept-staff"
                        className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                    >
                        Accept Staff
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        to="/admin/allocate-time-table"
                        className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                    >
                        Allocate Time Table
                    </NavLink>
                </li>
            </ul>

            {/* Page content will load here */}
            <Outlet />

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <>
                    {/* Backdrop */}
                    <div
                        className="modal-backdrop fade show"
                        style={{ zIndex: 1040 }}
                        onClick={() => setShowLogoutModal(false)}
                    ></div>

                    {/* Modal */}
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

export default Admin;
