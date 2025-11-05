import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
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
      console.error('Erreur lors du chargement des aliments:', error);
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
  
  // Trouver un aliment par son ID
  const getFoodById = (foodId) => {
    return state.foods.find(food => food.id === foodId) || null;
  };

  // Recherche d'aliments par texte
  const searchFoods = (query) => {
    if (!query || query.trim() === '') {
      return state.foods;
    }
    
    const searchTerm = query.toLowerCase().trim();
    return state.foods.filter(food => 
      food.name.toLowerCase().includes(searchTerm) ||
      food.category.toLowerCase().includes(searchTerm)
    );
  };
  
  // Mémoiser les aliments filtrés pour éviter recalculs inutiles
  const filteredFoods = useMemo(() => getFilteredFoods(), [state.foods, state.filters]);

  // Mémoiser l'objet value pour éviter re-renders en cascade
  const value = useMemo(() => ({
    ...state,
    filteredFoods,
    setFilter,
    resetFilters,
    addCustomFood,
    updateCustomFood,
    deleteCustomFood,
    getFoodById,
    searchFoods
  }), [state, filteredFoods]);

  return (
    <FoodContext.Provider value={value}>
      {children}
    </FoodContext.Provider>
  );
}