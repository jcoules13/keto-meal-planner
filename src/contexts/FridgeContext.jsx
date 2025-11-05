import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useFood } from './FoodContext';

// État initial
const initialState = {
  selectedFoods: [], // Format: { foodId: string, quantity: number }
  lastUpdated: null,
};

// Actions
const actions = {
  ADD_FOOD: 'ADD_FOOD',
  UPDATE_FOOD_QUANTITY: 'UPDATE_FOOD_QUANTITY',
  REMOVE_FOOD: 'REMOVE_FOOD',
  CLEAR_FRIDGE: 'CLEAR_FRIDGE',
  SET_FRIDGE: 'SET_FRIDGE',
  LOAD_FRIDGE: 'LOAD_FRIDGE',
  LOAD_FRIDGE_SUCCESS: 'LOAD_FRIDGE_SUCCESS',
  LOAD_FRIDGE_ERROR: 'LOAD_FRIDGE_ERROR',
};

// Reducer
function fridgeReducer(state, action) {
  switch (action.type) {
    case actions.ADD_FOOD: {
      const { foodId, quantity } = action.payload;
      // Vérifier si l'aliment est déjà dans le frigo
      const existingIndex = state.selectedFoods.findIndex(item => item.foodId === foodId);
      
      if (existingIndex >= 0) {
        // Si l'aliment existe déjà, mettre à jour la quantité
        const updatedFoods = [...state.selectedFoods];
        updatedFoods[existingIndex] = {
          ...updatedFoods[existingIndex],
          quantity: updatedFoods[existingIndex].quantity + quantity
        };
        
        return {
          ...state,
          selectedFoods: updatedFoods,
          lastUpdated: new Date().toISOString()
        };
      } else {
        // Sinon, ajouter un nouvel aliment
        return {
          ...state,
          selectedFoods: [...state.selectedFoods, { foodId, quantity }],
          lastUpdated: new Date().toISOString()
        };
      }
    }
    
    case actions.UPDATE_FOOD_QUANTITY: {
      const { foodId, quantity } = action.payload;
      // Mettre à jour la quantité d'un aliment spécifique
      return {
        ...state,
        selectedFoods: state.selectedFoods.map(item => 
          item.foodId === foodId ? { ...item, quantity } : item
        ),
        lastUpdated: new Date().toISOString()
      };
    }
    
    case actions.REMOVE_FOOD: {
      // Supprimer un aliment du frigo
      return {
        ...state,
        selectedFoods: state.selectedFoods.filter(item => item.foodId !== action.payload),
        lastUpdated: new Date().toISOString()
      };
    }
    
    case actions.CLEAR_FRIDGE: {
      // Vider complètement le frigo
      return {
        ...state,
        selectedFoods: [],
        lastUpdated: new Date().toISOString()
      };
    }
    
    case actions.SET_FRIDGE: {
      // Définir le contenu complet du frigo
      return {
        ...state,
        selectedFoods: action.payload,
        lastUpdated: new Date().toISOString()
      };
    }
    
    case actions.LOAD_FRIDGE_SUCCESS: {
      // Charger le contenu du frigo depuis le stockage
      return {
        ...state,
        selectedFoods: action.payload.selectedFoods || [],
        lastUpdated: action.payload.lastUpdated
      };
    }
    
    default:
      return state;
  }
}

// Création du contexte
const FridgeContext = createContext();

// Hook personnalisé pour utiliser le contexte
export function useFridge() {
  const context = useContext(FridgeContext);
  if (!context) {
    throw new Error('useFridge doit être utilisé à l\'intérieur d\'un FridgeProvider');
  }
  return context;
}

// Provider
export function FridgeProvider({ children }) {
  const [state, dispatch] = useReducer(fridgeReducer, initialState);
  const { foods, getFoodById } = useFood();
  
  // Charger le contenu du frigo depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedFridge = localStorage.getItem('keto-meal-planner-fridge');
      if (savedFridge) {
        const parsedFridge = JSON.parse(savedFridge);
        dispatch({ type: actions.LOAD_FRIDGE_SUCCESS, payload: parsedFridge });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contenu du frigo:', error);
    }
  }, []);
  
  // Sauvegarder le contenu du frigo dans localStorage à chaque changement
  useEffect(() => {
    if (!state.lastUpdated) return;

    // Debounce pour éviter trop de sauvegardes et boucles infinies
    const timeoutId = setTimeout(() => {
      localStorage.setItem('keto-meal-planner-fridge', JSON.stringify({
        selectedFoods: state.selectedFoods,
        lastUpdated: state.lastUpdated
      }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    state.lastUpdated,
    JSON.stringify(state.selectedFoods)
  ]);
  
  // Ajouter un aliment au frigo
  const addFood = (foodId, quantity = 100) => {
    dispatch({ 
      type: actions.ADD_FOOD, 
      payload: { foodId, quantity } 
    });
  };
  
  // Mettre à jour la quantité d'un aliment
  const updateFoodQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeFood(foodId);
    } else {
      dispatch({ 
        type: actions.UPDATE_FOOD_QUANTITY, 
        payload: { foodId, quantity } 
      });
    }
  };
  
  // Supprimer un aliment du frigo
  const removeFood = (foodId) => {
    dispatch({ 
      type: actions.REMOVE_FOOD, 
      payload: foodId 
    });
  };
  
  // Vider complètement le frigo
  const clearFridge = () => {
    dispatch({ type: actions.CLEAR_FRIDGE });
  };
  
  // Définir le contenu complet du frigo
  const setFridge = (selectedFoods) => {
    dispatch({ 
      type: actions.SET_FRIDGE, 
      payload: selectedFoods 
    });
  };
  
  // Obtenir les détails complets d'un aliment sélectionné
  const getSelectedFoodDetails = () => {
    return state.selectedFoods.map(item => {
      const food = getFoodById(item.foodId);
      return {
        ...item,
        food
      };
    }).filter(item => item.food !== null); // Filtrer les aliments non trouvés
  };
  
  // Calculer les macronutriments totaux disponibles dans le frigo
  const calculateAvailableMacros = () => {
    const selectedFoodDetails = getSelectedFoodDetails();
    
    const macros = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      netCarbs: 0
    };
    
    selectedFoodDetails.forEach(item => {
      const { food, quantity } = item;
      const ratio = quantity / 100; // Convertir en proportion de 100g
      
      macros.calories += food.nutritionPer100g.calories * ratio;
      macros.protein += food.nutritionPer100g.protein * ratio;
      macros.fat += food.nutritionPer100g.fat * ratio;
      macros.carbs += food.nutritionPer100g.carbs * ratio;
      
      // Calculer les glucides nets si disponible
      if ('netCarbs' in food.nutritionPer100g) {
        macros.netCarbs += food.nutritionPer100g.netCarbs * ratio;
      } else if ('fiber' in food.nutritionPer100g) {
        macros.netCarbs += (food.nutritionPer100g.carbs - food.nutritionPer100g.fiber) * ratio;
      } else {
        macros.netCarbs += food.nutritionPer100g.carbs * ratio;
      }
    });
    
    // Arrondir les valeurs
    Object.keys(macros).forEach(key => {
      macros[key] = Math.round(macros[key] * 10) / 10;
    });
    
    return macros;
  };
  
  // Obtenir le nombre d'aliments dans le frigo
  const getFoodCount = () => {
    return state.selectedFoods.length;
  };
  
  // Vérifier si un aliment est dans le frigo
  const isInFridge = (foodId) => {
    return state.selectedFoods.some(item => item.foodId === foodId);
  };
  
  // Grouper les aliments par catégorie
  const getFoodsByCategory = () => {
    const selectedFoodDetails = getSelectedFoodDetails();
    
    const groupedFoods = {};
    selectedFoodDetails.forEach(item => {
      const category = item.food.category;
      if (!groupedFoods[category]) {
        groupedFoods[category] = [];
      }
      groupedFoods[category].push(item);
    });
    
    return groupedFoods;
  };
  
  // Construire la valeur du contexte
  const value = {
    selectedFoods: state.selectedFoods,
    lastUpdated: state.lastUpdated,
    selectedFoodDetails: getSelectedFoodDetails(),
    availableMacros: calculateAvailableMacros(),
    foodCount: getFoodCount(),
    addFood,
    updateFoodQuantity,
    removeFood,
    clearFridge,
    setFridge,
    isInFridge,
    foodsByCategory: getFoodsByCategory()
  };
  
  return (
    <FridgeContext.Provider value={value}>
      {children}
    </FridgeContext.Provider>
  );
}
