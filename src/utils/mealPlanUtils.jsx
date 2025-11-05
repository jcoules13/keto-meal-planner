/**
 * Utilitaires pour la gestion des plans de repas
 * Permet de valider, calculer et manipuler les plans de repas
 */

/**
 * Valide un plan de repas pour s'assurer qu'il contient toutes les propriétés requises
 * et que les objectifs nutritionnels minimaux sont atteints
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

  // Vérifier le profil keto s'il est spécifié
  if (mealPlan.ketoProfile && !["standard", "perte_poids", "prise_masse", "cyclique", "hyperproteine"].includes(mealPlan.ketoProfile)) {
    return { valid: false, error: "Profil keto invalide" };
  }

  // Validation réussie
  return { valid: true, error: null };
}

/**
 * Valide les objectifs nutritionnels d'un plan de repas, notamment les protéines
 * @param {Object} dayTotals - Totaux nutritionnels d'un jour
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {string} ketoProfile - Profil keto utilisé
 * @returns {Object} Résultat de la validation {valid: boolean, error: string}
 */
export function validateNutritionalTargets(dayTotals, targetMacros, ketoProfile = 'standard') {
  // Définir le seuil minimum pour les protéines selon le profil (95% par défaut)
  const minProteinAchievement = 0.95;
  
  // Calculer le pourcentage d'atteinte pour les protéines
  const proteinAchievement = dayTotals.protein / targetMacros.protein;
  
  // Vérifier si les protéines atteignent au moins le pourcentage minimal
  if (proteinAchievement < minProteinAchievement) {
    return {
      valid: false,
      error: `Objectif protéique non atteint (${Math.round(proteinAchievement * 100)}% < ${Math.round(minProteinAchievement * 100)}%)`,
      details: {
        target: targetMacros.protein,
        actual: dayTotals.protein,
        achievement: proteinAchievement
      }
    };
  }
  
  // Vérifier que les glucides ne dépassent pas la limite
  if (dayTotals.netCarbs > targetMacros.carbs * 1.05) { // 5% de marge
    return {
      valid: false,
      error: `Limite de glucides dépassée (${dayTotals.netCarbs}g > ${targetMacros.carbs * 1.05}g)`,
      details: {
        target: targetMacros.carbs,
        actual: dayTotals.netCarbs,
        deviation: dayTotals.netCarbs / targetMacros.carbs
      }
    };
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
 * @param {string} ketoProfile - Profil keto ('standard', 'perte_poids', 'prise_masse', etc.)
 * @returns {Object} Structure de plan de repas vide
 */
export function createEmptyPlanStructure(name, startDate, endDate, dietType = 'keto_standard', ketoProfile = 'standard') {
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
    ketoProfile,
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
  // Récupérer les besoins caloriques du profil utilisateur
  const calories = userProfile.calorieTarget || 2000;
  
  // Récupérer le profil keto de l'utilisateur
  const ketoProfile = userProfile.ketoProfile || 'standard';
  
  // Distribution selon le profil keto
  let fatPercentage, proteinPercentage, carbsPercentage;
  
  switch (ketoProfile) {
    case 'perte_poids':
      fatPercentage = 0.75; // 75%
      proteinPercentage = 0.20; // 20%
      carbsPercentage = 0.05; // 5%
      break;
    case 'prise_masse':
      fatPercentage = 0.65; // 65%
      proteinPercentage = 0.30; // 30%
      carbsPercentage = 0.05; // 5%
      break;
    case 'cyclique':
      fatPercentage = 0.70; // 70%
      proteinPercentage = 0.20; // 20%
      carbsPercentage = 0.10; // 10%
      break;
    case 'hyperproteine':
      fatPercentage = 0.40; // 40%
      proteinPercentage = 0.50; // 50%
      carbsPercentage = 0.10; // 10%
      break;
    case 'standard':
    default:
      fatPercentage = 0.75; // 75%
      proteinPercentage = 0.20; // 20%
      carbsPercentage = 0.05; // 5%
      break;
  }
  
  // Calcul des protéines avec plancher selon le profil
  const proteinG = Math.max(
    Math.round((calories * proteinPercentage) / 4),
    ketoProfile === 'prise_masse' ? 150 :
    ketoProfile === 'hyperproteine' ? 200 : 100
  );
  
  // Calories pour protéines
  const proteinCalories = proteinG * 4;
  
  // Calories restantes pour lipides et glucides
  const remainingCalories = calories - proteinCalories;
  
  // Réajuster les pourcentages sur les calories restantes
  const remainingFatRatio = fatPercentage / (fatPercentage + carbsPercentage);
  const remainingCarbsRatio = carbsPercentage / (fatPercentage + carbsPercentage);
  
  // Conversion en grammes
  const fat = Math.round((remainingCalories * remainingFatRatio) / 9);
  const carbs = Math.round((remainingCalories * remainingCarbsRatio) / 4);
  
  return {
    calories,
    fat,
    protein: proteinG,
    carbs,
    netCarbs: carbs // Équivalent dans ce contexte simplifié
  };
}

/**
 * Analyse l'adéquation d'un plan de repas par rapport aux objectifs 
 * et met l'accent sur les protéines pour les profils hyperprotéinés.
 * 
 * @param {Object} plan - Plan de repas complet
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {Object} utils - Utilitaires {getFoodById, getRecipeById}
 * @returns {Object} Résultat de l'analyse avec des statistiques détaillées sur les atteintes d'objectifs
 */
export function analyzePlanMacroAchievement(plan, targetMacros, utils) {
  // Initialiser les compteurs
  const analysis = {
    totalDays: plan.days.length,
    daysWithMeals: 0,
    proteinAchievement: {
      total: 0,
      min: Infinity,
      max: 0,
      daysAbove95Percent: 0
    },
    carbsLimit: {
      total: 0,
      daysWithinLimit: 0,
      daysExceeded: 0
    },
    dailyStats: []
  };
  
  // Analyse jour par jour
  plan.days.forEach((day, index) => {
    if (!hasMeals(day)) return;
    
    analysis.daysWithMeals++;
    
    // Calculer les totaux nutritionnels du jour
    const dayTotals = calculateDailyTotals(day, utils);
    
    // Calculer les pourcentages d'atteinte
    const proteinAchievement = dayTotals.protein / targetMacros.protein;
    const carbsRatio = dayTotals.netCarbs / targetMacros.carbs;
    
    // Mettre à jour les statistiques sur les protéines
    analysis.proteinAchievement.total += proteinAchievement;
    analysis.proteinAchievement.min = Math.min(analysis.proteinAchievement.min, proteinAchievement);
    analysis.proteinAchievement.max = Math.max(analysis.proteinAchievement.max, proteinAchievement);
    
    if (proteinAchievement >= 0.95) {
      analysis.proteinAchievement.daysAbove95Percent++;
    }
    
    // Mettre à jour les statistiques sur les glucides
    analysis.carbsLimit.total += carbsRatio;
    
    if (carbsRatio <= 1.05) {
      analysis.carbsLimit.daysWithinLimit++;
    } else {
      analysis.carbsLimit.daysExceeded++;
    }
    
    // Enregistrer les statistiques pour ce jour
    analysis.dailyStats.push({
      day: index,
      date: day.date,
      totals: dayTotals,
      achievements: {
        protein: proteinAchievement,
        carbs: carbsRatio
      }
    });
  });
  
  // Calculer les moyennes
  if (analysis.daysWithMeals > 0) {
    analysis.proteinAchievement.average = analysis.proteinAchievement.total / analysis.daysWithMeals;
    analysis.carbsLimit.average = analysis.carbsLimit.total / analysis.daysWithMeals;
  }
  
  // Verdict global
  analysis.verdict = {
    proteinsSatisfactory: analysis.proteinAchievement.daysAbove95Percent === analysis.daysWithMeals,
    carbsWithinLimit: analysis.carbsLimit.daysExceeded === 0,
    overallValid: (analysis.proteinAchievement.daysAbove95Percent === analysis.daysWithMeals) && 
                  (analysis.carbsLimit.daysExceeded === 0)
  };
  
  return analysis;
}

/**
 * Vérifie si les objectifs de macronutriments sont atteints selon le profil keto
 * @param {Object} totals - Totaux nutritionnels calculés
 * @param {Object} targets - Objectifs nutritionnels
 * @param {string} ketoProfile - Profil keto utilisé
 * @returns {Object} Résultat de la vérification avec écarts
 */
export function checkMacroTargets(totals, targets, ketoProfile = 'standard') {
  const result = {
    caloriesReached: false,
    proteinReached: false,
    fatReached: false,
    carbsReached: false,
    deviations: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    }
  };
  
  // Calculer les pourcentages d'écart
  const calorieDeviation = Math.abs((totals.calories - targets.calories) / targets.calories * 100);
  const proteinDeviation = Math.abs((totals.protein - targets.protein) / targets.protein * 100);
  const fatDeviation = Math.abs((totals.fat - targets.fat) / targets.fat * 100);
  const carbsDeviation = Math.abs((totals.netCarbs - targets.carbs) / targets.carbs * 100);
  
  // Stocker les déviations
  result.deviations = {
    calories: Math.round(calorieDeviation),
    protein: Math.round(proteinDeviation),
    fat: Math.round(fatDeviation),
    carbs: Math.round(carbsDeviation)
  };
  
  // Définir les tolérances selon le profil keto
  let proteinTolerance = 5; // Tolérance réduite à ±5% (était à 15%)
  
  if (ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine') {
    proteinTolerance = 5; // Plus restrictif sur les protéines pour ces profils
  }
  
  // Assurer que les protéines ne sont pas sous l'objectif (tolérance uniquement pour les valeurs au-dessus)
  result.proteinReached = totals.protein >= targets.protein * 0.95;
  
  // Vérifier si les objectifs sont atteints
  result.caloriesReached = calorieDeviation <= 15; // ±15% de tolérance sur les calories
  result.fatReached = fatDeviation <= 20; // ±20% de tolérance sur les lipides
  
  // Pour les glucides, ne pas dépasser l'objectif
  result.carbsReached = totals.netCarbs <= targets.carbs * 1.05;
  
  return result;
}