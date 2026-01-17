
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Search, Loader2, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/apiConfig';

interface Department {
    id: string;
    name: string;
}

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form States
    const [newDeptName, setNewDeptName] = useState('');
    const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);

    // Edit Dept State
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [isEditDeptDialogOpen, setIsEditDeptDialogOpen] = useState(false);
    const [editDeptName, setEditDeptName] = useState('');

    // Delete Dept State
    const [deletingDeptId, setDeletingDeptId] = useState<string | null>(null);

    useEffect(() => {
        fetchDepartments();
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

    const handleCreateDepartment = async () => {
        if (!newDeptName.trim()) {
            toast.error('Department name is required');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newDeptName })
            });

            if (res.ok) {
                toast.success('Department created successfully');
                setNewDeptName('');
                setIsDeptDialogOpen(false);
                fetchDepartments();
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || 'Failed to create department');
            }
        } catch (error) {
            console.error('Error creating department:', error);
            toast.error('Network error while creating department');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditDepartment = async () => {
        if (!editingDept || !editDeptName.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/departments/${editingDept.id || (editingDept as any)._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editDeptName })
            });

            if (res.ok) {
                toast.success('Department updated successfully');
                setIsEditDeptDialogOpen(false);
                setEditingDept(null);
                fetchDepartments();
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || 'Failed to update department');
            }
        } catch (error) {
            console.error('Error updating department:', error);
            toast.error('Network error during update');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDepartment = async () => {
        if (!deletingDeptId) return;

        try {
            const res = await fetch(`${API_BASE_URL}/departments/${deletingDeptId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Department deleted successfully');
                setDeletingDeptId(null);
                fetchDepartments();
            } else {
                toast.error('Failed to delete department');
            }
        } catch (error) {
            console.error('Error deleting department:', error);
            toast.error('Network error during deletion');
        }
    };

    const openEditDeptDialog = (dept: Department) => {
        setEditingDept(dept);
        setEditDeptName(dept.name);
        setIsEditDeptDialogOpen(true);
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

            </div>

            <Card className="dark:bg-[#020617] dark:border-slate-800">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-8 dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500 focus-visible:ring-blue-500"
                                placeholder="Search departments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white border-0 py-2 sm:py-0 font-semibold shadow-lg shadow-red-900/20">
                                    <Building2 className="w-4 h-4" />
                                    <span className="sm:hidden lg:inline">Add Dept</span>
                                    <span className="hidden sm:inline lg:hidden">Add</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Department</DialogTitle>
                                    <DialogDescription>Add a new academic department to the system.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="dept-name" className="text-right">Name</Label>
                                        <Input
                                            id="dept-name"
                                            value={newDeptName}
                                            onChange={(e) => setNewDeptName(e.target.value)}
                                            className="col-span-3"
                                            placeholder="e.g. Computer Science"
                                        />
                                    </div>

                                    {departments.length > 0 && (
                                        <div className="grid grid-cols-4 gap-4 mt-2">
                                            <div className="col-start-2 col-span-3">
                                                <Label className="mb-2 block text-xs font-semibold text-muted-foreground uppercase">Existing Departments</Label>
                                                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto rounded-md bg-muted/30 p-2 border border-border">
                                                    {departments.map((dept: any) => (
                                                        <div key={dept._id || dept.id} className="text-xs px-2.5 py-1 bg-background border rounded-full text-foreground shadow-sm">
                                                            {dept.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateDepartment} disabled={isLoading} className="bg-red-700 hover:bg-red-800 text-white">
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3">
                        {filteredDepartments.map((dept: any) => (
                            <div key={dept._id || dept.id} className="group relative flex flex-col items-center justify-center p-2 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-sm transition-all text-center aspect-square md:aspect-auto h-24 md:h-28">
                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] md:text-xs font-semibold text-gray-900 dark:text-slate-200 line-clamp-2 leading-tight px-1 w-full">{dept.name}</span>

                                <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditDeptDialog(dept); }} className="h-4 w-4 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-gray-600 dark:text-slate-300 hover:text-blue-600">
                                        <Pencil className="h-2 w-2" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeletingDeptId(dept._id || dept.id); }} className="h-4 w-4 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-600 dark:text-slate-300 hover:text-red-600">
                                        <Trash2 className="h-2 w-2" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Edit Department Dialog */}
                    <Dialog open={isEditDeptDialogOpen} onOpenChange={setIsEditDeptDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Department</DialogTitle>
                                <DialogDescription>Update the department name.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-dept-name" className="text-right">Name</Label>
                                    <Input
                                        id="edit-dept-name"
                                        value={editDeptName}
                                        onChange={(e) => setEditDeptName(e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleEditDepartment} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Alert */}
                    <AlertDialog open={!!deletingDeptId} onOpenChange={() => setDeletingDeptId(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the department.
                                    Students associated with this department may lose their department assignment.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteDepartment} className="bg-red-600 hover:bg-red-700">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    );
};

export default DepartmentManagement;
