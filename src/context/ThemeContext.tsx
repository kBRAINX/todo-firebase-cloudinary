import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { updateUserPreferences } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setThemePreference: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const { user } = useAuth();

  // Initialiser le thème à partir du localStorage ou des préférences utilisateur
  useEffect(() => {
    const initTheme = () => {
      if (user && user.preferences?.theme) {
        // Utiliser les préférences de l'utilisateur si connecté
        setTheme(user.preferences.theme);
      } else {
        // Sinon, vérifier localStorage ou utiliser le thème par défaut
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
        } else {
          // Vérifier si l'utilisateur préfère le thème sombre au niveau du système
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        }
      }
    };

    initTheme();
  }, [user]);

  // Appliquer la classe de thème au document HTML
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Basculer entre les thèmes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveThemePreference(newTheme);
  };

  // Définir le thème de manière explicite
  const setThemePreference = (newTheme: Theme) => {
    setTheme(newTheme);
    saveThemePreference(newTheme);
  };

  // Sauvegarder la préférence de thème dans le profil utilisateur
  const saveThemePreference = (newTheme: Theme) => {
    if (user && user.uid) {
      // Mettre à jour les préférences dans Firestore
      updateUserPreferences(user.uid, { theme: newTheme })
        .catch(error => console.error('Error saving theme preference:', error));
    }
    // Toujours sauvegarder dans localStorage pour les utilisateurs non connectés
    localStorage.setItem('theme', newTheme);
  };

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setThemePreference
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte de thème
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};