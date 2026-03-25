const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.get('/students', adminController.getStudents);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.get('/faculty', adminController.getFaculty);
router.put('/faculty/:id', adminController.updateFaculty);
router.delete('/faculty/:id', adminController.deleteFaculty);
router.get('/stats', adminController.getDashboardStats);
router.get('/reports/attendance', adminController.getAttendanceReport);
router.get('/reports/performance', adminController.getPerformanceReport);

// Course/Subject management
router.get('/courses', adminController.getCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Fee management
router.get('/fees', adminController.getAllFees);
router.get('/fees/stats', adminController.getFeeStats);
router.post('/fees', adminController.createFeeRecord);
router.put('/fees/:id', adminController.updateFeeRecord);
router.delete('/fees/:id', adminController.deleteFeeRecord);

module.exports = router;
