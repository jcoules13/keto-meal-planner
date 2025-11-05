import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { generateShoppingList } from '../utils/shoppingListGenerator';
import { calculateDailyTotals, updateMealNutrition } from '../utils/mealNutritionCalculator';
import {
  validateMealPlan,
  validateNutritionalTargets,
  analyzePlanMacroAchievement
} from '../utils/mealPlanUtils';
// Contexts imports removed to break circular dependencies
// Components using MealPlanContext should import UserContext, FoodContext, RecipeContext separately if needed

// Fonction pour obtenir le nom d'affichage d'un type de repas
const getMealLabel = (mealTypeId) => {
  const mealLabels = {
    'petit_dejeuner': 'Petit déjeuner',
    'collation_matin': 'Collation du matin',
    'dejeuner': 'Déjeuner',
    'collation_aprem': 'Collation après-midi',
    'souper': 'Souper',    
  };
  
  return mealLabels[mealTypeId] || mealTypeId;
};

// Fonction pour obtenir l'ordre d'un type de repas
const getMealOrder = (mealTypeId) => {
  const mealOrders = {
    'petit_dejeuner': 1,
    'collation_matin': 2,
    'dejeuner': 3,
    'collation_aprem': 4,
    'souper': 5,    
  };
  
  return mealOrders[mealTypeId] || 99; // 99 comme valeur par défaut
};

// État initial
const initialState = {
  mealPlans: [],         // Liste des plans de repas
  currentPlanId: null,   // ID du plan de repas actif/sélectionné
  shoppingList: null,    // Liste de courses générée
  isGenerating: false,   // État de génération en cours
  error: null,           // Erreurs éventuelles
};

// Actions
const actions = {
  LOAD_MEAL_PLANS: 'LOAD_MEAL_PLANS',
  LOAD_MEAL_PLANS_SUCCESS: 'LOAD_MEAL_PLANS_SUCCESS',
  LOAD_MEAL_PLANS_ERROR: 'LOAD_MEAL_PLANS_ERROR',
  CREATE_MEAL_PLAN: 'CREATE_MEAL_PLAN',
  UPDATE_MEAL_PLAN: 'UPDATE_MEAL_PLAN',
  DELETE_MEAL_PLAN: 'DELETE_MEAL_PLAN',
  SELECT_MEAL_PLAN: 'SELECT_MEAL_PLAN',
  ADD_MEAL: 'ADD_MEAL',
  UPDATE_MEAL: 'UPDATE_MEAL',
  DELETE_MEAL: 'DELETE_MEAL',
  GENERATE_SHOPPING_LIST_START: 'GENERATE_SHOPPING_LIST_START',
  GENERATE_SHOPPING_LIST_SUCCESS: 'GENERATE_SHOPPING_LIST_SUCCESS',
  GENERATE_SHOPPING_LIST_ERROR: 'GENERATE_SHOPPING_LIST_ERROR',
  UPDATE_SHOPPING_ITEM: 'UPDATE_SHOPPING_ITEM',
  CLEAR_SHOPPING_LIST: 'CLEAR_SHOPPING_LIST',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
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
        isGenerating: false
      };
    
    case actions.LOAD_MEAL_PLANS_ERROR:
      return {
        ...state,
        isGenerating: false,
        error: action.payload
      };
    
    case actions.CREATE_MEAL_PLAN:
      return {
        ...state,
        mealPlans: [...state.mealPlans, action.payload],
        currentPlanId: action.payload.id
      };
    
    case actions.UPDATE_MEAL_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.map(plan => 
          plan.id === action.payload.id ? action.payload : plan
        )
      };
    
    case actions.DELETE_MEAL_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.filter(plan => plan.id !== action.payload),
        currentPlanId: state.currentPlanId === action.payload ? null : state.currentPlanId,
        // Si le plan supprimé est celui associé à la liste de courses, supprimer la liste aussi
        shoppingList: state.shoppingList && state.shoppingList.planId === action.payload 
          ? null 
          : state.shoppingList
      };
    
    case actions.SELECT_MEAL_PLAN:
      return {
        ...state,
        currentPlanId: action.payload
      };
    
    case actions.ADD_MEAL: {
      const { planId, dayIndex, meal } = action.payload;
      
      return {
        ...state,
        mealPlans: state.mealPlans.map(plan => {
          if (plan.id !== planId) return plan;
          
          const updatedDays = [...plan.days];
          // S'assurer que le jour existe
          if (!updatedDays[dayIndex]) {
            throw new Error(`Le jour d'index ${dayIndex} n'existe pas dans ce plan`);
          }
          
          updatedDays[dayIndex] = {
            ...updatedDays[dayIndex],
            meals: [...updatedDays[dayIndex].meals, meal]
          };
          
          return {
            ...plan,
            days: updatedDays
          };
        })
      };
    }
    
    case actions.UPDATE_MEAL: {
      const { planId, dayIndex, mealId, updatedMeal } = action.payload;
      
      return {
        ...state,
        mealPlans: state.mealPlans.map(plan => {
          if (plan.id !== planId) return plan;
          
          const updatedDays = [...plan.days];
          // S'assurer que le jour existe
          if (!updatedDays[dayIndex]) {
            throw new Error(`Le jour d'index ${dayIndex} n'existe pas dans ce plan`);
          }
          
          updatedDays[dayIndex] = {
            ...updatedDays[dayIndex],
            meals: updatedDays[dayIndex].meals.map(meal => 
              meal.id === mealId ? updatedMeal : meal
            )
          };
          
          return {
            ...plan,
            days: updatedDays
          };
        })
      };
    }
    
    case actions.DELETE_MEAL: {
      const { planId, dayIndex, mealId } = action.payload;
      
      return {
        ...state,
        mealPlans: state.mealPlans.map(plan => {
          if (plan.id !== planId) return plan;
          
          const updatedDays = [...plan.days];
          // S'assurer que le jour existe
          if (!updatedDays[dayIndex]) {
            throw new Error(`Le jour d'index ${dayIndex} n'existe pas dans ce plan`);
          }
          
          updatedDays[dayIndex] = {
            ...updatedDays[dayIndex],
            meals: updatedDays[dayIndex].meals.filter(meal => meal.id !== mealId)
          };
          
          return {
            ...plan,
            days: updatedDays
          };
        })
      };
    }
    
    case actions.GENERATE_SHOPPING_LIST_START:
      return {
        ...state,
        isGenerating: true,
        error: null
      };
    
    case actions.GENERATE_SHOPPING_LIST_SUCCESS:
      return {
        ...state,
        shoppingList: action.payload,
        isGenerating: false
      };
    
    case actions.GENERATE_SHOPPING_LIST_ERROR:
      return {
        ...state,
        isGenerating: false,
        error: action.payload
      };
    
    case actions.UPDATE_SHOPPING_ITEM: {
      const { categoryKey, foodId, checked } = action.payload;
      
      if (!state.shoppingList) return state;
      
      return {
        ...state,
        shoppingList: {
          ...state.shoppingList,
          categories: {
            ...state.shoppingList.categories,
            [categoryKey]: state.shoppingList.categories[categoryKey].map(item => 
              item.id === foodId ? { ...item, checked } : item
            )
          }
        }
      };
    }
    
    case actions.CLEAR_SHOPPING_LIST:
      return {
        ...state,
        shoppingList: null
      };
    
    case actions.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    
    case actions.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}
// Création du contexte
const MealPlanContext = createContext();

// Hook personnalisé pour utiliser le contexte
export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan doit être utilisé à l\'intérieur d\'un MealPlanProvider');
  }
  return context;
}

// Provider
export function MealPlanProvider({ children }) {
  const [state, dispatch] = useReducer(mealPlanReducer, initialState);
  
  // Charger les plans de repas depuis localStorage au démarrage
  useEffect(() => {
    dispatch({ type: actions.LOAD_MEAL_PLANS });
    
    try {
      const savedMealPlans = localStorage.getItem('keto-meal-planner-meal-plans');
      if (savedMealPlans) {
        const parsedMealPlans = JSON.parse(savedMealPlans);
        dispatch({ type: actions.LOAD_MEAL_PLANS_SUCCESS, payload: parsedMealPlans });
        
        // Restaurer le plan actif s'il existe
        const currentPlanId = localStorage.getItem('keto-meal-planner-current-plan-id');
        if (currentPlanId && parsedMealPlans.some(plan => plan.id === currentPlanId)) {
          dispatch({ type: actions.SELECT_MEAL_PLAN, payload: currentPlanId });
        }
      } else {
        dispatch({ type: actions.LOAD_MEAL_PLANS_SUCCESS, payload: [] });
      }
      
      // Restaurer la liste de courses si elle existe
      const savedShoppingList = localStorage.getItem('keto-meal-planner-shopping-list');
      if (savedShoppingList) {
        const parsedShoppingList = JSON.parse(savedShoppingList);
        dispatch({ 
          type: actions.GENERATE_SHOPPING_LIST_SUCCESS, 
          payload: parsedShoppingList 
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des plans de repas:', error);
      dispatch({ 
        type: actions.LOAD_MEAL_PLANS_ERROR, 
        payload: `Erreur lors du chargement: ${error.message}` 
      });
    }
  }, []);
  
  // Sauvegarder les plans de repas dans localStorage à chaque changement
  useEffect(() => {
    // Debounce pour éviter sauvegardes excessives et boucles infinies
    const timeoutId = setTimeout(() => {
      if (state.mealPlans.length > 0) {
        localStorage.setItem('keto-meal-planner-meal-plans', JSON.stringify(state.mealPlans));
      }

      if (state.currentPlanId) {
        localStorage.setItem('keto-meal-planner-current-plan-id', state.currentPlanId);
      } else {
        localStorage.removeItem('keto-meal-planner-current-plan-id');
      }

      if (state.shoppingList) {
        localStorage.setItem('keto-meal-planner-shopping-list', JSON.stringify(state.shoppingList));
      } else {
        localStorage.removeItem('keto-meal-planner-shopping-list');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    state.currentPlanId,
    JSON.stringify(state.mealPlans),
    JSON.stringify(state.shoppingList)
  ]);
  
  // Obtenir le plan actif
  const getCurrentPlan = () => {
    if (!state.currentPlanId) return null;
    return state.mealPlans.find(plan => plan.id === state.currentPlanId) || null;
  };
// Créer un nouveau plan de repas avec validation simplifiée (pas de dépendances context)
  const createMealPlan = (planData) => {
    try {
      const newPlan = {
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...planData,
        days: planData.days || []
      };

      // Valider la structure du plan
      const validationResult = validateMealPlan(newPlan);
      if (!validationResult.valid) {
        throw new Error(`Plan de repas invalide: ${validationResult.error}`);
      }

      dispatch({ type: actions.CREATE_MEAL_PLAN, payload: newPlan });
      return newPlan.id;
    } catch (error) {
      dispatch({ type: actions.SET_ERROR, payload: error.message });
      return null;
    }
  };
  
  // Mettre à jour un plan existant (version simplifiée)
  const updateMealPlan = (planId, updatedData) => {
    try {
      const existingPlan = state.mealPlans.find(plan => plan.id === planId);
      if (!existingPlan) {
        throw new Error(`Le plan avec l'ID ${planId} n'existe pas`);
      }

      const updatedPlan = {
        ...existingPlan,
        ...updatedData,
        updatedAt: new Date().toISOString()
      };

      // Valider la structure du plan
      const validationResult = validateMealPlan(updatedPlan);
      if (!validationResult.valid) {
        throw new Error(`Plan de repas invalide: ${validationResult.error}`);
      }

      dispatch({ type: actions.UPDATE_MEAL_PLAN, payload: updatedPlan });
      return true;
    } catch (error) {
      dispatch({ type: actions.SET_ERROR, payload: error.message });
      return false;
    }
  };
  
  // Supprimer un plan
  const deleteMealPlan = (planId) => {
    try {
      const existingPlan = state.mealPlans.find(plan => plan.id === planId);
      if (!existingPlan) {
        throw new Error(`Le plan avec l'ID ${planId} n'existe pas`);
      }
      
      dispatch({ type: actions.DELETE_MEAL_PLAN, payload: planId });
      return true;
    } catch (error) {
      dispatch({ type: actions.SET_ERROR, payload: error.message });
      return false;
    }
  };
  
  // Sélectionner un plan actif
  const selectMealPlan = (planId) => {
    try {
      // Accepter null pour désélectionner
      if (planId === null) {
        dispatch({ type: actions.SELECT_MEAL_PLAN, payload: null });
        return true;
      }
      
      const existingPlan = state.mealPlans.find(plan => plan.id === planId);
      if (!existingPlan) {
        throw new Error(`Le plan avec l'ID ${planId} n'existe pas`);
      }
      
      dispatch({ type: actions.SELECT_MEAL_PLAN, payload: planId });
      return true;
    } catch (error) {
      dispatch({ type: actions.SET_ERROR, payload: error.message });
      return false;
    }
  };
// Ajouter un repas à un jour du plan avec validation des objectifs protéiques
  const addMeal = (planId, dayIndex, meal) => {
    try {
      const existingPlan = state.mealPlans.find(plan => plan.id === planId);
      if (!existingPlan) {
        throw new Error(`Le plan avec l'ID ${planId} n'existe pas`);
      }
      
      if (!existingPlan.days[dayIndex]) {
        throw new Error(`Le jour d'index ${dayIndex} n'existe pas dans ce plan`);
      }
      
      // Générer un ID unique pour le repas
      const mealWithId = {
        ...meal,
        id: meal.id || `meal-${Date.now()}-${Math.round(Math.random() * 1000)}`
      };
      
      // Vérifier si l'ajout de ce repas respecte toujours les objectifs protéiques
      const updatedMeals = [...existingPlan.days[dayIndex].meals, mealWithId];
      const simulatedDay = {
        ...existingPlan.days[dayIndex],
        meals: updatedMeals
      };
      
      // Calculer les totaux nutritionnels du jour simulé
      const dayTotals = calculateDailyTotals(simulatedDay, { getFoodById, getRecipeById });
      
      // Vérifier si les objectifs de macros sont atteints, en particulier les protéines
      const nutritionValidation = validateNutritionalTargets(
        dayTotals, 
        macroTargets, 
        existingPlan.ketoProfile || ketoProfile
      );
      
      if (!nutritionValidation.valid) {
        // Au lieu de bloquer l'ajout, simplement avertir
        console.warn(`Attention: ${nutritionValidation.error}`);
      }
      
      dispatch({ 
        type: actions.ADD_MEAL, 
        payload: { planId, dayIndex, meal: mealWithId } 
      });
      
      return mealWithId.id;
    } catch (error) {
      dispatch({ type: actions.SET_ERROR, payload: error.message });
      return null;
    }
  };
  
  // Mettre à jour un repas avec validation des objectifs protéiques
  const updateMeal = (planId, dayIndex, mealId, updatedMeal) => {
    try {
      const existingPlan = state.mealPlans.find(plan => plan.id === planId);
      if (!existingPlan) {
        throw new Error(`Le plan avec l'ID ${planId} n'existe pas`);
      }
      
      if (!existingPlan.days[dayIndex]) {
        throw new Error(`Le jour d'index ${dayIndex} n'existe pas dans ce plan`);
      }
      
      const mealExists = existingPlan.days[dayIndex].meals.some(m => m.id === mealId);
      if (!mealExists) {
        throw new Error(`Le repas avec l'ID ${mealId} n'existe pas dans ce jour`);
      }
      
      // Vérifier si la mise à jour du repas respecte toujours les objectifs protéiques
      const updatedMeals = existingPlan.days[dayIndex].meals.map(meal => 
        meal.id === mealId ? { ...updatedMeal, id: mealId } : meal
      );
      
      const simulatedDay = {
        ...existingPlan.days[dayIndex],
        meals: updatedMeals
      };
      
      // Calculer les totaux nutritionnels du jour simulé
      const dayTotals = calculateDailyTotals(simulatedDay, { getFoodById, getRecipeById });
      
      // Vérifier si les objectifs de macros sont atteints, en particulier les protéines
      const nutritionValidation = validateNutritionalTargets(
        dayTotals, 
        macroTargets, 
        existingPlan.ketoProfile || ketoProfile
      );
      
      if (!nutritionValidation.valid) {
        // Au lieu de bloquer la mise à jour, simplement avertir
        console.warn(`Attention: ${nutritionValidation.error}`);
      }
      
      dispatch({ 
        type: actions.UPDATE_MEAL, 
        payload: { 
          planId, 
          dayIndex, 
          mealId, 
          updatedMeal: { ...updatedMeal, id: mealId } 
        } 
      });
      
      return true;
    } catch (error) {
      dispatch({ type: actions.SET_ERROR, payload: error.message });
      return false;
    }
  };
  
  // Supprimer un repas
  const deleteMeal = (planId, dayIndex, mealId) => {
    try {
      const existingPlan = state.mealPlans.find(plan => plan.id === planId);
      if (!existingPlan) {
        throw new Error(`Le plan avec l'ID ${planId} n'existe pas`);
      }
      
      if (!existingPlan.days[dayIndex]) {
        throw new Error(`Le jour d'index ${dayIndex} n'existe pas dans ce plan`);
      }
      
      const mealExists = existingPlan.days[dayIndex].meals.some(m => m.id === mealId);
      if (!mealExists) {
        throw new Error(`Le repas avec l'ID ${mealId} n'existe pas dans ce jour`);
      }
      
      dispatch({ 
        type: actions.DELETE_MEAL, 
        payload: { planId, dayIndex, mealId } 
      });
      
      return true;
    } catch (error) {
      dispatch({ type: actions.SET_ERROR, payload: error.message });
      return false;
    }
  };
/**
 * Ajoute un repas au plan actuellement sélectionné
 * @param {Object} meal - Le repas à ajouter (structure complète du repas)
 * @param {number} dayIndex - Index du jour dans le plan (0-6 pour une semaine)
 * @param {string} mealType - Type de repas (déjeuner, dîner, etc.)
 * @returns {string|null} ID du repas ajouté ou null en cas d'erreur
 */
  const addMealToCurrentPlan = (meal, dayIndex, mealType = 'repas') => {
    try {
      // Vérifier qu'un plan est sélectionné
      if (!state.currentPlanId) {
        throw new Error('Aucun plan n\'est sélectionné. Veuillez d\'abord créer ou sélectionner un plan.');
      }
      
      const currentPlan = state.mealPlans.find(plan => plan.id === state.currentPlanId);
      if (!currentPlan) {
        throw new Error('Le plan sélectionné n\'existe plus.');
      }
      
      // Vérifier que l'index du jour est valide
      if (dayIndex < 0 || dayIndex >= currentPlan.days.length) {
        throw new Error(`L'index du jour ${dayIndex} est hors limites pour ce plan.`);
      }
      
      // Normaliser le type de repas pour éviter les problèmes d'affichage
      const normalizedType = mealType.toLowerCase();
      
      // Déterminer le bon displayType en fonction du type normalisé
      let displayType = meal.displayType;
      
      if (!displayType || displayType === 'repas') {
        // Si le displayType n'est pas défini ou est générique, utiliser getMealLabel
        displayType = getMealLabel(normalizedType);
      }
      
      // Préparer le repas avec des informations additionnelles et un displayType fiable
      const preparedMeal = {
        ...meal,
        id: meal.id || `meal-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        type: normalizedType,
        displayType: displayType,
        // Utiliser l'ordre s'il existe ou le déduire du type
        order: meal.order || getMealOrder(normalizedType),
        addedAt: new Date().toISOString()
      };
      
      // Si le repas n'a pas de nom, lui en attribuer un par défaut
      if (!preparedMeal.name) {
        preparedMeal.name = `${preparedMeal.displayType} du ${
          new Date(currentPlan.days[dayIndex].date).toLocaleDateString('fr-FR')
        }`;
      }
      
      // Utiliser la fonction addMeal existante pour ajouter le repas
      return addMeal(state.currentPlanId, dayIndex, preparedMeal);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du repas au plan courant:', error);
      dispatch({ type: actions.SET_ERROR, payload: error.message });
      return null;
    }
  };
  
  // Générer une liste de courses à partir d'un plan
  const generateShoppingListFromPlan = async (planId) => {
    try {
      dispatch({ type: actions.GENERATE_SHOPPING_LIST_START });
      
      console.log("Génération de liste de courses pour le plan:", planId);
      
      const plan = state.mealPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error(`Le plan avec l'ID ${planId} n'existe pas`);
      }
      
      // Vérifier si le plan a des repas
      let hasMeals = false;
      for (const day of plan.days) {
        if (day && day.meals && day.meals.length > 0) {
          for (const meal of day.meals) {
            if (meal && meal.items && meal.items.length > 0) {
              hasMeals = true;
              break;
            }
          }
          if (hasMeals) break;
        }
      }
      
      if (!hasMeals) {
        console.warn("Le plan de repas n'a pas de meals ou d'items valides");
        throw new Error("Le plan de repas ne contient aucun repas ou aliment à ajouter à la liste de courses.");
      }
      
      // Log de débogage pour vérifier la structure du plan
      console.log("Structure du plan:", JSON.stringify({
        id: plan.id,
        name: plan.name,
        daysCount: plan.days.length,
        daysWithMeals: plan.days.filter(d => d && d.meals && d.meals.length > 0).length
      }));
      
      // Générer la liste de courses
      const shoppingList = generateShoppingList(plan, { 
        foods, 
        getFoodById, 
        recipes, 
        getRecipeById 
      });
      
      // Vérifier si la liste générée contient des catégories avec des éléments
      const categoriesCount = Object.keys(shoppingList.categories).length;
      if (categoriesCount === 0) {
        console.warn("La liste de courses générée est vide");
        throw new Error("Impossible de générer une liste de courses. Vérifiez que votre plan contient des aliments valides.");
      }
      
      console.log(`Liste de courses générée avec ${categoriesCount} catégories`);
      
      dispatch({ 
        type: actions.GENERATE_SHOPPING_LIST_SUCCESS, 
        payload: {
          ...shoppingList,
          planId,
          generatedAt: new Date().toISOString()
        } 
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la génération de la liste de courses:", error);
      dispatch({ 
        type: actions.GENERATE_SHOPPING_LIST_ERROR, 
        payload: `Erreur lors de la génération: ${error.message}` 
      });
      return false;
    }
  };
  
  // Vérifier les objectifs nutritionnels du plan, en particulier les protéines
  const validatePlanNutrition = (planId) => {
    try {
      const plan = state.mealPlans.find(p => p.id === planId);
      if (!plan) return { valid: false, error: "Plan introuvable" };
      
      // Analyser le plan complet
      const analysis = analyzePlanMacroAchievement(plan, macroTargets, { getFoodById, getRecipeById });
      
      // Log de l'analyse pour débogage
      console.log("Analyse du plan:", analysis);
      
      return {
        valid: analysis.verdict.proteinsSatisfactory && analysis.verdict.carbsWithinLimit,
        analysis: analysis,
        error: !analysis.verdict.proteinsSatisfactory 
          ? "Les objectifs protéiques ne sont pas atteints" 
          : !analysis.verdict.carbsWithinLimit 
            ? "La limite de glucides est dépassée" 
            : null
      };
    } catch (error) {
      console.error("Erreur lors de la validation du plan:", error);
      return { valid: false, error: error.message };
    }
  };
  
  // Mettre à jour un élément de la liste de courses (cocher/décocher)
  const updateShoppingItem = (categoryKey, foodId, checked) => {
    dispatch({ 
      type: actions.UPDATE_SHOPPING_ITEM, 
      payload: { categoryKey, foodId, checked } 
    });
  };
  
  // Effacer la liste de courses
  const clearShoppingList = () => {
    dispatch({ type: actions.CLEAR_SHOPPING_LIST });
  };
  
  // Réinitialiser une erreur
  const clearError = () => {
    dispatch({ type: actions.CLEAR_ERROR });
  };
  
  // Calculer les totaux nutritionnels pour un jour du plan
  const getDayNutritionTotals = (planId, dayIndex) => {
    try {
      const plan = state.mealPlans.find(p => p.id === planId);
      if (!plan) return null;
      
      const day = plan.days[dayIndex];
      if (!day) return null;
      
      // Utiliser notre nouvelle fonction de calcul des totaux nutritionnels
      return calculateDailyTotals(day, { getFoodById, getRecipeById });
    } catch (error) {
      console.error('Erreur lors du calcul des totaux nutritionnels:', error);
      return null;
    }
  };
// Créer un nouveau plan de repas vide pour une période donnée (version simplifiée)
  const createEmptyPlan = (name, startDate, endDate, dietType = 'keto_standard', advancedOptions = null) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Vérifier la validité des dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Dates invalides');
    }

    if (start > end) {
      throw new Error('La date de début doit être antérieure à la date de fin');
    }

    // Calculer le nombre de jours
    const dayCount = Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1;

    // Créer un tableau de jours vides
    const days = Array.from({ length: dayCount }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);

      return {
        date: date.toISOString().split('T')[0],
        meals: []
      };
    });

    // Créer le plan avec les paramètres de base
    const planData = {
      name,
      startDate,
      endDate,
      dietType,
      ketoProfile: advancedOptions?.ketoProfile || 'standard',
      days,
      advancedOptions
    };

    return createMealPlan(planData);
  };
  
  // Vérifier si un jour a des repas
  const hasMeals = (planId, dayIndex) => {
    const plan = state.mealPlans.find(p => p.id === planId);
    if (!plan || !plan.days[dayIndex]) return false;
    
    return plan.days[dayIndex].meals.length > 0;
  };
  
  // Obtenir le progrès de la liste de courses (pourcentage d'éléments cochés)
  const getShoppingListProgress = () => {
    if (!state.shoppingList || !state.shoppingList.categories) return 0;
    
    let totalItems = 0;
    let checkedItems = 0;
    
    Object.values(state.shoppingList.categories).forEach(category => {
      totalItems += category.length;
      checkedItems += category.filter(item => item.checked).length;
    });
    
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  };
  
  // Recalculer les macros d'un repas spécifique
  const recalculateMealNutrition = (planId, dayIndex, mealId) => {
    try {
      const plan = state.mealPlans.find(p => p.id === planId);
      if (!plan) return false;
      
      const day = plan.days[dayIndex];
      if (!day) return false;
      
      const mealIndex = day.meals.findIndex(m => m.id === mealId);
      if (mealIndex === -1) return false;
      
      // Récupérer le repas
      const meal = day.meals[mealIndex];
      
      // Mettre à jour les macros du repas
      const updatedMeal = updateMealNutrition(meal, getFoodById, getRecipeById);
      
      // Mettre à jour le repas dans le plan
      dispatch({ 
        type: actions.UPDATE_MEAL, 
        payload: { 
          planId, 
          dayIndex, 
          mealId, 
          updatedMeal
        } 
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des macros du repas:', error);
      return false;
    }
  };
  
  // Recalculer les macros de tous les repas d'un jour
  const recalculateDayNutrition = (planId, dayIndex) => {
    try {
      const plan = state.mealPlans.find(p => p.id === planId);
      if (!plan) return false;
      
      const day = plan.days[dayIndex];
      if (!day) return false;
      
      // Mettre à jour chaque repas du jour
      day.meals.forEach(meal => {
        recalculateMealNutrition(planId, dayIndex, meal.id);
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des macros du jour:', error);
      return false;
    }
  };
  
  // Recalculer les macros de tous les repas d'un plan
  const recalculatePlanNutrition = (planId) => {
    try {
      const plan = state.mealPlans.find(p => p.id === planId);
      if (!plan) return false;
      
      // Mettre à jour chaque jour du plan
      plan.days.forEach((day, index) => {
        recalculateDayNutrition(planId, index);
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des macros du plan:', error);
      return false;
    }
  };

  // Mémoiser les valeurs calculées pour éviter recalculs inutiles
  const currentPlan = useMemo(() => getCurrentPlan(), [state.currentPlanId, state.mealPlans]);
  const shoppingListProgress = useMemo(() => getShoppingListProgress(), [state.shoppingList]);

  // Construire la valeur du contexte avec useMemo pour éviter re-renders en cascade
  const value = useMemo(() => ({
    ...state,
    currentPlan,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
    selectMealPlan,
    addMeal,
    updateMeal,
    deleteMeal,
    addMealToCurrentPlan,
    generateShoppingListFromPlan,
    updateShoppingItem,
    clearShoppingList,
    clearError,
    getDayNutritionTotals,
    createEmptyPlan,
    hasMeals,
    getShoppingListProgress,
    shoppingListProgress,
    recalculateMealNutrition,
    recalculateDayNutrition,
    recalculatePlanNutrition,
    validatePlanNutrition
  }), [state, currentPlan, shoppingListProgress]);

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
}

export default MealPlanContext;
