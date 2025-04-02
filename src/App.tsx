import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Initialize from './pages/Initialize';
import './i18n';

const App: React.FC = () => {
  const [isAppInitialized, setIsAppInitialized] = useState<boolean | null>(null);

  // Vérifier si l'application a été initialisée
  useEffect(() => {
    const checkInitializationState = async () => {
      try {
        const db = getFirestore();
        const appStateDoc = await getDoc(doc(db, 'app_state', 'initialization'));

        if (appStateDoc.exists()) {
          setIsAppInitialized(appStateDoc.data().initialized);
        } else {
          setIsAppInitialized(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'état d\'initialisation:', error);
        setIsAppInitialized(false);
      }
    };

    checkInitializationState();
  }, []);

  // Afficher un chargeur pendant la vérification de l'état d'initialisation
  if (isAppInitialized === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            {/* N'afficher la navbar que si l'application est initialisée */}
            {isAppInitialized && <Navbar />}

            <main className="flex-1">
              <Routes>
                {/* Route d'initialisation - Accessible uniquement si l'app n'est pas initialisée */}
                <Route
                  path="/initialize"
                  element={isAppInitialized ? <Navigate to="/login" replace /> : <Initialize />}
                />

                {/* Routes normales - Accessibles uniquement si l'app est initialisée */}
                <Route
                  path="/"
                  element={isAppInitialized ? <Home /> : <Navigate to="/initialize" replace />}
                />
                <Route
                  path="/login"
                  element={isAppInitialized ? <Login /> : <Navigate to="/initialize" replace />}
                />
                <Route
                  path="/register"
                  element={isAppInitialized ? <Register /> : <Navigate to="/initialize" replace />}
                />
                <Route
                  path="/profile"
                  element={isAppInitialized ? <Profile /> : <Navigate to="/initialize" replace />}
                />

                {/* Redirection par défaut */}
                <Route
                  path="*"
                  element={isAppInitialized ? <Navigate to="/" replace /> : <Navigate to="/initialize" replace />}
                />
              </Routes>
            </main>

            {/* N'afficher le footer que si l'application est initialisée */}
            {isAppInitialized && (
              <footer className="bg-white dark:bg-gray-800 shadow-inner py-4">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  &copy; {new Date().getFullYear()} Todo List App - Powered by React, Firebase & Cloudinary
                </div>
              </footer>
            )}
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;