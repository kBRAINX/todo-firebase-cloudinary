import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
  } from 'firebase/auth';
  import type { UserCredential } from 'firebase/auth';
  import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
  import { auth, db } from '../config/firebase';
  import type { User, UserPreferences } from '../types/user';

  export const registerUser = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<User> => {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Mettre à jour le profil utilisateur
      await updateProfile(userCredential.user, { displayName });

      // Créer un document utilisateur dans Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);

      const defaultPreferences: UserPreferences = {
        theme: 'light',
        language: 'fr',
        showCompletedTasks: true,
        defaultPriority: 'medium'
      };

      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: displayName,
        photoURL: userCredential.user.photoURL || '',
        createdAt: new Date(),
        lastLogin: new Date(),
        preferences: defaultPreferences
      };

      await setDoc(userDocRef, {
        ...userData,
        createdAt: Timestamp.fromDate(userData.createdAt),
        lastLogin: Timestamp.fromDate(userData.lastLogin)
      });

      return userData;
    } catch (error: any) {
      console.error('Error registering user:', error);

      // Transformer les messages d'erreur Firebase en messages plus conviviaux
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Cette adresse email est déjà utilisée par un autre compte.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('L\'adresse email n\'est pas valide.');
      }

      throw error;
    }
  };

  export const loginUser = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Mettre à jour la date de dernière connexion
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, 'lastLogin' | 'createdAt'> & {
          lastLogin: Timestamp,
          createdAt: Timestamp
        };

        await setDoc(userDocRef, {
          ...userData,
          lastLogin: Timestamp.fromDate(new Date())
        }, { merge: true });

        return {
          ...userData,
          lastLogin: new Date(),
          createdAt: userData.createdAt.toDate()
        };
      } else {
        // Si le document utilisateur n'existe pas encore, créez-le
        const defaultPreferences: UserPreferences = {
          theme: 'light',
          language: 'fr',
          showCompletedTasks: true,
          defaultPriority: 'medium'
        };

        const userData: User = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || email,
          displayName: userCredential.user.displayName || '',
          photoURL: userCredential.user.photoURL || '',
          createdAt: new Date(),
          lastLogin: new Date(),
          preferences: defaultPreferences
        };

        await setDoc(userDocRef, {
          ...userData,
          createdAt: Timestamp.fromDate(userData.createdAt),
          lastLogin: Timestamp.fromDate(userData.lastLogin)
        });

        return userData;
      }
    } catch (error: any) {
      console.error('Error logging in:', error);

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Email ou mot de passe incorrect.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
      }

      throw error;
    }
  };

  // Nouvelle fonction pour la connexion avec Google
  export const loginWithGoogle = async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Vérifier si le document utilisateur existe déjà
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Mettre à jour la date de dernière connexion
        const userData = userDoc.data() as Omit<User, 'lastLogin' | 'createdAt'> & {
          lastLogin: Timestamp,
          createdAt: Timestamp
        };

        await setDoc(userDocRef, {
          ...userData,
          lastLogin: Timestamp.fromDate(new Date())
        }, { merge: true });

        return {
          ...userData,
          lastLogin: new Date(),
          createdAt: userData.createdAt.toDate()
        };
      } else {
        // Créer un nouveau document utilisateur
        const defaultPreferences: UserPreferences = {
          theme: 'light',
          language: 'fr',
          showCompletedTasks: true,
          defaultPriority: 'medium'
        };

        const userData: User = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || '',
          photoURL: userCredential.user.photoURL || '',
          createdAt: new Date(),
          lastLogin: new Date(),
          preferences: defaultPreferences
        };

        await setDoc(userDocRef, {
          ...userData,
          createdAt: Timestamp.fromDate(userData.createdAt),
          lastLogin: Timestamp.fromDate(userData.lastLogin)
        });

        return userData;
      }
    } catch (error: any) {
      console.error('Error logging in with Google:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Connexion annulée. La fenêtre de connexion a été fermée.');
      }

      throw error;
    }
  };

  export const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  export const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error resetting password:', error);

      if (error.code === 'auth/user-not-found') {
        throw new Error('Aucun compte associé à cette adresse email.');
      }

      throw error;
    }
  };

  export const getCurrentUser = async (): Promise<User | null> => {
    if (!auth.currentUser) return null;

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, 'lastLogin' | 'createdAt'> & {
          lastLogin: Timestamp,
          createdAt: Timestamp
        };

        return {
          ...userData,
          lastLogin: userData.lastLogin.toDate(),
          createdAt: userData.createdAt.toDate()
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  export const updateUserPreferences = async (
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { preferences }, { merge: true });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  };