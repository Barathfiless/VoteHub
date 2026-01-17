
import type { Request, Response } from 'express';
import Department from '../models/Department.js';

export const getDepartments = async (req: Request, res: Response) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching departments', error });
    }
};

export const createDepartment = async (req: Request, res: Response) => {
    console.log('[DepartmentController] createDepartment called. Body:', req.body);
    try {
        const { name } = req.body;
        if (!name) {
            console.log('[DepartmentController] Name is missing');
            return res.status(400).json({ message: 'Department name is required' });
        }

        const newDept = new Department({ name });
        await newDept.save();
        console.log('[DepartmentController] Department created:', newDept);
        res.status(201).json(newDept);
    } catch (error: any) {
        console.error('[DepartmentController] Error creating department:', error);

        // Handle duplicate key error specifically
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Department already exists', error });
        }

        res.status(400).json({ message: 'Error creating department', error });
    }
};


export const updateDepartment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) return res.status(400).json({ message: 'Name is required' });

        const updatedDept = await Department.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedDept) return res.status(404).json({ message: 'Department not found' });

        res.json(updatedDept);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Department with this name already exists', error });
        }
        res.status(500).json({ message: 'Error updating department', error });
    }
};

export const deleteDepartment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedDept = await Department.findByIdAndDelete(id);

        if (!deletedDept) return res.status(404).json({ message: 'Department not found' });

        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting department', error });
    }
};
