# Marche à suivre pour le développement

## 1. Création du répertoire du projet et configuration

- [x] Étape 1 : Initialisation du projet React (déjà validé)
- [x] Organiser les documents de conception dans un dossier docs à l'intérieur du projet
- [x] Ajouter les dépendances nécessaires:
```bash
npm install react-router-dom recharts tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react
npx tailwindcss init -p
```

## 2. Configuration de l'architecture initiale

- [x] Configurer Tailwind CSS selon le design system défini
- [x] Créer la structure de dossiers selon l'architecture technique
```
src/
├── assets/             # Images, icônes, etc.
├── components/         # Composants React réutilisables
├── contexts/           # Contextes React pour la gestion d'état
├── data/               # Données statiques (base d'aliments initiale)
├── hooks/              # Hooks personnalisés
├── pages/              # Pages principales de l'application
├── services/           # Services pour les opérations complexes
├── styles/             # Styles globaux et variables
└── utils/              # Fonctions utilitaires
```

## 3. Implémentation des contextes et services (par ordre de priorité)

- [x] ThemeContext - Gestion des thèmes clair/sombre
- [x] UserContext - Gestion du profil utilisateur
- [ ] FoodContext - Base de données alimentaire
- [ ] RecipeContext - Gestion des recettes
- [ ] MealPlanContext - Planification des repas
- [x] Services utilitaires (calculateur nutritionnel, stockage local, etc.)

## 4. Développement des composants d'interface

- [x] Composants UI de base (Button, Input, Card, etc.)
- [x] Composants de navigation (Header, Sidebar, etc.)
- [ ] Composants spécifiques à l'alimentation (FoodCard, MacroDisplay, PHIndicator)
- [ ] Composants de visualisation (WeightGraph, MacroChart, etc.)

## 5. Développement des pages principales

- [x] Page d'accueil / Dashboard (version basique)
- [x] Page de profil utilisateur
- [ ] Page de génération de plan de repas
- [ ] Page de recettes
- [ ] Page de base de données alimentaire
- [ ] Page de liste de courses
- [ ] Page de suivi de poids
- [ ] Page de paramètres

## 6. Implémentation des fonctionnalités clés

- [x] Calcul des besoins nutritionnels
- [ ] Algorithme de génération de plans de repas
- [ ] Création/édition de recettes personnalisées
- [ ] Génération de liste de courses
- [ ] Suivi de progression

## 7. Tests et optimisations

- [ ] Tests unitaires pour les fonctions critiques
- [ ] Tests des composants UI
- [ ] Optimisations de performance
- [ ] Vérification de l'accessibilité

## 8. Finalisation

- [ ] Documentation utilisateur
- [ ] Mode hors ligne
- [ ] Préparation au déploiement

## Checklist détaillée pour suivre l'avancement

### Phase 1: Configuration et base du projet

- [x] Initialiser le projet React
- [x] Configurer Tailwind CSS
- [x] Configurer React Router
- [x] Créer les fichiers de structure de base
- [x] Implémenter ThemeContext et son Provider
- [x] Créer les composants UI de base
- [x] Extension du ThemeContext pour supporter les thèmes multiples (saisons, fêtes)

### Phase 2: Gestion des données utilisateur

- [x] Implémenter UserContext
- [x] Créer la page de profil utilisateur
- [x] Développer le formulaire de profil
- [x] Implémenter les calculs d'IMC et besoins caloriques
- [x] Mettre en place la persistance locale des données

### Phase 3: Base de données alimentaire

- [x] Créer le fichier initial de données alimentaires
- [ ] Implémenter FoodContext
- [ ] Développer les composants de visualisation d'aliments
- [ ] Créer l'interface de recherche et filtrage
- [ ] Implémenter l'ajout d'aliments personnalisés

### Phase 4: Gestion des recettes

- [x] Créer un ensemble initial de recettes
- [ ] Implémenter RecipeContext
- [ ] Développer le formulaire d'ajout/édition de recettes
- [ ] Implémenter le calcul automatique des valeurs nutritionnelles
- [ ] Créer la page de bibliothèque de recettes

### Phase 5: Planification des repas

- [ ] Implémenter MealPlanContext
- [ ] Développer l'algorithme de génération de plans
- [ ] Créer l'interface de génération de plan
- [ ] Implémenter la visualisation du plan hebdomadaire
- [ ] Développer le système de personnalisation du plan

### Phase 6: Fonctionnalités avancées

- [ ] Implémenter la génération de liste de courses
- [ ] Développer l'interface de liste de courses
- [ ] Créer le système de suivi du poids
- [ ] Implémenter les graphiques d'évolution
- [ ] Ajouter le support du régime keto alcalin

### Phase 7: Finalisation et optimisations

- [ ] Optimiser les performances
- [ ] Uniformiser l'interface utilisateur
- [ ] Effectuer les tests finaux
- [ ] Préparer au déploiement

## Procédure recommandée pour chaque session de développement

### Au début de chaque session:

- [x] Vérifier la checklist pour voir où vous en êtes
- [x] Noter les objectifs spécifiques de la session

### Pendant le développement:

- [x] Implémenter une fonctionnalité à la fois
- [x] Tester régulièrement
- [x] Documenter les choix techniques importants

### À la fin de chaque session:

- [x] Mettre à jour la checklist (marquer ce qui est terminé)
- [x] Noter les problèmes rencontrés et les solutions trouvées
- [x] Planifier les objectifs de la prochaine session