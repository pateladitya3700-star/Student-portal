import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

function StudentDashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState({ attendance: [], stats: {} });
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedDate, setSelectedDate] = useState('');
  const [subjectStats, setSubjectStats] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('overall');
  const [feeHistory, setFeeHistory] = useState([]);
  const [feeStats, setFeeStats] = useState({
    totalFee: 0,
    totalPaid: 0,
    totalDue: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'fees') {
      loadFeeHistory();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      console.log('Loading student data...');
      const [profileRes, coursesRes, attendanceRes, resultsRes, notifRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/courses'),
        api.get('/student/attendance'),
        api.get('/student/results'),
        api.get('/student/notifications')
      ]);

      console.log('Profile data received:', profileRes.data);
      setProfile(profileRes.data);
      setCourses(coursesRes.data);
      setAttendance(attendanceRes.data);
      setResults(resultsRes.data);
      setNotifications(notifRes.data);
      
      // Calculate subject-wise attendance
      if (attendanceRes.data.attendance && attendanceRes.data.attendance.length > 0) {
        calculateSubjectStats(attendanceRes.data.attendance);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error response:', error.response);
    }
  };

  const calculateSubjectStats = (attendanceData) => {
    const subjectMap = {};
    
    attendanceData.forEach(record => {
      if (!subjectMap[record.course_name]) {
        subjectMap[record.course_name] = {
          name: record.course_name,
          total: 0,
          present: 0
        };
      }
      subjectMap[record.course_name].total++;
      if (record.status === 'present') {
        subjectMap[record.course_name].present++;
      }
    });

    const stats = Object.values(subjectMap).map(subject => ({
      ...subject,
      percentage: ((subject.present / subject.total) * 100).toFixed(1)
    }));

    setSubjectStats(stats);
  };

  const loadFeeHistory = async () => {
    try {
      const response = await api.get('/student/fees');
      setFeeHistory(response.data.feeHistory || []);
      setFeeStats(response.data.stats || { totalFee: 0, totalPaid: 0, totalDue: 0 });
    } catch (error) {
      console.error('Error loading fee history:', error);
    }
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

  const getFilteredAttendance = () => {
    if (!selectedDate) {
      return attendance.attendance;
    }
    
    return attendance.attendance.filter(record => {
      // Handle both 'date' and 'DATE' column names, and null values
      const dateValue = record.date || record.DATE;
      if (!dateValue) return false;
      
      const recordDate = new Date(dateValue).toISOString().split('T')[0];
      return recordDate === selectedDate;
    });
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <h1>NIC Student Portal</h1>
        <div className="nav-right">
          <span>{profile?.first_name} {profile?.last_name}</span>
          <button onClick={logout} className="btn btn-sm">Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-menu">
            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
              👤 Profile
            </button>
            <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>
              📚 Subjects
            </button>
            <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
              📅 Attendance
            </button>
            <button className={activeTab === 'results' ? 'active' : ''} onClick={() => setActiveTab('results')}>
              📝 Results
            </button>
            <button className={activeTab === 'fees' ? 'active' : ''} onClick={() => setActiveTab('fees')}>
              💰 Fee History
            </button>
            <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
              🔔 Notifications
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          {activeTab === 'profile' && (
            <div>
              <h2>My Profile</h2>
              <p className="subtitle">Personal and academic details</p>
              
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
                  </div>
                  <h3>{profile?.first_name} {profile?.last_name}</h3>
                </div>

                <div className="profile-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <label>Full Name</label>
                      <p>{profile?.first_name} {profile?.last_name}</p>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <p>{profile?.email}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <label>Phone</label>
                      <p>{profile?.phone}</p>
                    </div>
                    <div className="detail-item">
                      <label>Student ID</label>
                      <p>{profile?.student_id}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <label>Class</label>
                      <p>{profile?.class}</p>
                    </div>
                    <div className="detail-item">
                      <label>Section</label>
                      <p>{profile?.section}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <label>Roll No</label>
                      <p>{profile?.roll_number}</p>
                    </div>
                    <div className="detail-item">
                      <label>Guardian Name</label>
                      <p>{profile?.guardian_name}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <label>Guardian Phone</label>
                      <p>{profile?.guardian_phone}</p>
                    </div>
                    <div className="detail-item">
                      <label>Enrollment Date</label>
                      <p>{profile?.enrollment_date ? new Date(profile.enrollment_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <label>Address</label>
                      <p>{profile?.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div>
              <h2>Subjects</h2>
              <div className="card">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Subject Name</th>
                      <th>Credits</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length > 0 ? (
                      courses.map(course => (
                        <tr key={course.id}>
                          <td>{course.code}</td>
                          <td>{course.name}</td>
                          <td>{course.credits}</td>
                          <td>{course.description}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>
                          No subjects found for your class
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h2>Attendance Record</h2>
              
              <div className="card">
                <h3>Overall Attendance</h3>
                <div className="attendance-summary">
                  <div style={{fontSize: '48px', fontWeight: 'bold', color: attendance.stats.percentage >= 75 ? '#4CAF50' : '#f44336'}}>
                    {attendance.stats.percentage}%
                  </div>
                  <p>Present: {attendance.stats.present} | Absent: {attendance.stats.total - attendance.stats.present} | Total: {attendance.stats.total}</p>
                </div>
              </div>

              {subjectStats.length > 0 && (
                <div className="card" style={{marginTop: '20px'}}>
                  <h3>Subject-wise Attendance</h3>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Present</th>
                        <th>Total Classes</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectStats.map((subject, index) => (
                        <tr key={index}>
                          <td>{subject.name}</td>
                          <td>{subject.present}</td>
                          <td>{subject.total}</td>
                          <td>
                            <span className={`badge ${subject.percentage >= 75 ? 'badge-success' : 'badge-danger'}`}>
                              {subject.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="card" style={{marginTop: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h3>Attendance Details</h3>
                  <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <label>Filter by Date:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd'}}
                    />
                    {selectedDate && (
                      <button 
                        onClick={() => setSelectedDate('')}
                        className="btn btn-sm btn-secondary"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {attendance.attendance.length > 0 ? (
                  <>
                    {selectedDate && (
                      <p style={{marginBottom: '15px', color: '#666'}}>
                        Showing attendance for: {new Date(selectedDate).toLocaleDateString()}
                      </p>
                    )}
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Subject</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredAttendance().length > 0 ? (
                          getFilteredAttendance().map(record => (
                            <tr key={record.id}>
                              <td>{new Date(record.date).toLocaleDateString()}</td>
                              <td>{record.course_name}</td>
                              <td>
                                <span className={`badge badge-${record.status === 'present' ? 'success' : 'danger'}`}>
                                  {record.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>
                              No attendance records found for this date.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                    <p>No attendance records found.</p>
                    <p style={{fontSize: '14px', marginTop: '10px'}}>
                      Attendance will be marked by faculty members.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div>
              <h2>Exam Results</h2>
              <p className="subtitle">Grade breakdown and percentage for each term</p>

              {/* Term Selector */}
              <div style={{marginBottom: '20px', display: 'flex', gap: '10px'}}>
                <button 
                  className={`btn ${selectedTerm === 'overall' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedTerm('overall')}
                >
                  Overall
                </button>
                <button 
                  className={`btn ${selectedTerm === 'first_term' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedTerm('first_term')}
                >
                  First Term
                </button>
                <button 
                  className={`btn ${selectedTerm === 'second_term' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedTerm('second_term')}
                >
                  Second Term
                </button>
                <button 
                  className={`btn ${selectedTerm === 'third_term' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedTerm('third_term')}
                >
                  Third Term
                </button>
              </div>

              {/* Overall Summary - shown when "Overall" is selected */}
              {selectedTerm === 'overall' && results.length > 0 && (
                <div>
                  {/* Overall Percentage and Grade Card */}
                  <div className="card" style={{marginBottom: '20px', textAlign: 'center', padding: '30px'}}>
                    <h3 style={{color: '#666', marginBottom: '20px'}}>Final Grade & Overall Performance</h3>
                    <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                      <div>
                        <p style={{color: '#666', marginBottom: '10px'}}>Overall Percentage</p>
                        <div style={{fontSize: '48px', fontWeight: 'bold', color: '#48d1cc'}}>
                          {(() => {
                            const totalMarks = results.reduce((sum, r) => sum + parseFloat(r.marks_obtained), 0);
                            const totalPossible = results.reduce((sum, r) => sum + parseFloat(r.total_marks), 0);
                            return totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(1) : '0';
                          })()}%
                        </div>
                      </div>
                      <div>
                        <p style={{color: '#666', marginBottom: '10px'}}>Final Grade</p>
                        <div style={{fontSize: '48px', fontWeight: 'bold', color: '#4CAF50'}}>
                          {(() => {
                            const totalMarks = results.reduce((sum, r) => sum + parseFloat(r.marks_obtained), 0);
                            const totalPossible = results.reduce((sum, r) => sum + parseFloat(r.total_marks), 0);
                            const percentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;
                            return percentage >= 90 ? 'A+' : 
                                   percentage >= 80 ? 'A' : 
                                   percentage >= 70 ? 'B+' : 
                                   percentage >= 60 ? 'B' : 
                                   percentage >= 50 ? 'C+' : 
                                   percentage >= 40 ? 'C' : 'F';
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Term-wise Summary */}
                  <div className="card" style={{marginBottom: '20px'}}>
                    <h3>Term-wise Performance</h3>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Term</th>
                          <th>Total Marks</th>
                          <th>Percentage</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['first_term', 'second_term', 'third_term'].map(term => {
                          const termResults = results.filter(r => r.exam_type === term);
                          if (termResults.length === 0) return null;
                          
                          const totalMarks = termResults.reduce((sum, r) => sum + parseFloat(r.marks_obtained), 0);
                          const totalPossible = termResults.reduce((sum, r) => sum + parseFloat(r.total_marks), 0);
                          const percentage = ((totalMarks / totalPossible) * 100).toFixed(1);
                          const grade = percentage >= 90 ? 'A+' : 
                                       percentage >= 80 ? 'A' : 
                                       percentage >= 70 ? 'B+' : 
                                       percentage >= 60 ? 'B' : 
                                       percentage >= 50 ? 'C+' : 
                                       percentage >= 40 ? 'C' : 'F';
                          
                          return (
                            <tr key={term}>
                              <td><strong>{term === 'first_term' ? 'First Term' : term === 'second_term' ? 'Second Term' : 'Third Term'}</strong></td>
                              <td>{totalMarks.toFixed(0)}/{totalPossible}</td>
                              <td>
                                <span className={`badge ${percentage >= 40 ? 'badge-success' : 'badge-danger'}`}>
                                  {percentage}%
                                </span>
                              </td>
                              <td><strong>{grade}</strong></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Subject-wise Overall Performance */}
                  <div className="card">
                    <h3>Subject-wise Overall Performance</h3>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>First Term</th>
                          <th>Second Term</th>
                          <th>Third Term</th>
                          <th>Average</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const subjects = {};
                          results.forEach(r => {
                            if (!subjects[r.course_name]) {
                              subjects[r.course_name] = { first_term: 0, second_term: 0, third_term: 0 };
                            }
                            const percentage = ((r.marks_obtained / r.total_marks) * 100).toFixed(1);
                            subjects[r.course_name][r.exam_type] = percentage;
                          });

                          return Object.keys(subjects).map(subject => {
                            const avg = ((parseFloat(subjects[subject].first_term || 0) + 
                                         parseFloat(subjects[subject].second_term || 0) + 
                                         parseFloat(subjects[subject].third_term || 0)) / 3).toFixed(1);
                            const grade = avg >= 90 ? 'A+' : avg >= 80 ? 'A' : avg >= 70 ? 'B+' : 
                                         avg >= 60 ? 'B' : avg >= 50 ? 'C+' : avg >= 40 ? 'C' : 'F';
                            
                            return (
                              <tr key={subject}>
                                <td><strong>{subject}</strong></td>
                                <td>{subjects[subject].first_term || '-'}%</td>
                                <td>{subjects[subject].second_term || '-'}%</td>
                                <td>{subjects[subject].third_term || '-'}%</td>
                                <td>
                                  <span className={`badge ${avg >= 40 ? 'badge-success' : 'badge-danger'}`}>
                                    {avg}%
                                  </span>
                                </td>
                                <td><strong>{grade}</strong></td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Individual Term Results */}
              {selectedTerm !== 'overall' && (
                <>
                  {/* Term Overall Percentage Card */}
                  {results.filter(r => r.exam_type === selectedTerm).length > 0 && (
                    <div className="card" style={{marginBottom: '20px', textAlign: 'center', padding: '30px'}}>
                      <h3 style={{color: '#666', marginBottom: '10px'}}>
                        {selectedTerm === 'first_term' ? 'First Term' : selectedTerm === 'second_term' ? 'Second Term' : 'Third Term'} Overall Percentage
                      </h3>
                      <div style={{fontSize: '48px', fontWeight: 'bold', color: '#48d1cc'}}>
                        {(() => {
                          const termResults = results.filter(r => r.exam_type === selectedTerm);
                          if (termResults.length === 0) return '0';
                          const totalMarks = termResults.reduce((sum, r) => sum + parseFloat(r.marks_obtained), 0);
                          const totalPossible = termResults.reduce((sum, r) => sum + parseFloat(r.total_marks), 0);
                          return totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(1) : '0';
                        })()}%
                      </div>
                    </div>
                  )}

                  {/* Detailed Results Table */}
                  <div className="card">
                    <h3>Detailed Results</h3>
                    {results.filter(r => r.exam_type === selectedTerm).length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Theory (75)</th>
                            <th>Practical (25)</th>
                            <th>Total (100)</th>
                            <th>Percentage</th>
                            <th>Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results
                            .filter(r => r.exam_type === selectedTerm)
                            .map(result => {
                              const percentage = ((result.marks_obtained / result.total_marks) * 100).toFixed(1);
                              const grade = percentage >= 90 ? 'A+' : 
                                           percentage >= 80 ? 'A' : 
                                           percentage >= 70 ? 'B+' : 
                                           percentage >= 60 ? 'B' : 
                                           percentage >= 50 ? 'C+' : 
                                           percentage >= 40 ? 'C' : 'F';
                              
                              return (
                                <tr key={result.id}>
                                  <td><strong>{result.course_name}</strong></td>
                                  <td>{result.theory_marks || '-'}/75</td>
                                  <td>{result.practical_marks || '-'}/25</td>
                                  <td><strong>{result.marks_obtained}/{result.total_marks}</strong></td>
                                  <td>
                                    <span className={`badge ${percentage >= 40 ? 'badge-success' : 'badge-danger'}`}>
                                      {percentage}%
                                    </span>
                                  </td>
                                  <td><strong>{grade}</strong></td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                        <p>No results available for {selectedTerm === 'first_term' ? 'First Term' : selectedTerm === 'second_term' ? 'Second Term' : 'Third Term'}.</p>
                        <p style={{fontSize: '14px', marginTop: '10px'}}>
                          Results will be published by faculty after exams.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {results.length === 0 && (
                <div className="card" style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                  <p>No results available yet.</p>
                  <p style={{fontSize: '14px', marginTop: '10px'}}>
                    Results will be published by faculty after exams.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fees' && (
            <div>
              <h2>Fee History</h2>
              <p className="subtitle">View your fee payment history and outstanding dues</p>

              {/* Fee Summary Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Fee</h3>
                  <div className="stat-value">Rs. {feeStats.totalFee.toLocaleString()}</div>
                  <p>Across all semesters</p>
                </div>
                <div className="stat-card">
                  <h3>Total Paid</h3>
                  <div className="stat-value" style={{color: 'var(--color-primary)'}}>
                    Rs. {feeStats.totalPaid.toLocaleString()}
                  </div>
                  <p>Payments made</p>
                </div>
                <div className="stat-card">
                  <h3>Total Due</h3>
                  <div className="stat-value" style={{color: feeStats.totalDue > 0 ? '#EF4444' : 'var(--color-primary)'}}>
                    Rs. {feeStats.totalDue.toLocaleString()}
                  </div>
                  <p>Outstanding amount</p>
                </div>
                <div className="stat-card">
                  <h3>Payment Progress</h3>
                  <div className="stat-value">
                    {feeStats.totalFee > 0 ? Math.round((feeStats.totalPaid / feeStats.totalFee) * 100) : 0}%
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    marginTop: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${feeStats.totalFee > 0 ? (feeStats.totalPaid / feeStats.totalFee) * 100 : 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              </div>

              {/* Fee History Table */}
              <div className="profile-card" style={{marginTop: '30px'}}>
                <h3 style={{marginBottom: '20px'}}>Payment Records</h3>
                
                {feeHistory.length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Period</th>
                          <th>Total Fee</th>
                          <th>Paid</th>
                          <th>Due</th>
                          <th>Payment Date</th>
                          <th>Method</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeHistory.map(fee => (
                          <tr key={fee.id}>
                            <td>
                              <strong>{fee.academic_year}</strong>
                              <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px'}}>
                                {fee.semester}
                              </div>
                            </td>
                            <td><strong>Rs. {parseFloat(fee.total_fee).toLocaleString()}</strong></td>
                            <td style={{color: 'var(--color-primary)', fontWeight: '600'}}>
                              Rs. {parseFloat(fee.paid_amount).toLocaleString()}
                            </td>
                            <td style={{color: fee.due_amount > 0 ? '#EF4444' : '#10B981', fontWeight: '600'}}>
                              Rs. {parseFloat(fee.due_amount).toLocaleString()}
                            </td>
                            <td>
                              {fee.payment_date ? new Date(fee.payment_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : '-'}
                            </td>
                            <td>{fee.payment_method || '-'}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(fee.status)}`}>
                                {fee.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state" style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{fontSize: '3rem', marginBottom: '20px'}}>💰</div>
                    <h3>No Fee Records</h3>
                    <p>Your fee payment history will appear here</p>
                  </div>
                )}

                {/* Remarks Section */}
                {feeHistory.some(fee => fee.remarks) && (
                  <div style={{marginTop: '30px'}}>
                    <h4 style={{marginBottom: '15px', color: 'var(--text-primary)'}}>Additional Notes</h4>
                    {feeHistory.filter(fee => fee.remarks).map(fee => (
                      <div key={fee.id} style={{
                        padding: '12px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        borderLeft: '3px solid var(--color-primary)'
                      }}>
                        <strong>{fee.academic_year} - {fee.semester}:</strong>
                        <p style={{margin: '5px 0 0 0', color: 'var(--text-secondary)'}}>{fee.remarks}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Instructions */}
              {feeStats.totalDue > 0 && (
                <div className="profile-card" style={{
                  marginTop: '20px',
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
                  borderLeft: '4px solid var(--color-accent)'
                }}>
                  <h4 style={{color: 'var(--color-accent)', marginBottom: '10px'}}>
                    ⚠️ Outstanding Payment
                  </h4>
                  <p style={{marginBottom: '15px'}}>
                    You have an outstanding balance of <strong>Rs. {feeStats.totalDue.toLocaleString()}</strong>. 
                    Please contact the administration office for payment options.
                  </p>
                  <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                    <p><strong>Payment Methods:</strong></p>
                    <ul style={{marginLeft: '20px', marginTop: '5px'}}>
                      <li>Cash payment at college office</li>
                      <li>Bank transfer to college account</li>
                      <li>Online payment portal (coming soon)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2>Notifications</h2>
              <div className="card">
                {notifications.map(notif => (
                  <div key={notif.id} className="notification-card">
                    <div className="notification-header">
                      <strong>{notif.title}</strong>
                      <span className="notification-date">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{notif.message}</p>
                    <span className={`badge badge-${notif.type === 'test' ? 'warning' : 'success'}`}>
                      {notif.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
