const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('faculty'));

router.get('/profile', facultyController.getProfile);
router.get('/courses', facultyController.getCourses);
router.get('/students/:classNum/:section', facultyController.getStudentsByClass);
router.post('/attendance', facultyController.markAttendance);
router.get('/attendance', facultyController.getAttendanceRecords);
router.put('/attendance/:attendanceId', facultyController.updateAttendance);
router.get('/attendance-summary', facultyController.getAttendanceSummary);
router.get('/results-analysis', facultyController.getResultsAnalysis);
router.post('/upload-marks', facultyController.uploadMarks);
router.post('/grades', facultyController.uploadGrades);
router.post('/announcement', facultyController.sendAnnouncement);

module.exports = router;
