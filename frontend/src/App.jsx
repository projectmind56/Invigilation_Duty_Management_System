import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'
import Home from './components/Home/Home';
import Login from './components/Authentication/Login';
import Register from './components/Authentication/Register';
import Admin from './components/Admin/Admin';
import AcceptStaff from './components/Admin/AcceptStaff';
import AddStaff from './components/Admin/AddExamTimeTable';
import AddExamTimeTable from './components/Admin/AddExamTimeTable';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />


          {/* admin side routes */}
          <Route path="/admin/*" element={<Admin />}>
            <Route index element={<AcceptStaff />} />
            <Route path="accept-staff" element={<AcceptStaff />} />
            <Route path="add-time-table" element={<AddExamTimeTable />} />
          </Route>

        </Routes>
      </Router>
    </>
  )
}

export default App
