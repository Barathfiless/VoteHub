import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  // Determine storage key based on route and user
  let storageKey = 'theme';
  if (location.pathname.startsWith('/admin')) {
    storageKey = 'theme-admin';
  } else if (user?.id) {
    storageKey = `theme-student-${user.id}`;
  }

  useEffect(() => {
    // Load theme from localStorage based on current section
    const savedTheme = (localStorage.getItem(storageKey) as Theme) || 'system';
    setThemeState(savedTheme);

    // Apply theme immediately when section changes
    applyTheme(savedTheme);
  }, [storageKey]); // Re-run when switching between Admin/Student portals

  // Apply theme to document
  const applyTheme = (themeToApply: Theme) => {
    const htmlElement = document.documentElement;

    if (themeToApply === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      htmlElement.classList.toggle('dark', prefersDark);
      setIsDark(prefersDark);
    } else {
      htmlElement.classList.toggle('dark', themeToApply === 'dark');
      setIsDark(themeToApply === 'dark');
    }
  };

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
