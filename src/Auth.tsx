import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent, loginStudent, studentExists } from '@/integrations/firebase/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { Vote, Loader, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

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
        const sessionData = { id: student.id, rollNo: student.rollNo, name: student.name, role: 'student' };
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
    if (!rollNo || !password || !name) {
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
      const student = await registerStudent(rollNo, password, name);
      toast.success('Account created successfully! You can now sign in.');
      setRollNo('');
      setPassword('');
      setName('');
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
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
            <Vote className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">College Voting System</CardTitle>
          <CardDescription>Cast your vote securely and transparently</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-rollno">Roll Number</Label>
                  <Input
                    id="signin-rollno"
                    type="text"
                    placeholder="e.g., 2024001"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
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
            
            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-rollno">Roll Number</Label>
                  <Input
                    id="signup-rollno"
                    type="text"
                    placeholder="e.g., 2024001"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">Minimum 6 characters</p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
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
