import { useState } from 'react';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import Button from './common/Button';
import { getAuth } from 'firebase/auth';

const InitializeDatabase = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | null;
  }>({ message: '', type: null });

  const initializeDatabase = async () => {
    const db = getFirestore();
    setIsInitializing(true);
    setStatus({ message: 'Initialisation de la base de données...', type: 'info' });

    try {
      // Créer quelques catégories de démo
      const categories = ['Travail', 'Personnel', 'Courses', 'Santé', 'Éducation'];
      for (const category of categories) {
        const categoryRef = doc(collection(db, 'categories'));
        await setDoc(categoryRef, {
          name: category,
          createdAt: Timestamp.now()
        });
        setStatus({ message: `Catégorie "${category}" créée`, type: 'info' });
      }

      // Créer des tâches de démo pour l'utilisateur courant (si connecté)
      const demoTasks = [
        {
          title: 'Acheter du lait',
          description: 'Ne pas oublier le lait pour le petit déjeuner',
          completed: false,
          priority: 'medium',
          category: 'Courses',
          dueDate: new Date(Date.now() + 86400000) // demain
        },
        {
          title: 'Terminer le rapport',
          description: 'Finaliser le rapport trimestriel pour la réunion',
          completed: false,
          priority: 'high',
          category: 'Travail',
          dueDate: new Date(Date.now() + 172800000) // dans 2 jours
        },
        {
          title: 'Rendez-vous médical',
          description: 'Consulter le Dr. Martin pour le suivi annuel',
          completed: true,
          priority: 'high',
          category: 'Santé',
          dueDate: new Date(Date.now() - 86400000) // hier
        }
      ];

      // Si l'utilisateur est connecté, ajoutez les tâches, sinon affichez un message
      const auth = getAuth();
      if (auth.currentUser) {
        for (const task of demoTasks) {
          const taskRef = doc(collection(db, 'todos'));
          await setDoc(taskRef, {
            ...task,
            userId: auth.currentUser.uid,
            createdAt: Timestamp.now(),
            dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null
          });
          setStatus({ message: `Tâche "${task.title}" créée`, type: 'info' });
        }
      } else {
        setStatus({
          message: 'Aucun utilisateur connecté. Les tâches de démo n\'ont pas été créées.',
          type: 'info'
        });
      }

      setStatus({
        message: 'Initialisation terminée avec succès !',
        type: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setStatus({
        message: `Erreur lors de l'initialisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        type: 'error'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <h2 className="text-lg font-medium mb-4">Initialisation de la base de données</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Cliquez sur le bouton ci-dessous pour initialiser la base de données avec des données de démo.
        Cette action créera des catégories et des tâches de démonstration.
      </p>

      <Button
        onClick={initializeDatabase}
        isLoading={isInitializing}
        variant={isInitializing ? 'outline' : 'primary'}
        disabled={isInitializing}
      >
        {isInitializing ? 'Initialisation en cours...' : 'Initialiser la base de données'}
      </Button>

      {status.type && (
        <div className={`mt-4 p-3 rounded-md ${
          status.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
          status.type === 'error' ? 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
          'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

export default InitializeDatabase;