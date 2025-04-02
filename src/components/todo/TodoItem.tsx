import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import type { Todo } from '../../types/todo';
import { useImageUpload } from '../../hooks/useImageUpload';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string, completed: boolean) => Promise<boolean>;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => Promise<boolean>;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete
}) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { getResizedImageUrl } = useImageUpload();

  // Obtenir la locale appropriée pour la date
  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  // Formater la date de création
  const formattedCreatedAt = format(todo.createdAt, 'PPp', { locale: dateLocale });

  // Formater la date d'échéance si elle existe
  const formattedDueDate = todo.dueDate
    ? format(todo.dueDate, 'PPp', { locale: dateLocale })
    : t('todo.noDueDate');

  // Couleurs pour la priorité
  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  // Gérer le basculement de complétion
  const handleToggleComplete = async () => {
    setIsLoading(true);
    await onToggleComplete(todo.id, !todo.completed);
    setIsLoading(false);
  };

  // Gérer la confirmation de suppression
  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  // Gérer la suppression
  const handleDelete = async () => {
    setIsLoading(true);
    const success = await onDelete(todo.id);
    if (!success) {
      setIsLoading(false);
      setShowConfirmDelete(false);
    }
  };

  // Obtenir une image redimensionnée si elle existe
  const thumbnailUrl = todo.imageUrl
    ? getResizedImageUrl(todo.imageUrl, 80, 80)
    : '';

  return (
    <div className={`
      border rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow
      ${todo.completed ? 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}
    `}>
      {/* Modale de confirmation de suppression */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t('todo.deleteConfirm')}
            </h3>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                disabled={isLoading}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start p-4">
        {/* Case à cocher */}
        <div className="mr-4 pt-1">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggleComplete}
            className="h-5 w-5 text-primary-light rounded border-gray-300 focus:ring-primary-light dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-primary-dark"
            disabled={isLoading}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {todo.title}
            </h3>

            {/* Badge de priorité */}
            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[todo.priority]}`}>
              {t(`todo.priorities.${todo.priority}`)}
            </span>
          </div>

          {/* Description de la tâche */}
          {todo.description && (
            <p className={`text-sm mb-2 ${todo.completed ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {todo.description}
            </p>
          )}

          {/* Image de la tâche (si présente) */}
          {todo.imageUrl && (
            <div className="mb-3">
              <img
                src={thumbnailUrl || todo.imageUrl}
                alt={todo.title}
                className="h-20 w-20 object-cover rounded-md"
              />
            </div>
          )}

          {/* Métadonnées de la tâche */}
          <div className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
            <span>
              {formattedCreatedAt}
            </span>

            {todo.dueDate && (
              <span className={`flex items-center ${
                todo.dueDate < new Date() && !todo.completed
                  ? 'text-red-500 dark:text-red-400'
                  : ''
              }`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formattedDueDate}
              </span>
            )}

            {todo.category && (
              <span className="inline-flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {todo.category}
              </span>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => onEdit(todo)}
            className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label={t('common.edit')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            aria-label={t('common.delete')}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;