import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useFood } from './FoodContext';
import { useRecipe } from './RecipeContext';
import { generateShoppingList } from '../services/shoppingListGenerator';

// Context initial
const MealPlanContext = createContext();

// État initial
const initialState = {
  mealPlans: [],
  currentPlan: null,
  shoppingList: null,
  isGenerating: false,
  error: null,
  filterWeek: null // Permet de filtrer les repas par semaine
};

// Actions
const actions = {
  LOAD_MEAL_PLANS: 'LOAD_MEAL_PLANS',
  LOAD_MEAL_PLANS_SUCCESS: 'LOAD_MEAL_PLANS_SUCCESS',
  LOAD_MEAL_PLANS_ERROR: 'LOAD_MEAL_PLANS_ERROR',
  CREATE_PLAN: 'CREATE_PLAN',
  UPDATE_PLAN: 'UPDATE_PLAN',
  DELETE_PLAN: 'DELETE_PLAN',
  SET_CURRENT_PLAN: 'SET_CURRENT_PLAN',
  ADD_MEAL: 'ADD_MEAL',
  UPDATE_MEAL: 'UPDATE_MEAL',
  DELETE_MEAL: 'DELETE_MEAL',
  GENERATE_SHOPPING_LIST: 'GENERATE_SHOPPING_LIST',
  GENERATE_SHOPPING_LIST_SUCCESS: 'GENERATE_SHOPPING_LIST_SUCCESS',
  GENERATE_SHOPPING_LIST_ERROR: 'GENERATE_SHOPPING_LIST_ERROR',
  UPDATE_SHOPPING_ITEM: 'UPDATE_SHOPPING_ITEM',
  SET_FILTER_WEEK: 'SET_FILTER_WEEK',
  CLEAR_FILTER_WEEK: 'CLEAR_FILTER_WEEK'
};

// Reducer
function mealPlanReducer(state, action) {
  switch (action.type) {
    case actions.LOAD_MEAL_PLANS:
      return {
        ...state,
        isGenerating: true,
        error: null
      };
    
    case actions.LOAD_MEAL_PLANS_SUCCESS:
      return {
        ...state,
        mealPlans: action.payload,
        isGenerating: false,
        error: null
      };
    
    case actions.LOAD_MEAL_PLANS_ERROR:
      return {
        ...state,
        isGenerating: false,
        error: action.payload
      };
    
    case actions.CREATE_PLAN:
      return {
        ...state,
        mealPlans: [...state.mealPlans, action.payload],
        currentPlan: action.payload
      };
    
    case actions.UPDATE_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.map(plan => 
          plan.id === action.payload.id ? action.payload : plan
        ),
        currentPlan: state.currentPlan?.id === action.payload.id 
          ? action.payload 
          : state.currentPlan
      };
    
    case actions.DELETE_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.filter(plan => plan.id !== action.payload),
        currentPlan: state.currentPlan?.id === action.payload ? null : state.currentPlan,
        shoppingList: state.currentPlan?.id === action.payload ? null : state.shoppingList
      };
    
    case actions.SET_CURRENT_PLAN:
      return {
        ...state,
        currentPlan: action.payload,
        // Réinitialiser la liste de courses lorsqu'on change de plan
        shoppingList: null
      };
    
    case actions.ADD_MEAL:
      // On récupère le plan à mettre à jour
      const planToAddMeal = state.mealPlans.find(p => p.id === action.payload.planId);
      if (!planToAddMeal) return state;
      
      // On clone le plan et on ajoute le repas au jour spécifié
      const updatedPlanWithNewMeal = {
        ...planToAddMeal,
        days: planToAddMeal.days.map((day, index) => {
          if (index === action.payload.dayIndex) {
            return {
              ...day,
              meals: [...day.meals, {
                id: action.payload.meal.id || `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...action.payload.meal
              }]
            };
          }
          return day;
        })
      };
      
      return {
        ...state,
        mealPlans: state.mealPlans.map(plan => 
          plan.id === action.payload.planId ? updatedPlanWithNewMeal : plan
        ),
        currentPlan: state.currentPlan?.id === action.payload.planId 
          ? updatedPlanWithNewMeal 
          : state.currentPlan
      };
    
    case actions.UPDATE_MEAL:
      // On récupère le plan à mettre à jour
      const planToUpdateMeal = state.mealPlans.find(p => p.id === action.payload.planId);
      if (!planToUpdateMeal) return state;
      
      // On clone le plan et on met à jour le repas
      const updatedPlanWithUpdatedMeal = {
        ...planToUpdateMeal,
        days: planToUpdateMeal.days.map((day, dayIndex) => {
          if (dayIndex === action.payload.dayIndex) {
            return {
              ...day,
              meals: day.meals.map(meal => 
                meal.id === action.payload.mealId 
                  ? { ...meal, ...action.payload.updatedMeal }
                  : meal
              )
            };
          }
          return day;
        })
      };
      
      return {
        ...state,
        mealPlans: state.mealPlans.map(plan => 
          plan.id === action.payload.planId ? updatedPlanWithUpdatedMeal : plan
        ),
        currentPlan: state.currentPlan?.id === action.payload.planId 
          ? updatedPlanWithUpdatedMeal 
          : state.currentPlan
      };
    
    case actions.DELETE_MEAL:
      // On récupère le plan à mettre à jour
      const planToDeleteMeal = state.mealPlans.find(p => p.id === action.payload.planId);
      if (!planToDeleteMeal) return state;
      
      // On clone le plan et on supprime le repas
      const updatedPlanWithDeletedMeal = {
        ...planToDeleteMeal,
        days: planToDeleteMeal.days.map((day, dayIndex) => {
          if (dayIndex === action.payload.dayIndex) {
            return {
              ...day,
              meals: day.meals.filter(meal => meal.id !== action.payload.mealId)
            };
          }
          return day;
        })
      };
      
      return {
        ...state,
        mealPlans: state.mealPlans.map(plan => 
          plan.id === action.payload.planId ? updatedPlanWithDeletedMeal : plan
        ),
        currentPlan: state.currentPlan?.id === action.payload.planId 
          ? updatedPlanWithDeletedMeal 
          : state.currentPlan
      };
    
    case actions.GENERATE_SHOPPING_LIST:
      return {
        ...state,
        isGenerating: true,
        error: null
      };
    
    case actions.GENERATE_SHOPPING_LIST_SUCCESS:
      return {
        ...state,
        shoppingList: action.payload,
        isGenerating: false,
        error: null
      };
    
    case actions.GENERATE_SHOPPING_LIST_ERROR:
      return {
        ...state,
        isGenerating: false,
        error: action.payload
      };
    
    case actions.UPDATE_SHOPPING_ITEM:
      if (!state.shoppingList) return state;
      
      return {
        ...state,
        shoppingList: {
          ...state.shoppingList,
          categories: {
            ...state.shoppingList.categories,
            [action.payload.category]: state.shoppingList.categories[action.payload.category].map(item => 
              item.id === action.payload.itemId 
                ? { ...item, checked: action.payload.checked }
                : item
            )
          }
        }
      };
    
    case actions.SET_FILTER_WEEK:
      return {
        ...state,
        filterWeek: action.payload
      };
    
    case actions.CLEAR_FILTER_WEEK:
      return {
        ...state,
        filterWeek: null
      };
    
    default:
      return state;
  }
}

// Provider
export function MealPlanProvider({ children }) {
  const [state, dispatch] = useReducer(mealPlanReducer, initialState);
  const { foods } = useFood();
  const { recipes } = useRecipe();
  
  // Charger les plans de repas depuis le localStorage au démarrage
  useEffect(() => {
    dispatch({ type: actions.LOAD_MEAL_PLANS });
    
    try {
      const savedPlans = localStorage.getItem('keto-meal-planner-meal-plans');
      if (savedPlans) {
        const parsedPlans = JSON.parse(savedPlans);
        dispatch({ type: actions.LOAD_MEAL_PLANS_SUCCESS, payload: parsedPlans });
        
        // Récupérer le plan actif s'il existe
        const currentPlanId = localStorage.getItem('keto-meal-planner-current-plan-id');
        if (currentPlanId) {
          const currentPlan = parsedPlans.find(plan => plan.id === currentPlanId);
          if (currentPlan) {
            dispatch({ type: actions.SET_CURRENT_PLAN, payload: currentPlan });
          }
        }
      } else {
        dispatch({ type: actions.LOAD_MEAL_PLANS_SUCCESS, payload: [] });
      }
    } catch (error) {
      dispatch({ 
        type: actions.LOAD_MEAL_PLANS_ERROR, 
        payload: "Erreur lors du chargement des plans de repas: " + error.message 
      });
    }
  }, []);
  
  // Sauvegarder les plans de repas dans localStorage à chaque modification
  useEffect(() => {
    if (state.mealPlans.length > 0) {
      localStorage.setItem('keto-meal-planner-meal-plans', JSON.stringify(state.mealPlans));
    }
    
    // Sauvegarder le plan actif
    if (state.currentPlan) {
      localStorage.setItem('keto-meal-planner-current-plan-id', state.currentPlan.id);
    } else {
      localStorage.removeItem('keto-meal-planner-current-plan-id');
    }
  }, [state.mealPlans, state.currentPlan]);
  
  // Créer un nouveau plan de repas vide
  const createEmptyPlan = (name, startDate, endDate, dietType) => {
    // Calculer le nombre de jours dans le plan
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Créer un tableau de jours vides
    const days = [];
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      
      days.push({
        date: date.toISOString().split('T')[0], // Format YYYY-MM-DD
        meals: []
      });
    }
    
    // Créer le plan complet
    const newPlan = {
      id: `plan-${Date.now()}`,
      name,
      startDate,
      endDate,
      dietType, // 'keto_standard' ou 'keto_alcalin'
      days,
      createdAt: new Date().toISOString()
    };
    
    dispatch({ type: actions.CREATE_PLAN, payload: newPlan });
    return newPlan.id;
  };
  
  // Mettre à jour un plan existant
  const updatePlan = (planId, updates) => {
    const plan = state.mealPlans.find(p => p.id === planId);
    if (!plan) return null;
    
    const updatedPlan = { ...plan, ...updates };
    dispatch({ type: actions.UPDATE_PLAN, payload: updatedPlan });
    return updatedPlan;
  };
  
  // Supprimer un plan
  const deletePlan = (planId) => {
    dispatch({ type: actions.DELETE_PLAN, payload: planId });
  };
  
  // Définir le plan actif
  const setCurrentPlan = (planId) => {
    const plan = state.mealPlans.find(p => p.id === planId);
    dispatch({ type: actions.SET_CURRENT_PLAN, payload: plan || null });
    return plan;
  };
  
  // Ajouter un repas à un jour spécifique
  const addMeal = (planId, dayIndex, meal) => {
    const mealId = `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({ 
      type: actions.ADD_MEAL, 
      payload: { planId, dayIndex, meal: { ...meal, id: mealId } }
    });
    return mealId;
  };
  
  // Mettre à jour un repas existant
  const updateMeal = (planId, dayIndex, mealId, updatedMeal) => {
    dispatch({ 
      type: actions.UPDATE_MEAL, 
      payload: { planId, dayIndex, mealId, updatedMeal }
    });
  };
  
  // Supprimer un repas
  const deleteMeal = (planId, dayIndex, mealId) => {
    dispatch({ 
      type: actions.DELETE_MEAL, 
      payload: { planId, dayIndex, mealId }
    });
  };
  
  // Générer une liste de courses à partir d'un plan
  const generateShoppingListFromPlan = (planId) => {
    dispatch({ type: actions.GENERATE_SHOPPING_LIST });
    
    try {
      const plan = state.mealPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error("Plan de repas non trouvé");
      }
      
      // Utiliser le service de génération de liste de courses
      const list = generateShoppingList(plan, foods, recipes);
      
      dispatch({ type: actions.GENERATE_SHOPPING_LIST_SUCCESS, payload: list });
      return list;
    } catch (error) {
      dispatch({ 
        type: actions.GENERATE_SHOPPING_LIST_ERROR, 
        payload: "Erreur lors de la génération de la liste de courses: " + error.message 
      });
      return null;
    }
  };
  
  // Mettre à jour l'état coché d'un élément de la liste de courses
  const updateShoppingItem = (category, itemId, checked) => {
    dispatch({ 
      type: actions.UPDATE_SHOPPING_ITEM, 
      payload: { category, itemId, checked }
    });
  };
  
  // Calculer les totaux nutritionnels pour un jour
  const getDayNutritionTotals = (planId, dayIndex) => {
    const plan = state.mealPlans.find(p => p.id === planId);
    if (!plan || !plan.days[dayIndex]) return null;
    
    const day = plan.days[dayIndex];
    
    // Initialiser les totaux
    const totals = {
      calories: 0,
      macros: {
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        netCarbs: 0
      },
      pHValue: 0,
      mealCount: day.meals.length
    };
    
    // Si aucun repas, retourner les totaux vides
    if (day.meals.length === 0) return totals;
    
    // Calculer les totaux pour chaque repas
    day.meals.forEach(meal => {
      // Ajouter les calories
      totals.calories += meal.calories || 0;
      
      // Ajouter les macros
      if (meal.macros) {
        totals.macros.protein += meal.macros.protein || 0;
        totals.macros.fat += meal.macros.fat || 0;
        totals.macros.carbs += meal.macros.carbs || 0;
        totals.macros.fiber += meal.macros.fiber || 0;
        totals.macros.netCarbs += meal.macros.netCarbs || 0;
      }
      
      // Ajouter le pH pondéré par les calories
      if (meal.pHValue) {
        totals.pHValue += (meal.pHValue * (meal.calories || 0));
      }
    });
    
    // Calculer la moyenne du pH
    if (totals.calories > 0) {
      totals.pHValue = totals.pHValue / totals.calories;
    } else {
      totals.pHValue = 7.0; // pH neutre par défaut
    }
    
    // Calculer les ratios de macronutriments (en % des calories)
    const proteinCalories = totals.macros.protein * 4;
    const fatCalories = totals.macros.fat * 9;
    const carbCalories = totals.macros.netCarbs * 4;
    const totalCalories = proteinCalories + fatCalories + carbCalories;
    
    totals.macroRatios = {
      protein: totalCalories > 0 ? Math.round((proteinCalories / totalCalories) * 100) : 0,
      fat: totalCalories > 0 ? Math.round((fatCalories / totalCalories) * 100) : 0,
      carbs: totalCalories > 0 ? Math.round((carbCalories / totalCalories) * 100) : 0
    };
    
    // Arrondir les valeurs numériques pour plus de lisibilité
    totals.calories = Math.round(totals.calories);
    totals.macros.protein = Math.round(totals.macros.protein * 10) / 10;
    totals.macros.fat = Math.round(totals.macros.fat * 10) / 10;
    totals.macros.carbs = Math.round(totals.macros.carbs * 10) / 10;
    totals.macros.fiber = Math.round(totals.macros.fiber * 10) / 10;
    totals.macros.netCarbs = Math.round(totals.macros.netCarbs * 10) / 10;
    totals.pHValue = Math.round(totals.pHValue * 10) / 10;
    
    return totals;
  };
  
  // Définir le filtre de semaine
  const setFilterWeek = (weekStart) => {
    dispatch({ type: actions.SET_FILTER_WEEK, payload: weekStart });
  };
  
  // Effacer le filtre de semaine
  const clearFilterWeek = () => {
    dispatch({ type: actions.CLEAR_FILTER_WEEK });
  };
  
  // Ensemble des valeurs et fonctions exposées par le contexte
  const value = {
    ...state,
    createEmptyPlan,
    updatePlan,
    deletePlan,
    setCurrentPlan,
    addMeal,
    updateMeal,
    deleteMeal,
    generateShoppingListFromPlan,
    updateShoppingItem,
    getDayNutritionTotals,
    setFilterWeek,
    clearFilterWeek
  };
  
  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error("useMealPlan doit être utilisé à l'intérieur d'un MealPlanProvider");
  }
  return context;
}
