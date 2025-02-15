const {Router} = require('express');
const EmployeeController = require('../controllers/EmployeeController');
const AuthController = require('../controllers/AuthController');
const AttendanceController = require('../controllers/AttendanceController');
const PayrollController = require('../controllers/PayrollController');
const { isAuthenticated } = require('../middlewares/Authenticated');
const {upload}  = require('../middlewares/upload');
// const upload = require('../utils/multerConfig'); // Import the multer configuration

const router = Router();

// router.get('/', AuthController.index);
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);

router.post('/employee',isAuthenticated, upload,  EmployeeController.createEmployee);
router.get('/employee',isAuthenticated, EmployeeController.getEmployees);
router.get('/employees/:id',isAuthenticated, EmployeeController.getEmployeeById);
router.put('/employee/:id',isAuthenticated, EmployeeController.updateEmployee);
router.delete('/employee/:id',isAuthenticated, EmployeeController.deleteEmployee);
router.put('/employee/status/:id',isAuthenticated, EmployeeController.toggleEmployeeActiveStatus);


router.post('/attendance/:id',isAuthenticated, AttendanceController.recordAttendance);
router.get('/attendance/:employeeId',isAuthenticated, AttendanceController.fetchAttendanceById);
router.get('/attendance',isAuthenticated, AttendanceController.fetchAttendance);
router.put('/attendance/:employeeId',isAuthenticated, AttendanceController.updateAttendance);
router.delete('/attendance/:employeeId',isAuthenticated, AttendanceController.deleteAttendance);

router.post('/payroll/:employeeId',isAuthenticated, PayrollController.createOrUpdatePayroll);



module.exports = router;