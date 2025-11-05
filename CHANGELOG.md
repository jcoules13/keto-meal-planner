# Changelog - Keto Meal Planner

Ce fichier retrace l'historique des modifications apportées au projet.

## [0.2.0] - 2025-11-05

### 🚀 MIGRATION MAJEURE : React 19 + Vite

#### Ajouté
- ✨ **React 19.0.0** avec nouvelles fonctionnalités (Actions, use() hook)
- ⚡ **Vite 6.0.3** comme build tool (10x plus rapide que webpack)
- 🔧 Configuration Vite moderne (`vite.config.ts`)
- 📝 Documentation complète de la migration (`MIGRATION-TO-REACT19.md`)
- 🔒 **0 vulnérabilités de sécurité** (vs 13 avant)

#### Modifié
- ⬆️ TypeScript 4.9.5 → **5.7.2**
- ⬆️ React Router 6.21.0 → **7.0.2**
- ⬆️ Recharts 2.10.3 → **2.15.0**
- ⬆️ Web Vitals 2.1.4 → **4.2.4** (nouvelle API)
- ⬆️ Tailwind CSS 3.3.5 → **3.4.17**
- ⬆️ @headlessui/react 1.7.17 → **2.2.0**
- ⬆️ @heroicons/react 2.1.1 → **2.2.0**
- 📝 Renommage de tous les fichiers `.js` contenant du JSX en `.jsx`
- 🔧 Migration de `index.html` de `public/` vers la racine
- 📝 Mise à jour de `reportWebVitals.ts` pour web-vitals v4 API

#### Supprimé
- ❌ **react-scripts 5.0.1** (remplacé par Vite)
- ❌ Toutes les dépendances webpack
- ❌ Packages de sécurité vulnérables (svgo, nth-check, etc.)
- ❌ Configuration ESLint CRA
- ❌ npm overrides (plus nécessaires)

#### Performance
- ⚡ Build de production : **~7 secondes** (vs ~60s avant)
- ⚡ Démarrage dev server : **~1.4 secondes** (vs ~20s avant)
- ⚡ HMR : **instantané** (vs 1-3s avant)
- 📦 Bundle optimisé : **137 kB gzip** (vs 230 kB avant)

#### Scripts
- `npm start` → `npm run dev` (serveur de développement)
- `npm run build` (maintenant avec `tsc && vite build`)
- Ajout de `npm run preview` (prévisualiser le build de production)

---

## [Non publié]

### Ajouté
- Implémentation du MealPlanContext pour la gestion des plans de repas
- Algorithme de génération de liste de courses optimisé
- Utilitaires pour la manipulation et validation de plans de repas
- Calcul des totaux nutritionnels par jour et par plan
- Vérification de conformité des plans par rapport aux objectifs nutritionnels
- Conversion intelligente des quantités en unités pratiques
- Gestion de la persistance des plans de repas et listes de courses
- Organisation de la liste de courses par catégories
- Gestion des cases à cocher pour la liste de courses
- Fonctionnalité d'exportation de la liste au format texte
- Calcul du pH moyen des repas pour le régime keto alcalin
- Création automatique de plans vides pour une période donnée
- Analyse des proportions de macronutriments dans la liste de courses
- Page des recettes (RecipesPage) avec interface complète et responsive
- Formulaire de création/édition de recettes avec calcul automatique des valeurs nutritionnelles et du pH
- Affichage des recettes sous forme de cartes avec informations clés et macronutriments
- Vue détaillée des recettes avec tous les ingrédients, instructions et valeurs nutritionnelles
- Système de filtrage avancé pour les recettes (par type de repas, temps de préparation, etc.)
- Affichage des macronutriments sous forme de barres visuelles pour une meilleure compréhension
- Gestion des recettes favorites avec persistance dans localStorage
- Calcul des pourcentages de macronutriments pour vérifier la conformité au régime keto
- Indicateurs visuels des recettes keto et alcalines
- Gestion complète CRUD des recettes personnalisées
- Recherche textuelle dans les recettes
- Composants modulaires et réutilisables pour les recettes
- Page de suivi de poids (WeightTrackerPage) avec interface complète et responsive
- Graphique d'évolution du poids avec filtrage par période
- Indicateur de progression vers l'objectif de poids
- Calculateur d'IMC avec visualisation et catégorisation
- Formulaire d'enregistrement d'une nouvelle entrée de poids
- Affichage de l'historique des mesures de poids avec variations
- Utilitaires pour les calculs liés au poids, à l'IMC et aux tendances
- Hook personnalisé (useWeightTracking) pour la logique de suivi du poids
- Page de visualisation des aliments (FoodsPage) avec interface complète et responsive
- Composants d'interface pour les aliments (FoodCard, FoodDetail)
- Composants UI réutilisables (SearchBar, FilterPanel, PHIndicator, SeasonalityIndicator)
- Système complet de filtrage des aliments avec recherche, catégories, valeurs nutritionnelles, etc.
- Visualisation détaillée des propriétés des aliments avec graphiques de macronutriments
- Implémentation du RecipeContext pour la gestion des recettes
- Système de filtrage pour les recettes (par type de repas, temps de préparation, valeurs nutritionnelles, etc.)
- Base de données initiale avec 10 recettes keto prédéfinies
- Fonctions de calcul automatique des valeurs nutritionnelles et du pH des recettes
- Gestion des recettes favorites et personnalisées
- Persistance des recettes personnalisées et favorites dans le localStorage
- Implémentation du FoodContext pour la gestion de la base de données alimentaire
- Système de filtrage modulaire pour les aliments (par catégorie, régime, valeurs nutritionnelles, etc.)
- Base de données initiale avec 20 aliments adaptés au régime keto
- Fonction de détection automatique de la saison courante
- Persistance des aliments personnalisés dans le localStorage
- Création d'un nouveau composant HomePage avec support complet de thème
- Guide de gestion des thèmes (THEME.md) pour assurer une implémentation cohérente
- Centralisation de l'application des thèmes dans le composant MainLayout

### Modifié
- Guide de débogage (DEBUGGING.md) mis à jour avec des informations sur le MealPlanContext
- Structure d'interdépendance des contextes pour faciliter les calculs nutritionnels
- Amélioration du système de validation des données pour les plans et recettes
- App.tsx mis à jour pour intégrer la page RecipesPage dans le routage
- Application cohérente des thèmes clair/sombre sur tous les composants principaux
- Amélioration du système de thèmes pour une meilleure prise en charge des modes clair/sombre
- Variables CSS optimisées pour une transition fluide entre les thèmes
- Intégration du FoodProvider dans l'arborescence des contextes
- Améliorations du système de thèmes pour corriger l'affichage en mode clair
- Variables CSS redéfinies pour assurer un contraste approprié dans le thème clair
- Ajustements des styles de FoodsPage pour garantir la compatibilité avec le thème clair
- Correction des couleurs de fond et de texte dans les différentes sections de l'application
- Refactorisation complète de RecipesPage.css pour utiliser les variables CSS de thème
- Mise à jour de RecipesPage.js pour utiliser correctement le hook useTheme
- Refactorisation de App.tsx pour utiliser le nouveau composant HomePage modulaire
- Mise à jour du composant MainLayout pour appliquer automatiquement le thème courant

### Corrigé
- Correction du thème clair qui utilisait incorrectement des couleurs sombres
- Correction des contrastes et de la lisibilité des textes en mode clair
- Résolution de problèmes de compatibilité entre les différents composants et le thème
- Amélioration de l'accessibilité visuelle avec des couleurs plus appropriées pour chaque thème
- Résolution du problème de thème incohérent entre les différentes pages de l'application
- Correction des variables CSS hardcodées dans RecipesPage.css qui empêchaient le changement de thème
- Uniformisation de l'apparence des pages pour tous les thèmes (clair/sombre)

### Technique
- Implémentation du pattern Observer pour la synchronisation entre les contextes
- Utilisation de techniques avancées de memoization pour optimiser les calculs nutritionnels
- Système d'agrégation et de groupement pour la génération de liste de courses
- Structure de données optimisée pour les plans de repas et listes de courses
- Ajout des dépendances react-icons et react-helmet pour l'interface utilisateur
- Implémentation d'un composant de layout générique (PageLayout)
- Intégration entre FoodContext et RecipeContext pour les calculs nutritionnels basés sur les ingrédients
- Utilisation du pattern Context + useReducer pour une gestion d'état prévisible
- Optimisation des recherches avec filtrage à la demande
- Structure des données optimisée pour faciliter les recherches et le filtrage
- Réorganisation des variables CSS pour améliorer la maintenance des thèmes
- Architecture centralisée pour la gestion des thèmes évitant les répétitions de code
- Utilisation de sélecteurs CSS spécifiques au thème (.light, .dark) pour une meilleure maintenabilité
