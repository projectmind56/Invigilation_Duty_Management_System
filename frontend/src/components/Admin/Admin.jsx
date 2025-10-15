// import React from 'react';
// import { NavLink, Outlet } from 'react-router-dom';

// function Admin() {
//   return (
//     <div className="container-fluid">
//       <div className="row">

//         {/* Sidebar */}
//         <div className="col-md-3 bg-light vh-100 p-3 border-end">
//           <h4 className="mb-4 text-primary">Admin Panel</h4>

//           <nav className="nav flex-column">
//             <NavLink
//               to="accept"
//               className={({ isActive }) =>
//                 'nav-link' + (isActive ? ' active fw-bold text-primary' : '')
//               }
//             >
//               Accept Staff
//             </NavLink>
//             <NavLink
//               to="add"
//               className={({ isActive }) =>
//                 'nav-link' + (isActive ? ' active fw-bold text-primary' : '')
//               }
//             >
//               Add Staff
//             </NavLink>
//           </nav>
//         </div>

//         {/* Page Content */}
//         <div className="col-md-9 p-4">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Admin;





import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function Admin() {
    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4 text-primary">Admin Dashboard</h2>

            {/* Bootstrap Nav */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <NavLink
                        to="/admin/accept"
                        className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                    >
                        Accept Staff
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        to="/admin/add"
                        className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                    >
                        Add Staff
                    </NavLink>
                </li>
            </ul>

            {/* Page content will load here */}
            <Outlet />
        </div>
    );
}

export default Admin;
