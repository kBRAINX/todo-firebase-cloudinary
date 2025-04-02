import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Todo, TodoInput } from '../../types/todo';
import Button from '../common/Button';
import Input from '../common/Input';
import ImageUploader from '../common/ImageUploader';

interface TodoFormProps {
  initialData?: Todo;
  categories: string[];
  onSubmit: (todo: TodoInput) => Promise<Todo | null>;
  onCancel?: () => void;
  isEditing?: boolean;
}

const TodoForm: React.FC<TodoFormProps> = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState<TodoInput>({
    title: '',
    description: '',
    completed: false,
    priority: 'medium',
    category: '',
    dueDate: undefined,
    imageUrl: ''
  });

  // État des erreurs
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialiser le formulaire avec les données si en mode édition
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        completed: initialData.completed,
        priority: initialData.priority,
        category: initialData.category || '',
        dueDate: initialData.dueDate,
        imageUrl: initialData.imageUrl || ''
      });
    }
  }, [initialData]);

  // Gestionnaire de changement de champ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Traitement spécial pour les cases à cocher
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Gestionnaire pour la date d'échéance
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (value) {
      // Convertir la chaîne de date en objet Date
      const dueDate = new Date(value);
      setFormData(prev => ({ ...prev, dueDate }));
    } else {
      // Si la valeur est vide, définir dueDate comme undefined
      setFormData(prev => ({ ...prev, dueDate: undefined }));
    }
  };

  // Gestionnaire pour l'image uploadée
  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };

  // Gestionnaire pour supprimer l'image
  const handleImageRemoved = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = t('todo.titleRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await onSubmit(formData);

      // Réinitialiser le formulaire si ce n'est pas en mode édition
      if (!isEditing) {
        setFormData({
          title: '',
          description: '',
          completed: false,
          priority: formData.priority, // Garder la priorité sélectionnée
          category: formData.category, // Garder la catégorie sélectionnée
          dueDate: undefined,
          imageUrl: ''
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatage de la date pour l'input
  const formatDateForInput = (date?: Date): string => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Titre */}
      <Input
        label={t('todo.title')}
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder={t('todo.placeholderTitle')}
        error={errors.title}
        required
      />

      {/* Description */}
      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('todo.description')}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder={t('todo.placeholderDescription')}
          className="w-full rounded-md border border-gray-300 focus:border-primary-light focus:ring-2 focus:ring-primary-light dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-4 py-2 text-sm"
        />
      </div>

      {/* Priorité */}
      <div className="space-y-1">
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('todo.priority')}
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 focus:border-primary-light focus:ring-2 focus:ring-primary-light dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-4 py-2 text-sm"
        >
          <option value="low">{t('todo.priorities.low')}</option>
          <option value="medium">{t('todo.priorities.medium')}</option>
          <option value="high">{t('todo.priorities.high')}</option>
        </select>
      </div>

      {/* Catégorie */}
      <div className="space-y-1">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('todo.category')}
        </label>
        <div className="flex space-x-2">
          {showCategoryInput ? (
            <Input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder={t('todo.placeholderCategory')}
              className="flex-1"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowCategoryInput(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              }
            />
          ) : (
            <>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="flex-1 rounded-md border border-gray-300 focus:border-primary-light focus:ring-2 focus:ring-primary-light dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-4 py-2 text-sm"
              >
                <option value="">{t('todo.placeholderCategory')}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCategoryInput(true)}
              >
                +
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Date d'échéance */}
      <div className="space-y-1">
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('todo.dueDate')}
        </label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formatDateForInput(formData.dueDate)}
          onChange={handleDueDateChange}
          className="w-full rounded-md border border-gray-300 focus:border-primary-light focus:ring-2 focus:ring-primary-light dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-4 py-2 text-sm"
        />
      </div>

      {/* Upload d'image */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('todo.image')}
        </label>
        <ImageUploader
          initialImage={formData.imageUrl}
          onImageUploaded={handleImageUploaded}
          onImageRemoved={handleImageRemoved}
        />
      </div>

      {/* Tâche complétée */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="completed"
          name="completed"
          checked={formData.completed}
          onChange={(e) => handleChange(e)}
          className="h-4 w-4 text-primary-light rounded border-gray-300 focus:ring-primary-light dark:border-gray-600 dark:bg-gray-700"
        />
        <label htmlFor="completed" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('filter.completed')}
        </label>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isSubmitting}
        >
          {isEditing ? t('common.save') : t('common.add')}
        </Button>
      </div>
    </form>
  );
};

export default TodoForm;