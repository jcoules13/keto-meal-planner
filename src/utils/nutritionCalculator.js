/**
 * Utilitaire pour calculer les valeurs nutritionnelles
 * Utilisé pour s'assurer que les macros sont correctement calculées et affichées
 */

/**
 * Calcule les valeurs nutritionnelles d'un repas à partir de ses éléments
 * @param {Array} items - Éléments du repas (recettes ou aliments)
 * @param {Function} getFoodById - Fonction pour obtenir un aliment par son ID
 * @param {Function} getRecipeById - Fonction pour obtenir une recette par son ID
 * @returns {Object} Valeurs nutritionnelles calculées
 */
export const calculateMealNutrition = (items, getFoodById, getRecipeById) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { calories: 0, protein: 0, fat: 0, carbs: 0, netCarbs: 0 };
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

  // Additionner les contributions de chaque élément
  items.forEach(item => {
    try {
      if (item.type === 'recipe') {
        // Obtenir les infos de la recette
        const recipe = getRecipeById ? getRecipeById(item.id) : null;
        if (!recipe) return;

        // Utiliser les macros de la recette multipliées par le nombre de portions
        const servings = item.servings || 1;
        
        // Si les macros sont déjà définies dans l'item, les utiliser
        if (item.macros) {
          totals.calories += item.calories || 0;
          totals.protein += item.macros.protein || 0;
          totals.fat += item.macros.fat || 0;
          totals.carbs += item.macros.carbs || 0;
          totals.fiber += item.macros.fiber || 0;
          totals.netCarbs += item.macros.netCarbs || 0;
        } 
        // Sinon, utiliser les macros de la recette
        else if (recipe.nutritionPerServing) {
          totals.calories += (recipe.nutritionPerServing.calories || 0) * servings;
          totals.protein += (recipe.nutritionPerServing.protein || 0) * servings;
          totals.fat += (recipe.nutritionPerServing.fat || 0) * servings;
          totals.carbs += (recipe.nutritionPerServing.carbs || 0) * servings;
          totals.fiber += (recipe.nutritionPerServing.fiber || 0) * servings;
          totals.netCarbs += (recipe.nutritionPerServing.netCarbs || 0) * servings;
        }
      } else {
        // Obtenir les infos de l'aliment
        const food = getFoodById ? getFoodById(item.id) : null;
        if (!food) return;

        // Utiliser les macros de l'aliment multipliées par la quantité (en grammes)
        const quantity = item.quantity || 0;
        
        // Si les macros sont déjà définies dans l'item, les utiliser
        if (item.macros) {
          totals.calories += item.calories || 0;
          totals.protein += item.macros.protein || 0;
          totals.fat += item.macros.fat || 0;
          totals.carbs += item.macros.carbs || 0;
          totals.fiber += item.macros.fiber || 0;
          totals.netCarbs += item.macros.netCarbs || 0;
        } 
        // Sinon, calculer à partir des infos de l'aliment
        else if (food.nutritionPer100g) {
          const ratio = quantity / 100; // Convertir en ratio par rapport à 100g
          totals.calories += (food.nutritionPer100g.calories || 0) * ratio;
          totals.protein += (food.nutritionPer100g.protein || 0) * ratio;
          totals.fat += (food.nutritionPer100g.fat || 0) * ratio;
          totals.carbs += (food.nutritionPer100g.carbs || 0) * ratio;
          totals.fiber += (food.nutritionPer100g.fiber || 0) * ratio;
          
          // Si netCarbs est déjà calculé dans l'aliment, l'utiliser
          if (food.nutritionPer100g.netCarbs !== undefined) {
            totals.netCarbs += food.nutritionPer100g.netCarbs * ratio;
          } 
          // Sinon, calculer netCarbs = carbs - fiber
          else {
            const itemNetCarbs = Math.max(0, (food.nutritionPer100g.carbs || 0) - (food.nutritionPer100g.fiber || 0));
            totals.netCarbs += itemNetCarbs * ratio;
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du calcul des valeurs nutritionnelles:", error);
    }
  });

  // Si netCarbs n'est pas défini ou calculé, le calculer
  if (totals.netCarbs === 0 && totals.carbs > 0) {
    totals.netCarbs = Math.max(0, totals.carbs - totals.fiber);
  }

  // Arrondir les valeurs pour plus de lisibilité
  Object.keys(totals).forEach(key => {
    totals[key] = Math.round(totals[key] * 10) / 10; // Arrondir à 1 décimale
  });

  return totals;
};

/**
 * Calcule les totaux nutritionnels pour un jour complet
 * @param {Object} day - Objet représentant un jour avec ses repas
 * @param {Function} getFoodById - Fonction pour obtenir un aliment par son ID
 * @param {Function} getRecipeById - Fonction pour obtenir une recette par son ID
 * @returns {Object} Totaux nutritionnels du jour
 */
export const calculateDailyTotals = (day, { getFoodById, getRecipeById }) => {
  if (!day || !day.meals || !Array.isArray(day.meals)) {
    return { calories: 0, protein: 0, fat: 0, carbs: 0, netCarbs: 0 };
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

  // Additionner les contributions de chaque repas
  day.meals.forEach(meal => {
    try {
      // Si les macros du repas sont déjà définies, les utiliser
      if (meal.macros) {
        totals.calories += meal.calories || 0;
        totals.protein += meal.macros.protein || 0;
        totals.fat += meal.macros.fat || 0;
        totals.carbs += meal.macros.carbs || 0;
        totals.fiber += meal.macros.fiber || 0;
        totals.netCarbs += meal.macros.netCarbs || 0;
      }
      // Sinon, calculer à partir des éléments du repas
      else if (meal.items && Array.isArray(meal.items)) {
        const mealNutrition = calculateMealNutrition(meal.items, getFoodById, getRecipeById);
        
        totals.calories += mealNutrition.calories;
        totals.protein += mealNutrition.protein;
        totals.fat += mealNutrition.fat;
        totals.carbs += mealNutrition.carbs;
        totals.fiber += mealNutrition.fiber;
        totals.netCarbs += mealNutrition.netCarbs;
      }
    } catch (error) {
      console.error("Erreur lors du calcul des totaux nutritionnels du jour:", error);
    }
  });

  // Arrondir les valeurs pour plus de lisibilité
  Object.keys(totals).forEach(key => {
    totals[key] = Math.round(totals[key]);
  });

  return totals;
};

/**
 * Recalcule et met à jour les macronutriments d'un repas
 * @param {Object} meal - Repas à mettre à jour
 * @param {Function} getFoodById - Fonction pour obtenir un aliment par son ID
 * @param {Function} getRecipeById - Fonction pour obtenir une recette par son ID
 * @returns {Object} Repas mis à jour avec les macros recalculées
 */
export const updateMealNutrition = (meal, getFoodById, getRecipeById) => {
  if (!meal || !meal.items || !Array.isArray(meal.items)) {
    return meal;
  }

  try {
    const nutrition = calculateMealNutrition(meal.items, getFoodById, getRecipeById);
    
    return {
      ...meal,
      calories: nutrition.calories,
      macros: {
        protein: nutrition.protein,
        fat: nutrition.fat,
        carbs: nutrition.carbs,
        fiber: nutrition.fiber,
        netCarbs: nutrition.netCarbs
      }
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des macronutriments du repas:", error);
    return meal;
  }
};