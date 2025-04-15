# Changelog - Keto Meal Planner

Ce fichier retrace l'historique des modifications apportées au projet.

## [Non publié]

### Ajouté
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

### Modifié
- App.tsx mis à jour pour intégrer la page RecipesPage dans le routage
- Application cohérente des thèmes clair/sombre sur tous les composants principaux
- Amélioration du système de thèmes pour une meilleure prise en charge des modes clair/sombre
- Variables CSS optimisées pour une transition fluide entre les thèmes
- Intégration du FoodProvider dans l'arborescence des contextes
- Améliorations du système de thèmes pour corriger l'affichage en mode clair
- Variables CSS redéfinies pour assurer un contraste approprié dans le thème clair
- Ajustements des styles de FoodsPage pour garantir la compatibilité avec le thème clair
- Correction des couleurs de fond et de texte dans les différentes sections de l'application

### Corrigé
- Correction du thème clair qui utilisait incorrectement des couleurs sombres
- Correction des contrastes et de la lisibilité des textes en mode clair
- Résolution de problèmes de compatibilité entre les différents composants et le thème
- Amélioration de l'accessibilité visuelle avec des couleurs plus appropriées pour chaque thème

### Technique
- Ajout des dépendances react-icons et react-helmet pour l'interface utilisateur
- Implémentation d'un composant de layout générique (PageLayout)
- Intégration entre FoodContext et RecipeContext pour les calculs nutritionnels basés sur les ingrédients
- Utilisation du pattern Context + useReducer pour une gestion d'état prévisible
- Optimisation des recherches avec filtrage à la demande
- Structure des données optimisée pour faciliter les recherches et le filtrage
- Réorganisation des variables CSS pour améliorer la maintenance des thèmes
