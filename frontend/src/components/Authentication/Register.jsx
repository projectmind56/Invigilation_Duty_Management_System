import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../../public/kec_logo.png';

function Register() {
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const departments = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Information Technology',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !department) {
      toast.error('Please fill all fields.');
      return;
    }

    setLoading(true); // ✅ Disable button

    try {
      const response = await fetch('http://localhost:5277/api/Staff/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
        body: JSON.stringify({
          email,
          department,
        }),
      });

      if (response.ok) {
        toast.success('Successfully Sent for Admin Approval!');
        setEmail('');
        setDepartment('');
        setTimeout(() => {
          navigate('/home');
        }, 3000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Registration failed.');
      }
    } catch (error) {
      toast.error('Error connecting to server.');
    } finally {
      setLoading(false); // ✅ Re-enable button
    }
  };

  return (
    <div className="container-fluid vh-100">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />

      <div className="row h-100">
        {/* Left side - College content */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-light p-5">
          <img
            src={logo}
            alt="Kongu Engineering College Logo"
            className="img-fluid mt-4"
            style={{ maxHeight: '100px' }}
          />
          <h2 className="text-primary mb-3">Kongu Engineering College</h2>
          <p className="lead text-secondary text-center">
            Kongu Engineering College (KEC) is one of the premier institutions in Tamil Nadu.
            Known for its academic excellence, industry-aligned curriculum, and vibrant campus
            life, KEC strives to foster innovation, research, and holistic development of its
            students and staff.
          </p>
        </div>

        {/* Right side - Registration Form */}
        <div className="col-md-6 d-flex align-items-center justify-content-center p-4">
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <h3 className="mb-4 text-primary">Staff Registration</h3>

            <form
              onSubmit={handleSubmit}
              className="border p-4 rounded shadow-sm"
              style={{ backgroundColor: '#f8f9fa' }}
            >
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="department" className="form-label fw-semibold">
                  Department
                </label>
                <select
                  className="form-select"
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ Button disables on loading */}
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <p className="mt-3 text-center">
              Already have an account?{' '}
              <a href="/login" className="text-decoration-none" style={{ color: '#0d6efd' }}>
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
