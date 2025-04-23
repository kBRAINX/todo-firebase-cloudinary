# Todo List Application

## 🚀 Description

Une application de gestion de tâches moderne et multilingue construite avec React, TypeScript, Firebase,cloudinary et Tailwind CSS. Cette application offre une expérience utilisateur complète avec authentification, gestion de tâches, thèmes personnalisables et internationalisation.

## ✨ Fonctionnalités principales

- 📝 Création, modification et suppression de tâches
- 🔐 Authentification utilisateur (Email/Mot de passe et Google)
- 🌓 Mode sombre/clair personnalisable
- 🌍 Support multilingue (Français/Anglais)

# Cloudinary Configuration (Alternative to Firebase Storage)
- 📊 Statistiques de tâches détaillées
- 🖼️ Upload d'images pour les tâches
- 📱 Interface responsive
- 🔍 Filtrage et recherche de tâches

## 🛠️ Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Compte Firebase
- Compte Cloudinary

## 🔧 Installation

### 1. Clonage du repository

```bash
git https://github.com/kBRAINX/todo-firebase-cloudinary.git
cd todo-firebase-cloudinary
```

### 2. Installation des dépendances

```bash
npm install
# ou
yarn install
```

### 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Configurations Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Configurations Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

### 4. Configuration Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activez les services suivants :
   - Authentication (Email/Password et Google Sign-In)
   - Firestore Database
3. Configurez les règles de sécurité Firestore (voir section ci-dessous)

### 5. Configuration Cloudinary (Optionnel)

1. Créez un compte sur [Cloudinary](https://cloudinary.com/)
2. Créez un preset de téléchargement sans signature
3. Notez votre nom de cloud et le preset

### 6. Règles de sécurité Firestore

Dans la console Firebase, définissez les règles suivantes :

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /todos/{todoId} {
      allow read, create: if isAuthenticated();
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    match /categories/{categoryId} {
      allow read: if true;
    }
  }
}
```

## 🚀 Lancement de l'application

```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible à l'adresse `http://localhost:3000`

## 🌐 Déploiement

L'application peut être déployée sur des plateformes comme Vercel, Netlify ou Firebase Hosting.

## 📦 Dépendances principales

- React 18
- TypeScript
- Firebase
- Tailwind CSS
- i18next (internationalisation)
- date-fns

## 📄 Licence

Distribué sous la licence MIT.

## 📂 Structure du Projet

### Structure des Dossiers

```
todo-list/
│
├── public/                   # Ressources statiques
│   ├── locales/              # Fichiers de traduction i18n
│   │   ├── fr/               # Traductions françaises
│   │   └── en/               # Traductions anglaises
│   └── vite.svg              # Icône du projet
│
├── src/                      # Code source principal
│   ├── assets/               # Ressources graphiques statiques
│   │   └── react.svg         # Logo React
│   │
│   ├── components/           # Composants React réutilisables
│   │   ├── common/           # Composants génériques (Input, Button, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ImageUploader.tsx
│   │   │
│   │   ├── todo/             # Composants spécifiques aux tâches
│   │   │   ├── TodoList.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   └── TodoForm.tsx
│   │   │
│   │   └── admin/            # Composants d'administration
│   │       └── CreateDemoData.tsx
│   │
│   ├── config/               # Configurations de l'application
│   │   └── firebase.ts       # Configuration Firebase
│   │
│   ├── context/              # Contextes React globaux
│   │   ├── AuthContext.tsx   # Gestion de l'authentification
│   │   └── ThemeContext.tsx  # Gestion du thème
│   │
│   ├── hooks/                # Hooks personnalisés React
│   │   ├── useAuth.ts        # Hook d'authentification
│   │   ├── useTodos.ts       # Hook de gestion des tâches
│   │   └── useImageUpload.ts # Hook de téléchargement d'images
│   │
│   ├── pages/                # Composants de pages
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Profile.tsx
│   │   └── Initialize.tsx
│   │
│   ├── services/             # Services applicatifs
│   │   ├── authService.ts    # Logique d'authentification
│   │   ├── todoService.ts    # Opérations sur les tâches
│   │   └── cloudinaryService.ts  # Gestion des uploads d'images
│   │
│   ├── types/                # Définitions de types TypeScript
│   │   ├── todo.ts           # Types pour les tâches
│   │   └── user.ts           # Types pour les utilisateurs
│   │
│   ├── App.tsx               # Composant racine de l'application
│   ├── index.css             # Styles globaux Tailwind
│   ├── i18n.ts               # Configuration de l'internationalisation
│   └── main.tsx              # Point d'entrée React
│
├── .env                      # Variables d'environnement
├── .gitignore                # Configuration Git
├── index.html                # Page HTML principale
├── package.json              # Dépendances et scripts
├── tailwind.config.ts        # Configuration Tailwind CSS
└── tsconfig.json             # Configuration TypeScript
```