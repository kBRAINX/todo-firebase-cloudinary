import { useState } from 'react';
import { getFirestore, collection, doc, setDoc, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Button from '../common/Button';

/**
 * Composant pour créer des données de démonstration pour l'utilisateur actuel.
 * Peut être inclus dans une page de profil ou une section d'administration.
 */
const CreateDemoData: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | null;
  }>({ message: '', type: null });

  const createDemoTasks = async () => {
    const db = getFirestore();
    const auth = getAuth();

    if (!auth.currentUser) {
      setStatus({
        message: 'Vous devez être connecté pour créer des données de démonstration',
        type: 'error'
      });
      return;
    }

    setIsCreating(true);
    setStatus({ message: 'Création des tâches de démonstration...', type: 'info' });

    try {
      const userId = auth.currentUser.uid;

      // Récupérer les catégories existantes depuis Firestore
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => doc.data().name);

      // Utiliser les catégories de la base de données ou utiliser des valeurs par défaut si aucune
      const categories = categoriesData.length > 0 ?
        categoriesData :
        ['Travail', 'Personnel', 'Courses', 'Santé', 'Éducation', 'Projet', 'Urgence'];

      // Images de démonstration (URLs de Cloudinary)
      const demoImages = [
        'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
        'https://res.cloudinary.com/demo/image/upload/w_300,h_200,c_crop/sample.jpg',
        'https://res.cloudinary.com/demo/image/upload/w_500/sample.jpg'
      ];

      // Créer des tâches de démo plus diversifiées
      const demoTasks = [
        {
          title: 'Acheter des courses',
          description: 'Lait, pain, fruits, légumes et produits d\'entretien',
          completed: false,
          priority: 'medium' as const,
          category: getRandomItem(categories, 'Courses'),
          dueDate: new Date(Date.now() + 86400000), // demain
          imageUrl: getRandomItem(demoImages)
        },
        {
          title: 'Rendez-vous médical',
          description: 'Consulter le Dr. Martin pour le bilan annuel',
          completed: true,
          priority: 'high' as const,
          category: getRandomItem(categories, 'Santé'),
          dueDate: new Date(Date.now() - 86400000) // hier
        }
      ];

      // Vérifier si l'utilisateur a déjà des tâches
      const existingTasksSnapshot = await getDocs(
        query(collection(db, 'todos'), where('userId', '==', userId))
      );

      // Si l'utilisateur a déjà beaucoup de tâches, ne pas en créer trop de nouvelles
      const tasksToCreate = existingTasksSnapshot.size > 5 ?
        demoTasks.slice(0, 3) :
        demoTasks;

      for (const task of tasksToCreate) {
        const taskRef = doc(collection(db, 'todos'));
        await setDoc(taskRef, {
          ...task,
          userId,
          createdAt: Timestamp.now(),
          dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null
        });
        setStatus({ message: `Tâche "${task.title}" créée`, type: 'info' });

        // Petite pause pour ne pas surcharger Firestore
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setStatus({
        message: `${tasksToCreate.length} tâches de démonstration créées avec succès ! Rafraîchissez la page pour voir les nouvelles tâches.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de la création des données de démonstration:', error);
      setStatus({
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        type: 'error'
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Fonction utilitaire pour obtenir un élément aléatoire ou une valeur par défaut
  const getRandomItem = <T,>(array: T[], defaultValue?: T): T | undefined => {
    if (!array || array.length === 0) {
      return defaultValue;
    }
    return array[Math.floor(Math.random() * array.length)];
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <h2 className="text-lg font-medium mb-2">Données de démonstration</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Créez des tâches de démonstration pour tester rapidement l'application.
      </p>

      <Button
        onClick={createDemoTasks}
        isLoading={isCreating}
        variant={isCreating ? 'outline' : 'secondary'}
        disabled={isCreating}
        size="sm"
      >
        {isCreating ? 'Création en cours...' : 'Créer des tâches de démo'}
      </Button>

      {status.type && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
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

export default CreateDemoData;