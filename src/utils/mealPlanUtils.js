/**
 * Utilitaires pour les plans de repas
 */

/**
 * Valide un plan de repas
 * @param {Object} plan - Le plan de repas à valider
 * @returns {Object} Résultat de validation {valid: boolean, error: string|null}
 */
export function validateMealPlan(plan) {
  // Vérifier les champs obligatoires
  if (!plan.name || typeof plan.name !== 'string') {
    return { valid: false, error: 'Le nom du plan est obligatoire' };
  }
  
  if (!plan.startDate || !isValidDate(plan.startDate)) {
    return { valid: false, error: 'La date de début est obligatoire et doit être valide' };
  }
  
  if (!plan.endDate || !isValidDate(plan.endDate)) {
    return { valid: false, error: 'La date de fin est obligatoire et doit être valide' };
  }
  
  if (new Date(plan.startDate) > new Date(plan.endDate)) {
    return { valid: false, error: 'La date de début doit être antérieure à la date de fin' };
  }
  
  if (!plan.dietType || !['keto_standard', 'keto_alcalin'].includes(plan.dietType)) {
    return { valid: false, error: 'Le type de régime doit être keto_standard ou keto_alcalin' };
  }
  
  if (!Array.isArray(plan.days)) {
    return { valid: false, error: 'Le plan doit contenir un tableau de jours' };
  }
  
  // Vérifier chaque jour
  for (let i = 0; i < plan.days.length; i++) {
    const day = plan.days[i];
    
    if (!day.date || !isValidDate(day.date)) {
      return { valid: false, error: `Jour ${i+1}: date invalide` };
    }
    
    if (!Array.isArray(day.meals)) {
      return { valid: false, error: `Jour ${i+1}: les repas doivent être un tableau` };
    }
    
    // Vérifier chaque repas
    for (let j = 0; j < day.meals.length; j++) {
      const meal = day.meals[j];
      
      if (!meal.id) {
        return { valid: false, error: `Jour ${i+1}, Repas ${j+1}: ID manquant` };
      }
      
      if (!meal.type || typeof meal.type !== 'string') {
        return { valid: false, error: `Jour ${i+1}, Repas ${j+1}: type de repas manquant` };
      }
      
      if (!Array.isArray(meal.items) || meal.items.length === 0) {
        return { valid: false, error: `Jour ${i+1}, Repas ${j+1}: items manquants ou vides` };
      }
      
      // Vérifier chaque élément du repas
      for (let k = 0; k < meal.items.length; k++) {
        const item = meal.items[k];
        
        if (!item.type || !['recipe', 'food'].includes(item.type)) {
          return { valid: false, error: `Jour ${i+1}, Repas ${j+1}, Item ${k+1}: type invalide` };
        }
        
        if (!item.id) {
          return { valid: false, error: `Jour ${i+1}, Repas ${j+1}, Item ${k+1}: ID manquant` };
        }
        
        if (item.type === 'recipe' && (!item.servings || item.servings <= 0)) {
          return { valid: false, error: `Jour ${i+1}, Repas ${j+1}, Item ${k+1}: nombre de portions invalide` };
        }
        
        if (item.type === 'food' && (!item.quantity || item.quantity <= 0)) {
          return { valid: false, error: `Jour ${i+1}, Repas ${j+1}, Item ${k+1}: quantité invalide` };
        }
      }
    }
  }
  
  return { valid: true, error: null };
}

/**
 * Vérifie si une chaîne est une date valide au format YYYY-MM-DD
 * @param {string} dateString - La chaîne de date à vérifier
 * @returns {boolean} Vrai si la date est valide
 */
function isValidDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  
  // Vérifier le format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  
  // Vérifier que la date est valide
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  // Vérifier que la date formatée correspond à l'entrée (pour éviter les dates comme 2023-02-31)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` === dateString;
}

/**
 * Calcule les totaux nutritionnels pour un jour du plan
 * @param {Object} day - Le jour du plan
 * @param {Object} options - Options
 * @param {Function} options.getFoodById - Fonction pour obtenir un aliment par son ID
 * @param {Function} options.getRecipeById - Fonction pour obtenir une recette par son ID
 * @returns {Object} Totaux nutritionnels
 */
export function calculateDailyTotals(day, { getFoodById, getRecipeById }) {
  // Initialiser les totaux
  const totals = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    netCarbs: 0,
    macroRatios: {
      protein: 0,
      fat: 0,
      carbs: 0
    }
  };
  
  // Si le jour n'a pas de repas, retourner les totaux à zéro
  if (!day.meals || day.meals.length === 0) {
    return totals;
  }
  
  // Parcourir tous les repas
  for (const meal of day.meals) {
    // Parcourir tous les éléments du repas
    for (const item of meal.items) {
      if (item.type === 'recipe') {
        // Élément de type recette
        const recipe = getRecipeById(item.id);
        if (!recipe) continue;
        
        const servings = item.servings || 1;
        totals.calories += recipe.nutritionPerServing.calories * servings;
        totals.protein += recipe.nutritionPerServing.protein * servings;
        totals.fat += recipe.nutritionPerServing.fat * servings;
        totals.carbs += recipe.nutritionPerServing.carbs * servings;
        totals.fiber += recipe.nutritionPerServing.fiber * servings;
        totals.netCarbs += recipe.nutritionPerServing.netCarbs * servings;
      } else if (item.type === 'food') {
        // Élément de type aliment
        const food = getFoodById(item.id);
        if (!food) continue;
        
        const quantity = item.quantity || 0;
        const ratio = quantity / 100; // Les valeurs nutritionnelles sont pour 100g
        
        totals.calories += food.nutritionPer100g.calories * ratio;
        totals.protein += food.nutritionPer100g.protein * ratio;
        totals.fat += food.nutritionPer100g.fat * ratio;
        totals.carbs += food.nutritionPer100g.carbs * ratio;
        totals.fiber += food.nutritionPer100g.fiber * ratio;
        totals.netCarbs += food.nutritionPer100g.netCarbs * ratio;
      }
    }
  }
  
  // Arrondir les valeurs
  totals.calories = Math.round(totals.calories);
  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.fiber = Math.round(totals.fiber * 10) / 10;
  totals.netCarbs = Math.round(totals.netCarbs * 10) / 10;
  
  // Calculer les ratios de macronutriments en pourcentage des calories
  const proteinCalories = totals.protein * 4;  // 4 kcal/g
  const fatCalories = totals.fat * 9;          // 9 kcal/g
  const carbsCalories = totals.netCarbs * 4;   // 4 kcal/g
  const totalMacroCalories = proteinCalories + fatCalories + carbsCalories;
  
  if (totalMacroCalories > 0) {
    totals.macroRatios = {
      protein: Math.round((proteinCalories / totalMacroCalories) * 100),
      fat: Math.round((fatCalories / totalMacroCalories) * 100),
      carbs: Math.round((carbsCalories / totalMacroCalories) * 100)
    };
    
    // S'assurer que les pourcentages totalisent 100%
    const totalPercentage = totals.macroRatios.protein + totals.macroRatios.fat + totals.macroRatios.carbs;
    if (totalPercentage !== 100) {
      // Ajuster le ratio le plus élevé pour obtenir 100%
      const highestMacro = Object.entries(totals.macroRatios)
        .sort((a, b) => b[1] - a[1])[0][0];
      
      totals.macroRatios[highestMacro] += (100 - totalPercentage);
    }
  }
  
  return totals;
}

/**
 * Calcule les totaux nutritionnels pour un plan complet
 * @param {Object} plan - Le plan de repas
 * @param {Object} options - Options
 * @param {Function} options.getFoodById - Fonction pour obtenir un aliment par son ID
 * @param {Function} options.getRecipeById - Fonction pour obtenir une recette par son ID
 * @returns {Object} Totaux nutritionnels moyens par jour
 */
export function calculatePlanTotals(plan, { getFoodById, getRecipeById }) {
  // Si le plan n'a pas de jours, retourner des totaux à zéro
  if (!plan.days || plan.days.length === 0) {
    return {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      netCarbs: 0,
      macroRatios: {
        protein: 0,
        fat: 0,
        carbs: 0
      }
    };
  }
  
  // Calculer les totaux pour chaque jour
  const dailyTotals = plan.days.map(day => 
    calculateDailyTotals(day, { getFoodById, getRecipeById })
  );
  
  // Calculer les moyennes
  const averageTotals = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    netCarbs: 0,
    macroRatios: {
      protein: 0,
      fat: 0,
      carbs: 0
    }
  };
  
  // Ne pas inclure les jours vides
  const nonEmptyDays = dailyTotals.filter(dayTotal => dayTotal.calories > 0);
  
  if (nonEmptyDays.length === 0) {
    return averageTotals;
  }
  
  // Calculer les totaux
  for (const dayTotal of nonEmptyDays) {
    averageTotals.calories += dayTotal.calories;
    averageTotals.protein += dayTotal.protein;
    averageTotals.fat += dayTotal.fat;
    averageTotals.carbs += dayTotal.carbs;
    averageTotals.fiber += dayTotal.fiber;
    averageTotals.netCarbs += dayTotal.netCarbs;
    
    averageTotals.macroRatios.protein += dayTotal.macroRatios.protein;
    averageTotals.macroRatios.fat += dayTotal.macroRatios.fat;
    averageTotals.macroRatios.carbs += dayTotal.macroRatios.carbs;
  }
  
  // Diviser par le nombre de jours non vides
  const count = nonEmptyDays.length;
  averageTotals.calories = Math.round(averageTotals.calories / count);
  averageTotals.protein = Math.round((averageTotals.protein / count) * 10) / 10;
  averageTotals.fat = Math.round((averageTotals.fat / count) * 10) / 10;
  averageTotals.carbs = Math.round((averageTotals.carbs / count) * 10) / 10;
  averageTotals.fiber = Math.round((averageTotals.fiber / count) * 10) / 10;
  averageTotals.netCarbs = Math.round((averageTotals.netCarbs / count) * 10) / 10;
  
  averageTotals.macroRatios.protein = Math.round(averageTotals.macroRatios.protein / count);
  averageTotals.macroRatios.fat = Math.round(averageTotals.macroRatios.fat / count);
  averageTotals.macroRatios.carbs = Math.round(averageTotals.macroRatios.carbs / count);
  
  return averageTotals;
}

/**
 * Vérifie si un plan de repas respecte les objectifs nutritionnels
 * @param {Object} plan - Le plan de repas
 * @param {Object} userTargets - Objectifs nutritionnels de l'utilisateur
 * @param {Object} options - Options
 * @param {Function} options.getFoodById - Fonction pour obtenir un aliment par son ID
 * @param {Function} options.getRecipeById - Fonction pour obtenir une recette par son ID
 * @returns {Object} Résultats de vérification
 */
export function checkPlanAgainstTargets(plan, userTargets, { getFoodById, getRecipeById }) {
  const planTotals = calculatePlanTotals(plan, { getFoodById, getRecipeById });
  
  // Calculer les écarts par rapport aux objectifs
  const calorieDeviation = Math.abs((planTotals.calories - userTargets.calorieTarget) / userTargets.calorieTarget);
  const proteinDeviation = Math.abs((planTotals.protein - userTargets.macroTargets.protein) / userTargets.macroTargets.protein);
  const fatDeviation = Math.abs((planTotals.fat - userTargets.macroTargets.fat) / userTargets.macroTargets.fat);
  const carbsDeviation = Math.abs((planTotals.netCarbs - userTargets.macroTargets.carbs) / userTargets.macroTargets.carbs);
  
  // Vérifier si les déviations sont acceptables (±10% pour calories, ±15% pour macros)
  const isCaloriesOk = calorieDeviation <= 0.1;
  const isProteinOk = proteinDeviation <= 0.15;
  const isFatOk = fatDeviation <= 0.15;
  const isCarbsOk = carbsDeviation <= 0.15;
  
  // Vérifier les ratios keto
  const isFatRatioOk = planTotals.macroRatios.fat >= 65; // Minimum 65% des calories en lipides
  const isCarbRatioOk = planTotals.macroRatios.carbs <= 10; // Maximum 10% des calories en glucides
  
  return {
    isCaloriesOk,
    isProteinOk,
    isFatOk,
    isCarbsOk,
    isFatRatioOk,
    isCarbRatioOk,
    isKetogenic: isFatRatioOk && isCarbRatioOk,
    isWithinTargets: isCaloriesOk && isProteinOk && isFatOk && isCarbsOk,
    deviations: {
      calories: Math.round(calorieDeviation * 100),
      protein: Math.round(proteinDeviation * 100),
      fat: Math.round(fatDeviation * 100),
      carbs: Math.round(carbsDeviation * 100)
    },
    planTotals
  };
}
