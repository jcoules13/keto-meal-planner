/**
 * Utilitaires pour la gestion des plans de repas
 * Permet de valider, calculer et manipuler les plans de repas
 */

/**
 * Valide un plan de repas pour s'assurer qu'il contient toutes les propriétés requises
 * @param {Object} mealPlan - Plan de repas à valider
 * @returns {Object} Résultat de la validation {valid: boolean, error: string}
 */
export function validateMealPlan(mealPlan) {
  // Vérifier les propriétés requises
  if (!mealPlan.id) {
    return { valid: false, error: "ID du plan manquant" };
  }

  if (!mealPlan.startDate || !mealPlan.endDate) {
    return { valid: false, error: "Dates de début ou de fin manquantes" };
  }

  // Vérifier que la date de début est avant la date de fin
  const startDate = new Date(mealPlan.startDate);
  const endDate = new Date(mealPlan.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { valid: false, error: "Dates invalides" };
  }

  if (startDate > endDate) {
    return { 
      valid: false, 
      error: "La date de début doit être antérieure à la date de fin" 
    };
  }

  // Vérifier que le tableau days existe
  if (!Array.isArray(mealPlan.days)) {
    return { valid: false, error: "Le tableau des jours est manquant ou invalide" };
  }

  // Validation réussie
  return { valid: true, error: null };
}

/**
 * Calcule les totaux nutritionnels pour un jour du plan
 * @param {Object} day - Jour du plan contenant des repas
 * @param {Object} utils - Utilitaires {getFoodById, getRecipeById}
 * @returns {Object} Totaux nutritionnels du jour
 */
export function calculateDailyTotals(day, utils) {
  const { getFoodById, getRecipeById } = utils;
  
  // Initialiser les totaux
  const totals = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    netCarbs: 0,
    pHValue: 0 // Pour le régime alcalin
  };
  
  if (!day || !day.meals || day.meals.length === 0) {
    return totals;
  }
  
  // Somme des valeurs nutritionnelles de tous les repas
  let totalWeight = 0; // Pour calculer la moyenne pondérée du pH
  
  day.meals.forEach(meal => {
    if (!meal.items || meal.items.length === 0) {
      return;
    }
    
    meal.items.forEach(item => {
      let nutritionInfo;
      let itemWeight = 0;
      
      if (item.type === 'food') {
        // Aliment individuel
        const food = getFoodById(item.id);
        if (!food) return;
        
        const ratio = item.quantity / 100; // La nutrition est pour 100g
        nutritionInfo = {
          calories: food.nutritionPer100g.calories * ratio,
          protein: food.nutritionPer100g.protein * ratio,
          fat: food.nutritionPer100g.fat * ratio,
          carbs: food.nutritionPer100g.carbs * ratio,
          fiber: (food.nutritionPer100g.fiber || 0) * ratio,
          pHValue: food.pHValue
        };
        
        itemWeight = item.quantity;
      } else if (item.type === 'recipe') {
        // Recette
        const recipe = getRecipeById(item.id);
        if (!recipe) return;
        
        nutritionInfo = {
          calories: recipe.nutritionPerServing.calories * item.servings,
          protein: recipe.nutritionPerServing.protein * item.servings,
          fat: recipe.nutritionPerServing.fat * item.servings,
          carbs: recipe.nutritionPerServing.carbs * item.servings,
          fiber: (recipe.nutritionPerServing.fiber || 0) * item.servings,
          pHValue: recipe.averagePHValue
        };
        
        // Estimation du poids approximatif pour la pondération du pH
        itemWeight = 250 * item.servings; // ~250g par portion (approximation)
      }
      
      if (!nutritionInfo) return;
      
      // Ajouter aux totaux
      totals.calories += nutritionInfo.calories;
      totals.protein += nutritionInfo.protein;
      totals.fat += nutritionInfo.fat;
      totals.carbs += nutritionInfo.carbs;
      totals.fiber += nutritionInfo.fiber;
      
      // Calculer les glucides nets
      const itemNetCarbs = Math.max(0, nutritionInfo.carbs - nutritionInfo.fiber);
      totals.netCarbs += itemNetCarbs;
      
      // Pour la moyenne pondérée du pH
      totals.pHValue += nutritionInfo.pHValue * itemWeight;
      totalWeight += itemWeight;
    });
  });
  
  // Calculer la moyenne pondérée du pH
  if (totalWeight > 0) {
    totals.pHValue = totals.pHValue / totalWeight;
  } else {
    totals.pHValue = 7.0; // Valeur neutre par défaut
  }
  
  // Arrondir les valeurs pour plus de lisibilité
  totals.calories = Math.round(totals.calories);
  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.fiber = Math.round(totals.fiber * 10) / 10;
  totals.netCarbs = Math.round(totals.netCarbs * 10) / 10;
  totals.pHValue = Math.round(totals.pHValue * 10) / 10;
  
  return totals;
}

/**
 * Vérifie si un jour contient des repas
 * @param {Object} day - Jour du plan
 * @returns {boolean} True si le jour contient au moins un repas
 */
export function hasMeals(day) {
  return day && Array.isArray(day.meals) && day.meals.length > 0;
}

/**
 * Génère un nom par défaut pour un plan hebdomadaire
 * @param {Date} startDate - Date de début du plan
 * @param {Date} endDate - Date de fin du plan
 * @returns {string} Nom du plan au format "Plan du JJ/MM au JJ/MM"
 */
export function generatePlanName(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };
  
  return `Plan du ${formatDate(start)} au ${formatDate(end)}`;
}

/**
 * Crée une structure de base pour un plan de repas vide
 * @param {string} name - Nom du plan
 * @param {string} startDate - Date de début (format YYYY-MM-DD)
 * @param {string} endDate - Date de fin (format YYYY-MM-DD)
 * @param {string} dietType - Type de régime ('keto_standard' ou 'keto_alcalin')
 * @returns {Object} Structure de plan de repas vide
 */
export function createEmptyPlanStructure(name, startDate, endDate, dietType = 'keto_standard') {
  const id = `plan-${Date.now()}`;
  
  // Créer un tableau de jours entre startDate et endDate
  const days = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Nombre de jours
  const dayCount = Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1;
  
  for (let i = 0; i < dayCount; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    
    days.push({
      date: date.toISOString().split('T')[0], // Format YYYY-MM-DD
      meals: []
    });
  }
  
  return {
    id,
    name: name || generatePlanName(start, end),
    startDate,
    endDate,
    dietType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    days
  };
}

/**
 * Formate une date au format lisible en français
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {string} Date au format "JJ/MM/YYYY"
 */
export function formatDate(dateString) {
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Calcule les besoins caloriques en fonction d'un profil utilisateur
 * @param {Object} userProfile - Profil utilisateur
 * @returns {Object} Besoins caloriques et macronutritionnels
 */
export function calculateNutritionalNeeds(userProfile) {
  // Implémentation basée sur le contexte UserContext
  // Simulons un calcul simplifié ici
  const calories = userProfile.calorieTarget || 2000;
  
  // Distribution typique keto
  const fatPercentage = 0.75; // 75% des calories proviennent des lipides
  const proteinPercentage = 0.20; // 20% des calories proviennent des protéines
  const carbsPercentage = 0.05; // 5% des calories proviennent des glucides
  
  // Conversion en grammes
  const fat = Math.round((calories * fatPercentage) / 9); // 9 kcal/g pour les lipides
  const protein = Math.round((calories * proteinPercentage) / 4); // 4 kcal/g pour les protéines
  const carbs = Math.round((calories * carbsPercentage) / 4); // 4 kcal/g pour les glucides
  
  return {
    calories,
    fat,
    protein,
    carbs,
    netCarbs: carbs // Équivalent dans ce contexte simplifié
  };
}