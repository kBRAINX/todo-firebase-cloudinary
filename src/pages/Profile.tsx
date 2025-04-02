import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { updateUserPreferences } from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ImageUploader from '../components/common/ImageUploader';

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  const { theme, setThemePreference } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(theme);
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en'>(i18n.language as 'fr' | 'en');
  const [showCompletedTasks, setShowCompletedTasks] = useState(user?.preferences?.showCompletedTasks !== false);
  const [defaultPriority, setDefaultPriority] = useState<'low' | 'medium' | 'high'>(user?.preferences?.defaultPriority || 'medium');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Obtenir la locale appropriée pour la date
  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  // Afficher un spinner de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Gérer la mise à jour des préférences utilisateur
  const handleSavePreferences = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Mettre à jour les préférences dans Firestore
      await updateUserPreferences(user.uid, {
        theme: selectedTheme,
        language: selectedLanguage,
        showCompletedTasks,
        defaultPriority
      });

      // Appliquer les changements
      setThemePreference(selectedTheme);

      if (i18n.language !== selectedLanguage) {
        await i18n.changeLanguage(selectedLanguage);
      }

      setSaveSuccess(true);

      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  // Gérer le téléchargement d'une nouvelle photo de profil
  const handleImageUploaded = async (imageUrl: string) => {
    setPhotoURL(imageUrl);
  };

  // Formater les dates
  const formattedCreatedAt = user.createdAt
    ? format(user.createdAt, 'PPP', { locale: dateLocale })
    : '';

  const formattedLastLogin = user.lastLogin
    ? format(user.lastLogin, 'PPP', { locale: dateLocale })
    : '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* En-tête du profil */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('profile.title')}
          </h1>
        </div>

        {/* Contenu du profil */}
        <div className="p-6">
          {/* Section des informations utilisateur */}
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            {/* Avatar */}
            <div className="mb-6 md:mb-0">
              <div className="relative w-32 h-32 mx-auto md:mx-0">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName || user.email || ''}
                    className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-700 shadow-md"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary-light dark:bg-primary-dark flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-700 shadow-md">
                    {displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Bouton de modification d'avatar (si en mode édition) */}
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <ImageUploader
                      initialImage={photoURL}
                      onImageUploaded={handleImageUploaded}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Informations */}
            <div className="flex-1">
              <div className="space-y-4">
                {isEditing ? (
                  <Input
                    label={t('auth.displayName')}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.displayName || user.email}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('profile.memberSince')}
                    </p>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {formattedCreatedAt}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('profile.lastLogin')}
                    </p>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {formattedLastLogin}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section des préférences */}
          <div className="mt-10">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('settings.title')}
            </h3>

            <div className="space-y-6">
              {/* Thème */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.theme')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => isEditing && setSelectedTheme('light')}
                    className={`
                      border rounded-md py-3 px-4 flex items-center justify-center text-sm font-medium
                      ${!isEditing && 'cursor-not-allowed opacity-60'}
                      ${selectedTheme === 'light'
                        ? 'bg-primary-light text-white dark:bg-primary-dark border-transparent'
                        : 'bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                    {t('settings.themes.light')}
                  </button>
                  <button
                    type="button"
                    onClick={() => isEditing && setSelectedTheme('dark')}
                    className={`
                      border rounded-md py-3 px-4 flex items-center justify-center text-sm font-medium
                      ${!isEditing && 'cursor-not-allowed opacity-60'}
                      ${selectedTheme === 'dark'
                        ? 'bg-primary-light text-white dark:bg-primary-dark border-transparent'
                        : 'bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                    {t('settings.themes.dark')}
                  </button>
                </div>
              </div>

              {/* Langue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.language')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => isEditing && setSelectedLanguage('fr')}
                    className={`
                      border rounded-md py-3 px-4 flex items-center justify-center text-sm font-medium
                      ${!isEditing && 'cursor-not-allowed opacity-60'}
                      ${selectedLanguage === 'fr'
                        ? 'bg-primary-light text-white dark:bg-primary-dark border-transparent'
                        : 'bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span className="text-lg mr-2">🇫🇷</span>
                    {t('settings.languages.fr')}
                  </button>
                  <button
                    type="button"
                    onClick={() => isEditing && setSelectedLanguage('en')}
                    className={`
                      border rounded-md py-3 px-4 flex items-center justify-center text-sm font-medium
                      ${!isEditing && 'cursor-not-allowed opacity-60'}
                      ${selectedLanguage === 'en'
                        ? 'bg-primary-light text-white dark:bg-primary-dark border-transparent'
                        : 'bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span className="text-lg mr-2">🇬🇧</span>
                    {t('settings.languages.en')}
                  </button>
                </div>
              </div>

              {/* Afficher les tâches terminées */}
              <div className="flex items-center">
                <input
                  id="showCompletedTasks"
                  name="showCompletedTasks"
                  type="checkbox"
                  checked={showCompletedTasks}
                  onChange={() => isEditing && setShowCompletedTasks(!showCompletedTasks)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-primary-light rounded border-gray-300 focus:ring-primary-light dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="showCompletedTasks" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.showCompleted')}
                </label>
              </div>

              {/* Priorité par défaut */}
              <div>
                <label htmlFor="defaultPriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.defaultPriority')}
                </label>
                <select
                  id="defaultPriority"
                  name="defaultPriority"
                  value={defaultPriority}
                  onChange={(e) => isEditing && setDefaultPriority(e.target.value as 'low' | 'medium' | 'high')}
                  disabled={!isEditing}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-light focus:border-primary-light dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm rounded-md"
                >
                  <option value="low">{t('todo.priorities.low')}</option>
                  <option value="medium">{t('todo.priorities.medium')}</option>
                  <option value="high">{t('todo.priorities.high')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="mt-10 flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  isLoading={isLoading}
                >
                  {t('common.save')}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
              >
                {t('profile.edit')}
              </Button>
            )}
          </div>

          {/* Message de succès */}
          {saveSuccess && (
            <div className="mt-4 rounded-md bg-green-50 dark:bg-green-900/30 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    {t('profile.saveSuccess')}
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;