import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import GoogleLoginButton from '../components/common/GoogleLoginButton';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, register, loginWithGoogle, error, clearError } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!displayName.trim()) {
      errors.displayName = t('auth.nameRequired');
    }

    if (!email.trim()) {
      errors.email = t('auth.emailRequired');
    }

    if (!password) {
      errors.password = t('auth.passwordRequired');
    } else if (password.length < 6) {
      errors.password = t('auth.passwordLength');
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = t('auth.passwordMismatch');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register(email, password, displayName);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      // Les erreurs d'authentification sont gérées dans le hook useAuth
    } finally {
      setIsLoading(false);
    }
  };

  // Inscription avec Google
  const handleGoogleRegister = async () => {
    clearError();
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Google registration error:', error);
      // Les erreurs d'authentification sont gérées dans le hook useAuth
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth.register')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-primary-light dark:text-primary-dark hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>

        <div>
          <GoogleLoginButton
            onClick={handleGoogleRegister}
            isLoading={isGoogleLoading}
          />
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-300 dark:border-gray-600 w-full absolute"></div>
          <div className="relative px-4 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
            {t('common.or')}
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Message d'erreur */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <Input
                label={t('auth.displayName')}
                type="text"
                id="displayName"
                name="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                error={formErrors.displayName}
                required
                autoComplete="name"
                leftIcon={
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                }
              />
            </div>

            <div className="mb-4">
              <Input
                label={t('auth.email')}
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                required
                autoComplete="email"
                leftIcon={
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                }
              />
            </div>

            <div className="mb-4">
              <Input
                label={t('auth.password')}
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={formErrors.password}
                required
                autoComplete="new-password"
                leftIcon={
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                }
              />
            </div>

            <div className="mb-4">
              <Input
                label={t('auth.confirmPassword')}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={formErrors.confirmPassword}
                required
                autoComplete="new-password"
                leftIcon={
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                }
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              {t('auth.register')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;