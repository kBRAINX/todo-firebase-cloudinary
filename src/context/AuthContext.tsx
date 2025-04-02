import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User, AuthState } from '../types/user';
import { getCurrentUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // L'utilisateur est connecté, récupérer ses données depuis Firestore
          const userData = await getCurrentUser();
          setAuthState({
            user: userData,
            loading: false,
            error: null
          });
        } else {
          // L'utilisateur est déconnecté
          setAuthState({
            user: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setAuthState({
          user: null,
          loading: false,
          error: 'Failed to authenticate user'
        });
      }
    });

    // Nettoyer l'abonnement lors du démontage
    return () => unsubscribe();
  }, []);

  const setUser = (user: User | null) => {
    setAuthState(prev => ({ ...prev, user }));
  };

  const setError = (error: string | null) => {
    setAuthState(prev => ({ ...prev, error }));
  };

  const contextValue: AuthContextType = {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    setUser,
    setError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;