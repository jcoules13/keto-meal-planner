{
  `path`: `src/utils/mealGeneratorAlgorithm.js`,
  `repo`: `keto-meal-planner`,
  `owner`: `jcoules13`,
  `branch`: `main`,
  `content`: `/**
 * Algorithme de génération de repas basé sur les aliments disponibles dans le frigo
 * 
 * Cet algorithme prend en compte:
 * - Les aliments disponibles et leurs quantités
 * - Les besoins nutritionnels de l'utilisateur
 * - Les préférences (faible en glucides, riche en protéines, équilibré)
 * 
 * Il génère des repas qui respectent les contraintes keto tout en utilisant les aliments disponibles.
 */

// Constantes pour les ratios keto
const KETO_RATIOS = {
  FAT_PERCENTAGE: 0.7, // 70% des calories proviennent des lipides
  PROTEIN_PERCENTAGE: 0.25, // 25% des calories proviennent des protéines
  CARBS_PERCENTAGE: 0.05, // 5% des calories proviennent des glucides
  MAX_NET_CARBS_PER_MEAL: 15, // Maximum de glucides nets par repas
};

// Facteurs caloriques des macronutriments
const CALORIC_FACTORS = {
  FAT: 9, // 9 calories par gramme de lipides
  PROTEIN: 4, // 4 calories par gramme de protéines
  CARBS: 4, // 4 calories par gramme de glucides
};

// Types d'aliments pour assurer la diversité
const FOOD_TYPES = {
  PROTEIN: 'protein', // Viandes, poissons, œufs, fromages à haute teneur en protéines
  FAT: 'fat', // Huiles, beurres, crèmes, fromages gras
  VEGETABLE: 'vegetable', // Légumes à faible teneur en glucides
  OTHER: 'other', // Autres aliments
};

/**
 * Détermine le type principal d'un aliment en fonction de sa composition
 * @param {Object} food - L'aliment à analyser
 * @returns {string} Le type principal de l'aliment
 */
function determineFoodType(food) {
  const { protein, fat, carbs } = food.nutritionPer100g;
  const totalGrams = protein + fat + carbs;
  
  // Si les protéines représentent plus de 40% de la composition en grammes
  if (protein / totalGrams > 0.4) {
    return FOOD_TYPES.PROTEIN;
  }
  
  // Si les lipides représentent plus de 50% de la composition en grammes
  if (fat / totalGrams > 0.5) {
    return FOOD_TYPES.FAT;
  }
  
  // Catégoriser les légumes selon leur catégorie et leur teneur en glucides
  if (food.category === 'légumes' && carbs < 10) {
    return FOOD_TYPES.VEGETABLE;
  }
  
  return FOOD_TYPES.OTHER;
}

/**
 * Calcule les calories totales à partir des macronutriments
 * @param {number} protein - Quantité de protéines en grammes
 * @param {number} fat - Quantité de lipides en grammes
 * @param {number} carbs - Quantité de glucides en grammes
 * @returns {number} Calories totales
 */
function calculateCalories(protein, fat, carbs) {
  return (
    protein * CALORIC_FACTORS.PROTEIN +
    fat * CALORIC_FACTORS.FAT +
    carbs * CALORIC_FACTORS.CARBS
  );
}

/**
 * Calcule le score de compatibilité keto d'un aliment
 * Plus le score est élevé, plus l'aliment est compatible avec le régime keto
 * @param {Object} food - L'aliment à évaluer
 * @returns {number} Score de compatibilité keto (0-10)
 */
function calculateKetoCompatibilityScore(food) {
  const { protein, fat, carbs, fiber = 0 } = food.nutritionPer100g;
  const netCarbs = Math.max(0, carbs - fiber);
  
  // Calcul des calories de chaque macronutriment
  const proteinCalories = protein * CALORIC_FACTORS.PROTEIN;
  const fatCalories = fat * CALORIC_FACTORS.FAT;
  const carbsCalories = netCarbs * CALORIC_FACTORS.CARBS;
  
  // Calories totales
  const totalCalories = proteinCalories + fatCalories + carbsCalories;
  
  if (totalCalories === 0) return 0; // Éviter la division par zéro
  
  // Calculer les ratios réels
  const fatRatio = fatCalories / totalCalories;
  const proteinRatio = proteinCalories / totalCalories;
  const carbsRatio = carbsCalories / totalCalories;
  
  // Calculer l'écart par rapport aux ratios keto idéaux (pondéré)
  const fatDeviation = Math.abs(fatRatio - KETO_RATIOS.FAT_PERCENTAGE) * 2;
  const proteinDeviation = Math.abs(proteinRatio - KETO_RATIOS.PROTEIN_PERCENTAGE);
  const carbsDeviation = Math.abs(carbsRatio - KETO_RATIOS.CARBS_PERCENTAGE) * 3; // Pénaliser davantage les glucides élevés
  
  // Calculer le score (10 - déviations)
  let score = 10 - (fatDeviation + proteinDeviation + carbsDeviation) * 10;
  
  // Pénaliser fortement les aliments à teneur élevée en glucides nets
  if (netCarbs > 10) {
    score -= (netCarbs - 10) * 0.5;
  }
  
  // Borner le score entre 0 et 10
  return Math.max(0, Math.min(10, score));
}

/**
 * Trouve les combinaisons d'aliments qui forment un repas équilibré keto
 * @param {Array} availableFoods - Liste des aliments disponibles avec quantités
 * @param {Object} targetNutrition - Objectifs nutritionnels pour le repas
 * @param {Object} options - Options de génération
 * @returns {Array} Repas générés respectant les contraintes
 */
function findFoodCombinations(availableFoods, targetNutrition, options) {
  // Trier les aliments par score de compatibilité keto
  const sortedFoods = [...availableFoods].sort((a, b) => {
    const scoreA = calculateKetoCompatibilityScore(a.food);
    const scoreB = calculateKetoCompatibilityScore(b.food);
    return scoreB - scoreA; // Du plus compatible au moins compatible
  });
  
  // Séparer les aliments par type
  const foodsByType = {
    [FOOD_TYPES.PROTEIN]: [],
    [FOOD_TYPES.FAT]: [],
    [FOOD_TYPES.VEGETABLE]: [],
    [FOOD_TYPES.OTHER]: [],
  };
  
  // Catégoriser les aliments
  sortedFoods.forEach(item => {
    const type = determineFoodType(item.food);
    foodsByType[type].push(item);
  });
  
  // Calculer les besoins caloriques par repas
  const mealsPerDay = options.mealCount;
  const caloriesPerMeal = targetNutrition.calories / mealsPerDay;
  
  // Limites pour chaque macronutriment par repas (en grammes)
  const targetMacros = {
    protein: (targetNutrition.protein || 100) / mealsPerDay,
    fat: (targetNutrition.fat || 150) / mealsPerDay,
    carbs: (targetNutrition.carbs || 25) / mealsPerDay,
  };
  
  const generatedMeals = [];
  
  // Essayer de générer le nombre requis de repas
  for (let i = 0; i < options.mealCount; i++) {
    const meal = generateSingleMeal(
      foodsByType,
      caloriesPerMeal,
      targetMacros,
      options
    );
    
    if (meal) {
      generatedMeals.push(meal);
      
      // Mettre à jour les quantités disponibles après chaque repas généré
      meal.items.forEach(mealItem => {
        const foodIndex = availableFoods.findIndex(
          item => item.foodId === mealItem.foodId
        );
        
        if (foodIndex !== -1) {
          availableFoods[foodIndex].quantity -= mealItem.quantity;
          // Si la quantité tombe à zéro ou moins, supprimer l'aliment
          if (availableFoods[foodIndex].quantity <= 0) {
            availableFoods.splice(foodIndex, 1);
          }
        }
      });
      
      // Recatégoriser les aliments restants
      Object.keys(foodsByType).forEach(type => {
        foodsByType[type] = foodsByType[type].filter(item => {
          return availableFoods.some(food => food.foodId === item.foodId && food.quantity > 0);
        });
      });
    }
  }
  
  return generatedMeals;
}

/**
 * Génère un seul repas équilibré à partir des aliments disponibles
 * @param {Object} foodsByType - Aliments disponibles organisés par type
 * @param {number} targetCalories - Calories cibles pour le repas
 * @param {Object} targetMacros - Macronutriments cibles pour le repas
 * @param {Object} options - Options de génération
 * @returns {Object|null} Repas généré ou null si impossible
 */
function generateSingleMeal(foodsByType, targetCalories, targetMacros, options) {
  // Structure de base du repas
  const meal = {
    name: generateMealName(),
    items: [],
    totalNutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      netCarbs: 0,
    },
  };
  
  // Essayer d'ajouter au moins un aliment protéiné
  if (!addFoodOfType(meal, foodsByType[FOOD_TYPES.PROTEIN], targetCalories * 0.3, targetMacros, options)) {
    return null; // Impossible de créer un repas sans source de protéines
  }
  
  // Essayer d'ajouter au moins un légume (si disponible)
  if (foodsByType[FOOD_TYPES.VEGETABLE].length > 0) {
    addFoodOfType(meal, foodsByType[FOOD_TYPES.VEGETABLE], targetCalories * 0.2, targetMacros, options);
  }
  
  // Essayer d'ajouter au moins une source de gras (si disponible)
  if (foodsByType[FOOD_TYPES.FAT].length > 0) {
    addFoodOfType(meal, foodsByType[FOOD_TYPES.FAT], targetCalories * 0.4, targetMacros, options);
  }
  
  // Si le repas est encore trop faible en calories, ajouter d'autres aliments
  if (meal.totalNutrition.calories < targetCalories * 0.7) {
    // Ajouter des aliments supplémentaires jusqu'à atteindre ~90% des calories cibles
    const remainingCalories = targetCalories - meal.totalNutrition.calories;
    
    // Priorité aux aliments en fonction des options
    let availableFoods = [];
    
    if (options.maximizeProtein) {
      // Priorité aux protéines
      availableFoods = [
        ...foodsByType[FOOD_TYPES.PROTEIN],
        ...foodsByType[FOOD_TYPES.FAT],
        ...foodsByType[FOOD_TYPES.VEGETABLE],
        ...foodsByType[FOOD_TYPES.OTHER],
      ];
    } else if (options.preferLowCarbs) {
      // Priorité aux aliments faibles en glucides
      const allFoods = [
        ...foodsByType[FOOD_TYPES.PROTEIN],
        ...foodsByType[FOOD_TYPES.FAT],
        ...foodsByType[FOOD_TYPES.VEGETABLE],
        ...foodsByType[FOOD_TYPES.OTHER],
      ];
      
      availableFoods = allFoods.sort((a, b) => {
        const netCarbsA = a.food.nutritionPer100g.carbs - (a.food.nutritionPer100g.fiber || 0);
        const netCarbsB = b.food.nutritionPer100g.carbs - (b.food.nutritionPer100g.fiber || 0);
        return netCarbsA - netCarbsB;
      });
    } else {
      // Mélanger tous les types d'aliments
      availableFoods = [
        ...foodsByType[FOOD_TYPES.FAT],
        ...foodsByType[FOOD_TYPES.PROTEIN],
        ...foodsByType[FOOD_TYPES.VEGETABLE],
        ...foodsByType[FOOD_TYPES.OTHER],
      ];
    }
    
    // Filtrer les aliments déjà présents dans le repas
    const existingFoodIds = meal.items.map(item => item.foodId);
    const filteredFoods = availableFoods.filter(
      item => !existingFoodIds.includes(item.foodId)
    );
    
    addFoodOfType(meal, filteredFoods, remainingCalories, targetMacros, options);
  }
  
  // Vérifier si le repas est viable (minimum de calories et au moins 2 aliments)
  if (meal.totalNutrition.calories < targetCalories * 0.5 || meal.items.length < 2) {
    return null;
  }
  
  // Ajuster les quantités pour équilibrer les macros si l'option est activée
  if (options.balancedMacros) {
    balanceMealMacros(meal, targetMacros);
  }
  
  return meal;
}

/**
 * Ajoute un aliment du type spécifié au repas
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} foodsOfType - Aliments disponibles du type spécifié
 * @param {number} targetCalories - Calories cibles à ajouter
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {Object} options - Options de génération
 * @returns {boolean} True si un aliment a été ajouté, false sinon
 */
function addFoodOfType(meal, foodsOfType, targetCalories, targetMacros, options) {
  if (foodsOfType.length === 0) return false;
  
  // Choisir un aliment au hasard parmi les plus compatibles
  const topFoods = foodsOfType.slice(0, Math.min(3, foodsOfType.length));
  const selectedFoodItem = topFoods[Math.floor(Math.random() * topFoods.length)];
  
  if (!selectedFoodItem) return false;
  
  const { food, quantity: availableQuantity, foodId } = selectedFoodItem;
  
  // Vérifier si l'aliment n'est pas déjà dans le repas
  if (meal.items.some(item => item.foodId === foodId)) {
    return false;
  }
  
  // Calculer la quantité nécessaire pour atteindre les calories cibles
  const caloriesPer100g = food.nutritionPer100g.calories;
  let quantity = Math.min(
    (targetCalories / caloriesPer100g) * 100,
    availableQuantity,
    200 // Limiter à 200g par défaut pour éviter des portions disproportionnées
  );
  
  // Ajuster pour les aliments très caloriques (comme les huiles)
  if (caloriesPer100g > 700) {
    quantity = Math.min(quantity, 30);
  }
  
  // Ajuster pour les aliments faibles en calories
  if (caloriesPer100g < 50) {
    quantity = Math.min(quantity, 300);
  }
  
  // Arrondir à 5g près
  quantity = Math.max(10, Math.round(quantity / 5) * 5);
  
  // Calculer les nutriments pour cette quantité
  const ratio = quantity / 100;
  const itemNutrition = {
    calories: food.nutritionPer100g.calories * ratio,
    protein: food.nutritionPer100g.protein * ratio,
    fat: food.nutritionPer100g.fat * ratio,
    carbs: food.nutritionPer100g.carbs * ratio,
    netCarbs: (
      food.nutritionPer100g.carbs - (food.nutritionPer100g.fiber || 0)
    ) * ratio,
  };
  
  // Ajouter l'aliment au repas
  meal.items.push({
    food,
    foodId,
    quantity,
  });
  
  // Mettre à jour les totaux nutritionnels du repas
  meal.totalNutrition.calories += itemNutrition.calories;
  meal.totalNutrition.protein += itemNutrition.protein;
  meal.totalNutrition.fat += itemNutrition.fat;
  meal.totalNutrition.netCarbs += itemNutrition.netCarbs;
  
  return true;
}

/**
 * Ajuste les quantités d'aliments pour équilibrer les macronutriments
 * @param {Object} meal - Le repas à équilibrer
 * @param {Object} targetMacros - Objectifs de macronutriments
 */
function balanceMealMacros(meal, targetMacros) {
  // Calculer les ratios actuels
  const currentRatios = {
    protein: meal.totalNutrition.protein / targetMacros.protein,
    fat: meal.totalNutrition.fat / targetMacros.fat,
    carbs: meal.totalNutrition.netCarbs / targetMacros.carbs,
  };
  
  // Identifier le macronutriment le plus éloigné de sa cible
  let furthestMacro = 'fat';
  let furthestRatio = Math.abs(1 - currentRatios.fat);
  
  if (Math.abs(1 - currentRatios.protein) > furthestRatio) {
    furthestMacro = 'protein';
    furthestRatio = Math.abs(1 - currentRatios.protein);
  }
  
  if (Math.abs(1 - currentRatios.carbs) > furthestRatio) {
    furthestMacro = 'carbs';
    furthestRatio = Math.abs(1 - currentRatios.carbs);
  }
  
  // Ajuster les quantités pour mieux cibler les macros
  meal.items.forEach(item => {
    const food = item.food;
    
    // Calculer l'impact de cet aliment sur le macronutriment cible
    let macroContent;
    
    if (furthestMacro === 'protein') {
      macroContent = food.nutritionPer100g.protein;
    } else if (furthestMacro === 'fat') {
      macroContent = food.nutritionPer100g.fat;
    } else {
      macroContent = food.nutritionPer100g.carbs - (food.nutritionPer100g.fiber || 0);
    }
    
    // Ajuster seulement les aliments qui contribuent significativement au macro ciblé
    if (macroContent > 0) {
      let adjustmentFactor = 1;
      
      if (currentRatios[furthestMacro] < 0.9) {
        // Si nous sommes en dessous de la cible, augmenter les aliments riches en ce macro
        if (macroContent / food.nutritionPer100g.calories > 0.1) {
          adjustmentFactor = 1.2;
        }
      } else if (currentRatios[furthestMacro] > 1.1) {
        // Si nous sommes au-dessus de la cible, réduire les aliments riches en ce macro
        if (macroContent / food.nutritionPer100g.calories > 0.1) {
          adjustmentFactor = 0.8;
        }
      }
      
      // Appliquer l'ajustement
      if (adjustmentFactor !== 1) {
        // Calculer la nouvelle quantité
        const newQuantity = Math.round(item.quantity * adjustmentFactor / 5) * 5;
        
        // Mettre à jour les macros du repas
        const oldRatio = item.quantity / 100;
        const newRatio = newQuantity / 100;
        const diffRatio = newRatio - oldRatio;
        
        meal.totalNutrition.calories += food.nutritionPer100g.calories * diffRatio;
        meal.totalNutrition.protein += food.nutritionPer100g.protein * diffRatio;
        meal.totalNutrition.fat += food.nutritionPer100g.fat * diffRatio;
        meal.totalNutrition.netCarbs += (
          food.nutritionPer100g.carbs - (food.nutritionPer100g.fiber || 0)
        ) * diffRatio;
        
        // Mettre à jour la quantité
        item.quantity = newQuantity;
      }
    }
  });
  
  // Arrondir les valeurs nutritionnelles
  meal.totalNutrition.calories = Math.round(meal.totalNutrition.calories);
  meal.totalNutrition.protein = Math.round(meal.totalNutrition.protein * 10) / 10;
  meal.totalNutrition.fat = Math.round(meal.totalNutrition.fat * 10) / 10;
  meal.totalNutrition.netCarbs = Math.round(meal.totalNutrition.netCarbs * 10) / 10;
}

/**
 * Génère un nom pour le repas en fonction de ses ingrédients principaux
 * @returns {string} Nom du repas
 */
function generateMealName() {
  const mealTypes = [
    'Assiette', 'Plat', 'Bowl', 'Cocotte', 'Poêlée', 'Salade'
  ];
  
  const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
  
  return `${mealType} keto du frigo`;
}

/**
 * Fonction principale pour générer des repas à partir des aliments du frigo
 * @param {Array} availableFoods - Aliments disponibles avec leurs quantités
 * @param {Object} nutritionNeeds - Besoins nutritionnels journaliers
 * @param {Object} options - Options de génération
 * @returns {Array} Repas générés
 */
export function generateMealsFromFridge(availableFoods, nutritionNeeds, options) {
  // Si pas assez d'aliments, retourner un tableau vide
  if (!availableFoods || availableFoods.length < 3) {
    return [];
  }
  
  // Ne garder que les aliments avec une quantité positive
  const validFoods = availableFoods.filter(item => item.quantity > 0);
  
  // Valeurs par défaut pour les besoins nutritionnels si non fournis
  const defaultNeeds = {
    calories: 2000,
    protein: 125, // ~25% des calories
    fat: 155, // ~70% des calories
    carbs: 25, // ~5% des calories
  };
  
  const needs = {
    calories: nutritionNeeds?.calories || defaultNeeds.calories,
    protein: nutritionNeeds?.protein || defaultNeeds.protein,
    fat: nutritionNeeds?.fat || defaultNeeds.fat,
    carbs: nutritionNeeds?.carbs || defaultNeeds.carbs,
  };
  
  // Valeurs par défaut pour les options si non fournies
  const defaultOptions = {
    mealCount: 3,
    preferLowCarbs: true,
    maximizeProtein: false,
    balancedMacros: true,
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };
  
  // Générer les repas en tenant compte des contraintes
  return findFoodCombinations(validFoods, needs, mergedOptions);
}`,
  `message`: `Correction complète du fichier mealGeneratorAlgorithm.js`
}
