import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { updateUserPreferences } from '../../services/authService';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'fr', label: t('settings.languages.fr'), flag: '🇫🇷' },
    { code: 'en', label: t('settings.languages.en'), flag: '🇬🇧' }
  ];

  // Gérer les clics en dehors du menu déroulant pour le fermer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
    setIsOpen(false);

    // Sauvegarder la préférence linguistique de l'utilisateur s'il est connecté
    if (user && user.uid) {
      try {
        await updateUserPreferences(user.uid, { language: language as 'fr' | 'en' });
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }

    // Sauvegarder également dans localStorage
    localStorage.setItem('i18nextLng', language);
  };

  // Trouver la langue actuelle
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`
                w-full text-left px-4 py-2 text-sm flex items-center space-x-2
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${i18n.language === language.code ? 'bg-gray-100 dark:bg-gray-700' : ''}
              `}
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;