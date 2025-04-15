# Architecture technique - Keto Meal Planner

## Structure globale
L'application sera structurée selon une architecture modulaire basée sur des composants React et des hooks personnalisés.

```
src/
├── assets/             # Images, icônes, etc.
├── components/         # Composants React réutilisables
│   ├── layout/         # Composants structurels (Header, Footer, etc.)
│   ├── meals/          # Composants liés aux repas
│   ├── recipes/        # Composants liés aux recettes
│   ├── foods/          # Composants liés aux aliments
│   ├── profile/        # Composants liés au profil utilisateur
│   └── ui/             # Composants d'interface générique
├── contexts/           # Contextes React pour la gestion d'état
├── data/               # Données statiques (base d'aliments initiale)
├── hooks/              # Hooks personnalisés
├── pages/              # Pages principales de l'application
├── services/           # Services pour les opérations complexes
│   ├── mealPlanner.js  # Service de génération de plans de repas
│   ├── calculator.js   # Service de calcul (calories, macros, etc.)
│   └── storage.js      # Service de stockage local
├── styles/             # Styles globaux et variables
└── utils/              # Fonctions utilitaires

```

## Gestion d'état
L'application utilisera le Context API de React pour gérer les différents états:

1. **UserContext**
   - Profil utilisateur (sexe, âge, taille, poids)
   - Objectifs (poids cible, préférences alimentaires)
   - Historique de poids et mesures
   - Préférences de jeûne intermittent

2. **FoodContext**
   - Base de données d'aliments
   - Filtres et recherche d'aliments
   - Valeurs nutritionnelles et pH des aliments
   - Saisonnalité des aliments

3. **RecipeContext**
   - Recettes personnalisées et prédéfinies
   - Favoris
   - Calcul automatique des valeurs nutritionnelles

4. **MealPlanContext**
   - Plans de repas générés
   - Planification quotidienne et hebdomadaire
   - Liste de courses générée

5. **ThemeContext**
   - Préférences de thème (clair/sombre)
   - Personnalisation de l'interface

## Flux de données

1. **Données utilisateur**:
   - Collecte des informations de profil
   - Calcul des besoins caloriques
   - Stockage des préférences

2. **Génération de plan de repas**:
   - Sélection du type de régime (keto standard ou alcalin)
   - Application des préférences et restrictions
   - Distribution des macronutriments
   - Sélection des recettes et aliments
   - Génération des portions adaptées aux besoins caloriques

3. **Gestion des recettes**:
   - Création et modification de recettes personnalisées
   - Calcul automatique des macronutriments et du pH moyen
   - Intégration dans les plans de repas

4. **Liste de courses**:
   - Agrégation des ingrédients du plan de repas
   - Catégorisation par type d'aliment
   - Fonctionnalité de cochage

5. **Suivi des objectifs**:
   - Enregistrement du poids
   - Visualisation des tendances
   - Ajustement automatique des plans de repas

## Persistance des données
L'application utilisera localStorage pour stocker les données de l'utilisateur localement. Pour une version plus avancée, une base de données Firebase pourrait être intégrée.

## Optimisations de performance
- Utilisation de React.memo pour les composants avec rendu coûteux
- Memoization des calculs complexes avec useMemo et useCallback
- Lazy loading des composants non essentiels
- Virtualisation des listes longues (recettes, aliments)

## Accessibilité
- Respect des normes WCAG 2.1
- Support complet du clavier
- Messages d'erreur explicites
- Contrastes suffisants
- Textes alternatifs pour les images

## Responsive design
- Approche mobile-first
- Breakpoints adaptés aux différents appareils
- Composants flexibles s'adaptant à différentes tailles d'écran
