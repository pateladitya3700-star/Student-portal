import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

function AdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
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
  const [activeTab, setActiveTab] = useState('overview');
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
    // Student fields
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
    // Faculty fields
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading admin data...');
      const [statsRes, usersRes, coursesRes, studentsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/courses'),
        api.get('/admin/students')
      ]);
      console.log('Students data:', studentsRes.data);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error response:', error.response);
    }
  };

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
      setCourseForm({
        code: '',
        name: '',
        class: '11',
        credits: 3,
        description: ''
      });
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
        // Update existing student
        await api.put(`/admin/students/${editingStudent.id}`, studentData);
        alert('Student updated successfully!');
      } else {
        // Create new student
        await api.post('/admin/users', studentData);
        alert('Student added successfully!');
      }

      setShowStudentForm(false);
      setEditingStudent(null);
      setStudentForm({
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
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
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

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <h1>NIC Admin Portal</h1>
        <div className="nav-right">
          <span>Administrator</span>
          <button onClick={logout} className="btn btn-sm">Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-menu">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
              📊 Dashboard
            </button>
            <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
              👥 Users
            </button>
            <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
              🎓 Students
            </button>
            <button className={activeTab === 'subjects' ? 'active' : ''} onClick={() => setActiveTab('subjects')}>
              📚 Subjects
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          {activeTab === 'overview' && (
            <div>
              <h2>System Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Students</h3>
                  <div className="stat-value">{stats.students || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Faculty</h3>
                  <div className="stat-value">{stats.faculty || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Courses</h3>
                  <div className="stat-value">{stats.courses || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Avg Attendance</h3>
                  <div className="stat-value">{stats.avgAttendance || 0}%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2>User Management</h2>
                <button className="btn btn-primary" onClick={() => {
                  setShowUserForm(true);
                  setUserForm({
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
                }}>
                  + Add User
                </button>
              </div>

              {showUserForm && (
                <div className="card" style={{marginBottom: '20px'}}>
                  <h3>Create New User Account</h3>
                  <form onSubmit={handleUserSubmit}>
                    <div className="form-group">
                      <label>Account Type</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                        required
                        style={{fontSize: '16px', padding: '10px'}}
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <input
                          type="text"
                          value={userForm.password}
                          onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          value={userForm.firstName}
                          onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          value={userForm.lastName}
                          onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={userForm.phone}
                        onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                        required
                      />
                    </div>

                    {userForm.role === 'student' && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Student ID</label>
                            <input
                              type="text"
                              value={userForm.studentId}
                              onChange={(e) => setUserForm({...userForm, studentId: e.target.value})}
                              placeholder="e.g., NIC11A21"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Class</label>
                            <select
                              value={userForm.class}
                              onChange={(e) => setUserForm({...userForm, class: e.target.value})}
                              required
                            >
                              <option value="11">Class 11</option>
                              <option value="12">Class 12</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Section</label>
                            <select
                              value={userForm.section}
                              onChange={(e) => setUserForm({...userForm, section: e.target.value})}
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
                              value={userForm.rollNumber}
                              onChange={(e) => setUserForm({...userForm, rollNumber: e.target.value})}
                              min="1"
                              max="20"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Address</label>
                          <input
                            type="text"
                            value={userForm.address}
                            onChange={(e) => setUserForm({...userForm, address: e.target.value})}
                            required
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Guardian Name</label>
                            <input
                              type="text"
                              value={userForm.guardianName}
                              onChange={(e) => setUserForm({...userForm, guardianName: e.target.value})}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Guardian Phone</label>
                            <input
                              type="tel"
                              value={userForm.guardianPhone}
                              onChange={(e) => setUserForm({...userForm, guardianPhone: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Enrollment Date</label>
                          <input
                            type="date"
                            value={userForm.enrollmentDate}
                            onChange={(e) => setUserForm({...userForm, enrollmentDate: e.target.value})}
                            required
                          />
                        </div>
                      </>
                    )}

                    {userForm.role === 'faculty' && (
                      <>
                        <div className="form-group">
                          <label>Faculty ID</label>
                          <input
                            type="text"
                            value={userForm.facultyId}
                            onChange={(e) => setUserForm({...userForm, facultyId: e.target.value})}
                            placeholder="e.g., FAC002"
                            required
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Department</label>
                            <input
                              type="text"
                              value={userForm.department}
                              onChange={(e) => setUserForm({...userForm, department: e.target.value})}
                              placeholder="e.g., Computer Science"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Specialization</label>
                            <input
                              type="text"
                              value={userForm.specialization}
                              onChange={(e) => setUserForm({...userForm, specialization: e.target.value})}
                              placeholder="e.g., Data Structures"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                      <button type="submit" className="btn btn-primary">
                        Create {userForm.role === 'student' ? 'Student' : 'Faculty'} Account
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        setShowUserForm(false);
                      }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {showEditUserModal && (
                <div className="card" style={{marginBottom: '20px', background: '#fff3cd', border: '1px solid #ffc107'}}>
                  <h3>Edit User: {editingUser?.email}</h3>
                  <form onSubmit={handleUpdateUser}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Role</label>
                        <select
                          value={editUserForm.role}
                          onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
                          required
                          style={{fontSize: '16px', padding: '10px'}}
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={editUserForm.isActive ? 'active' : 'inactive'}
                          onChange={(e) => setEditUserForm({...editUserForm, isActive: e.target.value === 'active'})}
                          required
                          style={{fontSize: '16px', padding: '10px'}}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div style={{background: '#fff', padding: '15px', borderRadius: '4px', marginBottom: '15px'}}>
                      <p style={{margin: '0 0 10px 0', fontWeight: 'bold', color: '#856404'}}>⚠️ Warning:</p>
                      <p style={{margin: '0', fontSize: '14px', color: '#856404'}}>
                        Changing a user's role will affect their access permissions. 
                        Deactivating a user will prevent them from logging in.
                      </p>
                    </div>

                    <div style={{display: 'flex', gap: '10px'}}>
                      <button type="submit" className="btn btn-primary">
                        Update User
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        setShowEditUserModal(false);
                        setEditingUser(null);
                      }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="card">
                <table className="table">
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
                        <td>
                          <span className="badge badge-success">{user.role}</span>
                        </td>
                        <td>
                          <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-sm" 
                            onClick={() => handleEditUser(user)}
                            style={{background: '#48d1cc'}}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <div>
                  <h2>Student Management</h2>
                  <p className="subtitle">All students organized by class and section</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                  setShowStudentForm(true);
                  setEditingStudent(null);
                  setStudentForm({
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
                }}>
                  + Add Student
                </button>
              </div>

              {showStudentForm && (
                <div className="card" style={{marginBottom: '20px'}}>
                  <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
                  <form onSubmit={handleStudentSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <input
                          type="text"
                          value={studentForm.password}
                          onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          value={studentForm.firstName}
                          onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          value={studentForm.lastName}
                          onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Student ID</label>
                        <input
                          type="text"
                          value={studentForm.studentId}
                          onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})}
                          placeholder="e.g., NIC11A21"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          value={studentForm.phone}
                          onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Class</label>
                        <select
                          value={studentForm.class}
                          onChange={(e) => setStudentForm({...studentForm, class: e.target.value})}
                          required
                        >
                          <option value="11">Class 11</option>
                          <option value="12">Class 12</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Section</label>
                        <select
                          value={studentForm.section}
                          onChange={(e) => setStudentForm({...studentForm, section: e.target.value})}
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
                          value={studentForm.rollNumber}
                          onChange={(e) => setStudentForm({...studentForm, rollNumber: e.target.value})}
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
                          value={studentForm.guardianName}
                          onChange={(e) => setStudentForm({...studentForm, guardianName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Guardian Phone</label>
                        <input
                          type="tel"
                          value={studentForm.guardianPhone}
                          onChange={(e) => setStudentForm({...studentForm, guardianPhone: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        value={studentForm.address}
                        onChange={(e) => setStudentForm({...studentForm, address: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Enrollment Date</label>
                      <input
                        type="date"
                        value={studentForm.enrollmentDate}
                        onChange={(e) => setStudentForm({...studentForm, enrollmentDate: e.target.value})}
                        required
                      />
                    </div>

                    <div style={{display: 'flex', gap: '10px'}}>
                      <button type="submit" className="btn btn-primary">
                        {editingStudent ? 'Update Student' : 'Add Student'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        setShowStudentForm(false);
                        setEditingStudent(null);
                      }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="card">
                <div style={{marginBottom: '20px'}}>
                  <strong>Total Students: {students.length}</strong>
                  <span style={{marginLeft: '20px'}}>Password for all students: 123456</span>
                </div>
                
                <table className="table">
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
                        <td>{student.class}</td>
                        <td>{student.section}</td>
                        <td>{student.roll_number}</td>
                        <td>{student.phone}</td>
                        <td>{student.guardian_name}</td>
                        <td>
                          <button 
                            className="btn btn-sm" 
                            onClick={() => handleEditStudent(student)}
                            style={{marginRight: '5px'}}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary" 
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2>Subject Management</h2>
                <button className="btn btn-primary" onClick={() => {
                  setShowCourseForm(true);
                  setEditingCourse(null);
                  setCourseForm({
                    code: '',
                    name: '',
                    class: '11',
                    credits: 3,
                    description: ''
                  });
                }}>
                  + Add Subject
                </button>
              </div>

              {showCourseForm && (
                <div className="card" style={{marginBottom: '20px'}}>
                  <h3>{editingCourse ? 'Edit Subject' : 'Add New Subject'}</h3>
                  <form onSubmit={handleCourseSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Subject Code</label>
                        <input
                          type="text"
                          value={courseForm.code}
                          onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Subject Name</label>
                        <input
                          type="text"
                          value={courseForm.name}
                          onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Class</label>
                        <select
                          value={courseForm.class}
                          onChange={(e) => setCourseForm({...courseForm, class: e.target.value})}
                          required
                        >
                          <option value="11">Class 11</option>
                          <option value="12">Class 12</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Credits</label>
                        <input
                          type="number"
                          value={courseForm.credits}
                          onChange={(e) => setCourseForm({...courseForm, credits: parseInt(e.target.value)})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                        rows="3"
                      />
                    </div>

                    <div style={{display: 'flex', gap: '10px'}}>
                      <button type="submit" className="btn btn-primary">
                        {editingCourse ? 'Update' : 'Create'} Subject
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        setShowCourseForm(false);
                        setEditingCourse(null);
                      }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="card">
                <table className="table">
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
                          <button 
                            className="btn btn-sm" 
                            onClick={() => handleEditCourse(course)}
                            style={{marginRight: '5px'}}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary" 
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
