# Keto Meal Planner v2 - Édition Française

Une application React moderne et optimisée pour planifier et suivre les régimes cétogènes avec des fonctionnalités avancées pour le céto standard et le céto alcalin.

## Fonctionnalités

### Fonctionnalités principales
- 🔄 Génération de plans de repas hebdomadaires (céto standard ou céto alcalin)
- 📊 Calcul de l'IMC et des besoins caloriques
- 🍽️ Planification flexible des repas (1-5 repas par jour, compatible avec le jeûne intermittent)
- 🥑 Base de données d'aliments avec valeurs pH et saisonnalité
- 📝 Recettes avec portions détaillées (quantités précises pour chaque ingrédient)
- 🛒 Liste de courses interactive avec cases à cocher
- 👨‍🍳 Gestion de recettes personnelles avec intégration dans vos plans de repas
- 🌡️ Affichage numérique du pH pour chaque aliment et recette
- 🎨 Design moderne avec thème personnalisable
- ⭐ Aliments et recettes favoris pour une utilisation préférentielle
- 📈 Suivi graphique du poids avec tendances et prédictions
- ⚖️ Définition d'un poids cible avec indicateur de progression
- 🌱 Filtrage des ingrédients de saison pour une alimentation écologique
- 🔄 Intégration du jeûne intermittent avec plusieurs options d'horaires
- 📱 Interface utilisateur responsive pour ordinateur et mobile

## Architecture technique

### Principes de conception
- **Modularité** : Architecture basée sur des composants et des hooks réutilisables
- **Maintenabilité** : Code bien structuré avec séparation claire des responsabilités
- **Performance** : Optimisation des rendus et utilisation efficace de la mémoire
- **Robustesse** : Gestion des erreurs et validations pour assurer la stabilité
- **Accessibilité** : Respect des standards WCAG pour une expérience utilisateur inclusive

### Gestion d'état
L'application utilise l'API Context de React pour la gestion d'état avec une approche plus modulaire :

- **UserContext** : Profil utilisateur, entrées de poids et objectifs
- **RecipeContext** : Recettes, aliments, recherche et filtres
- **FavoritesContext** : Gestion des favoris (recettes et aliments)
- **MealPlanContext** : Plans de repas et liste de courses
- **ThemeContext** : Préférences de thème (clair/sombre)

## Nouvelle structure du projet

```
public/                           # Ressources publiques statiques
├── index.html                    # Template HTML principal
├── favicon.ico                   # Icône du site
├── manifest.json                 # Manifest pour les PWA
└── images/                       # Images publiques et statiques
    └── logos/                    # Logos de l'application

src/
├── assets/                      # Ressources statiques
│   ├── images/                  # Images et icônes
│   └── data/                    # Données JSON statiques
│       ├── foods.json           # Base de données d'aliments
│       └── recipes.json         # Recettes prédéfinies
│
├── components/                  # Composants React organisés par domaine
│   ├── common/                  # Composants réutilisables
│   │   ├── Button/              # Structure par composant avec tests
│   │   │   ├── Button.jsx
│   │   │   ├── Button.test.jsx
│   │   │   └── index.js
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Select/
│   │   ├── PHDisplay/
│   │   └── SeasonalBadge/
│   │
│   ├── layout/                  # Composants de mise en page
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Sidebar/
│   │   └── PageLayout/
│   │
│   ├── features/                # Composants par fonctionnalité
│       ├── auth/                # Authentification et profils
│       │   ├── ProfileSelector/
│       │   └── ProfileForm/
│       │
│       ├── meals/               # Gestion des repas
│       │   ├── RecipeCard/
│       │   ├── MealPlanDay/
│       │   ├── MacroDisplay/
│       │   └── FoodDetail/
│       │
│       ├── weight/              # Suivi du poids
│       │   ├── BMICalculator/
│       │   ├── WeightChart/
│       │   ├── WeightForm/
│       │   └── WeightStats/
│       │
│       └── shopping/            # Liste de courses
│           ├── ShoppingList/
│           └── ShoppingItem/
│
├── context/                     # Gestion d'état avec Context API
│   ├── UserContext/
│   │   ├── UserContext.jsx
│   │   ├── UserReducer.js
│   │   ├── UserActions.js
│   │   └── index.js
│   ├── RecipeContext/
│   ├── FavoritesContext/
│   ├── MealPlanContext/
│   └── ThemeContext/
│
├── hooks/                       # Hooks personnalisés
│   ├── useLocalStorage.js       # Persistance des données
│   ├── useWeightTracking.js     # Logique de suivi du poids
│   ├── useMealPlanning.js       # Planification des repas
│   └── useMediaQuery.js         # Gestion du responsive
│
├── pages/                       # Pages principales de l'application
│   ├── HomePage/
│   ├── MealPlanPage/
│   ├── RecipesPage/
│   ├── ShoppingListPage/
│   ├── WeightTrackerPage/
│   └── ProfilePage/
│
├── services/                    # Services et API
│   ├── storageService.js        # Service de stockage local
│   └── exportService.js         # Export des données (PDF, etc.)
│
├── utils/                       # Fonctions utilitaires
│   ├── dietUtils.js             # Calculs liés au régime
│   ├── weightUtils.js           # Calculs liés au poids
│   ├── dateUtils.js             # Manipulation des dates
│   └── formatters.js            # Formatage des données
│
├── styles/                      # Styles globaux et thèmes
│   ├── theme.js                 # Configuration des thèmes
│   ├── global.css               # Styles globaux
│   └── variables.css            # Variables CSS
│
├── config/                      # Configuration de l'application
│   └── constants.js             # Constantes globales
│
├── App.jsx                      # Composant racine
└── index.jsx                    # Point d'entrée
```

## Modèles de données optimisés

### Food (Aliment)
```javascript
{
  id: string,
  name: string,
  category: string,
  macros: {
    calories: number,
    protein: number,
    fat: number,
    carbs: number
  },
  servingSize: {
    quantity: number,
    unit: string
  },
  pH: number,
  seasonality: string[]  // 'printemps', 'été', 'automne', 'hiver', 'toute_année'
}
```

### Recipe (Recette)
```javascript
{
  id: string,
  name: string,
  image: string,
  description: string,
  mealType: string,  // 'petit_dejeuner', 'dejeuner', 'diner', 'collation'
  prepTime: number,
  cookTime: number,
  servings: number,
  ingredients: [
    { foodId: string, quantity: number, unit: string }
  ],
  instructions: string[],
  // Les macros sont calculées automatiquement à partir des ingrédients
}
```

### Meal Plan (Plan de repas)
```javascript
{
  id: string,
  userId: string,
  startDate: string,
  endDate: string,
  dietType: string,  // 'ceto_standard', 'ceto_alcalin'
  intermittentFasting: {
    enabled: boolean,
    pattern: string,  // '16_8', '18_6', '20_4', 'omad'
  },
  days: [
    {
      date: string,
      meals: {
        petit_dejeuner: string[],  // Array of recipe IDs
        dejeuner: string[],
        diner: string[],
        collations: string[]
      }
    }
  ]
}
```

### User Profile (Profil utilisateur)
```javascript
{
  id: string,
  name: string,
  gender: string,
  birthDate: string,
  height: number,
  activityLevel: string,
  goal: string,   // 'perte_poids', 'maintien', 'prise_masse'
  weightEntries: [
    { date: string, weight: number }
  ],
  goalWeight: number,
  preferences: {
    theme: string,
    excludedFoods: string[]
  }
}
```

## Types de régimes
- **Céto Standard** : Régime cétogène traditionnel axé sur les lipides élevés et les glucides bas
- **Céto Alcalin** : Combine la cétose avec des aliments à pH équilibré (pH > 6.0)

## Options de jeûne intermittent
- 16:8 (16h de jeûne, 8h de fenêtre d'alimentation)
- 18:6 (18h de jeûne, 6h de fenêtre d'alimentation)
- 20:4 (20h de jeûne, 4h de fenêtre d'alimentation)
- OMAD (Un repas par jour)
- Jeûne alterné

## Fonctions utilitaires optimisées

### Utilitaires de régime et recettes
- `calculateRecipeMacros(recipe, foods)` : Calcule les macronutriments d'une recette
- `calculateRecipePH(recipe, foods)` : Calcule le pH moyen d'une recette
- `filterFoodsByDiet(foods, dietType)` : Filtre les aliments selon le type de régime
- `filterFoodsBySeason(foods, date)` : Filtre les aliments selon la saison

### Utilitaires de suivi du poids
- `calculateBMI(height, weight)` : Calcule l'IMC
- `calculateDailyCalories(profile)` : Calcule les besoins caloriques quotidiens
- `getWeightGoalProgress(profile)` : Calcule la progression vers le poids cible
- `predictGoalDate(profile)` : Prédit la date d'atteinte de l'objectif de poids

## Installation et démarrage

1. Cloner le dépôt :
```bash
git clone https://github.com/jcoules13/keto-meal-planner-v2.git
cd keto-meal-planner-v2
```

2. Installer les dépendances :
```bash
npm install
```

3. Démarrer le serveur de développement :
```bash
npm start
```

4. Compiler pour la production :
```bash
npm run build
```

## Bonnes pratiques de développement

1. **Structure des composants** : Chaque composant dans son propre dossier avec ses fichiers associés
2. **Séparation des préoccupations** : Logique métier dans les hooks et contexts, UI dans les composants
3. **Gestion d'état** : Utilisation cohérente des contexts et reducers
4. **Performance** : Utilisation judicieuse de useMemo, useCallback et React.memo
5. **Tests** : Tests unitaires pour chaque fonctionnalité
6. **Accessibilité** : Support ARIA et focus sur l'expérience utilisateur
7. **Responsive** : Adaptation à tous les formats d'écran

## Plan de développement

1. **Phase 1** : Mise en place de l'architecture de base et des contexts
2. **Phase 2** : Implémentation des features principales (profil, recettes, plan de repas)
3. **Phase 3** : Développement des fonctionnalités avancées (suivi du poids, favoris)
4. **Phase 4** : Optimisation des performances et de l'interface utilisateur
5. **Phase 5** : Tests et finalisation

## Licence

MIT License

## Auteur

JCO
