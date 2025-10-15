import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import logo from '../../../public/logo2.jpeg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5277/api/Staff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token;

        if (!token) {
          throw new Error('Token not found in response');
        }

        localStorage.setItem('token', token);

        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;

        toast.success('Login successful!');

        setTimeout(() => {
          if (userRole === 'admin') {
            navigate('/admin');
          } else if (userRole === 'staff') {
            navigate('/home');
          } else {
            navigate('/');
          }
        }, 3000);
      } else {
        toast.error(data.message || 'Invalid credentials.');
      }
    } catch (error) {
      toast.error('Error connecting to server.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="row h-100">
        {/* Left side - Login Form */}
        <div className="col-md-6 d-flex align-items-center justify-content-center p-4">
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <h3 className="mb-4 text-primary">Staff Login</h3>

            <form
              onSubmit={handleLogin}
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
                <label htmlFor="password" className="form-label fw-semibold">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="mt-3 text-center">
              Don’t have an account?{' '}
              <a href="/register" className="text-decoration-none" style={{ color: '#0d6efd' }}>
                Register here
              </a>
            </p>
          </div>
        </div>

        {/* Right side - College Info */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-light p-5">
          <img
            src={logo}
            alt="Kongu Engineering College Logo"
            className="img-fluid mt-4"
            style={{ maxHeight: '100px' }}
          />
          <h2 className="text-primary mb-3">Kongu Engineering College</h2>
          <p className="lead text-secondary text-center">
            Empowering minds and shaping the future of engineering. KEC is committed to academic excellence and innovation in education, nurturing both students and faculty through world-class infrastructure and opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;