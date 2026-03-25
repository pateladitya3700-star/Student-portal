const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('student'));

router.get('/profile', studentController.getProfile);
router.get('/courses', studentController.getCourses);
router.get('/attendance', studentController.getAttendance);
router.get('/results', studentController.getResults);
router.get('/notifications', studentController.getNotifications);
router.get('/fees', studentController.getFeeHistory);

module.exports = router;
