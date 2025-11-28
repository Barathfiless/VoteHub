import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminAuthContextType {
  loading: boolean;
  isAdmin: boolean;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  loading: true,
  isAdmin: false,
  signOut: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for admin session
    const adminSession = localStorage.getItem('adminDemoSession');
    if (adminSession) {
      try {
        const adminData = JSON.parse(adminSession);
        if (adminData && adminData.id) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
      }
    }
    setLoading(false);
  }, [navigate]);

  const signOut = () => {
    localStorage.removeItem('adminDemoSession');
    setIsAdmin(false);
    navigate('/admin/auth');
  };

  return (
    <AdminAuthContext.Provider value={{ loading, isAdmin, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
