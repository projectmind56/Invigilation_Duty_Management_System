import { NavLink, Outlet } from 'react-router-dom';

import React from 'react'

function Staff() {
    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4 text-primary">Staff Dashboard</h2>

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
            </ul>

            {/* Page content will load here */}
            <Outlet />
        </div>
    );
}

export default Staff
