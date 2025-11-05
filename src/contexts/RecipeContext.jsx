import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import initialRecipes from '../data/recipes.json';

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
      console.error('Erreur lors du chargement des recettes:', error);
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
  const calculateRecipeNutrition = (ingredients, foods = []) => {
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
  const calculateRecipePH = (ingredients, foods = []) => {
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
  
  const addRecipe = (recipe, foods = []) => {
    const newRecipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
      isUserCreated: true,
      createdAt: new Date().toISOString()
    };

    // Calculer les valeurs nutritionnelles si non fournies
    if (!newRecipe.nutritionPerServing) {
      const totalNutrition = calculateRecipeNutrition(newRecipe.ingredients, foods);
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
      newRecipe.averagePHValue = calculateRecipePH(newRecipe.ingredients, foods);
    }
    
    // Déterminer si la recette est keto et alcaline
    newRecipe.isKeto = newRecipe.nutritionPerServing.netCarbs <= 10; // Max 10g de glucides nets
    newRecipe.isAlkaline = newRecipe.averagePHValue >= 7.0;
    
    dispatch({ type: actions.ADD_RECIPE, payload: newRecipe });
    return newRecipe.id;
  };
  
  const updateRecipe = (recipe, foods = []) => {
    const updatedRecipe = { ...recipe };

    // Recalculer les valeurs nutritionnelles et le pH
    const totalNutrition = calculateRecipeNutrition(updatedRecipe.ingredients, foods);
    updatedRecipe.nutritionPerServing = {
      calories: Math.round(totalNutrition.calories / updatedRecipe.servings),
      protein: Math.round(totalNutrition.protein / updatedRecipe.servings),
      fat: Math.round(totalNutrition.fat / updatedRecipe.servings),
      carbs: Math.round(totalNutrition.carbs / updatedRecipe.servings),
      fiber: Math.round(totalNutrition.fiber / updatedRecipe.servings),
      netCarbs: Math.round(totalNutrition.netCarbs / updatedRecipe.servings)
    };
    
    updatedRecipe.averagePHValue = calculateRecipePH(updatedRecipe.ingredients, foods);
    
    // Mettre à jour les propriétés dérivées
    updatedRecipe.isKeto = updatedRecipe.nutritionPerServing.netCarbs <= 10;
    updatedRecipe.isAlkaline = updatedRecipe.averagePHValue >= 7.0;
    
    dispatch({ type: actions.UPDATE_RECIPE, payload: updatedRecipe });
  };
  
  const deleteRecipe = (recipeId) => {
    dispatch({ type: actions.DELETE_RECIPE, payload: recipeId });
  };
  
  const toggleFavorite = (recipeId) => {
    dispatch({ type: actions.TOGGLE_FAVORITE, payload: recipeId });
  };
  
  const getRecipeById = (recipeId) => {
    return state.recipes.find(recipe => recipe.id === recipeId) || null;
  };
  
  const searchRecipes = (query) => {
    if (!query || query.trim() === '') {
      return state.recipes;
    }
    
    const searchTerm = query.toLowerCase().trim();
    return state.recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchTerm) ||
      recipe.description.toLowerCase().includes(searchTerm) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  };
  
  // Mémoiser les recettes filtrées pour éviter recalculs inutiles
  const filteredRecipes = useMemo(() => getFilteredRecipes(), [state.recipes, state.filters]);

  // Mémoiser l'objet value pour éviter re-renders en cascade
  const value = useMemo(() => ({
    ...state,
    filteredRecipes,
    setFilter,
    resetFilters,
    selectRecipe,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    getRecipeById,
    searchRecipes,
    calculateRecipeNutrition,
    calculateRecipePH
  }), [state, filteredRecipes]);

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
}