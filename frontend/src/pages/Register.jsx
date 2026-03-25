import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Account info
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    
    // Personal info
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    
    // Student specific
    studentId: '',
    class: '11',
    section: 'A',
    rollNumber: '',
    guardianName: '',
    guardianPhone: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    
    // Faculty specific
    facultyId: '',
    department: '',
    specialization: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setError('All fields are required');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    if (formData.role === 'student') {
      if (!formData.studentId || !formData.class || !formData.section || !formData.rollNumber || !formData.guardianName || !formData.guardianPhone) {
        setError('All student fields are required');
        return false;
      }
    } else if (formData.role === 'faculty') {
      if (!formData.facultyId || !formData.department) {
        setError('All faculty fields are required');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    
    if (!validateStep2()) {
      console.log('Validation failed');
      return;
    }

    console.log('Validation passed, starting registration...');
    setLoading(true);
    setError('');

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        profileData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address
        }
      };

      if (formData.role === 'student') {
        registrationData.profileData = {
          ...registrationData.profileData,
          studentId: formData.studentId,
          class: formData.class,
          section: formData.section,
          rollNumber: parseInt(formData.rollNumber),
          guardianName: formData.guardianName,
          guardianPhone: formData.guardianPhone,
          enrollmentDate: formData.enrollmentDate
        };
      } else if (formData.role === 'faculty') {
        registrationData.profileData = {
          ...registrationData.profileData,
          facultyId: formData.facultyId,
          department: formData.department,
          specialization: formData.specialization
        };
      }

      console.log('Sending registration data:', registrationData);
      const response = await api.post('/auth/register', registrationData);
      console.log('Registration response:', response.data);
      
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <h1>National Infotech College</h1>
          <h2>Student Portal Registration</h2>

          {/* Progress indicator */}
          <div className="progress-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Account</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Profile</div>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Information */}
            {step === 1 && (
              <div className="form-step">
                <div className="form-group">
                  <label>I am registering as:</label>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required
                  />
                </div>

                <button type="button" className="btn btn-primary btn-block" onClick={handleNext}>
                  Next Step →
                </button>
              </div>
            )}

            {/* Step 2: Profile Information */}
            {step === 2 && (
              <div className="form-step">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9841234567"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Your address"
                  />
                </div>

                {/* Student specific fields */}
                {formData.role === 'student' && (
                  <>
                    <div className="form-group">
                      <label>Student ID</label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="e.g., NIC11A01"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Class</label>
                        <select 
                          name="class" 
                          value={formData.class} 
                          onChange={handleChange}
                          required
                        >
                          <option value="11">Class 11</option>
                          <option value="12">Class 12</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Section</label>
                        <select 
                          name="section" 
                          value={formData.section} 
                          onChange={handleChange}
                          required
                        >
                          <option value="A">Section A</option>
                          <option value="B">Section B</option>
                          <option value="C">Section C</option>
                          <option value="D">Section D</option>
                          <option value="E">Section E</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Roll Number</label>
                        <input
                          type="number"
                          name="rollNumber"
                          value={formData.rollNumber}
                          onChange={handleChange}
                          placeholder="1-20"
                          min="1"
                          max="20"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Guardian Name</label>
                        <input
                          type="text"
                          name="guardianName"
                          value={formData.guardianName}
                          onChange={handleChange}
                          placeholder="Parent/Guardian name"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Guardian Phone</label>
                        <input
                          type="tel"
                          name="guardianPhone"
                          value={formData.guardianPhone}
                          onChange={handleChange}
                          placeholder="9841234567"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Enrollment Date</label>
                      <input
                        type="date"
                        name="enrollmentDate"
                        value={formData.enrollmentDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}

                {/* Faculty specific fields */}
                {formData.role === 'faculty' && (
                  <>
                    <div className="form-group">
                      <label>Faculty ID</label>
                      <input
                        type="text"
                        name="facultyId"
                        value={formData.facultyId}
                        onChange={handleChange}
                        placeholder="e.g., FAC001"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g., Computer Science"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g., Data Structures"
                      />
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleBack}
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                    onClick={(e) => {
                      console.log('Complete Registration button clicked');
                    }}
                  >
                    {loading ? 'Registering...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="register-footer">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
