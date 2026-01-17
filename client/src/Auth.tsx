import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loginStudent,
  registerStudent,
  studentExists,
  type StudentUser
} from '@/integrations/mongo/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { Vote, Loader, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/config/apiConfig';

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);

  // Fetch departments on mount
  useState(() => {
    const fetchDepts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/departments`);
        if (res.ok) {
          const data = await res.json();
          setDepartments(data);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepts();
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNo || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const student = await loginStudent(rollNo, password);

      if (student) {
        toast.success('Signed in successfully');
        // Store user session in localStorage
        const sessionData = {
          id: student.id,
          rollNo: student.rollNo,
          name: student.name,
          email: student.email,
          department: student.department,
          role: 'student'
        };
        localStorage.setItem('studentSession', JSON.stringify(sessionData));

        // Dispatch custom event to notify auth context
        window.dispatchEvent(new Event('studentSessionCreated'));

        // Navigate after a short delay to ensure state updates
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        toast.error('Invalid roll number or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during sign in');
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNo || !password || !name || !email || !department) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Check if student already exists
      const exists = await studentExists(rollNo);
      if (exists) {
        toast.error('Roll number already registered');
        setLoading(false);
        return;
      }

      // Register new student
      await registerStudent(rollNo, password, name, email, department);
      toast.success('Account created successfully! You can now sign in.');
      setRollNo('');
      setPassword('');
      setName('');
      setEmail('');
      setDepartment('');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to create account');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md shadow-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="text-center space-y-2">
          <div className="flex flex-col items-center justify-center mb-6 space-y-4">
            <div className="w-12 h-12 bg-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20 ring-4 ring-white dark:ring-gray-800">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">VoteHub</h1>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-rollno" className="font-semibold text-gray-700 dark:text-gray-300">Roll Number</Label>
                  <Input
                    id="signin-rollno"
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-gray-50 dark:bg-gray-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="font-semibold text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-gray-50 dark:bg-gray-800/50"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-bold h-11" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-3 mt-4">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="font-semibold text-gray-700 dark:text-gray-300 text-xs">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-gray-50 dark:bg-gray-800/50 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-rollno" className="font-semibold text-gray-700 dark:text-gray-300 text-xs">Roll Number</Label>
                  <Input
                    id="signup-rollno"
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-gray-50 dark:bg-gray-800/50 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-department" className="font-semibold text-gray-700 dark:text-gray-300 text-xs">Department</Label>
                  <Select onValueChange={setDepartment} value={department}>
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 h-9 text-sm">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="font-semibold text-gray-700 dark:text-gray-300 text-xs">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-gray-50 dark:bg-gray-800/50 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="font-semibold text-gray-700 dark:text-gray-300 text-xs">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="bg-gray-50 dark:bg-gray-800/50 h-9 text-sm"
                  />
                  <p className="text-[10px] text-gray-500">Minimum 6 characters</p>
                </div>
                <Button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-white font-bold h-10 mt-1 shadow-md shadow-red-900/10" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
