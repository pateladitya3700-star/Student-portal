import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-portal">
      {/* Background with college image */}
      <div className="portal-background"></div>

      {/* Centered Login Card */}
      <div className="portal-container">
        <div className="portal-card">
          {/* Logo Section */}
          <div className="portal-logo">
            <div className="logo-circle">NIC</div>
          </div>

          {/* Welcome Text */}
          <div className="portal-welcome">
            <h1>Welcome to CAP</h1>
            <p>Combined Admin Panel</p>
          </div>

          {/* Login Button */}
          <button className="portal-login-btn" onClick={() => navigate('/login')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Student & Staff Login
          </button>

          {/* Footer Text */}
          <div className="portal-footer">
            <p>To create an account, contact <strong>Admin</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
