# Modèle de données - Keto Meal Planner

## Types de données principaux

### Utilisateur (User)
```typescript
interface User {
  id: string;
  name: string;
  gender: 'homme' | 'femme' | 'autre';
  age: number;
  height: number; // en cm
  weight: number; // en kg
  activityLevel: 'sédentaire' | 'légèrement_actif' | 'modérément_actif' | 'très_actif' | 'extrêmement_actif';
  targetWeight: number; // en kg
  dietType: 'keto_standard' | 'keto_alcalin';
  calorieTarget: number; // calculé
  macroTargets: {
    protein: number; // en g
    fat: number; // en g
    carbs: number; // en g
  };
  mealFrequency: number; // nombre de repas par jour (1-5)
  intermittentFasting: {
    enabled: boolean;
    fastingWindow: number; // en heures
    eatingWindow: number; // en heures
    startTime: string; // format "HH:MM"
  };
  allergies: string[];
  preferences: {
    excludedFoods: string[]; // IDs des aliments exclus
    favoriteFoods: string[]; // IDs des aliments favoris
    favoriteRecipes: string[]; // IDs des recettes favorites
    seasonalOnly: boolean; // Préférence pour les aliments de saison uniquement
  };
  weightHistory: {
    date: string; // format YYYY-MM-DD
    weight: number; // en kg
  }[];
}
```

### Aliment (Food)
```typescript
interface Food {
  id: string;
  name: string;
  category: 'viande' | 'poisson' | 'œufs' | 'produits_laitiers' | 'légumes' | 'fruits' | 'noix_graines' | 'matières_grasses' | 'autre';
  nutritionPer100g: {
    calories: number;
    protein: number; // en g
    fat: number; // en g
    carbs: number; // en g
    fiber: number; // en g
    netCarbs: number; // calculé (carbs - fiber)
  };
  pHValue: number; // Niveau d'acidité/alcalinité (0-14)
  isKeto: boolean;
  isAlkaline: boolean; // pour le régime keto alcalin
  seasons: ('printemps' | 'été' | 'automne' | 'hiver')[]; // Saisons de disponibilité
  commonUnitWeight: number; // Poids moyen d'une unité en g (ex: 1 œuf = 50g)
  unitName: string; // Nom de l'unité (ex: "œuf", "cuillère à soupe")
  image?: string; // URL optionnelle de l'image
}
```

### Recette (Recipe)
```typescript
interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number; // en minutes
  cookTime: number; // en minutes
  servings: number;
  ingredients: {
    foodId: string;
    quantity: number;
    unit: string; // "g", "ml", "unité", etc.
  }[];
  instructions: string[];
  nutritionPerServing: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    netCarbs: number;
  };
  averagePHValue: number; // calculé à partir des ingrédients
  isKeto: boolean; // calculé (si netCarbs < seuil)
  isAlkaline: boolean; // calculé (si pH > 7)
  tags: string[];
  image?: string;
  isUserCreated: boolean;
}
```

### Repas (Meal)
```typescript
interface Meal {
  id: string;
  name: string; // "Déjeuner", "Dîner", etc.
  timeOfDay: string; // format "HH:MM"
  items: Array<{
    type: 'recipe' | 'food';
    id: string; // ID de la recette ou de l'aliment
    servingSize: number; // Nombre de portions ou quantité en g
    calories: number; // calculé
    macros: {
      protein: number;
      fat: number;
      carbs: number;
      fiber: number;
      netCarbs: number;
    };
    pHValue: number;
  }>;
  totalNutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    netCarbs: number;
  };
  averagePHValue: number;
}
```

### Plan de repas (MealPlan)
```typescript
interface MealPlan {
  id: string;
  userId: string;
  startDate: string; // format YYYY-MM-DD
  endDate: string; // format YYYY-MM-DD
  dietType: 'keto_standard' | 'keto_alcalin';
  dailyCalorieTarget: number;
  days: Array<{
    date: string; // format YYYY-MM-DD
    meals: Meal[];
    totals: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      fiber: number;
      netCarbs: number;
      pHValue: number;
    };
  }>;
  shoppingList: {
    [foodId: string]: {
      name: string;
      category: string;
      totalQuantity: number;
      unit: string;
      checked: boolean;
    };
  };
}
```

## Relations entre les données

1. **Utilisateur → Plan de repas**
   - Un utilisateur peut avoir plusieurs plans de repas
   - Chaque plan est adapté aux besoins caloriques et macronutritionnels de l'utilisateur

2. **Plan de repas → Repas**
   - Un plan de repas contient plusieurs jours
   - Chaque jour contient plusieurs repas
   - Le nombre de repas par jour dépend des préférences de l'utilisateur

3. **Repas → Recettes & Aliments**
   - Un repas peut contenir des recettes et/ou des aliments individuels
   - Les quantités sont ajustées pour atteindre les objectifs caloriques

4. **Recette → Aliments**
   - Une recette est composée de plusieurs aliments en quantités spécifiques
   - Les valeurs nutritionnelles sont calculées à partir des aliments

5. **Plan de repas → Liste de courses**
   - La liste de courses est générée à partir de tous les aliments nécessaires dans le plan
   - Les quantités sont agrégées pour éviter les doublons

## Calculs automatiques

1. **Besoins caloriques**
   - Calculés à partir des données utilisateur (sexe, âge, poids, taille, niveau d'activité)
   - Ajustés en fonction de l'objectif de poids (maintenance, perte, gain)

2. **Macronutriments**
   - Répartition typique keto: 70-75% lipides, 20-25% protéines, 5-10% glucides
   - Ajustable selon les préférences de l'utilisateur

3. **Valeurs nutritionnelles des recettes**
   - Calculées à partir des ingrédients et de leurs quantités
   - Divisées par le nombre de portions

4. **pH moyen**
   - Calculé comme moyenne pondérée des valeurs pH des aliments
   - Utilisé pour déterminer si un repas ou une recette est alcalin

5. **Liste de courses**
   - Générée automatiquement à partir des plans de repas
   - Quantités agrégées et converties en unités pratiques
