
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Search, Mail, CreditCard, User, Loader2, Building2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/apiConfig';

interface Department {
    id: string;
    name: string;
}

interface Student {
    id: string;
    name: string;
    rollNo: string;
    email: string;
    department: string;
}

const StudentManagement = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [newStudent, setNewStudent] = useState({ name: '', rollNo: '', email: '', department: '' });
    const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
    const [showDepartments, setShowDepartments] = useState(false);

    useEffect(() => {
        fetchDepartments();
        fetchStudents();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/departments`);
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            toast.error('Failed to load departments');
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/student`);
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students');
        }
    };

    const handleAddStudent = async () => {
        if (!newStudent.name || !newStudent.rollNo || !newStudent.department) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            // Using existing register endpoint
            const res = await fetch(`${API_BASE_URL}/auth/student/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newStudent,
                    password: newStudent.rollNo // Default password
                })
            });

            if (res.ok) {
                const created = await res.json();
                toast.success('Student registered successfully');
                setStudents(prev => [...prev, created]);
                setNewStudent({ name: '', rollNo: '', email: '', department: '' });
                setIsStudentDialogOpen(false);
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || 'Failed to register student');
            }
        } catch (error) {
            console.error('Error adding student:', error);
            toast.error('Network error while adding student');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteStudent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/student/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Student deleted successfully');
                setStudents(prev => prev.filter(s => (s as any)._id !== id && s.id !== id));
            } else {
                toast.error('Failed to delete student');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            toast.error('Network error while deleting student');
        }
    };



    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDepartment ? student.department === selectedDepartment : true;
        return matchesSearch && matchesDept;
    });

    const getStudentCount = (deptName: string) => {
        return students.filter(s => s.department === deptName).length;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3">
                <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg bg-white dark:bg-black border border-border">
                    <div className="p-1.5 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Total Students</p>
                        <h3 className="text-base font-bold text-gray-900 dark:text-foreground leading-none">{students.length}</h3>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg bg-white dark:bg-black border border-border">
                    <div className="p-1.5 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Departments</p>
                        <h3 className="text-base font-bold text-gray-900 dark:text-foreground leading-none">{departments.length}</h3>
                    </div>
                </div>
            </div>

            <Card className="bg-white dark:bg-[#020617] border-border dark:border-slate-800">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-8 dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500 focus-visible:ring-blue-500"
                                placeholder="Search students by name or roll number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {/* Add Student Dialog */}
                            <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="flex-1 sm:flex-none gap-2 bg-red-600 hover:bg-red-700 text-white border-0 py-2 sm:py-0 font-semibold shadow-lg shadow-red-900/20">
                                        <Users className="w-4 h-4" />
                                        <span className="sm:hidden lg:inline">Add Student</span>
                                        <span className="hidden sm:inline lg:hidden">Add</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Add New Student</DialogTitle>
                                        <DialogDescription>Register a new student manually.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">Name</Label>
                                            <div className="col-span-3 relative">
                                                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input id="name" className="pl-8" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="rollno" className="text-right">Roll No</Label>
                                            <div className="col-span-3 relative">
                                                <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input id="rollno" className="pl-8" value={newStudent.rollNo} onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="email" className="text-right">Email</Label>
                                            <div className="col-span-3 relative">
                                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input id="email" className="pl-8" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="dept" className="text-right">Dept</Label>
                                            <Select onValueChange={(val) => setNewStudent({ ...newStudent, department: val })}>
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select Department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map((dept: any) => (
                                                        <SelectItem key={dept._id || dept.id} value={dept.name}>{dept.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddStudent} disabled={isLoading} className="bg-red-700 hover:bg-red-800 text-white">
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Register Student
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Departments List */}
                    {departments.length > 0 && (
                        <div className="space-y-4">
                            <div
                                className="flex items-center justify-between cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded-lg -mx-2 transition-colors"
                                onClick={() => setShowDepartments(!showDepartments)}
                            >
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Departments
                                </h3>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    {showDepartments ? (
                                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>

                            {showDepartments && (
                                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3">
                                    {departments.map((dept: any) => (
                                        <div
                                            key={dept._id || dept.id}
                                            onClick={() => setSelectedDepartment(selectedDepartment === dept.name ? null : dept.name)}
                                            className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer text-center aspect-square md:aspect-auto h-24 md:h-28 ${selectedDepartment === dept.name
                                                ? 'bg-blue-500/10 border-blue-500 shadow-md shadow-blue-500/10'
                                                : 'bg-white dark:bg-[#1e293b] border-gray-200 dark:border-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-all duration-300 ${selectedDepartment === dept.name
                                                ? 'bg-blue-500 text-white scale-110'
                                                : 'bg-blue-50 dark:bg-slate-900/50 text-blue-600 dark:text-blue-400 group-hover:scale-105'
                                                }`}>
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <span className={`text-[10px] md:text-xs font-semibold px-1 w-full leading-tight line-clamp-2 ${selectedDepartment === dept.name ? 'text-blue-500' : 'text-gray-900 dark:text-slate-200'
                                                }`}>{dept.name}</span>
                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors mt-auto ${selectedDepartment === dept.name
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                                                }`}>
                                                {getStudentCount(dept.name)}
                                            </div>

                                            {selectedDepartment === dept.name && (
                                                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Students List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {selectedDepartment ? `${selectedDepartment} Students` : 'All Students'} ({filteredStudents.length})
                            </h3>
                            {selectedDepartment && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDepartment(null)}
                                    className="h-8 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                >
                                    Clear Filter
                                </Button>
                            )}
                        </div>
                        {filteredStudents.length > 0 ? (
                            <div className="grid gap-3">
                                {filteredStudents.map((student) => (
                                    <div
                                        key={student.id || student.rollNo}
                                        className="group p-3 px-4 bg-gray-50 dark:bg-black/40 hover:bg-gray-100 dark:hover:bg-black/60 border border-border dark:border-white/5 hover:border-blue-500/30 rounded-xl transition-all duration-200 hover:shadow-md"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                            {/* Name */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-semibold text-foreground truncate group-hover:text-blue-500 transition-colors uppercase tracking-tight">{student.name}</h4>
                                            </div>

                                            {/* Roll No */}
                                            <div className="text-sm font-mono text-muted-foreground truncate">
                                                {student.rollNo}
                                            </div>

                                            {/* Department */}
                                            <div className="flex items-center">
                                                <span className="text-[10px] font-black text-white bg-purple-600 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-purple-900/20 truncate">
                                                    {student.department}
                                                </span>
                                            </div>

                                            {/* Email & Actions */}
                                            <div className="flex items-center gap-4 justify-end">
                                                <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground truncate">
                                                    <Mail className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="truncate max-w-[150px]">{student.email}</span>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={isLoading}
                                                    onClick={() => handleDeleteStudent((student as any)._id || student.id)}
                                                    className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border text-muted-foreground">
                                No students found matching your search.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentManagement;
