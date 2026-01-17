
import type { Request, Response } from 'express';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';

// Student Auth
export const registerStudent = async (req: Request, res: Response) => {
    try {
        const { rollNo, password, name, department, email } = req.body;
        const existing = await Student.findOne({ rollNo });
        if (existing) return res.status(400).json({ message: 'Student already exists' });

        const newStudent = new Student({ rollNo, password: btoa(password), name, department, email });
        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(500).json({ message: 'Error registering student', error });
    }
};

export const loginStudent = async (req: Request, res: Response) => {
    try {
        const { rollNo, password } = req.body;
        const student = await Student.findOne({ rollNo });

        if (!student || student.password !== btoa(password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

export const getStudent = async (req: Request, res: Response) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student', error });
    }
};

export const checkStudentExists = async (req: Request, res: Response) => {
    try {
        const { rollNo } = req.body;
        const exists = await Student.exists({ rollNo });
        res.json({ exists: !!exists });
    } catch (error) {
        res.status(500).json({ message: 'Error checking existence', error });
    }
}

export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error });
    }
};

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting student', error });
    }
};

// Admin Auth
export const registerAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;
        const existing = await Admin.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Admin already exists' });

        const newAdmin = new Admin({ email, password: btoa(password), name });
        await newAdmin.save();
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(500).json({ message: 'Error registering admin', error });
    }
};

export const loginAdmin = async (req: Request, res: Response) => {
    console.log('[Controller] loginAdmin called', req.body.email);
    try {
        const { email, password } = req.body;
        console.log('[Controller] Finding admin...');
        const admin = await Admin.findOne({ email });

        if (!admin || admin.password !== btoa(password)) {
            console.log('[Controller] Invalid credentials');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('[Controller] Admin found, sending response...');
        res.json(admin);
    } catch (error: any) {
        console.error('Error in loginAdmin:', error);
        res.status(500).json({
            message: 'Error logging in',
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            }
        });
    }
};

export const getAdmin = async (req: Request, res: Response) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin', error });
    }
};

export const checkAdminExists = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const exists = await Admin.exists({ email });
        res.json({ exists: !!exists });
    } catch (error) {
        res.status(500).json({ message: 'Error checking existence', error });
    }
}
