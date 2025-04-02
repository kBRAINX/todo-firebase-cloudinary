import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TodoFilter as TodoFilterType } from '../../types/todo';

interface TodoFilterProps {
  filter: TodoFilterType;
  categories: string[];
  onFilterChange: (filter: Partial<TodoFilterType>) => void;
  onClearFilters: () => void;
}

const TodoFilter: React.FC<TodoFilterProps> = ({
  filter,
  categories,
  onFilterChange,
  onClearFilters
}) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = Object.values(filter).some(value =>
    value !== undefined && value !== '' && value !== null
  );

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
      {/* Barre de recherche et toggle des filtres */}
      <div className="p-4 flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            id="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-light focus:border-primary-light text-sm"
            placeholder={t('filter.search')}
            value={filter.searchQuery || ''}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          />
        </div>

        <button
          type="button"
          className={`p-2 rounded-md ${
            showFilters
              ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
              : 'text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white'
          }`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className="sr-only">{t('filter.filters')}</span>
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white"
            onClick={onClearFilters}
          >
            <span className="sr-only">{t('filter.clearFilters')}</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Filtre par statut */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('filter.filters')}
            </label>
            <select
              id="statusFilter"
              name="statusFilter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-light focus:border-primary-light dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm rounded-md"
              value={filter.completed === undefined ? '' : filter.completed ? 'completed' : 'active'}
              onChange={(e) => {
                const value = e.target.value;
                onFilterChange({
                  completed: value === '' ? undefined : value === 'completed'
                });
              }}
            >
              <option value="">{t('filter.all')}</option>
              <option value="active">{t('filter.active')}</option>
              <option value="completed">{t('filter.completed')}</option>
            </select>
          </div>

          {/* Filtre par priorité */}
          <div>
            <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('filter.priority')}
            </label>
            <select
              id="priorityFilter"
              name="priorityFilter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-light focus:border-primary-light dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm rounded-md"
              value={filter.priority || ''}
              onChange={(e) => {
                const value = e.target.value as "low" | "medium" | "high" | "";
                onFilterChange({
                  priority: value === "" ? undefined : value
                });
              }}
            >
              <option value="">{t('filter.all')}</option>
              <option value="low">{t('todo.priorities.low')}</option>
              <option value="medium">{t('todo.priorities.medium')}</option>
              <option value="high">{t('todo.priorities.high')}</option>
            </select>
          </div>

          {/* Filtre par catégorie */}
          <div>
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('filter.category')}
            </label>
            <select
              id="categoryFilter"
              name="categoryFilter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-light focus:border-primary-light dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm rounded-md"
              value={filter.category || ''}
              onChange={(e) => onFilterChange({ category: e.target.value || undefined })}
            >
              <option value="">{t('filter.all')}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoFilter;