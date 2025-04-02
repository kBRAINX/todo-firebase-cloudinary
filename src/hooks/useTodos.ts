import { useState, useEffect, useCallback } from 'react';
import type { Todo, TodoInput, TodoFilter } from '../types/todo';
import {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompleted,
  getTodoStats
} from '../services/todoService';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

// Nouvelle fonction pour récupérer les catégories depuis la collection Firestore
const getCategoriesFromCollection = async (): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));

    // Extraire les noms de catégories
    const categories = querySnapshot.docs
      .filter(doc => doc.data().name) // Vérifier que le document a un champ 'name'
      .map(doc => doc.data().name as string);

    // Trier par ordre alphabétique et éliminer les doublons éventuels
    return [...new Set(categories)].sort();
  } catch (error) {
    console.error('Error fetching categories from Firestore:', error);
    // En cas d'erreur, retourner un tableau vide
    return [];
  }
};

export const useTodos = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0,
    dueSoon: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TodoFilter>({});

  // Fonction pour charger les tâches avec filtres optionnels
  const loadTodos = useCallback(async () => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Charger les tâches
      const loadedTodos = await getTodos(user.uid, filter);
      setTodos(loadedTodos);

      // Charger les catégories depuis la collection Firestore
      try {
        const loadedCategories = await getCategoriesFromCollection();
        setCategories(loadedCategories);
      } catch (categoryError) {
        console.error('Error loading categories:', categoryError);
        // Ne pas planter l'application si les catégories échouent
      }

      // Charger les statistiques
      const todoStats = await getTodoStats(user.uid);
      setStats(todoStats);

      setLoading(false);
    } catch (error) {
      console.error('Error loading todos:', error);
      setError('Failed to load todos');
      setLoading(false);
    }
  }, [user, filter]);

  // Charger les tâches au chargement et lorsque le filtre change
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Ajouter une tâche
  const createTodo = async (todoData: TodoInput) => {
    if (!user) return null;

    try {
      const newTodo = await addTodo(todoData, user.uid);
      setTodos(prev => [newTodo, ...prev]);

      // Mettre à jour les statistiques
      const todoStats = await getTodoStats(user.uid);
      setStats(todoStats);

      return newTodo;
    } catch (error) {
      console.error('Error creating todo:', error);
      setError('Failed to create todo');
      return null;
    }
  };

  // Modifier une tâche
  const editTodo = async (id: string, todoData: Partial<Todo>) => {
    try {
      await updateTodo(id, todoData);

      setTodos(prev =>
        prev.map(todo =>
          todo.id === id ? { ...todo, ...todoData } : todo
        )
      );

      // Mettre à jour les statistiques
      if (user) {
        const todoStats = await getTodoStats(user.uid);
        setStats(todoStats);
      }

      return true;
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo');
      return false;
    }
  };

  // Supprimer une tâche
  const removeTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));

      // Mettre à jour les statistiques
      if (user) {
        const todoStats = await getTodoStats(user.uid);
        setStats(todoStats);
      }

      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo');
      return false;
    }
  };

  // Basculer l'état de complétion d'une tâche
  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      await toggleTodoCompleted(id, completed);

      setTodos(prev =>
        prev.map(todo =>
          todo.id === id ? { ...todo, completed } : todo
        )
      );

      // Mettre à jour les statistiques
      if (user) {
        const todoStats = await getTodoStats(user.uid);
        setStats(todoStats);
      }

      return true;
    } catch (error) {
      console.error('Error toggling todo completion:', error);
      setError('Failed to update todo status');
      return false;
    }
  };

  // Mettre à jour les filtres
  const updateFilter = (newFilter: Partial<TodoFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  // Réinitialiser les filtres
  const clearFilters = () => {
    setFilter({});
  };

  // Rafraîchir les données manuellement
  const refresh = () => {
    loadTodos();
  };

  return {
    todos,
    categories,
    stats,
    loading,
    error,
    filter,
    createTodo,
    editTodo,
    removeTodo,
    toggleComplete,
    updateFilter,
    clearFilters,
    refresh
  };
};

export default useTodos;