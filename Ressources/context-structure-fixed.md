# Structure des contextes React

Cette application utilise l'API Context de React pour gérer l'état global de manière modulaire et performante. Chaque contexte est responsable d'une partie spécifique des données et des fonctionnalités associées.

## UserContext

Gère les informations relatives à l'utilisateur, ses préférences et objectifs.

```javascript
// src/contexts/UserContext.js

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// État initial
const initialState = {
  id: null,
  name: '',
  gender: 'homme',
  age: 30,
  height: 175, // en cm
  weight: 75, // en kg
  activityLevel: 'modérément_actif',
  targetWeight: 70, // en kg
  dietType: 'keto_standard',
  calorieTarget: 2000, // calculé
  macroTargets: {
    protein: 100, // en g
    fat: 155, // en g
    carbs: 25, // en g
  },
  mealFrequency: 3, // nombre de repas par jour
  intermittentFasting: {
    enabled: false,
    fastingWindow: 16, // en heures
    eatingWindow: 8, // en heures
    startTime: "12:00" // format "HH:MM"
  },
  allergies: [],
  preferences: {
    excludedFoods: [],
    favoriteFoods: [],
    favoriteRecipes: [],
    seasonalOnly: false
  },
  weightHistory: [],
  isProfileComplete: false
};

// Actions
const actions = {
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_DIET_TYPE: 'SET_DIET_TYPE',
  ADD_WEIGHT_ENTRY: 'ADD_WEIGHT_ENTRY',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  UPDATE_FASTING: 'UPDATE_FASTING',
  SET_MEAL_FREQUENCY: 'SET_MEAL_FREQUENCY',
  RECALCULATE_TARGETS: 'RECALCULATE_TARGETS'
};

// Reducer
function userReducer(state, action) {
  switch (action.type) {
    case actions.UPDATE_PROFILE:
      return {
        ...state,
        ...action.payload,
        isProfileComplete: true
      };
    
    case actions.SET_DIET_TYPE:
      return {
        ...state,
        dietType: action.payload
      };
    
    case actions.ADD_WEIGHT_ENTRY:
      return {
        ...state,
        weight: action.payload.weight,
        weightHistory: [
          ...state.weightHistory,
          action.payload
        ].sort((a, b) => new Date(a.date) - new Date(b.date))
      };
    
    case actions.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
    
    case actions.UPDATE_FASTING:
      return {
        ...state,
        intermittentFasting: {
          ...state.intermittentFasting,
          ...action.payload
        }
      };
    
    case actions.SET_MEAL_FREQUENCY:
      return {
        ...state,
        mealFrequency: action.payload
      };
    
    case actions.RECALCULATE_TARGETS:
      // Cette action recalcule les besoins caloriques et macronutritionnels
      // basés sur les données utilisateur actuelles
      const { calorieTarget, macroTargets } = calculateNutritionalNeeds(state);
      return {
        ...state,
        calorieTarget,
        macroTargets
      };
    
    default:
      return state;
  }
}

// Fonction utilitaire pour calculer les besoins nutritionnels
function calculateNutritionalNeeds(userData) {
  // Calcul du métabolisme de base (formule de Mifflin-St Jeor)
  let bmr;
  if (userData.gender === 'homme') {
    bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5;
  } else {
    bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age - 161;
  }
  
  // Facteur d'activité
  const activityFactors = {
    'sédentaire': 1.2,
    'légèrement_actif': 1.375,
    'modérément_actif': 1.55,
    'très_actif': 1.725,
    'extrêmement_actif': 1.9
  };
  
  // Besoins caloriques totaux
  let calorieTarget = bmr * activityFactors[userData.activityLevel];
  
  // Ajustement selon l'objectif de poids
  if (userData.weight > userData.targetWeight) {
    // Déficit pour perte de poids (max 20% de déficit)
    calorieTarget = calorieTarget * 0.8;
  } else if (userData.weight < userData.targetWeight) {
    // Surplus pour prise de poids (max 10% de surplus)
    calorieTarget = calorieTarget * 1.1;
  }
  
  // Arrondir à l'entier le plus proche
  calorieTarget = Math.round(calorieTarget);
  
  // Calcul des macronutriments pour régime keto
  const macroTargets = {
    fat: Math.round((calorieTarget * 0.75) / 9), // 75% des calories, 9 kcal/g
    protein: Math.round((calorieTarget * 0.20) / 4), // 20% des calories, 4 kcal/g
    carbs: Math.round((calorieTarget * 0.05) / 4) // 5% des calories, 4 kcal/g
  };
  
  return { calorieTarget, macroTargets };
}

// Création du contexte
const UserContext = createContext();

// Hook personnalisé pour utiliser le contexte
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé à l\'intérieur d\'un UserProvider');
  }
  return context;
}

// Provider
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  
  // Charger les données utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('keto-meal-planner-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        dispatch({ type: actions.UPDATE_PROFILE, payload: userData });
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
      }
    }
  }, []);
  
  // Sauvegarder les données utilisateur dans localStorage à chaque changement
  useEffect(() => {
    if (state.isProfileComplete) {
      localStorage.setItem('keto-meal-planner-user', JSON.stringify(state));
    }
  }, [state]);
  
  // Actions exposées
  const updateProfile = (profileData) => {
    dispatch({ type: actions.UPDATE_PROFILE, payload: profileData });
    dispatch({ type: actions.RECALCULATE_TARGETS });
  };
  
  const setDietType = (dietType) => {
    dispatch({ type: actions.SET_DIET_TYPE, payload: dietType });
  };
  
  const addWeightEntry = (weight) => {
    const entry = {
      date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
      weight
    };
    dispatch({ type: actions.ADD_WEIGHT_ENTRY, payload: entry });
    dispatch({ type: actions.RECALCULATE_TARGETS });
  };
  
  const updatePreferences = (preferences) => {
    dispatch({ type: actions.UPDATE_PREFERENCES, payload: preferences });
  };
  
  const updateFasting = (fastingSettings) => {
    dispatch({ type: actions.UPDATE_FASTING, payload: fastingSettings });
  };
  
  const setMealFrequency = (frequency) => {
    dispatch({ type: actions.SET_MEAL_FREQUENCY, payload: frequency });
  };
  
  const value = {
    ...state,
    updateProfile,
    setDietType,
    addWeightEntry,
    updatePreferences,
    updateFasting,
    setMealFrequency
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

## FoodContext

Gère la base de données d'aliments, les filtres et la recherche.

```javascript
// src/contexts/FoodContext.js

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import initialFoods from '../data/foods.json';

// État initial
const initialState = {
  foods: [],
  categories: [],
  filters: {
    query: '',
    category: '',
    isKeto: true,
    isAlkaline: false,
    seasonal: false,
    currentSeason: getCurrentSeason(),
    maxNetCarbs: null,
    minProtein: null,
    minFat: null,
    minpH: null,
    maxpH: null
  },
  loading: true,
  error: null
};

// Obtenir la saison actuelle
function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'printemps';
  if (month >= 5 && month <= 7) return 'été';
  if (month >= 8 && month <= 10) return 'automne';
  return 'hiver';
}

// Actions
const actions = {
  LOAD_FOODS: 'LOAD_FOODS',
  LOAD_FOODS_SUCCESS: 'LOAD_FOODS_SUCCESS',
  LOAD_FOODS_ERROR: 'LOAD_FOODS_ERROR',
  SET_FILTER: 'SET_FILTER',
  RESET_FILTERS: 'RESET_FILTERS',
  ADD_CUSTOM_FOOD: 'ADD_CUSTOM_FOOD',
  UPDATE_CUSTOM_FOOD: 'UPDATE_CUSTOM_FOOD',
  DELETE_CUSTOM_FOOD: 'DELETE_CUSTOM_FOOD'
};

// Reducer
function foodReducer(state, action) {
  switch (action.type) {
    case actions.LOAD_FOODS:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case actions.LOAD_FOODS_SUCCESS:
      // Extraire les catégories uniques des aliments
      const categories = [...new Set(action.payload.map(food => food.category))];
      return {
        ...state,
        foods: action.payload,
        categories,
        loading: false
      };
    
    case actions.LOAD_FOODS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case actions.SET_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.name]: action.payload.value
        }
      };
    
    case actions.RESET_FILTERS:
      return {
        ...state,
        filters: {
          ...initialState.filters,
          isKeto: true,
          currentSeason: getCurrentSeason()
        }
      };
    
    case actions.ADD_CUSTOM_FOOD:
      return {
        ...state,
        foods: [...state.foods, action.payload]
      };
    
    case actions.UPDATE_CUSTOM_FOOD:
      return {
        ...state,
        foods: state.foods.map(food => 
          food.id === action.payload.id ? action.payload : food
        )
      };
    
    case actions.DELETE_CUSTOM_FOOD:
      return {
        ...state,
        foods: state.foods.filter(food => food.id !== action.payload)
      };
    
    default:
      return state;
  }
}

// Création du contexte
const FoodContext = createContext();

// Hook personnalisé pour utiliser le contexte
export function useFood() {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFood doit être utilisé à l\'intérieur d\'un FoodProvider');
  }
  return context;
}

// Provider
export function FoodProvider({ children }) {
  const [state, dispatch] = useReducer(foodReducer, initialState);
  
  // Charger les aliments initiaux et personnalisés au démarrage
  useEffect(() => {
    dispatch({ type: actions.LOAD_FOODS });
    
    try {
      // Charger d'abord les aliments prédéfinis
      let allFoods = [...initialFoods];
      
      // Ensuite, charger les aliments personnalisés depuis localStorage
      const customFoods = localStorage.getItem('keto-meal-planner-custom-foods');
      if (customFoods) {
        const parsedCustomFoods = JSON.parse(customFoods);
        
        // Fusionner en évitant les doublons (par ID)
        const existingIds = new Set(allFoods.map(food => food.id));
        parsedCustomFoods.forEach(food => {
          if (!existingIds.has(food.id)) {
            allFoods.push(food);
            existingIds.add(food.id);
          }
        });
      }
      
      dispatch({ type: actions.LOAD_FOODS_SUCCESS, payload: allFoods });
    } catch (error) {
      dispatch({ type: actions.LOAD_FOODS_ERROR, payload: error.message });
    }
  }, []);
  
  // Sauvegarder les aliments personnalisés dans localStorage
  useEffect(() => {
    // Ne s'exécute pas lors du chargement initial
    if (!state.loading && state.foods.length > 0) {
      const customFoods = state.foods.filter(food => food.isCustom);
      localStorage.setItem('keto-meal-planner-custom-foods', JSON.stringify(customFoods));
    }
  }, [state.foods, state.loading]);
  
  // Obtenir les aliments filtrés
  const getFilteredFoods = () => {
    const { filters, foods } = state;
    
    return foods.filter(food => {
      // Filtre de recherche
      if (filters.query && !food.name.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      
      // Filtre de catégorie
      if (filters.category && food.category !== filters.category) {
        return false;
      }
      
      // Filtre keto
      if (filters.isKeto && !food.isKeto) {
        return false;
      }
      
      // Filtre alcalin
      if (filters.isAlkaline && !food.isAlkaline) {
        return false;
      }
      
      // Filtre de saison
      if (filters.seasonal && !food.seasons.includes(filters.currentSeason)) {
        return false;
      }
      
      // Filtre de glucides nets
      if (filters.maxNetCarbs !== null && food.nutritionPer100g.netCarbs > filters.maxNetCarbs) {
        return false;
      }
      
      // Filtre de protéines
      if (filters.minProtein !== null && food.nutritionPer100g.protein < filters.minProtein) {
        return false;
      }
      
      // Filtre de lipides
      if (filters.minFat !== null && food.nutritionPer100g.fat < filters.minFat) {
        return false;
      }
      
      // Filtre de pH
      if (filters.minpH !== null && food.pHValue < filters.minpH) {
        return false;
      }
      
      if (filters.maxpH !== null && food.pHValue > filters.maxpH) {
        return false;
      }
      
      return true;
    });
  };
  
  // Actions exposées
  const setFilter = (name, value) => {
    dispatch({ 
      type: actions.SET_FILTER, 
      payload: { name, value } 
    });
  };
  
  const resetFilters = () => {
    dispatch({ type: actions.RESET_FILTERS });
  };
  
  const addCustomFood = (food) => {
    const newFood = {
      ...food,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    dispatch({ type: actions.ADD_CUSTOM_FOOD, payload: newFood });
  };
  
  const updateCustomFood = (food) => {
    dispatch({ type: actions.UPDATE_CUSTOM_FOOD, payload: food });
  };
  
  const deleteCustomFood = (foodId) => {
    dispatch({ type: actions.DELETE_CUSTOM_FOOD, payload: foodId });
  };
  
  const value = {
    ...state,
    filteredFoods: getFilteredFoods(),
    setFilter,
    resetFilters,
    addCustomFood,
    updateCustomFood,
    deleteCustomFood
  };
  
  return (
    <FoodContext.Provider value={value}>
      {children}
    </FoodContext.Provider>
  );
}
```

## RecipeContext

Gère les recettes prédéfinies et personnalisées.

```javascript
// src/contexts/RecipeContext.js

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import initialRecipes from '../data/recipes.json';
import { useFood } from './FoodContext';

// État initial
const initialState = {
  recipes: [],
  filters: {
    query: '',
    isKeto: true,
    isAlkaline: false,
    mealType: '',
    maxPrepTime: null,
    maxNetCarbs: null,
    minProtein: null,
    isFavorite: false
  },
  selectedRecipe: null,
  loading: true,
  error: null
};

// Actions
const actions = {
  LOAD_RECIPES: 'LOAD_RECIPES',
  LOAD_RECIPES_SUCCESS: 'LOAD_RECIPES_SUCCESS',
  LOAD_RECIPES_ERROR: 'LOAD_RECIPES_ERROR',
  SET_FILTER: 'SET_FILTER',
  RESET_FILTERS: 'RESET_FILTERS',
  SELECT_RECIPE: 'SELECT_RECIPE',
  ADD_RECIPE: 'ADD_RECIPE',
  UPDATE_RECIPE: 'UPDATE_RECIPE',
  DELETE_RECIPE: 'DELETE_RECIPE',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE'
};

// Reducer
function recipeReducer(state, action) {
  switch (action.type) {
    case actions.LOAD_RECIPES:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case actions.LOAD_RECIPES_SUCCESS:
      return {
        ...state,
        recipes: action.payload,
        loading: false
      };
    
    case actions.LOAD_RECIPES_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case actions.SET_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.name]: action.payload.value
        }
      };
    
    case actions.RESET_FILTERS:
      return {
        ...state,
        filters: {
          ...initialState.filters,
          isKeto: true
        }
      };
    
    case actions.SELECT_RECIPE:
      return {
        ...state,
        selectedRecipe: action.payload
      };
    
    case actions.ADD_RECIPE:
      return {
        ...state,
        recipes: [...state.recipes, action.payload]
      };
    
    case actions.UPDATE_RECIPE:
      return {
        ...state,
        recipes: state.recipes.map(recipe => 
          recipe.id === action.payload.id ? action.payload : recipe
        ),
        selectedRecipe: action.payload.id === state.selectedRecipe?.id 
          ? action.payload 
          : state.selectedRecipe
      };
    
    case actions.DELETE_RECIPE:
      return {
        ...state,
        recipes: state.recipes.filter(recipe => recipe.id !== action.payload),
        selectedRecipe: state.selectedRecipe?.id === action.payload 
          ? null 
          : state.selectedRecipe
      };
    
    case actions.TOGGLE_FAVORITE:
      return {
        ...state,
        recipes: state.recipes.map(recipe => 
          recipe.id === action.payload 
            ? { ...recipe, isFavorite: !recipe.isFavorite } 
            : recipe
        ),
        selectedRecipe: state.selectedRecipe?.id === action.payload
          ? { ...state.selectedRecipe, isFavorite: !state.selectedRecipe.isFavorite }
          : state.selectedRecipe
      };
    
    default:
      return state;
  }
}

// Création du contexte
const RecipeContext = createContext();

// Hook personnalisé pour utiliser le contexte
export function useRecipe() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe doit être utilisé à l\'intérieur d\'un RecipeProvider');
  }
  return context;
}

// Provider
export function RecipeProvider({ children }) {
  const [state, dispatch] = useReducer(recipeReducer, initialState);
  const { foods } = useFood();
  
  // Charger les recettes initiales et personnalisées au démarrage
  useEffect(() => {
    dispatch({ type: actions.LOAD_RECIPES });
    
    try {
      // Charger d'abord les recettes prédéfinies
      let allRecipes = [...initialRecipes];
      
      // Ensuite, charger les recettes personnalisées depuis localStorage
      const customRecipes = localStorage.getItem('keto-meal-planner-custom-recipes');
      if (customRecipes) {
        const parsedCustomRecipes = JSON.parse(customRecipes);
        
        // Fusionner en évitant les doublons (par ID)
        const existingIds = new Set(allRecipes.map(recipe => recipe.id));
        parsedCustomRecipes.forEach(recipe => {
          if (!existingIds.has(recipe.id)) {
            allRecipes.push(recipe);
            existingIds.add(recipe.id);
          }
        });
      }
      
      // Charger les favoris
      const favorites = localStorage.getItem('keto-meal-planner-favorite-recipes');
      if (favorites) {
        const favoriteIds = new Set(JSON.parse(favorites));
        allRecipes = allRecipes.map(recipe => ({
          ...recipe,
          isFavorite: favoriteIds.has(recipe.id)
        }));
      }
      
      dispatch({ type: actions.LOAD_RECIPES_SUCCESS, payload: allRecipes });
    } catch (error) {
      dispatch({ type: actions.LOAD_RECIPES_ERROR, payload: error.message });
    }
  }, []);
  
  // Sauvegarder les recettes personnalisées dans localStorage
  useEffect(() => {
    // Ne s'exécute pas lors du chargement initial
    if (!state.loading && state.recipes.length > 0) {
      const customRecipes = state.recipes.filter(recipe => recipe.isUserCreated);
      localStorage.setItem('keto-meal-planner-custom-recipes', JSON.stringify(customRecipes));
      
      // Sauvegarder les favoris séparément
      const favorites = state.recipes
        .filter(recipe => recipe.isFavorite)
        .map(recipe => recipe.id);
      localStorage.setItem('keto-meal-planner-favorite-recipes', JSON.stringify(favorites));
    }
  }, [state.recipes, state.loading]);
  
  // Obtenir les recettes filtrées
  const getFilteredRecipes = () => {
    const { filters, recipes } = state;
    
    return recipes.filter(recipe => {
      // Filtre de recherche
      if (filters.query && !recipe.name.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      
      // Filtre keto
      if (filters.isKeto && !recipe.isKeto) {
        return false;
      }
      
      // Filtre alcalin
      if (filters.isAlkaline && !recipe.isAlkaline) {
        return false;
      }
      
      // Filtre type de repas
      if (filters.mealType && !recipe.tags.includes(filters.mealType)) {
        return false;
      }
      
      // Filtre temps de préparation
      if (filters.maxPrepTime !== null && recipe.prepTime > filters.maxPrepTime) {
        return false;
      }
      
      // Filtre de glucides nets
      if (filters.maxNetCarbs !== null && 
          recipe.nutritionPerServing.netCarbs > filters.maxNetCarbs) {
        return false;
      }
      
      // Filtre de protéines
      if (filters.minProtein !== null && 
          recipe.nutritionPerServing.protein < filters.minProtein) {
        return false;
      }
      
      // Filtre favoris
      if (filters.isFavorite && !recipe.isFavorite) {
        return false;
      }
      
      return true;
    });
  };
  
  // Calcul des valeurs nutritionnelles d'une recette
  const calculateRecipeNutrition = (ingredients) => {
    if (!ingredients || ingredients.length === 0 || foods.length === 0) {
      return {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        netCarbs: 0
      };
    }
    
    // Initialiser les totaux
    const totals = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      netCarbs: 0
    };
    
    // Additionner les contributions de chaque ingrédient
    ingredients.forEach(ingredient => {
      const food = foods.find(f => f.id === ingredient.foodId);
      if (food) {
        const ratio = ingredient.quantity / 100; // Convertir en ratio par rapport à 100g
        
        totals.calories += food.nutritionPer100g.calories * ratio;
        totals.protein += food.nutritionPer100g.protein * ratio;
        totals.fat += food.nutritionPer100g.fat * ratio;
        totals.carbs += food.nutritionPer100g.carbs * ratio;
        totals.fiber += food.nutritionPer100g.fiber * ratio;
      }
    });
    
    // Calculer les glucides nets
    totals.netCarbs = Math.max(0, totals.carbs - totals.fiber);
    
    // Arrondir les valeurs
    Object.keys(totals).forEach(key => {
      totals[key] = Math.round(totals[key] * 10) / 10; // Arrondir à 1 décimale
    });
    
    return totals;
  };
  
  // Calcul du pH moyen d'une recette
  const calculateRecipePH = (ingredients) => {
    if (!ingredients || ingredients.length === 0 || foods.length === 0) {
      return 7.0; // Valeur neutre par défaut
    }
    
    let totalWeight = 0;
    let weightedpH = 0;
    
    ingredients.forEach(ingredient => {
      const food = foods.find(f => f.id === ingredient.foodId);
      if (food) {
        totalWeight += ingredient.quantity;
        weightedpH += food.pHValue * ingredient.quantity;
      }
    });
    
    if (totalWeight === 0) return 7.0;
    
    // pH moyen pondéré
    const averagepH = weightedpH / totalWeight;
    
    // Arrondir à 1 décimale
    return Math.round(averagepH * 10) / 10;
  };
  
  // Actions exposées
  const setFilter = (name, value) => {
    dispatch({ 
      type: actions.SET_FILTER, 
      payload: { name, value } 
    });
  };
  
  const resetFilters = () => {
    dispatch({ type: actions.RESET_FILTERS });
  };
  
  const selectRecipe = (recipeId) => {
    const recipe = state.recipes.find(r => r.id === recipeId) || null;
    dispatch({ type: actions.SELECT_RECIPE, payload: recipe });
  };
  
  const addRecipe = (recipe) => {
    const newRecipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
      isUserCreated: true,
      createdAt: new Date().toISOString()
    };
    
    // Calculer les valeurs nutritionnelles si non fournies
    if (!newRecipe.nutritionPerServing) {
      const totalNutrition = calculateRecipeNutrition(newRecipe.ingredients);
      newRecipe.nutritionPerServing = {
        calories: Math.round(totalNutrition.calories / newRecipe.servings),
        protein: Math.round(totalNutrition.protein / newRecipe.servings),
        fat: Math.round(totalNutrition.fat / newRecipe.servings),
        carbs: Math.round(totalNutrition.carbs / newRecipe.servings),
        fiber: Math.round(totalNutrition.fiber / newRecipe.servings),
        netCarbs: Math.round(totalNutrition.netCarbs / newRecipe.servings)
      };
    }
    
    // Calculer le pH moyen si non fourni
    if (!newRecipe.averagePHValue) {
      newRecipe.averagePHValue = calculateRecipePH(newRecipe.ingredients);
    }
    
    // Déterminer si la recette est keto et alcaline
    newRecipe.isKeto = newRecipe.nutritionPerServing.netCarbs <= 10; // Max 10g de glucides nets
    newRecipe.isAlkaline = newRecipe.averagePHValue >= 7.0;
    
    