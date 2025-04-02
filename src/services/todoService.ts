import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp
  } from 'firebase/firestore';
  import type { DocumentData } from 'firebase/firestore';
  import { db } from '../config/firebase';
  import type { Todo, TodoInput, TodoFilter } from '../types/todo';

  // Collection de référence
  const TODOS_COLLECTION = 'todos';

  /**
   * Convertit un document Firestore en objet Todo
   */
  const convertToTodo = (doc: DocumentData): Todo => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description || '',
      completed: data.completed,
      createdAt: data.createdAt.toDate(),
      dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
      imageUrl: data.imageUrl || '',
      userId: data.userId,
      priority: data.priority,
      category: data.category || ''
    };
  };

  /**
   * Obtenir toutes les tâches pour un utilisateur avec filtres optionnels
   */
  export const getTodos = async (userId: string, filter?: TodoFilter): Promise<Todo[]> => {
    try {
      // Version simplifiée qui fonctionnera même sans index
      let queryBase = collection(db, TODOS_COLLECTION);
      let querySnapshot = await getDocs(queryBase);

      // Filtrage côté client (moins efficace mais fonctionne sans index)
      let todos = querySnapshot.docs
        .map(convertToTodo)
        .filter(todo => todo.userId === userId);

      // Tri par date de création
      todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Filtres supplémentaires
      if (filter) {
        if (filter.completed !== undefined) {
          todos = todos.filter(todo => todo.completed === filter.completed);
        }

        if (filter.priority) {
          todos = todos.filter(todo => todo.priority === filter.priority);
        }

        if (filter.category) {
          todos = todos.filter(todo => todo.category === filter.category);
        }

        if (filter.searchQuery) {
          const searchLower = filter.searchQuery.toLowerCase();
          todos = todos.filter(todo =>
            todo.title.toLowerCase().includes(searchLower) ||
            (todo.description && todo.description.toLowerCase().includes(searchLower))
          );
        }
      }

      return todos;
    } catch (error) {
      console.error('Error getting todos:', error);
      throw error;
    }
  };

  /**
   * Ajouter une nouvelle tâche
   */
  export const addTodo = async (todo: TodoInput, userId: string): Promise<Todo> => {
    try {
      const todoData = {
        ...todo,
        userId,
        createdAt: Timestamp.fromDate(todo.createdAt || new Date()),
        dueDate: todo.dueDate ? Timestamp.fromDate(todo.dueDate) : null,
        completed: todo.completed || false
      };

      const docRef = await addDoc(collection(db, TODOS_COLLECTION), todoData);

      return {
        id: docRef.id,
        ...todo,
        userId,
        createdAt: todo.createdAt || new Date(),
        completed: todo.completed || false
      };
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  };

  /**
   * Mettre à jour une tâche existante
   */
  export const updateTodo = async (id: string, todo: Partial<Todo>): Promise<void> => {
    try {
      const todoRef = doc(db, TODOS_COLLECTION, id);

      // Transformer les dates en Timestamp pour Firestore
      const updateData: Record<string, any> = { ...todo };

      if (todo.dueDate) {
        updateData.dueDate = Timestamp.fromDate(todo.dueDate);
      }

      await updateDoc(todoRef, updateData);
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  };

  /**
   * Supprimer une tâche
   */
  export const deleteTodo = async (id: string): Promise<void> => {
    try {
      const todoRef = doc(db, TODOS_COLLECTION, id);
      await deleteDoc(todoRef);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  };

  /**
   * Marquer une tâche comme complétée ou non
   */
  export const toggleTodoCompleted = async (id: string, completed: boolean): Promise<void> => {
    try {
      const todoRef = doc(db, TODOS_COLLECTION, id);
      await updateDoc(todoRef, { completed });
    } catch (error) {
      console.error('Error toggling todo completion:', error);
      throw error;
    }
  };

  /**
   * Obtenir les catégories uniques pour un utilisateur
   */
  export const getCategories = async (): Promise<string[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));

      // Extraire les noms de catégories
      const categories = querySnapshot.docs
        .filter(doc => doc.data().name) // Vérifier que le document a un champ 'name'
        .map(doc => doc.data().name as string);

      // Si aucune catégorie n'est trouvée, renvoyez un tableau vide
      if (categories.length === 0) {
        console.warn('No categories found in Firestore collection');
      }

      // Trier par ordre alphabétique et éliminer les doublons éventuels
      return [...new Set(categories)].sort();
    } catch (error) {
      console.error('Error fetching categories from Firestore:', error);
      // En cas d'erreur, retourner un tableau vide
      return [];
    }
  };

  /**
   * Obtenir les statistiques des tâches d'un utilisateur
   */
  export const getTodoStats = async (userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
    dueSoon: number;
  }> => {
    try {
      const todos = await getTodos(userId);

      const now = new Date();
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(now.getDate() + 3);

      const completed = todos.filter(todo => todo.completed).length;
      const highPriority = todos.filter(todo => todo.priority === 'high' && !todo.completed).length;
      const dueSoon = todos.filter(todo =>
        todo.dueDate &&
        todo.dueDate > now &&
        todo.dueDate < threeDaysFromNow &&
        !todo.completed
      ).length;

      return {
        total: todos.length,
        completed,
        pending: todos.length - completed,
        highPriority,
        dueSoon
      };
    } catch (error) {
      console.error('Error getting todo stats:', error);
      throw error;
    }
  };

  /**
   * Mettre à jour l'URL de l'image d'une tâche
   */
  export const updateTodoImage = async (id: string, imageUrl: string): Promise<void> => {
    try {
      const todoRef = doc(db, TODOS_COLLECTION, id);
      await updateDoc(todoRef, { imageUrl });
    } catch (error) {
      console.error('Error updating todo image:', error);
      throw error;
    }
  };

  /**
   * Obtenir une tâche par son ID
   */
  export const getTodoById = async (id: string): Promise<Todo | null> => {
    try {
      const todoDoc = await getDocs(query(collection(db, TODOS_COLLECTION), where('__name__', '==', id)));

      if (todoDoc.empty) {
        return null;
      }

      return todoDoc.docs[0] ? convertToTodo(todoDoc.docs[0]) : null;
    } catch (error) {
      console.error('Error getting todo by id:', error);
      throw error;
    }
  };

  /**
   * Obtenir les tâches par échéance
   */
  export const getTodosByDueDate = async (userId: string, startDate: Date, endDate: Date): Promise<Todo[]> => {
    try {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      const querySnapshot = await getDocs(
        query(
          collection(db, TODOS_COLLECTION),
          where('userId', '==', userId),
          where('dueDate', '>=', startTimestamp),
          where('dueDate', '<=', endTimestamp),
          orderBy('dueDate', 'asc')
        )
      );

      return querySnapshot.docs.map(convertToTodo);
    } catch (error) {
      console.error('Error getting todos by due date:', error);
      throw error;
    }
  };

  /**
   * Compter les tâches par priorité
   */
  export const countTodosByPriority = async (userId: string): Promise<{
    low: number;
    medium: number;
    high: number;
  }> => {
    try {
      const todos = await getTodos(userId);

      return {
        low: todos.filter(todo => todo.priority === 'low').length,
        medium: todos.filter(todo => todo.priority === 'medium').length,
        high: todos.filter(todo => todo.priority === 'high').length
      };
    } catch (error) {
      console.error('Error counting todos by priority:', error);
      throw error;
    }
  };

  /**
   * Marquer plusieurs tâches comme complétées
   */
  export const bulkCompleteTodos = async (ids: string[]): Promise<void> => {
    try {
      // Créer un tableau de promesses pour toutes les opérations
      const updatePromises = ids.map(id => {
        const todoRef = doc(db, TODOS_COLLECTION, id);
        return updateDoc(todoRef, { completed: true });
      });

      // Exécuter toutes les promesses en parallèle
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error bulk completing todos:', error);
      throw error;
    }
  };

  /**
   * Supprimer plusieurs tâches
   */
  export const bulkDeleteTodos = async (ids: string[]): Promise<void> => {
    try {
      // Créer un tableau de promesses pour toutes les opérations
      const deletePromises = ids.map(id => {
        const todoRef = doc(db, TODOS_COLLECTION, id);
        return deleteDoc(todoRef);
      });

      // Exécuter toutes les promesses en parallèle
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error bulk deleting todos:', error);
      throw error;
    }
  };