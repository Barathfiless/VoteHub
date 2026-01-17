import { API_BASE_URL } from '@/config/apiConfig';

const API_URL = `${API_BASE_URL}/auth`;

export interface StudentUser {
    id: string;
    rollNo: string;
    name: string;
    email?: string;
    department?: string;
    createdAt: string;
    role: 'student';
}

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    role: 'admin';
}

// Student Authentication
export const registerStudent = async (rollNo: string, password: string, name: string, email: string, department: string): Promise<StudentUser> => {
    const response = await fetch(`${API_URL}/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo, password, name, email, department }),
    });
    if (!response.ok) throw new Error('Failed to register student');
    return response.json();
};

export const loginStudent = async (rollNo: string, password: string): Promise<StudentUser | null> => {
    const response = await fetch(`${API_URL}/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo, password }),
    });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error('Failed to login student');
    return response.json();
};

export const getStudent = async (studentId: string): Promise<StudentUser | null> => {
    const response = await fetch(`${API_URL}/student/${studentId}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch student');
    return response.json();
};

export const studentExists = async (rollNo: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/student/exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo }),
    });

    if (!response.ok) throw new Error('Failed to check student existence');
    const data = await response.json();
    return data.exists;
};


// Admin Authentication
export const registerAdmin = async (email: string, password: string, name: string): Promise<AdminUser> => {
    const response = await fetch(`${API_URL}/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
    });
    if (!response.ok) throw new Error('Failed to register admin');
    return response.json();
};

export const loginAdmin = async (email: string, password: string): Promise<AdminUser | null> => {
    const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error('Failed to login admin');
    return response.json();
};

export const getAdmin = async (adminId: string): Promise<AdminUser | null> => {
    const response = await fetch(`${API_URL}/admin/${adminId}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch admin');
    return response.json();
};

export const adminExists = async (email: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/admin/exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to check admin existence');
    const data = await response.json();
    return data.exists;
};
