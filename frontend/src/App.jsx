import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './components/Home/Home';
import Login from './components/Authentication/Login';
import Register from './components/Authentication/Register';
import Admin from './components/Admin/Admin';
import AcceptStaff from './components/Admin/AcceptStaff';
import AddExamTimeTable from './components/Admin/AddExamTimeTable';

// Example staff components (replace with your actual ones)
import Staff from './components/Staff/Staff';
import StaffDashboard from './components/Staff/StaffDashboard';
import AddTimeTable from './components/Staff/AddTimeTable';
import ExamTimeTableAllocation from './components/Admin/ExamTimeTableAllocation';
import AcceptHallAllocation from './components/Staff/AcceptHallAllocation';
import ProtectedRoute from './ProtectedRoute';
import AcceptHallReAllocation from './components/Staff/AcceptHallReAllocation';
import AddTimeTableViaExcel from './components/Admin/AddTimeTableViaExcel';

// Utility: decode JWT safely
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    console.error('Invalid token:', e);
    return null;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />

        {/* Admin protected routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Admin />}>
            <Route index element={<AcceptStaff />} />
            <Route path="accept-staff" element={<AcceptStaff />} />
            <Route path="add-time-table" element={<AddExamTimeTable />} />
            <Route path="allocate-time-table" element={<ExamTimeTableAllocation />} />
            <Route path="allocate-time-table-via-excel" element={<AddTimeTableViaExcel />} />
          </Route>
        </Route>

        {/* Staff protected routes */}
        <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
          <Route path="/staff" element={<Staff />}>
            <Route index element={<AcceptHallAllocation />} />
            <Route path="accept-hall-arrangement" element={<AcceptHallAllocation />} />
            <Route path="accept-hall-re-arrangement" element={<AcceptHallReAllocation />} />
            <Route path="add-time-table" element={<AddTimeTable />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
