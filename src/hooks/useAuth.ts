import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { loginUser, registerUser, signOut, resetPassword, loginWithGoogle } from '../services/authService';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, loading, error, setUser, setError } = context;

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const user = await loginUser(email, password);
      setUser(user);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      setError(errorMessage);
      throw error;
    }
  };

  // Login with Google function
  const loginWithGoogleAuth = async () => {
    try {
      const user = await loginWithGoogle();
      setUser(user);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login with Google';
      setError(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, displayName: string) => {
    try {
      const user = await registerUser(email, password, displayName);
      setUser(user);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      setError(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      setError(errorMessage);
      throw error;
    }
  };

  // Reset password function
  const forgotPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setError(errorMessage);
      throw error;
    }
  };

  // Clear any errors
  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    login,
    loginWithGoogle: loginWithGoogleAuth,
    register,
    logout,
    forgotPassword,
    clearError
  };
};

export default useAuth;