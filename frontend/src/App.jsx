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
  const token = localStorage.getItem('token'); // <-- where your JWT is stored
  const decoded = token ? decodeToken(token) : null;
  const role = decoded?.role;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />


        {role === 'admin' ? (
          <>
            <Route path="/admin/" element={<Admin />}>
              <Route index element={<AcceptStaff />} />
              <Route path="accept-staff" element={<AcceptStaff />} />
              <Route path="add-time-table" element={<AddExamTimeTable />} />
              <Route path="allocate-time-table" element={<ExamTimeTableAllocation />} />
            </Route>
          </>
        ) : role === 'staff' ? (
          <>
            <Route path="/staff/" element={<Staff />}>
              <Route index element={<AcceptHallAllocation />} />
              <Route path="accept-hall-arrangement" element={<AcceptHallAllocation />} />
              <Route path="add-time-table" element={<AddTimeTable />} />
            </Route>
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
