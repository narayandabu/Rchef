import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './utils/axiosInstance';
import './styles/login.css';


export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('token_expiry');
    
    if (token && expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
    }
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        console.log("Already logged in...");
        navigate('/main');  // Redirect to main if already logged in
        window.location.href = '/main';
    }
  }, []);
  const handleSignup = async () => {
    try {
      console.log("Attempting signup with", email, password);
      const response = await axiosInstance.post('http://localhost:5000/api/signup', {
        email: email,
        password: password
      });
      setMessage(response.data.message);
      if (response.data.success) {
        setIsSignup(false); 
      }
    } catch (error) {
      console.error(error);
      setMessage(`Something went wrong. Please try again.`);
    }
  };
  const handleLogin = async () => {
    try {
        const res = await axiosInstance.post('http://localhost:5000/api/login', { email, password });
        if (res.data.success) {
            localStorage.setItem('token', res.data.token); // optional for auth routes
            localStorage.setItem('isLoggedIn', true);
            setIsFadingOut(true);
            setTimeout(() => navigate('/main'), 800);   
           // Redirect to main page after successful login
      }
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      isSignup ? handleSignup() : handleLogin();
    }
  };

  return (
    <div className="login-page">
    <div className="login-box">
    <div className="login-header">
          <h1 className="login-title">NeuroLingo</h1>
      </div>
      <h2 className="login-subtitle">{isSignup ? 'Sign Up' : 'Login'}</h2>
      
      <input
        type="email"
        placeholder="Email"
        className="login-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      
      <input
        type="password"
        placeholder="Password"
        className="login-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      
      <button
        onClick={isSignup ? handleSignup : handleLogin}
        className="login-button"
      >
        {isSignup ? 'Create Account' : 'Log In'}
      </button>

      {message && <p className="login-message">{message}</p>}

      <p className="toggle-link">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Log in' : 'Sign up'}
        </span>
      </p>
    </div>
  </div>
);
}
