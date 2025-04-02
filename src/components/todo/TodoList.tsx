import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type{ Todo } from '../../types/todo';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import TodoFilter from './TodoFilter';
import { useTodos } from '../../hooks/useTodos';

const TodoList: React.FC = () => {
  const { t } = useTranslation();
  const {
    todos,
    categories,
    stats,
    loading,
    filter,
    createTodo,
    editTodo,
    removeTodo,
    toggleComplete,
    updateFilter,
    clearFilters
  } = useTodos();

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Gérer l'édition d'une tâche
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setShowAddForm(false);
  };

  // Soumettre la modification d'une tâche
  const handleEditSubmit = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'userId'>) => {
    if (!editingTodo) return null;

    await editTodo(editingTodo.id, todoData);
    setEditingTodo(null);
    return editingTodo;
  };

  // Rendre le contenu principal en fonction de l'état
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
        </div>
      );
    }

    if (todos.length === 0) {
      return (
        <div className="text-center py-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {t('todo.noTasks')}
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {t('todo.noTasksAdd')}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-light hover:bg-primary-light/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90"
            >
              {t('todo.add')}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggleComplete={toggleComplete}
            onEdit={handleEdit}
            onDelete={removeTodo}
          />
        ))}
      </div>
    );
  };

  // Afficher les statistiques des tâches
  const renderStats = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t('stats.total')}
          </div>
          <div className="mt-1 text-2xl font-semibold text-primary-light dark:text-primary-dark">
            {stats.total}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t('stats.completed')}
          </div>
          <div className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-500">
            {stats.completed}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t('stats.pending')}
          </div>
          <div className="mt-1 text-2xl font-semibold text-yellow-600 dark:text-yellow-500">
            {stats.pending}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t('stats.highPriority')}
          </div>
          <div className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-500">
            {stats.highPriority}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t('stats.dueSoon')}
          </div>
          <div className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-500">
            {stats.dueSoon}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* En-tête avec statistiques */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('app.name')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('app.slogan')}
        </p>
      </div>

      {/* Statistiques */}
      {stats.total > 0 && renderStats()}

      {/* Filtres */}
      <TodoFilter
        categories={categories}
        filter={filter}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('todo.add')}
          </h2>
          <TodoForm
            categories={categories}
            onSubmit={createTodo}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Formulaire d'édition */}
      {editingTodo && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('todo.edit')}
          </h2>
          <TodoForm
            initialData={editingTodo}
            categories={categories}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingTodo(null)}
            isEditing
          />
        </div>
      )}

      {/* Bouton d'ajout, visible seulement si le formulaire d'ajout n'est pas affiché */}
      {!showAddForm && !editingTodo && (
        <div className="mt-6 mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-primary-light dark:text-primary-dark font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {t('todo.add')}
          </button>
        </div>
      )}

      {/* Liste des tâches */}
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default TodoList;