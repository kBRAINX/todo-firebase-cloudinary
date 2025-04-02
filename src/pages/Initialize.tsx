import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Button from '../components/common/Button';

interface AppInitializationState {
  initialized: boolean;
  initializedAt: Date;
  initializedBy?: string;
}

const Initialize: React.FC = () => {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCheckingInitState, setIsCheckingInitState] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | null;
  }>({ message: '', type: null });

  // Vérifier si l'application est déjà initialisée
  useEffect(() => {
    const checkInitializationState = async () => {
      try {
        const db = getFirestore();
        const appStateDoc = await getDoc(doc(db, 'app_state', 'initialization'));

        if (appStateDoc.exists()) {
          const data = appStateDoc.data() as AppInitializationState;
          setIsInitialized(data.initialized);

          // Si déjà initialisé, rediriger vers la page de connexion
          if (data.initialized) {
            setTimeout(() => navigate('/login'), 1500);
          }
        }

        setIsCheckingInitState(false);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'état d\'initialisation:', error);
        setIsCheckingInitState(false);
        setStatus({
          message: 'Erreur lors de la vérification de l\'état d\'initialisation',
          type: 'error'
        });
      }
    };

    checkInitializationState();
  }, [navigate]);

  const initializeDatabase = async () => {
    const db = getFirestore();
    const auth = getAuth();
    setIsInitializing(true);
    setStatus({ message: 'Initialisation de la base de données...', type: 'info' });

    try {
      // 1. Créer le document d'état d'initialisation
      await setDoc(doc(db, 'app_state', 'initialization'), {
        initialized: true,
        initializedAt: Timestamp.now(),
        initializedBy: auth.currentUser?.uid || 'system'
      });

      // 2. Créer les catégories de base
      const categories = ['Travail', 'Personnel', 'Courses', 'Santé', 'Éducation', 'Projet', 'Urgence'];
      for (const category of categories) {
        const categoryRef = doc(collection(db, 'categories'));
        await setDoc(categoryRef, {
          name: category,
          createdAt: Timestamp.now(),
          system: true // Marquer comme catégorie système
        });
        setStatus({ message: `Catégorie "${category}" créée`, type: 'info' });
      }

      // 3. Créer un compte démo si l'utilisateur le souhaite
      try {
        const demoEmail = 'demo@example.com';
        const demoPassword = 'Demo123!';
        const userCredential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);

        // Mettre à jour le profil
        await updateProfile(userCredential.user, {
          displayName: 'Utilisateur Démo'
        });

        // Créer un document utilisateur
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: demoEmail,
          displayName: 'Utilisateur Démo',
          createdAt: Timestamp.now(),
          lastLogin: Timestamp.now(),
          preferences: {
            theme: 'light',
            language: 'fr',
            showCompletedTasks: true,
            defaultPriority: 'medium'
          }
        });

        // Créer quelques tâches démo pour cet utilisateur
        const demoTasks = [
          {
            title: 'Bienvenue dans Todo List!',
            description: 'Cette tâche a été créée automatiquement pour vous montrer comment fonctionne l\'application. N\'hésitez pas à explorer toutes les fonctionnalités!',
            completed: false,
            priority: 'high',
            category: 'Projet',
            dueDate: new Date(Date.now() + 86400000), // demain
            imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' // Image démo de Cloudinary
          },
          {
            title: 'Appeler le médecin',
            description: 'Prendre rendez-vous pour le bilan annuel',
            completed: true,
            priority: 'high',
            category: 'Santé',
            dueDate: new Date(Date.now() - 86400000) // hier
          }
        ];

        for (const task of demoTasks) {
          const taskRef = doc(collection(db, 'todos'));
          await setDoc(taskRef, {
            ...task,
            userId: userCredential.user.uid,
            createdAt: Timestamp.now(),
            dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null
          });
        }

        setStatus({
          message: 'Compte démo créé avec succès! Email: demo@example.com, Mot de passe: Demo123!',
          type: 'success'
        });
      } catch (authError) {
        console.error('Erreur lors de la création du compte démo:', authError);
        setStatus({
          message: 'Impossible de créer le compte démo, mais l\'initialisation continue...',
          type: 'info'
        });
      }

      setStatus({
        message: 'Initialisation terminée avec succès ! Redirection vers la page de connexion...',
        type: 'success'
      });

      setIsInitialized(true);

      setTimeout(async () => {
        try {
          // Vérifier une dernière fois que l'état a bien été enregistré
          const db = getFirestore();
          const appStateDoc = await getDoc(doc(db, 'app_state', 'initialization'));

          if (appStateDoc.exists() && appStateDoc.data().initialized) {
            navigate('/login');
          } else {
            console.warn("L'état d'initialisation n'a pas été correctement enregistré.");
            setStatus({
              message: "L'initialisation a réussi mais l'état n'a pas été enregistré. Veuillez rafraîchir la page.",
              type: 'info'
            });
          }
        } catch (error) {
          console.error("Erreur lors de la vérification finale:", error);
          // Rediriger quand même, mais avec un message d'erreur
          navigate('/login');
        }
      }, 5000);

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

  if (isCheckingInitState) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Vérification de l'état de l'application...</p>
      </div>
    );
  }

  if (isInitialized) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Application initialisée</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            La base de données a déjà été initialisée. Redirection vers la page de connexion...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Initialisation de l'application</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Bienvenue dans votre application Todo List ! Avant de commencer, nous devons initialiser la base de données.
          Cette opération ne doit être effectuée qu'une seule fois. Un compte de démonstration sera également créé pour vous permettre de tester l'application.
        </p>

        <Button
          onClick={initializeDatabase}
          isLoading={isInitializing}
          variant={isInitializing ? 'outline' : 'primary'}
          disabled={isInitializing}
          fullWidth
          size="lg"
        >
          {isInitializing ? 'Initialisation en cours...' : 'Initialiser l\'application'}
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
    </div>
  );
};

export default Initialize;