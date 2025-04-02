import { Navigate } from 'react-router-dom';
import TodoList from '../components/todo/TodoList';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const { user, loading } = useAuth();

  // Afficher un spinner de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <TodoList />
    </div>
  );
};

export default Home;