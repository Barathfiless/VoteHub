import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  rollNo?: string;
  email?: string;
  name: string;
  department?: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: User | null;
  userRole: 'admin' | 'student' | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  signOut: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session in localStorage
    const checkSession = async () => {
      try {
        const studentSession = localStorage.getItem('studentSession');
        const adminSession = localStorage.getItem('adminDemoSession');

        if (studentSession) {
          const userData = JSON.parse(studentSession);
          setUser({
            id: userData.id,
            rollNo: userData.rollNo,
            name: userData.name,
            department: userData.department,
            role: 'student',
          });
          setUserRole('student');
        } else if (adminSession) {
          const adminData = JSON.parse(adminSession);
          setUser({
            id: adminData.id,
            email: adminData.email,
            name: adminData.name,
            role: 'admin',
          });
          setUserRole('admin');
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkSession();
    };

    // Listen for custom session created event
    const handleSessionCreated = () => {
      checkSession();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('studentSessionCreated', handleSessionCreated);
    window.addEventListener('adminSessionCreated', handleSessionCreated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studentSessionCreated', handleSessionCreated);
      window.removeEventListener('adminSessionCreated', handleSessionCreated);
    };
  }, []);

  const signOut = () => {
    localStorage.removeItem('studentSession');
    localStorage.removeItem('adminDemoSession');
    setUser(null);
    setUserRole(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
