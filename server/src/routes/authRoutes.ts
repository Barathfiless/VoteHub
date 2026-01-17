
import express from 'express';
import {
    registerStudent, loginStudent, getStudent, checkStudentExists, getAllStudents, deleteStudent,
    registerAdmin, loginAdmin, getAdmin, checkAdminExists
} from '../controllers/authController.js';

const router = express.Router();

router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);
router.get('/student', getAllStudents);
router.get('/student/:id', getStudent);
router.post('/student/exists', checkStudentExists);
router.delete('/student/:id', deleteStudent);

router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);
router.get('/admin/:id', getAdmin);
router.post('/admin/exists', checkAdminExists);

export default router;
