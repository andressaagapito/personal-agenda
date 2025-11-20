import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (!enabled) return 'light';
    
    const saved = localStorage.getItem('agenda-theme') as Theme;
    const initialTheme = saved || 'light';
    
    const root = document.documentElement;
    if (initialTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    return initialTheme;
  });

  useEffect(() => {
    if (!enabled) {
      const root = document.documentElement;
      root.classList.remove('dark');
      return;
    }
    
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, enabled]);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      localStorage.setItem('agenda-theme', newTheme);
      
      const root = document.documentElement;
      root.classList.remove('dark', 'light');
      
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      return newTheme;
    });
  };

  const contextValue = enabled 
    ? { theme, toggleTheme }
    : { theme: 'light' as Theme, toggleTheme: () => {} };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
