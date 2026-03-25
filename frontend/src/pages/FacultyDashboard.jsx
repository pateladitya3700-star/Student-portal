import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

function FacultyDashboard() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mark Attendance state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  
  // View Attendance state
  const [viewCourse, setViewCourse] = useState('');
  const [viewClass, setViewClass] = useState('');
  const [viewSection, setViewSection] = useState('');
  const [viewDate, setViewDate] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);

  // Export Attendance state
  const [exportCourse, setExportCourse] = useState('');
  const [exportClass, setExportClass] = useState('');
  const [exportSection, setExportSection] = useState('');
  const [attendanceSummary, setAttendanceSummary] = useState([]);

  // Results Analysis state
  const [analysisCourse, setAnalysisCourse] = useState('');
  const [analysisClass, setAnalysisClass] = useState('');
  const [analysisSection, setAnalysisSection] = useState('');
  const [analysisTerm, setAnalysisTerm] = useState('First Term');
  const [resultsData, setResultsData] = useState(null);

  // Upload Marks state
  const [uploadCourse, setUploadCourse] = useState('');
  const [uploadClass, setUploadClass] = useState('');
  const [uploadSection, setUploadSection] = useState('');
  const [uploadTerm, setUploadTerm] = useState('First Term');
  const [uploadStudents, setUploadStudents] = useState([]);
  const [marksData, setMarksData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, coursesRes] = await Promise.all([
        api.get('/faculty/profile'),
        api.get('/faculty/courses')
      ]);
      setProfile(profileRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadStudents = async () => {
    if (!selectedClass || !selectedSection) return;
    
    try {
      const { data } = await api.get(`/faculty/students/${selectedClass}/${selectedSection}`);
      setStudents(data);
      
      // Initialize attendance data
      const initialData = {};
      data.forEach(student => {
        initialData[student.id] = 'present';
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Error loading students');
    }
  };

  const loadStudentsForUpload = async () => {
    if (!uploadClass || !uploadSection) return;
    
    try {
      const { data } = await api.get(`/faculty/students/${uploadClass}/${uploadSection}`);
      setUploadStudents(data);
      
      // Initialize marks data
      const initialMarks = {};
      data.forEach(student => {
        initialMarks[student.id] = { theoryMarks: '', practicalMarks: '' };
      });
      setMarksData(initialMarks);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Error loading students');
    }
  };

  const loadAttendanceSummary = async () => {
    if (!exportCourse || !exportClass || !exportSection) {
      alert('Please select course, class, and section');
      return;
    }

    try {
      const { data } = await api.get('/faculty/attendance-summary', {
        params: {
          courseId: exportCourse,
          classNum: exportClass,
          section: exportSection
        }
      });
      setAttendanceSummary(data);
    } catch (error) {
      console.error('Error loading attendance summary:', error);
      alert('Error loading attendance summary');
    }
  };

  const exportAttendanceCSV = () => {
    if (attendanceSummary.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Roll No', 'Student ID', 'Name', 'Total Days', 'Present', 'Absent', 'Late', 'Percentage'];
    const rows = attendanceSummary.map(s => [
      s.roll_number,
      s.student_id,
      `${s.first_name} ${s.last_name}`,
      s.total_days || 0,
      s.present_days || 0,
      s.absent_days || 0,
      s.late_days || 0,
      `${s.percentage || 0}%`
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_class${exportClass}_section${exportSection}.csv`;
    a.click();
  };

  const loadResultsAnalysis = async () => {
    if (!analysisCourse || !analysisClass || !analysisSection) {
      alert('Please select course, class, and section');
      return;
    }

    try {
      const { data } = await api.get('/faculty/results-analysis', {
        params: {
          courseId: analysisCourse,
          classNum: analysisClass,
          section: analysisSection,
          term: analysisTerm
        }
      });
      setResultsData(data);
    } catch (error) {
      console.error('Error loading results analysis:', error);
      alert('Error loading results analysis');
    }
  };

  const exportResultsCSV = () => {
    if (!resultsData || resultsData.students.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Roll No', 'Student ID', 'Name', 'Theory Marks', 'Practical Marks', 'Total', 'Percentage', 'Grade'];
    const rows = resultsData.students.map(s => [
      s.roll_number,
      s.student_id,
      `${s.first_name} ${s.last_name}`,
      s.theory_marks || 'N/A',
      s.practical_marks || 'N/A',
      s.total_marks || 'N/A',
      s.percentage || 'N/A',
      s.grade || 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results_${analysisTerm}_class${analysisClass}_section${analysisSection}.csv`;
    a.click();
  };

  const handleMarksChange = (studentId, field, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const submitMarks = async () => {
    if (!uploadCourse || !uploadClass || !uploadSection || uploadStudents.length === 0) {
      alert('Please select course, class, section and load students');
      return;
    }

    try {
      const marksArray = uploadStudents.map(student => ({
        studentId: student.id,
        theoryMarks: parseFloat(marksData[student.id]?.theoryMarks) || 0,
        practicalMarks: parseFloat(marksData[student.id]?.practicalMarks) || 0
      }));

      // Validate marks
      for (const mark of marksArray) {
        if (mark.theoryMarks < 0 || mark.theoryMarks > 75) {
          alert('Theory marks must be between 0 and 75');
          return;
        }
        if (mark.practicalMarks < 0 || mark.practicalMarks > 25) {
          alert('Practical marks must be between 0 and 25');
          return;
        }
      }

      await api.post('/faculty/upload-marks', {
        courseId: parseInt(uploadCourse),
        classNum: uploadClass,
        section: uploadSection,
        term: uploadTerm,
        marks: marksArray
      });

      alert('Marks uploaded successfully!');
      
      // Reset form
      setUploadStudents([]);
      setMarksData({});
    } catch (error) {
      console.error('Error uploading marks:', error);
      alert(error.response?.data?.message || 'Error uploading marks');
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const newData = {};
    students.forEach(student => {
      newData[student.id] = status;
    });
    setAttendanceData(newData);
  };

  const submitAttendance = async () => {
    if (!selectedCourse || !selectedClass || !selectedSection || students.length === 0) {
      alert('Please select course, class, section and load students');
      return;
    }

    try {
      const attendanceArray = students.map(student => ({
        studentId: student.id,
        status: attendanceData[student.id] || 'present'
      }));

      await api.post('/faculty/attendance', {
        courseId: parseInt(selectedCourse),
        classNum: selectedClass,
        section: selectedSection,
        date: attendanceDate,
        attendanceData: attendanceArray
      });

      alert('Attendance marked successfully!');
      
      // Reset form
      setStudents([]);
      setAttendanceData({});
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert(error.response?.data?.message || 'Error marking attendance');
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      const params = {};
      if (viewCourse) params.courseId = viewCourse;
      if (viewClass) params.classNum = viewClass;
      if (viewSection) params.section = viewSection;
      if (viewDate) params.date = viewDate;

      const { data } = await api.get('/faculty/attendance', { params });
      setAttendanceRecords(data);
    } catch (error) {
      console.error('Error loading attendance records:', error);
      alert('Error loading attendance records');
    }
  };

  const handleEditAttendance = async (recordId, newStatus) => {
    try {
      await api.put(`/faculty/attendance/${recordId}`, { status: newStatus });
      alert('Attendance updated successfully!');
      loadAttendanceRecords();
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Error updating attendance');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return '#4caf50';
      case 'absent': return '#f44336';
      case 'late': return '#ff9800';
      default: return '#999';
    }
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <h1>NIC Faculty Portal</h1>
        <div className="nav-right">
          <span>{profile?.first_name} {profile?.last_name}</span>
          <button onClick={logout} className="btn btn-sm">Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-menu">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
              📊 Profile
            </button>
            <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>
              📚 My Courses
            </button>
            <button className={activeTab === 'mark-attendance' ? 'active' : ''} onClick={() => setActiveTab('mark-attendance')}>
              ✅ Mark Attendance
            </button>
            <button className={activeTab === 'view-attendance' ? 'active' : ''} onClick={() => setActiveTab('view-attendance')}>
              📋 View Attendance
            </button>
            <button className={activeTab === 'export-attendance' ? 'active' : ''} onClick={() => setActiveTab('export-attendance')}>
              📤 Export Attendance
            </button>
            <button className={activeTab === 'upload-marks' ? 'active' : ''} onClick={() => setActiveTab('upload-marks')}>
              📝 Upload Marks
            </button>
            <button className={activeTab === 'results-analysis' ? 'active' : ''} onClick={() => setActiveTab('results-analysis')}>
              📊 Results Analysis
            </button>
            <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
              📈 Reports
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          {activeTab === 'overview' && (
            <div>
              <h2>Welcome, {profile?.first_name}!</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Faculty ID</h3>
                  <div className="stat-value">{profile?.faculty_id}</div>
                  <p>{profile?.department}</p>
                </div>
                <div className="stat-card">
                  <h3>Assigned Courses</h3>
                  <div className="stat-value">{courses.length}</div>
                  <p>{profile?.specialization}</p>
                </div>
              </div>

              <div className="card" style={{marginTop: '20px'}}>
                <h3>Profile Information</h3>
                <table className="table">
                  <tbody>
                    <tr>
                      <td><strong>Name:</strong></td>
                      <td>{profile?.first_name} {profile?.last_name}</td>
                    </tr>
                    <tr>
                      <td><strong>Email:</strong></td>
                      <td>{profile?.email}</td>
                    </tr>
                    <tr>
                      <td><strong>Phone:</strong></td>
                      <td>{profile?.phone}</td>
                    </tr>
                    <tr>
                      <td><strong>Department:</strong></td>
                      <td>{profile?.department}</td>
                    </tr>
                    <tr>
                      <td><strong>Specialization:</strong></td>
                      <td>{profile?.specialization}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div>
              <h2>My Courses</h2>
              <div className="card">
                {courses.length === 0 ? (
                  <p>No courses assigned yet.</p>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Course Name</th>
                        <th>Class</th>
                        <th>Credits</th>
                        <th>Academic Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map(course => (
                        <tr key={course.id}>
                          <td>{course.code}</td>
                          <td>{course.name}</td>
                          <td>Class {course.class}</td>
                          <td>{course.credits}</td>
                          <td>{course.academic_year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'mark-attendance' && (
            <div>
              <h2>Mark Attendance</h2>
              <div className="card">
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                  <div>
                    <label>Course:</label>
                    <select 
                      className="form-control" 
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name} - Class {course.class}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Date:</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Class:</label>
                    <select 
                      className="form-control"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="">Select Class</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                  </div>

                  <div>
                    <label>Section:</label>
                    <select 
                      className="form-control"
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                    >
                      <option value="">Select Section</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                      <option value="E">Section E</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={loadStudents}
                  disabled={!selectedClass || !selectedSection}
                >
                  Load Students
                </button>

                {students.length > 0 && (
                  <div style={{marginTop: '20px'}}>
                    <div style={{marginBottom: '15px', display: 'flex', gap: '10px'}}>
                      <button className="btn btn-sm" onClick={() => handleMarkAll('present')} style={{background: '#4caf50'}}>
                        Mark All Present
                      </button>
                      <button className="btn btn-sm" onClick={() => handleMarkAll('absent')} style={{background: '#f44336'}}>
                        Mark All Absent
                      </button>
                    </div>

                    <table className="table">
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(student => (
                          <tr key={student.id}>
                            <td>{student.roll_number}</td>
                            <td>{student.student_id}</td>
                            <td>{student.first_name} {student.last_name}</td>
                            <td>
                              <select 
                                className="form-control"
                                value={attendanceData[student.id] || 'present'}
                                onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                style={{
                                  background: getStatusColor(attendanceData[student.id] || 'present'),
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <button className="btn btn-primary" onClick={submitAttendance}>
                      Submit Attendance
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'view-attendance' && (
            <div>
              <h2>View & Edit Attendance</h2>
              <div className="card">
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                  <div>
                    <label>Course:</label>
                    <select 
                      className="form-control"
                      value={viewCourse}
                      onChange={(e) => setViewCourse(e.target.value)}
                    >
                      <option value="">All Courses</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name} - Class {course.class}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Class:</label>
                    <select 
                      className="form-control"
                      value={viewClass}
                      onChange={(e) => setViewClass(e.target.value)}
                    >
                      <option value="">All Classes</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                  </div>

                  <div>
                    <label>Section:</label>
                    <select 
                      className="form-control"
                      value={viewSection}
                      onChange={(e) => setViewSection(e.target.value)}
                    >
                      <option value="">All Sections</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                      <option value="E">Section E</option>
                    </select>
                  </div>

                  <div>
                    <label>Date:</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={viewDate}
                      onChange={(e) => setViewDate(e.target.value)}
                    />
                  </div>
                </div>

                <button className="btn btn-primary" onClick={loadAttendanceRecords}>
                  Load Records
                </button>

                {attendanceRecords.length > 0 && (
                  <div style={{marginTop: '20px'}}>
                    <p><strong>Total Records:</strong> {attendanceRecords.length}</p>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Course</th>
                          <th>Class</th>
                          <th>Section</th>
                          <th>Roll No</th>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map(record => (
                          <tr key={record.id}>
                            <td>{new Date(record.date).toLocaleDateString()}</td>
                            <td>{record.course_code}</td>
                            <td>{record.class}</td>
                            <td>{record.section}</td>
                            <td>{record.roll_number}</td>
                            <td>{record.student_id}</td>
                            <td>{record.first_name} {record.last_name}</td>
                            <td>
                              {editingRecord === record.id ? (
                                <select 
                                  className="form-control"
                                  defaultValue={record.status}
                                  onChange={(e) => handleEditAttendance(record.id, e.target.value)}
                                  style={{
                                    background: getStatusColor(record.status),
                                    color: 'white'
                                  }}
                                >
                                  <option value="present">Present</option>
                                  <option value="absent">Absent</option>
                                  <option value="late">Late</option>
                                </select>
                              ) : (
                                <span 
                                  className="badge"
                                  style={{
                                    background: getStatusColor(record.status),
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    color: 'white'
                                  }}
                                >
                                  {record.status.toUpperCase()}
                                </span>
                              )}
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm"
                                onClick={() => setEditingRecord(editingRecord === record.id ? null : record.id)}
                                style={{background: '#48d1cc'}}
                              >
                                {editingRecord === record.id ? 'Cancel' : 'Edit'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {attendanceRecords.length === 0 && (
                  <p style={{marginTop: '20px', color: '#999'}}>
                    No attendance records found. Try adjusting the filters.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'export-attendance' && (
            <div>
              <h2>Export Attendance Summary</h2>
              <div className="card">
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                  <div>
                    <label>Course:</label>
                    <select 
                      className="form-control"
                      value={exportCourse}
                      onChange={(e) => setExportCourse(e.target.value)}
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name} - Class {course.class}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Class:</label>
                    <select 
                      className="form-control"
                      value={exportClass}
                      onChange={(e) => setExportClass(e.target.value)}
                    >
                      <option value="">Select Class</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                  </div>

                  <div>
                    <label>Section:</label>
                    <select 
                      className="form-control"
                      value={exportSection}
                      onChange={(e) => setExportSection(e.target.value)}
                    >
                      <option value="">Select Section</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                      <option value="E">Section E</option>
                    </select>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={loadAttendanceSummary}>
                  Load Summary
                </button>

                {attendanceSummary.length > 0 && (
                  <div style={{marginTop: '20px'}}>
                    <div style={{marginBottom: '15px'}}>
                      <button className="btn" onClick={exportAttendanceCSV} style={{background: '#4caf50', color: 'white'}}>
                        📥 Export as CSV
                      </button>
                    </div>

                    <table className="table">
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Total Days</th>
                          <th>Present</th>
                          <th>Absent</th>
                          <th>Late</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceSummary.map(student => (
                          <tr key={student.student_id}>
                            <td>{student.roll_number}</td>
                            <td>{student.student_id}</td>
                            <td>{student.first_name} {student.last_name}</td>
                            <td>{student.total_days || 0}</td>
                            <td style={{color: '#4caf50', fontWeight: 'bold'}}>{student.present_days || 0}</td>
                            <td style={{color: '#f44336', fontWeight: 'bold'}}>{student.absent_days || 0}</td>
                            <td style={{color: '#ff9800', fontWeight: 'bold'}}>{student.late_days || 0}</td>
                            <td>
                              <span style={{
                                background: (student.percentage || 0) >= 75 ? '#4caf50' : '#f44336',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                              }}>
                                {student.percentage || 0}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'upload-marks' && (
            <div>
              <h2>Upload Marks</h2>
              <div className="card">
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                  <div>
                    <label>Course:</label>
                    <select 
                      className="form-control"
                      value={uploadCourse}
                      onChange={(e) => setUploadCourse(e.target.value)}
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name} - Class {course.class}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Class:</label>
                    <select 
                      className="form-control"
                      value={uploadClass}
                      onChange={(e) => setUploadClass(e.target.value)}
                    >
                      <option value="">Select Class</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                  </div>

                  <div>
                    <label>Section:</label>
                    <select 
                      className="form-control"
                      value={uploadSection}
                      onChange={(e) => setUploadSection(e.target.value)}
                    >
                      <option value="">Select Section</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                      <option value="E">Section E</option>
                    </select>
                  </div>

                  <div>
                    <label>Term:</label>
                    <select 
                      className="form-control"
                      value={uploadTerm}
                      onChange={(e) => setUploadTerm(e.target.value)}
                    >
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={loadStudentsForUpload}
                  disabled={!uploadClass || !uploadSection}
                >
                  Load Students
                </button>

                {uploadStudents.length > 0 && (
                  <div style={{marginTop: '20px'}}>
                    <p><strong>Enter marks for {uploadTerm}</strong></p>
                    <p style={{color: '#666', fontSize: '14px'}}>Theory: 0-75 | Practical: 0-25 | Total: 100</p>
                    
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Theory (75)</th>
                          <th>Practical (25)</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadStudents.map(student => {
                          const theory = parseFloat(marksData[student.id]?.theoryMarks) || 0;
                          const practical = parseFloat(marksData[student.id]?.practicalMarks) || 0;
                          const total = theory + practical;
                          
                          return (
                            <tr key={student.id}>
                              <td>{student.roll_number}</td>
                              <td>{student.student_id}</td>
                              <td>{student.first_name} {student.last_name}</td>
                              <td>
                                <input 
                                  type="number"
                                  className="form-control"
                                  min="0"
                                  max="75"
                                  step="0.5"
                                  value={marksData[student.id]?.theoryMarks || ''}
                                  onChange={(e) => handleMarksChange(student.id, 'theoryMarks', e.target.value)}
                                  style={{width: '100px'}}
                                />
                              </td>
                              <td>
                                <input 
                                  type="number"
                                  className="form-control"
                                  min="0"
                                  max="25"
                                  step="0.5"
                                  value={marksData[student.id]?.practicalMarks || ''}
                                  onChange={(e) => handleMarksChange(student.id, 'practicalMarks', e.target.value)}
                                  style={{width: '100px'}}
                                />
                              </td>
                              <td>
                                <strong>{total.toFixed(1)}</strong>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <button className="btn btn-primary" onClick={submitMarks}>
                      Submit Marks
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'results-analysis' && (
            <div>
              <h2>Results Analysis</h2>
              <div className="card">
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                  <div>
                    <label>Course:</label>
                    <select 
                      className="form-control"
                      value={analysisCourse}
                      onChange={(e) => setAnalysisCourse(e.target.value)}
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name} - Class {course.class}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Class:</label>
                    <select 
                      className="form-control"
                      value={analysisClass}
                      onChange={(e) => setAnalysisClass(e.target.value)}
                    >
                      <option value="">Select Class</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                  </div>

                  <div>
                    <label>Section:</label>
                    <select 
                      className="form-control"
                      value={analysisSection}
                      onChange={(e) => setAnalysisSection(e.target.value)}
                    >
                      <option value="">Select Section</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                      <option value="E">Section E</option>
                    </select>
                  </div>

                  <div>
                    <label>Term:</label>
                    <select 
                      className="form-control"
                      value={analysisTerm}
                      onChange={(e) => setAnalysisTerm(e.target.value)}
                    >
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                    </select>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={loadResultsAnalysis}>
                  Load Analysis
                </button>

                {resultsData && (
                  <div style={{marginTop: '20px'}}>
                    <div style={{marginBottom: '15px'}}>
                      <button className="btn" onClick={exportResultsCSV} style={{background: '#4caf50', color: 'white'}}>
                        📥 Export as CSV
                      </button>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px'}}>
                      <div>
                        <h3>Student Results</h3>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Roll</th>
                              <th>Student ID</th>
                              <th>Name</th>
                              <th>Theory</th>
                              <th>Practical</th>
                              <th>Total</th>
                              <th>%</th>
                              <th>Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultsData.students.map(student => (
                              <tr key={student.student_id}>
                                <td>{student.roll_number}</td>
                                <td>{student.student_id}</td>
                                <td>{student.first_name} {student.last_name}</td>
                                <td>{student.theory_marks || 'N/A'}</td>
                                <td>{student.practical_marks || 'N/A'}</td>
                                <td>{student.total_marks || 'N/A'}</td>
                                <td>{student.percentage || 'N/A'}</td>
                                <td>
                                  <span style={{
                                    background: student.grade === 'A+' || student.grade === 'A' ? '#4caf50' :
                                               student.grade === 'B+' || student.grade === 'B' ? '#2196f3' :
                                               student.grade === 'C+' || student.grade === 'C' ? '#ff9800' :
                                               student.grade === 'F' ? '#f44336' : '#999',
                                    color: 'white',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold'
                                  }}>
                                    {student.grade || 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h3>Grade Distribution</h3>
                        <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                          {Object.entries(resultsData.gradeDistribution).map(([grade, count]) => {
                            const total = resultsData.students.length;
                            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                            const color = grade === 'A+' || grade === 'A' ? '#4caf50' :
                                        grade === 'B+' || grade === 'B' ? '#2196f3' :
                                        grade === 'C+' || grade === 'C' ? '#ff9800' :
                                        grade === 'F' ? '#f44336' : '#999';
                            
                            return (
                              <div key={grade} style={{marginBottom: '15px'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                                  <span style={{fontWeight: 'bold'}}>{grade}</span>
                                  <span>{count} ({percentage}%)</span>
                                </div>
                                <div style={{
                                  width: '100%',
                                  height: '20px',
                                  background: '#f0f0f0',
                                  borderRadius: '10px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    background: color,
                                    transition: 'width 0.3s ease'
                                  }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div style={{marginTop: '20px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                          <h4>Summary</h4>
                          <p><strong>Total Students:</strong> {resultsData.students.length}</p>
                          <p><strong>Pass Rate:</strong> {
                            (() => {
                              const passed = resultsData.students.filter(s => s.grade && s.grade !== 'F' && s.grade !== 'N/A').length;
                              const total = resultsData.students.filter(s => s.grade && s.grade !== 'N/A').length;
                              return total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
                            })()
                          }%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2>Reports & Analytics</h2>
              
              <div className="card" style={{marginBottom: '20px'}}>
                <h3>Attendance Report</h3>
                <p>Generate comprehensive attendance reports for your classes</p>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '20px'}}>
                  <div>
                    <label>Course:</label>
                    <select className="form-control">
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name} - Class {course.class}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label>Class:</label>
                    <select className="form-control">
                      <option value="">Select Class</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                  </div>
                  
                  <div>
                    <label>Section:</label>
                    <select className="form-control">
                      <option value="">Select Section</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                      <option value="E">Section E</option>
                    </select>
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'}}>
                  <div>
                    <label>Start Date:</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div>
                    <label>End Date:</label>
                    <input type="date" className="form-control" />
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{marginTop: '20px'}}
                  onClick={() => alert('This will generate an attendance report. Feature coming soon!')}
                >
                  📊 Generate Attendance Report
                </button>
              </div>

              <div className="card">
                <h3>Performance Report</h3>
                <p>View and analyze student performance across terms</p>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginTop: '20px'}}>
                  <div>
                    <label>Course:</label>
                    <select className="form-control">
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name} - Class {course.class}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label>Class:</label>
                    <select className="form-control">
                      <option value="">Select Class</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                  </div>
                  
                  <div>
                    <label>Section:</label>
                    <select className="form-control">
                      <option value="">Select Section</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                      <option value="E">Section E</option>
                    </select>
                  </div>

                  <div>
                    <label>Term:</label>
                    <select className="form-control">
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                      <option value="All Terms">All Terms</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{marginTop: '20px'}}
                  onClick={() => alert('This will generate a performance report. Feature coming soon!')}
                >
                  📈 Generate Performance Report
                </button>
              </div>

              <div className="card" style={{marginTop: '20px', background: '#e7f3ff', border: '1px solid #2196f3'}}>
                <h3 style={{color: '#1976d2'}}>💡 Quick Access</h3>
                <p>Use the tabs above for detailed reports:</p>
                <ul style={{marginLeft: '20px', lineHeight: '2'}}>
                  <li><strong>Export Attendance:</strong> Download attendance summary as CSV</li>
                  <li><strong>Results Analysis:</strong> View grade distribution and performance charts</li>
                  <li><strong>View Attendance:</strong> Filter and view detailed attendance records</li>
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default FacultyDashboard;
