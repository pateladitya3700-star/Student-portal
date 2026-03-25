import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AdminDashboard_Premium.css';

function AdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Low attendance alert for Class 11-A', time: '2 hours ago' },
    { id: 2, type: 'info', message: '5 new student registrations pending', time: '4 hours ago' },
    { id: 3, type: 'danger', message: '12 students have pending fees', time: '1 day ago' }
  ]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });
  
  const [showFacultyForm, setShowFacultyForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [facultyForm, setFacultyForm] = useState({
    email: '',
    facultyId: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    specialization: ''
  });
  
  // Form states
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    email: '',
    password: '123456',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    studentId: '',
    class: '11',
    section: 'A',
    rollNumber: '',
    guardianName: '',
    guardianPhone: '',
    enrollmentDate: new Date().toISOString().split('T')[0]
  });

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    class: '11',
    credits: 3,
    description: ''
  });
  
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({
    role: 'student',
    email: '',
    password: '123456',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    studentId: '',
    class: '11',
    section: 'A',
    rollNumber: '',
    guardianName: '',
    guardianPhone: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    facultyId: '',
    department: '',
    specialization: ''
  });
  
  const [editingUser, setEditingUser] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    id: null,
    role: '',
    isActive: true
  });

  // Fee Management State
  const [fees, setFees] = useState([]);
  const [feeStats, setFeeStats] = useState({});
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    academicYear: '2024-2025',
    semester: 'First Semester',
    totalFee: 50000,
    paidAmount: 0,
    paymentDate: '',
    paymentMethod: '',
    transactionId: '',
    remarks: ''
  });
  const [feeFilter, setFeeFilter] = useState({
    status: '',
    academicYear: '',
    studentId: ''
  });
  const [showFeeDetails, setShowFeeDetails] = useState(false);

  useEffect(() => {
    loadData();
    loadAdminProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'fees') {
      loadFees();
      loadFeeStats();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, coursesRes, studentsRes, facultyRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/courses'),
        api.get('/admin/students'),
        api.get('/admin/faculty')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setStudents(studentsRes.data);
      setFaculty(facultyRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadAdminProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      
      // Format the data for display
      setAdminProfile({
        email: userData.email,
        firstName: userData.email.split('@')[0], // Extract from email if no name
        lastName: '',
        role: userData.role,
        isActive: true,
        createdAt: userData.created_at
      });
    } catch (error) {
      console.error('Error loading admin profile:', error);
      // Set fallback data from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setAdminProfile({
        email: user.email || 'admin@example.com',
        firstName: user.email ? user.email.split('@')[0] : 'Admin',
        lastName: '',
        role: user.role || 'admin',
        isActive: true,
        createdAt: new Date().toISOString()
      });
    }
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSettingsMessage({ type: '', text: '' });

    // Validate passwords
    if (settingsForm.newPassword !== settingsForm.confirmPassword) {
      setSettingsMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (settingsForm.newPassword.length < 6) {
      setSettingsMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
      return;
    }

    try {
      await api.put('/auth/change-password', {
        currentPassword: settingsForm.currentPassword,
        newPassword: settingsForm.newPassword
      });
      
      setSettingsMessage({ type: 'success', text: 'Password changed successfully!' });
      setSettingsForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setSettingsMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    }
  };

  const handleEditFaculty = (fac) => {
    setEditingFaculty(fac);
    setFacultyForm({
      email: fac.email,
      facultyId: fac.faculty_id,
      firstName: fac.first_name,
      lastName: fac.last_name,
      phone: fac.phone,
      department: fac.department,
      specialization: fac.specialization
    });
    setShowFacultyForm(true);
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await api.put(`/admin/faculty/${editingFaculty.id}`, {
          email: facultyForm.email,
          profileData: {
            firstName: facultyForm.firstName,
            lastName: facultyForm.lastName,
            phone: facultyForm.phone,
            department: facultyForm.department,
            specialization: facultyForm.specialization
          }
        });
        alert('Faculty updated successfully!');
      } else {
        await api.post('/admin/users', {
          email: facultyForm.email,
          password: '123456',
          role: 'faculty',
          profileData: {
            facultyId: facultyForm.facultyId,
            firstName: facultyForm.firstName,
            lastName: facultyForm.lastName,
            phone: facultyForm.phone,
            department: facultyForm.department,
            specialization: facultyForm.specialization
          }
        });
        alert('Faculty added successfully!');
      }

      setShowFacultyForm(false);
      setEditingFaculty(null);
      setFacultyForm({
        email: '', facultyId: '', firstName: '', lastName: '', 
        phone: '', department: '', specialization: ''
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving faculty');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await api.delete(`/admin/faculty/${id}`);
        alert('Faculty deleted successfully!');
        loadData();
      } catch (error) {
        alert('Error deleting faculty');
      }
    }
  };

  // Recent activities data
  const recentActivities = [
    { id: 1, action: 'New student enrolled', user: 'John Doe', time: '10 mins ago' },
    { id: 2, action: 'Exam results published', user: 'Admin', time: '1 hour ago' },
    { id: 3, action: 'Faculty added', user: 'Jane Smith', time: '2 hours ago' },
    { id: 4, action: 'Course updated', user: 'Admin', time: '3 hours ago' }
  ];

  // Handler functions (keeping existing logic)
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, courseForm);
      } else {
        await api.post('/admin/courses', courseForm);
      }
      setShowCourseForm(false);
      setEditingCourse(null);
      setCourseForm({ code: '', name: '', class: '11', credits: 3, description: '' });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving course');
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      code: course.code,
      name: course.name,
      class: course.class,
      credits: course.credits,
      description: course.description || ''
    });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await api.delete(`/admin/courses/${id}`);
        loadData();
      } catch (error) {
        alert('Error deleting course');
      }
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const studentData = {
        email: studentForm.email,
        password: studentForm.password,
        role: 'student',
        profileData: {
          studentId: studentForm.studentId,
          firstName: studentForm.firstName,
          lastName: studentForm.lastName,
          phone: studentForm.phone,
          address: studentForm.address,
          class: studentForm.class,
          section: studentForm.section,
          rollNumber: parseInt(studentForm.rollNumber),
          guardianName: studentForm.guardianName,
          guardianPhone: studentForm.guardianPhone,
          enrollmentDate: studentForm.enrollmentDate
        }
      };

      if (editingStudent) {
        await api.put(`/admin/students/${editingStudent.id}`, studentData);
        alert('Student updated successfully!');
      } else {
        await api.post('/admin/users', studentData);
        alert('Student added successfully!');
      }

      setShowStudentForm(false);
      setEditingStudent(null);
      setStudentForm({
        email: '', password: '123456', firstName: '', lastName: '', phone: '', address: '',
        studentId: '', class: '11', section: 'A', rollNumber: '', guardianName: '',
        guardianPhone: '', enrollmentDate: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving student');
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      email: student.email,
      password: '123456',
      firstName: student.first_name,
      lastName: student.last_name,
      phone: student.phone,
      address: student.address,
      studentId: student.student_id,
      class: student.class,
      section: student.section,
      rollNumber: student.roll_number,
      guardianName: student.guardian_name,
      guardianPhone: student.guardian_phone,
      enrollmentDate: student.enrollment_date ? new Date(student.enrollment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowStudentForm(true);
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/admin/students/${id}`);
        alert('Student deleted successfully!');
        loadData();
      } catch (error) {
        alert('Error deleting student');
      }
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      let userData;
      if (userForm.role === 'student') {
        userData = {
          email: userForm.email,
          password: userForm.password,
          role: 'student',
          profileData: {
            studentId: userForm.studentId,
            firstName: userForm.firstName,
            lastName: userForm.lastName,
            phone: userForm.phone,
            address: userForm.address,
            class: userForm.class,
            section: userForm.section,
            rollNumber: parseInt(userForm.rollNumber),
            guardianName: userForm.guardianName,
            guardianPhone: userForm.guardianPhone,
            enrollmentDate: userForm.enrollmentDate
          }
        };
      } else if (userForm.role === 'faculty') {
        userData = {
          email: userForm.email,
          password: userForm.password,
          role: 'faculty',
          profileData: {
            facultyId: userForm.facultyId,
            firstName: userForm.firstName,
            lastName: userForm.lastName,
            phone: userForm.phone,
            department: userForm.department,
            specialization: userForm.specialization
          }
        };
      }

      await api.post('/admin/users', userData);
      alert(`${userForm.role === 'student' ? 'Student' : 'Faculty'} account created successfully!`);
      setShowUserForm(false);
      setUserForm({
        role: 'student', email: '', password: '123456', firstName: '', lastName: '', phone: '',
        address: '', studentId: '', class: '11', section: 'A', rollNumber: '', guardianName: '',
        guardianPhone: '', enrollmentDate: new Date().toISOString().split('T')[0],
        facultyId: '', department: '', specialization: ''
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserForm({
      id: user.id,
      role: user.role,
      isActive: user.is_active
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editUserForm.id}`, {
        role: editUserForm.role,
        isActive: editUserForm.isActive
      });
      alert('User updated successfully!');
      setShowEditUserModal(false);
      setEditingUser(null);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating user');
    }
  };

  // Fee Management Functions
  const loadFees = async () => {
    try {
      const params = new URLSearchParams();
      if (feeFilter.status) params.append('status', feeFilter.status);
      if (feeFilter.academicYear) params.append('academicYear', feeFilter.academicYear);
      if (feeFilter.studentId) params.append('studentId', feeFilter.studentId);
      
      const response = await api.get(`/admin/fees?${params.toString()}`);
      setFees(response.data);
    } catch (error) {
      console.error('Error loading fees:', error);
    }
  };

  const loadFeeStats = async () => {
    try {
      const response = await api.get('/admin/fees/stats');
      setFeeStats(response.data);
    } catch (error) {
      console.error('Error loading fee stats:', error);
    }
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFee) {
        await api.put(`/admin/fees/${editingFee.id}`, feeForm);
        alert('Fee record updated successfully');
      } else {
        await api.post('/admin/fees', feeForm);
        alert('Fee record created successfully');
      }
      setShowFeeForm(false);
      setEditingFee(null);
      resetFeeForm();
      loadFees();
      loadFeeStats();
    } catch (error) {
      alert('Error saving fee record: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditFee = (fee) => {
    setEditingFee(fee);
    setFeeForm({
      studentId: fee.student_id,
      academicYear: fee.academic_year,
      semester: fee.semester,
      totalFee: fee.total_fee,
      paidAmount: fee.paid_amount,
      paymentDate: fee.payment_date || '',
      paymentMethod: fee.payment_method || '',
      transactionId: fee.transaction_id || '',
      remarks: fee.remarks || ''
    });
    setShowFeeForm(true);
  };

  const handleDeleteFee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee record?')) return;
    
    try {
      await api.delete(`/admin/fees/${id}`);
      alert('Fee record deleted successfully');
      loadFees();
      loadFeeStats();
    } catch (error) {
      alert('Error deleting fee record');
    }
  };

  const resetFeeForm = () => {
    setFeeForm({
      studentId: '',
      academicYear: '2024-2025',
      semester: 'First Semester',
      totalFee: 50000,
      paidAmount: 0,
      paymentDate: '',
      paymentMethod: '',
      transactionId: '',
      remarks: ''
    });
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'paid': return 'badge-success';
      case 'partial': return 'badge-warning';
      case 'pending': return 'badge-danger';
      case 'overdue': return 'badge-dark';
      default: return 'badge-secondary';
    }
  };

  const handleStatCardClick = (filterType) => {
    setShowFeeDetails(true);
    if (filterType === 'all') {
      setFeeFilter({ status: '', academicYear: '', studentId: '' });
    } else {
      setFeeFilter({ ...feeFilter, status: filterType });
    }
    setTimeout(loadFees, 100);
  };

  const QuickActionButton = ({ icon, label, onClick, color }) => (
    <button className="quick-action-btn" onClick={onClick} style={{ borderColor: color }}>
      <div className="quick-action-icon" style={{ background: color }}>{icon}</div>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="admin-dashboard-premium">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="navbar-left">
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            ☰
          </button>
          <h1 className="brand">NIC Admin</h1>
        </div>
        
        <div className="navbar-right">
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
            🔔
          </button>
          
          <div className="profile-menu">
            <button className="profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="avatar">
                {adminProfile?.firstName ? adminProfile.firstName.charAt(0).toUpperCase() : 'A'}
              </div>
              <span>{adminProfile?.firstName || 'Administrator'}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-item" onClick={() => setActiveTab('profile')}>
                  👤 Profile
                </div>
                <div className="dropdown-item" onClick={() => setActiveTab('settings')}>
                  ⚙️ Settings
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={logout}>🚪 Logout</div>
              </div>
            )}
          </div>
        </div>
        
        {showNotifications && (
          <div className="notifications-panel">
            <div className="notifications-header">
              <h3>Notifications ({notifications.length})</h3>
              <button className="close-btn" onClick={() => setShowNotifications(false)}>×</button>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`notification-item ${notif.type}`}>
                  <div className="notification-content">
                    <p>{notif.message}</p>
                    <span className="notification-time">{notif.time}</span>
                  </div>
                  <button 
                    className="dismiss-notification-btn" 
                    onClick={() => dismissNotification(notif.id)}
                    title="Dismiss"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </nav>

      {/* Sidebar */}
      <aside className={`sidebar-premium ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-section">
          <div className="section-label">MAIN</div>
          <button 
            className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="sidebar-icon">📊</span>
            <span className="sidebar-label">Dashboard</span>
          </button>
        </div>
        
        <div className="sidebar-section">
          <div className="section-label">MANAGEMENT</div>
          <button 
            className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="sidebar-icon">👥</span>
            <span className="sidebar-label">Users</span>
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <span className="sidebar-icon">🎓</span>
            <span className="sidebar-label">Students</span>
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => setActiveTab('faculty')}
          >
            <span className="sidebar-icon">👨‍🏫</span>
            <span className="sidebar-label">Faculty</span>
          </button>
        </div>
        
        <div className="sidebar-section">
          <div className="section-label">ACADEMICS</div>
          <button 
            className={`sidebar-btn ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            <span className="sidebar-icon">📚</span>
            <span className="sidebar-label">Subjects</span>
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'fees' ? 'active' : ''}`}
            onClick={() => setActiveTab('fees')}
          >
            <span className="sidebar-icon">💰</span>
            <span className="sidebar-label">Fee Management</span>
          </button>
        </div>
        
        <div className="sidebar-section">
          <div className="section-label">SYSTEM</div>
          <button 
            className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="sidebar-icon">⚙️</span>
            <span className="sidebar-label">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content-premium ${sidebarCollapsed ? 'expanded' : ''}`}>
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="page-header">
              <div>
                <h2>Dashboard Overview</h2>
                <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3 className="section-title">Quick Actions</h3>
              <div className="quick-actions-grid">
                <QuickActionButton 
                  icon="👨‍🎓" 
                  label="Add Student" 
                  onClick={() => {
                    setActiveTab('students');
                    setTimeout(() => {
                      setShowStudentForm(true);
                      setEditingStudent(null);
                      setStudentForm({
                        email: '', password: '123456', firstName: '', lastName: '', phone: '', address: '',
                        studentId: '', class: '11', section: 'A', rollNumber: '', guardianName: '',
                        guardianPhone: '', enrollmentDate: new Date().toISOString().split('T')[0]
                      });
                    }, 100);
                  }}
                  color="#48d1cc"
                />
                <QuickActionButton 
                  icon="👨‍🏫" 
                  label="Add Faculty" 
                  onClick={() => {
                    setActiveTab('faculty');
                    setTimeout(() => {
                      setShowFacultyForm(true);
                      setEditingFaculty(null);
                      setFacultyForm({
                        email: '', facultyId: '', firstName: '', lastName: '', 
                        phone: '', department: '', specialization: ''
                      });
                    }, 100);
                  }}
                  color="#4f46e5"
                />
                <QuickActionButton 
                  icon="📢" 
                  label="Send Announcement" 
                  onClick={() => {
                    const message = prompt('Enter announcement message:');
                    if (message) {
                      alert('Announcement sent: ' + message);
                      // In future, this would call an API to send notifications
                    }
                  }}
                  color="#10b981"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid-premium">
              <div className="stat-card-premium">
                <div className="stat-icon" style={{ background: '#e0f7f7' }}>
                  <span style={{ color: '#48d1cc' }}>🎓</span>
                </div>
                <div className="stat-details">
                  <p className="stat-label">Total Students</p>
                  <h3 className="stat-value">{stats.students || 0}</h3>
                  <span className="stat-change positive">+12% from last month</span>
                </div>
              </div>

              <div className="stat-card-premium">
                <div className="stat-icon" style={{ background: '#ede9fe' }}>
                  <span style={{ color: '#4f46e5' }}>👨‍🏫</span>
                </div>
                <div className="stat-details">
                  <p className="stat-label">Total Faculty</p>
                  <h3 className="stat-value">{stats.faculty || 0}</h3>
                  <span className="stat-change positive">+2 new this month</span>
                </div>
              </div>

              <div className="stat-card-premium">
                <div className="stat-icon" style={{ background: '#d1fae5' }}>
                  <span style={{ color: '#10b981' }}>📚</span>
                </div>
                <div className="stat-details">
                  <p className="stat-label">Total Subjects</p>
                  <h3 className="stat-value">{stats.courses || 0}</h3>
                  <span className="stat-change neutral">Active subjects</span>
                </div>
              </div>
            </div>

            {/* Recent Activity & Notifications */}
            <div className="bottom-grid">
              <div className="activity-card">
                <h3 className="section-title">Recent Activity</h3>
                <div className="activity-list">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">📌</div>
                      <div className="activity-content">
                        <p className="activity-action">{activity.action}</p>
                        <span className="activity-meta">{activity.user} • {activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="alerts-card">
                <h3 className="section-title">System Alerts</h3>
                <div className="alerts-list">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`alert-item ${notif.type}`}>
                      <div className="alert-icon">
                        {notif.type === 'warning' && '⚠️'}
                        {notif.type === 'info' && 'ℹ️'}
                        {notif.type === 'danger' && '🚨'}
                      </div>
                      <div className="alert-content">
                        <p>{notif.message}</p>
                        <span className="alert-time">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Tables */}
            <div className="tables-grid">
              <div className="table-card">
                <div className="table-header">
                  <h3>Recent Students</h3>
                  <button className="view-all-btn" onClick={() => setActiveTab('students')}>View All →</button>
                </div>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 5).map(student => (
                      <tr key={student.id}>
                        <td>{student.student_id}</td>
                        <td>{student.first_name} {student.last_name}</td>
                        <td>Class {student.class}</td>
                        <td>Section {student.section}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="content-section">
            <div className="page-header">
              <div>
                <h2>User Management</h2>
                <p className="page-subtitle">Manage all system users and their permissions</p>
              </div>
              <button className="btn-premium btn-primary" onClick={() => {
                setShowUserForm(true);
                setUserForm({
                  role: 'student', email: '', password: '123456', firstName: '', lastName: '', phone: '',
                  address: '', studentId: '', class: '11', section: 'A', rollNumber: '', guardianName: '',
                  guardianPhone: '', enrollmentDate: new Date().toISOString().split('T')[0],
                  facultyId: '', department: '', specialization: ''
                });
              }}>
                + Add User
              </button>
            </div>

            {showUserForm && (
              <div className="form-card">
                <h3>Create New User Account</h3>
                <form onSubmit={handleUserSubmit}>
                  <div className="form-group">
                    <label>Account Type</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input type="text" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" value={userForm.firstName} onChange={(e) => setUserForm({...userForm, firstName: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" value={userForm.lastName} onChange={(e) => setUserForm({...userForm, lastName: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" value={userForm.phone} onChange={(e) => setUserForm({...userForm, phone: e.target.value})} required />
                  </div>

                  {userForm.role === 'student' && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Student ID</label>
                          <input type="text" value={userForm.studentId} onChange={(e) => setUserForm({...userForm, studentId: e.target.value})} placeholder="e.g., NIC11A21" required />
                        </div>
                        <div className="form-group">
                          <label>Class</label>
                          <select value={userForm.class} onChange={(e) => setUserForm({...userForm, class: e.target.value})} required>
                            <option value="11">Class 11</option>
                            <option value="12">Class 12</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Section</label>
                          <select value={userForm.section} onChange={(e) => setUserForm({...userForm, section: e.target.value})} required>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                            <option value="D">Section D</option>
                            <option value="E">Section E</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Roll Number</label>
                          <input type="number" value={userForm.rollNumber} onChange={(e) => setUserForm({...userForm, rollNumber: e.target.value})} min="1" max="20" required />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Address</label>
                        <input type="text" value={userForm.address} onChange={(e) => setUserForm({...userForm, address: e.target.value})} required />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Guardian Name</label>
                          <input type="text" value={userForm.guardianName} onChange={(e) => setUserForm({...userForm, guardianName: e.target.value})} required />
                        </div>
                        <div className="form-group">
                          <label>Guardian Phone</label>
                          <input type="tel" value={userForm.guardianPhone} onChange={(e) => setUserForm({...userForm, guardianPhone: e.target.value})} required />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Enrollment Date</label>
                        <input type="date" value={userForm.enrollmentDate} onChange={(e) => setUserForm({...userForm, enrollmentDate: e.target.value})} required />
                      </div>
                    </>
                  )}

                  {userForm.role === 'faculty' && (
                    <>
                      <div className="form-group">
                        <label>Faculty ID</label>
                        <input type="text" value={userForm.facultyId} onChange={(e) => setUserForm({...userForm, facultyId: e.target.value})} placeholder="e.g., FAC002" required />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Department</label>
                          <input type="text" value={userForm.department} onChange={(e) => setUserForm({...userForm, department: e.target.value})} placeholder="e.g., Computer Science" required />
                        </div>
                        <div className="form-group">
                          <label>Specialization</label>
                          <input type="text" value={userForm.specialization} onChange={(e) => setUserForm({...userForm, specialization: e.target.value})} placeholder="e.g., Data Structures" required />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="form-actions">
                    <button type="submit" className="btn-premium btn-primary">
                      Create {userForm.role === 'student' ? 'Student' : 'Faculty'} Account
                    </button>
                    <button type="button" className="btn-premium btn-secondary" onClick={() => setShowUserForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showEditUserModal && (
              <div className="form-card warning-card">
                <h3>Edit User: {editingUser?.email}</h3>
                <form onSubmit={handleUpdateUser}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Role</label>
                      <select value={editUserForm.role} onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})} required>
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={editUserForm.isActive ? 'active' : 'inactive'} onChange={(e) => setEditUserForm({...editUserForm, isActive: e.target.value === 'active'})} required>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="warning-box">
                    <p><strong>⚠️ Warning:</strong></p>
                    <p>Changing a user's role will affect their access permissions. Deactivating a user will prevent them from logging in.</p>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-premium btn-primary">Update User</button>
                    <button type="button" className="btn-premium btn-secondary" onClick={() => { setShowEditUserModal(false); setEditingUser(null); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="data-card">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.email}</td>
                      <td><span className="badge badge-info">{user.role}</span></td>
                      <td><span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-premium btn-sm" onClick={() => handleEditUser(user)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="content-section">
            <div className="page-header">
              <div>
                <h2>Student Management</h2>
                <p className="page-subtitle">All students organized by class and section</p>
              </div>
              <button className="btn-premium btn-primary" onClick={() => {
                setShowStudentForm(true);
                setEditingStudent(null);
                setStudentForm({
                  email: '', password: '123456', firstName: '', lastName: '', phone: '', address: '',
                  studentId: '', class: '11', section: 'A', rollNumber: '', guardianName: '',
                  guardianPhone: '', enrollmentDate: new Date().toISOString().split('T')[0]
                });
              }}>
                + Add Student
              </button>
            </div>

            {showStudentForm && (
              <div className="form-card">
                <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
                <form onSubmit={handleStudentSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({...studentForm, email: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input type="text" value={studentForm.password} onChange={(e) => setStudentForm({...studentForm, password: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" value={studentForm.firstName} onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" value={studentForm.lastName} onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Student ID</label>
                      <input type="text" value={studentForm.studentId} onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})} placeholder="e.g., NIC11A21" required />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="tel" value={studentForm.phone} onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Class</label>
                      <select value={studentForm.class} onChange={(e) => setStudentForm({...studentForm, class: e.target.value})} required>
                        <option value="11">Class 11</option>
                        <option value="12">Class 12</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Section</label>
                      <select value={studentForm.section} onChange={(e) => setStudentForm({...studentForm, section: e.target.value})} required>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                        <option value="E">Section E</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Roll Number</label>
                      <input type="number" value={studentForm.rollNumber} onChange={(e) => setStudentForm({...studentForm, rollNumber: e.target.value})} min="1" max="20" required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Guardian Name</label>
                      <input type="text" value={studentForm.guardianName} onChange={(e) => setStudentForm({...studentForm, guardianName: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Guardian Phone</label>
                      <input type="tel" value={studentForm.guardianPhone} onChange={(e) => setStudentForm({...studentForm, guardianPhone: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input type="text" value={studentForm.address} onChange={(e) => setStudentForm({...studentForm, address: e.target.value})} required />
                  </div>

                  <div className="form-group">
                    <label>Enrollment Date</label>
                    <input type="date" value={studentForm.enrollmentDate} onChange={(e) => setStudentForm({...studentForm, enrollmentDate: e.target.value})} required />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-premium btn-primary">{editingStudent ? 'Update Student' : 'Add Student'}</button>
                    <button type="button" className="btn-premium btn-secondary" onClick={() => { setShowStudentForm(false); setEditingStudent(null); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="data-card">
              <div className="data-card-header">
                <strong>Total Students: {students.length}</strong>
                <span style={{marginLeft: '20px', color: '#64748b'}}>Password for all students: 123456</span>
              </div>
              
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Roll No</th>
                    <th>Phone</th>
                    <th>Guardian</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td>{student.student_id}</td>
                      <td>{student.first_name} {student.last_name}</td>
                      <td>{student.email}</td>
                      <td>Class {student.class}</td>
                      <td>Section {student.section}</td>
                      <td>{student.roll_number}</td>
                      <td>{student.phone}</td>
                      <td>{student.guardian_name}</td>
                      <td>
                        <button className="btn-premium btn-sm" onClick={() => handleEditStudent(student)} style={{marginRight: '5px'}}>Edit</button>
                        <button className="btn-premium btn-sm btn-danger" onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div className="content-section">
            <div className="page-header">
              <div>
                <h2>Subject Management</h2>
                <p className="page-subtitle">Manage all subjects and courses</p>
              </div>
              <button className="btn-premium btn-primary" onClick={() => {
                setShowCourseForm(true);
                setEditingCourse(null);
                setCourseForm({ code: '', name: '', class: '11', credits: 3, description: '' });
              }}>
                + Add Subject
              </button>
            </div>

            {showCourseForm && (
              <div className="form-card">
                <h3>{editingCourse ? 'Edit Subject' : 'Add New Subject'}</h3>
                <form onSubmit={handleCourseSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Subject Code</label>
                      <input type="text" value={courseForm.code} onChange={(e) => setCourseForm({...courseForm, code: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Subject Name</label>
                      <input type="text" value={courseForm.name} onChange={(e) => setCourseForm({...courseForm, name: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Class</label>
                      <select value={courseForm.class} onChange={(e) => setCourseForm({...courseForm, class: e.target.value})} required>
                        <option value="11">Class 11</option>
                        <option value="12">Class 12</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Credits</label>
                      <input type="number" value={courseForm.credits} onChange={(e) => setCourseForm({...courseForm, credits: parseInt(e.target.value)})} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} rows="3" />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-premium btn-primary">{editingCourse ? 'Update' : 'Create'} Subject</button>
                    <button type="button" className="btn-premium btn-secondary" onClick={() => { setShowCourseForm(false); setEditingCourse(null); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="data-card">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Credits</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td>{course.code}</td>
                      <td>{course.name}</td>
                      <td>Class {course.class}</td>
                      <td>{course.credits}</td>
                      <td>
                        <button className="btn-premium btn-sm" onClick={() => handleEditCourse(course)} style={{marginRight: '5px'}}>Edit</button>
                        <button className="btn-premium btn-sm btn-danger" onClick={() => handleDeleteCourse(course.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Faculty Tab */}
        {activeTab === 'faculty' && (
          <div className="content-section">
            <div className="page-header">
              <div>
                <h2>Faculty Management</h2>
                <p className="page-subtitle">All faculty members organized by department</p>
              </div>
              <button className="btn-premium btn-primary" onClick={() => {
                setActiveTab('users');
                setShowUserForm(true);
                setUserForm({...userForm, role: 'faculty'});
              }}>
                + Add Faculty
              </button>
            </div>

            <div className="data-card">
              <div className="data-card-header">
                <strong>Total Faculty: {faculty.length}</strong>
                <span style={{marginLeft: '20px', color: '#64748b'}}>Password for all faculty: 123456</span>
              </div>
              
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Faculty ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Specialization</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map(fac => (
                    <tr key={fac.id}>
                      <td>{fac.faculty_id}</td>
                      <td>{fac.first_name} {fac.last_name}</td>
                      <td>{fac.email}</td>
                      <td>{fac.department}</td>
                      <td>{fac.specialization}</td>
                      <td>{fac.phone}</td>
                      <td>
                        <span className={`badge ${fac.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {fac.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-premium btn-sm" 
                          onClick={() => handleEditFaculty(fac)} 
                          style={{marginRight: '5px'}}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-premium btn-sm btn-danger" 
                          onClick={() => handleDeleteFaculty(fac.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showFacultyForm && (
              <div className="form-card" style={{marginTop: '24px'}}>
                <h3>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h3>
                <form onSubmit={handleFacultySubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        value={facultyForm.email} 
                        onChange={(e) => setFacultyForm({...facultyForm, email: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Faculty ID</label>
                      <input 
                        type="text" 
                        value={facultyForm.facultyId} 
                        onChange={(e) => setFacultyForm({...facultyForm, facultyId: e.target.value})} 
                        placeholder="e.g., FAC015"
                        required 
                        disabled={editingFaculty}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input 
                        type="text" 
                        value={facultyForm.firstName} 
                        onChange={(e) => setFacultyForm({...facultyForm, firstName: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input 
                        type="text" 
                        value={facultyForm.lastName} 
                        onChange={(e) => setFacultyForm({...facultyForm, lastName: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone</label>
                      <input 
                        type="tel" 
                        value={facultyForm.phone} 
                        onChange={(e) => setFacultyForm({...facultyForm, phone: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input 
                        type="text" 
                        value={facultyForm.department} 
                        onChange={(e) => setFacultyForm({...facultyForm, department: e.target.value})} 
                        placeholder="e.g., Physics"
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Specialization</label>
                    <input 
                      type="text" 
                      value={facultyForm.specialization} 
                      onChange={(e) => setFacultyForm({...facultyForm, specialization: e.target.value})} 
                      placeholder="e.g., Quantum Mechanics"
                      required 
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-premium btn-primary">
                      {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-premium btn-secondary" 
                      onClick={() => { 
                        setShowFacultyForm(false); 
                        setEditingFaculty(null); 
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="content-section">
            <div className="page-header">
              <h2>Profile</h2>
              <p className="page-subtitle">Your account information</p>
            </div>
            <div className="data-card">
              {adminProfile ? (
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '32px', margin: '0 auto 20px' }}>
                      {adminProfile.firstName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  </div>
                  <table className="modern-table">
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 'var(--font-semibold)' }}>Email</td>
                        <td>{adminProfile.email}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'var(--font-semibold)' }}>First Name</td>
                        <td>{adminProfile.firstName || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'var(--font-semibold)' }}>Last Name</td>
                        <td>{adminProfile.lastName || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'var(--font-semibold)' }}>Role</td>
                        <td><span className="badge badge-info">{adminProfile.role}</span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'var(--font-semibold)' }}>Status</td>
                        <td><span className={`badge ${adminProfile.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {adminProfile.isActive ? 'Active' : 'Inactive'}
                        </span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'var(--font-semibold)' }}>Account Created</td>
                        <td>{new Date(adminProfile.createdAt).toLocaleDateString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p>Loading profile...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fee Management Tab */}
        {activeTab === 'fees' && (
          <div className="content-section">
            <div className="page-header">
              <h2>Fee Management</h2>
              <p className="page-subtitle">Manage student fee payments and records</p>
              <button className="btn-primary" onClick={() => {
                resetFeeForm();
                setEditingFee(null);
                setShowFeeForm(true);
              }}>
                + Add Fee Record
              </button>
            </div>

            {/* Fee Statistics */}
            <div className="stats-grid-premium">
              <div className="stat-card-premium" onClick={() => handleStatCardClick('all')} style={{cursor: 'pointer'}}>
                <div className="stat-icon" style={{ background: '#e0f7f7' }}>
                  <span style={{ color: '#48d1cc' }}>💰</span>
                </div>
                <div className="stat-details">
                  <p className="stat-label">Total Fee Amount</p>
                  <h3 className="stat-value">Rs. {(feeStats.total_fee_amount || 0).toLocaleString()}</h3>
                  <span className="stat-change neutral">Across all students</span>
                </div>
              </div>

              <div className="stat-card-premium" onClick={() => handleStatCardClick('paid')} style={{cursor: 'pointer'}}>
                <div className="stat-icon" style={{ background: '#d1fae5' }}>
                  <span style={{ color: '#10b981' }}>✓</span>
                </div>
                <div className="stat-details">
                  <p className="stat-label">Total Collected</p>
                  <h3 className="stat-value" style={{color: '#10b981'}}>Rs. {(feeStats.total_paid || 0).toLocaleString()}</h3>
                  <span className="stat-change positive">{feeStats.paid_count || 0} fully paid</span>
                </div>
              </div>

              <div className="stat-card-premium" onClick={() => handleStatCardClick('pending')} style={{cursor: 'pointer'}}>
                <div className="stat-icon" style={{ background: '#fee2e2' }}>
                  <span style={{ color: '#ef4444' }}>⚠</span>
                </div>
                <div className="stat-details">
                  <p className="stat-label">Total Due</p>
                  <h3 className="stat-value" style={{color: '#ef4444'}}>Rs. {(feeStats.total_due || 0).toLocaleString()}</h3>
                  <span className="stat-change negative">{feeStats.pending_count || 0} pending</span>
                </div>
              </div>

              <div className="stat-card-premium" onClick={() => handleStatCardClick('partial')} style={{cursor: 'pointer'}}>
                <div className="stat-icon" style={{ background: '#fef3c7' }}>
                  <span style={{ color: '#f59e0b' }}>◐</span>
                </div>
                <div className="stat-details">
                  <p className="stat-label">Partial Payments</p>
                  <h3 className="stat-value">{feeStats.partial_count || 0}</h3>
                  <span className="stat-change neutral">Students with partial payment</span>
                </div>
              </div>
            </div>

            {/* Show details only when a card is clicked */}
            {showFeeDetails && (
              <>
                {/* Filters */}
                <div className="filters-row" style={{display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap'}}>
                  <select 
                    value={feeFilter.status}
                    onChange={(e) => {
                      setFeeFilter({...feeFilter, status: e.target.value});
                      setTimeout(loadFees, 100);
                    }}
                    style={{padding: '10px', borderRadius: '8px', border: '1px solid var(--border-primary)'}}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Search by Student ID..."
                    value={feeFilter.studentId}
                    onChange={(e) => {
                      setFeeFilter({...feeFilter, studentId: e.target.value});
                      setTimeout(loadFees, 500);
                    }}
                    style={{padding: '10px', borderRadius: '8px', border: '1px solid var(--border-primary)', minWidth: '250px'}}
                  />
                  
                  <button className="btn-secondary" onClick={() => {
                    setFeeFilter({ status: '', academicYear: '', studentId: '' });
                    setTimeout(loadFees, 100);
                  }}>
                    Clear Filters
                  </button>
                  
                  <button className="btn-secondary" onClick={() => setShowFeeDetails(false)} style={{marginLeft: 'auto'}}>
                    Hide Details
                  </button>
                </div>

                {/* Fee Records Table */}
                <div className="table-container" style={{background: 'var(--surface-primary)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)'}}>
                  <table className="data-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'}}>Student ID</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'}}>Name</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'}}>Class</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'}}>Academic Year</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'}}>Semester</th>
                        <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'}}>Total Fee</th>
                        <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'}}>Paid</th>
                        <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'}}>Due</th>
                        <th style={{padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'}}>Status</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'}}>Payment Date</th>
                        <th style={{padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map(fee => (
                        <tr key={fee.id} style={{borderBottom: '1px solid var(--border-primary)'}}>
                          <td style={{padding: '12px', color: 'var(--text-primary)'}}>{fee.student_id}</td>
                          <td style={{padding: '12px', color: 'var(--text-primary)'}}>{fee.first_name} {fee.last_name}</td>
                          <td style={{padding: '12px', color: 'var(--text-primary)'}}>{fee.class}-{fee.section}</td>
                          <td style={{padding: '12px', color: 'var(--text-primary)'}}>{fee.academic_year}</td>
                          <td style={{padding: '12px', color: 'var(--text-primary)'}}>{fee.semester}</td>
                          <td style={{padding: '12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '600'}}>Rs. {parseFloat(fee.total_fee).toLocaleString()}</td>
                          <td style={{padding: '12px', textAlign: 'right', color: '#10b981', fontWeight: '600'}}>Rs. {parseFloat(fee.paid_amount).toLocaleString()}</td>
                      <td style={{padding: '12px', textAlign: 'right', color: '#ef4444', fontWeight: '600'}}>Rs. {parseFloat(fee.due_amount).toLocaleString()}</td>
                      <td style={{padding: '12px', textAlign: 'center'}}>
                        <span className={`badge ${getStatusBadgeClass(fee.status)}`} style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase'
                        }}>
                          {fee.status}
                        </span>
                      </td>
                      <td style={{padding: '12px', color: 'var(--text-primary)'}}>{fee.payment_date ? new Date(fee.payment_date).toLocaleDateString() : '-'}</td>
                      <td style={{padding: '12px', textAlign: 'center'}}>
                        <button className="btn-icon" onClick={() => handleEditFee(fee)} title="Edit" style={{marginRight: '5px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '18px'}}>
                          ✏️
                        </button>
                        <button className="btn-icon" onClick={() => handleDeleteFee(fee.id)} title="Delete" style={{cursor: 'pointer', background: 'none', border: 'none', fontSize: '18px'}}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {fees.length === 0 && (
                <div className="empty-state" style={{textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)'}}>
                  <div style={{fontSize: '3rem', marginBottom: '20px'}}>💰</div>
                  <h3>No fee records found</h3>
                  <p>Add fee records to get started</p>
                </div>
              )}
            </div>
              </>
            )}

            {/* Fee Form Modal */}
            {showFeeForm && (
              <div className="modal-overlay" onClick={() => setShowFeeForm(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{editingFee ? 'Edit Fee Record' : 'Add Fee Record'}</h3>
                    <button className="close-btn" onClick={() => setShowFeeForm(false)}>×</button>
                  </div>
                  <form onSubmit={handleFeeSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Student ID *</label>
                        <input
                          type="text"
                          value={feeForm.studentId}
                          onChange={(e) => setFeeForm({...feeForm, studentId: e.target.value})}
                          required
                          disabled={editingFee}
                          placeholder="e.g., STU001"
                        />
                      </div>
                      <div className="form-group">
                        <label>Academic Year *</label>
                        <input
                          type="text"
                          value={feeForm.academicYear}
                          onChange={(e) => setFeeForm({...feeForm, academicYear: e.target.value})}
                          required
                          placeholder="e.g., 2024-2025"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Semester *</label>
                        <select
                          value={feeForm.semester}
                          onChange={(e) => setFeeForm({...feeForm, semester: e.target.value})}
                          required
                        >
                          <option value="First Semester">First Semester</option>
                          <option value="Second Semester">Second Semester</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Total Fee (Rs.) *</label>
                        <input
                          type="number"
                          value={feeForm.totalFee}
                          onChange={(e) => setFeeForm({...feeForm, totalFee: parseFloat(e.target.value)})}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Paid Amount (Rs.)</label>
                        <input
                          type="number"
                          value={feeForm.paidAmount}
                          onChange={(e) => setFeeForm({...feeForm, paidAmount: parseFloat(e.target.value)})}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="form-group">
                        <label>Payment Date</label>
                        <input
                          type="date"
                          value={feeForm.paymentDate}
                          onChange={(e) => setFeeForm({...feeForm, paymentDate: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Payment Method</label>
                        <select
                          value={feeForm.paymentMethod}
                          onChange={(e) => setFeeForm({...feeForm, paymentMethod: e.target.value})}
                        >
                          <option value="">Select Method</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Online Payment">Online Payment</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Transaction ID</label>
                        <input
                          type="text"
                          value={feeForm.transactionId}
                          onChange={(e) => setFeeForm({...feeForm, transactionId: e.target.value})}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Remarks</label>
                      <textarea
                        value={feeForm.remarks}
                        onChange={(e) => setFeeForm({...feeForm, remarks: e.target.value})}
                        rows="3"
                        placeholder="Additional notes..."
                      />
                    </div>

                    <div className="form-actions">
                      <button type="button" className="btn-secondary" onClick={() => setShowFeeForm(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {editingFee ? 'Update' : 'Create'} Fee Record
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="content-section">
            <div className="page-header">
              <h2>Settings</h2>
              <p className="page-subtitle">Manage your account settings</p>
            </div>

            <div className="form-card">
              <h3>Change Password</h3>
              {settingsMessage.text && (
                <div className={`alert-message ${settingsMessage.type}`} style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  background: settingsMessage.type === 'success' ? 'var(--success-50)' : 'var(--error-50)',
                  color: settingsMessage.type === 'success' ? 'var(--success-700)' : 'var(--error-700)',
                  border: `1px solid ${settingsMessage.type === 'success' ? 'var(--success-500)' : 'var(--error-500)'}`
                }}>
                  {settingsMessage.text}
                </div>
              )}
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={settingsForm.currentPassword}
                    onChange={(e) => setSettingsForm({...settingsForm, currentPassword: e.target.value})}
                    required 
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={settingsForm.newPassword}
                    onChange={(e) => setSettingsForm({...settingsForm, newPassword: e.target.value})}
                    required 
                    placeholder="Enter new password (min 6 characters)"
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={settingsForm.confirmPassword}
                    onChange={(e) => setSettingsForm({...settingsForm, confirmPassword: e.target.value})}
                    required 
                    placeholder="Confirm new password"
                    minLength="6"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-premium btn-primary">
                    Update Password
                  </button>
                  <button 
                    type="button" 
                    className="btn-premium btn-secondary"
                    onClick={() => {
                      setSettingsForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setSettingsMessage({ type: '', text: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <div className="data-card" style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Account Information</h3>
              <table className="modern-table">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'var(--font-semibold)', width: '200px' }}>Email</td>
                    <td>{adminProfile?.email || 'Loading...'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'var(--font-semibold)' }}>Role</td>
                    <td><span className="badge badge-info">{adminProfile?.role || 'admin'}</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'var(--font-semibold)' }}>Account Status</td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'var(--font-semibold)' }}>Member Since</td>
                    <td>{adminProfile?.createdAt ? new Date(adminProfile.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Placeholder tabs */}
        {[].includes(activeTab) && (
          <div className="content-section">
            <div className="page-header">
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              <p className="page-subtitle">This section is under development</p>
            </div>
            <div className="placeholder-card">
              <div className="placeholder-icon">🚧</div>
              <h3>Coming Soon</h3>
              <p>The {activeTab} management section will be available in the next update.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
