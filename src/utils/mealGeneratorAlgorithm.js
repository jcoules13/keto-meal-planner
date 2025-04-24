/**
 * Algorithme de génération de repas keto amélioré
 * 
 * Cet algorithme respecte strictement les objectifs de macronutriments de l'utilisateur
 * en suivant une approche méthodique de construction des repas.
 */

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

// Tolérances pour la validation des repas - plus strictes qu'avant
const MACRO_TOLERANCES = {
  PROTEIN_MIN: 0.97, // 97% minimum de l'objectif protéique doit être atteint (était 0.95)
  FAT_MAX: 1.02, // Maximum 102% de l'objectif de lipides (était indéfini)
  CARBS_MAX: 1.00, // Maximum 100% de l'objectif de glucides (était 1.05)
};

// Paramètres pour les différents types d'aliments
const FOOD_PARAMETERS = {
  PROTEIN: {
    MIN_QUANTITY: 50, // Minimum 50g d'aliment protéiné
    MAX_QUANTITY: 300, // Maximum 300g d'aliment protéiné
    PRIORITY_FACTOR: 2.0, // Facteur de priorité lors de la sélection
  },
  VEGETABLE: {
    MIN_QUANTITY: 50, // Minimum 50g de légumes
    MAX_QUANTITY: 300, // Maximum 300g de légumes
    MAX_COUNT: 2, // Maximum 2 légumes différents par repas
  },
  FAT: {
    MIN_QUANTITY_OIL: 5, // Minimum 5g pour les huiles
    MIN_QUANTITY_OTHER: 15, // Minimum 15g pour les autres sources
    MAX_QUANTITY_OIL: 30, // Maximum 30g pour les huiles
    MAX_QUANTITY_OTHER: 100, // Maximum 100g pour les autres sources
  },
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
 * @param {Object} targetMacros - Objectifs de macronutriments pour le repas
 * @returns {number} Score de compatibilité keto (0-10)
 */
function calculateKetoCompatibilityScore(food, targetMacros) {
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
  
  // Calculer les ratios cibles
  const targetCalories = targetMacros.protein * CALORIC_FACTORS.PROTEIN + 
                         targetMacros.fat * CALORIC_FACTORS.FAT + 
                         targetMacros.carbs * CALORIC_FACTORS.CARBS;
  
  const targetFatRatio = (targetMacros.fat * CALORIC_FACTORS.FAT) / targetCalories;
  const targetProteinRatio = (targetMacros.protein * CALORIC_FACTORS.PROTEIN) / targetCalories;
  const targetCarbsRatio = (targetMacros.carbs * CALORIC_FACTORS.CARBS) / targetCalories;
  
  // Calculer l'écart par rapport aux ratios keto idéaux (pondéré)
  const fatDeviation = Math.abs(fatRatio - targetFatRatio) * 1.5;
  const proteinDeviation = Math.abs(proteinRatio - targetProteinRatio) * 0.8; // Moins pénalisant
  const carbsDeviation = Math.abs(carbsRatio - targetCarbsRatio) * 4; // Plus pénalisant
  
  // Calculer le score (10 - déviations)
  let score = 10 - (fatDeviation + proteinDeviation + carbsDeviation) * 10;
  
  // Pénaliser fortement les aliments à teneur élevée en glucides nets
  if (netCarbs > 5) { // Plus strict qu'avant (était 8)
    score -= (netCarbs - 5) * 0.8; // Plus pénalisant qu'avant (était 0.7)
  }
  
  // Bonifier les aliments riches en protéines
  const proteinBonus = (protein / 100) * FOOD_PARAMETERS.PROTEIN.PRIORITY_FACTOR;
  score += proteinBonus;
  
  // Borner le score entre 0 et 10
  return Math.max(0, Math.min(10, score));
}

/**
 * Filtre et trie les aliments en fonction des préférences de l'utilisateur
 * @param {Array} availableFoods - Liste des aliments disponibles
 * @param {Array} favoriteFoodIds - IDs des aliments favoris de l'utilisateur
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @returns {Object} Aliments triés par type et avec les favoris priorisés
 */
function organizeAndPrioritizeFoods(availableFoods, favoriteFoodIds, targetMacros) {
  if (!availableFoods || availableFoods.length === 0) {
    return {
      [FOOD_TYPES.PROTEIN]: [],
      [FOOD_TYPES.FAT]: [],
      [FOOD_TYPES.VEGETABLE]: [],
      [FOOD_TYPES.OTHER]: [],
    };
  }
  
  // Convertir la liste d'IDs favoris en Set pour une recherche plus rapide
  const favoriteSet = new Set(favoriteFoodIds || []);
  
  // Trier les aliments par score de compatibilité keto et favoris
  const sortedFoods = [...availableFoods].sort((a, b) => {
    // Les favoris ont toujours la priorité
    const aIsFavorite = favoriteSet.has(a.foodId);
    const bIsFavorite = favoriteSet.has(b.foodId);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    
    // Si les deux sont favoris ou aucun n'est favori, 
    // utiliser le score de compatibilité keto
    const scoreA = calculateKetoCompatibilityScore(a.food, targetMacros);
    const scoreB = calculateKetoCompatibilityScore(b.food, targetMacros);
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
    // Ajouter un marqueur indiquant si c'est un favori
    foodsByType[type].push({
      ...item,
      isFavorite: favoriteSet.has(item.foodId)
    });
  });
  
  return foodsByType;
}

/**
 * Trie les recettes pour prioriser les favorites et les plus compatibles
 * @param {Array} availableRecipes - Liste des recettes disponibles
 * @param {Array} favoriteRecipeIds - IDs des recettes favorites
 * @param {Object} targetMacros - Objectifs de macronutriments pour le repas
 * @returns {Array} Recettes triées
 */
function prioritizeRecipes(availableRecipes, favoriteRecipeIds, targetMacros) {
  if (!availableRecipes || availableRecipes.length === 0) {
    return [];
  }
  
  // Convertir la liste d'IDs favoris en Set pour une recherche plus rapide
  const favoriteSet = new Set(favoriteRecipeIds || []);
  
  // Fonction pour calculer l'écart entre les macros de la recette et les cibles
  function calculateMacroDeviation(recipe, targetMacros) {
    if (!recipe.nutritionPerServing) return Infinity;
    
    const { protein, fat, netCarbs } = recipe.nutritionPerServing;
    
    // Calcul de l'écart normalisé (pourcentage d'écart)
    const proteinDeviation = Math.abs(protein - targetMacros.protein) / targetMacros.protein;
    const fatDeviation = Math.abs(fat - targetMacros.fat) / targetMacros.fat;
    const carbsDeviation = Math.abs(netCarbs - targetMacros.carbs) / targetMacros.carbs;
    
    // Les dépassements de glucides sont plus pénalisés
    const carbsPenalty = netCarbs > targetMacros.carbs ? 2 : 1;
    
    // Score combiné (plus petit = meilleur)
    return proteinDeviation * 0.5 + fatDeviation * 0.3 + (carbsDeviation * carbsPenalty) * 1.2;
  }
  
  // Trier les recettes
  return [...availableRecipes].sort((a, b) => {
    // Les favoris ont toujours la priorité
    const aIsFavorite = favoriteSet.has(a.id);
    const bIsFavorite = favoriteSet.has(b.id);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    
    // Si keto standard est requis, prioriser les recettes keto
    if (a.isKeto && !b.isKeto) return -1;
    if (!a.isKeto && b.isKeto) return 1;
    
    // Comparer l'écart par rapport aux macros cibles
    const aDeviation = calculateMacroDeviation(a, targetMacros);
    const bDeviation = calculateMacroDeviation(b, targetMacros);
    
    return aDeviation - bDeviation; // Du plus proche de l'objectif au plus éloigné
  });
}
/**
 * Vérifie si un repas respecte les objectifs de macros au seuil minimum requis
 * @param {Object} mealNutrition - Nutrition totale du repas
 * @param {Object} targetMacros - Objectifs de macros pour le repas
 * @returns {Object} Résultat de la validation avec statut et messages
 */
function validateMealMacros(mealNutrition, targetMacros) {
  // Calculer les pourcentages d'atteinte des objectifs
  const proteinPercentage = mealNutrition.protein / targetMacros.protein;
  const fatPercentage = mealNutrition.fat / targetMacros.fat;
  const carbsPercentage = mealNutrition.netCarbs / targetMacros.carbs;
  
  const issues = [];
  
  // Vérifier l'objectif protéique (exigence très stricte)
  if (proteinPercentage < MACRO_TOLERANCES.PROTEIN_MIN) {
    issues.push(`Protéines insuffisantes: ${Math.round(proteinPercentage * 100)}% de l'objectif (minimum ${Math.round(MACRO_TOLERANCES.PROTEIN_MIN * 100)}% requis)`);
  }
  
  // Vérifier que les lipides ne dépassent pas la limite
  if (fatPercentage > MACRO_TOLERANCES.FAT_MAX) {
    issues.push(`Excès de lipides: ${Math.round(fatPercentage * 100)}% de l'objectif (maximum ${Math.round(MACRO_TOLERANCES.FAT_MAX * 100)}% autorisé)`);
  }
  
  // Vérifier que les glucides ne dépassent pas la limite
  if (carbsPercentage > MACRO_TOLERANCES.CARBS_MAX) {
    issues.push(`Excès de glucides: ${Math.round(carbsPercentage * 100)}% de l'objectif (maximum ${Math.round(MACRO_TOLERANCES.CARBS_MAX * 100)}% autorisé)`);
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues,
    macroPercentages: {
      protein: proteinPercentage,
      fat: fatPercentage,
      carbs: carbsPercentage
    }
  };
}

/**
 * Génère un nom pour le repas en fonction de ses ingrédients principaux
 * @param {Array} items - Éléments du repas
 * @returns {string} Nom du repas
 */
function generateMealName(items) {
  // S'il n'y a pas d'éléments, retourner un nom générique
  if (!items || items.length === 0) {
    return "Repas keto du jour";
  }
  
  // Types de repas possibles
  const mealTypes = [
    'Assiette', 'Plat', 'Bowl', 'Cocotte', 'Poêlée', 'Salade'
  ];
  
  // Sélectionner un type de repas aléatoire
  const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
  
  // Trouver l'ingrédient principal (source de protéines)
  const proteinItems = items.filter(item => 
    determineFoodType(item.food) === FOOD_TYPES.PROTEIN
  );
  
  if (proteinItems.length > 0) {
    // Trier par quantité décroissante pour trouver la protéine principale
    const mainProtein = [...proteinItems].sort((a, b) => b.quantity - a.quantity)[0];
    return `${mealType} ${mainProtein.food.name}`;
  }
  
  // Si pas de protéine principale, utiliser l'aliment avec la plus grande quantité
  const sortedByQuantity = [...items].sort((a, b) => b.quantity - a.quantity);
  if (sortedByQuantity.length > 0) {
    return `${mealType} ${sortedByQuantity[0].food.name}`;
  }
  
  return "Repas keto du jour";
}

/**
 * Génère un nom de repas pour une recette
 * @param {Object} recipe - La recette utilisée
 * @returns {string} Nom du repas
 */
function generateRecipeMealName(recipe) {
  if (!recipe || !recipe.name) {
    return "Recette keto du jour";
  }
  
  // Variantes pour éviter la monotonie
  const prefixes = ["", "Délicieux ", "Savoureux "];
  const suffix = Math.random() > 0.7 ? " (recette)" : "";
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  return `${prefix}${recipe.name}${suffix}`;
}

/**
 * Arrondit une quantité d'aliment à une valeur pratique
 * @param {number} quantity - Quantité à arrondir en grammes
 * @param {number} minQuantity - Quantité minimale acceptable
 * @returns {number} Quantité arrondie
 */
function roundFoodQuantity(quantity, minQuantity = 5) {
  // Arrondir à 5g près
  const rounded = Math.round(quantity / 5) * 5;
  
  // Assurer un minimum
  return Math.max(minQuantity, rounded);
}
/**
 * Ajoute des aliments protéinés pour atteindre l'objectif de protéines
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} proteinFoods - Aliments protéinés disponibles
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @returns {boolean} True si suffisamment de protéines ajoutées, false sinon
 */
function addProteinFoods(meal, proteinFoods, targetMacros) {
  if (proteinFoods.length === 0) return false;
  
  // Trier les aliments protéinés d'abord par favoris, puis par teneur en protéines
  proteinFoods.sort((a, b) => {
    // Favoris en premier
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    
    // Ensuite par teneur en protéines (du plus riche au moins riche)
    return b.food.nutritionPer100g.protein - a.food.nutritionPer100g.protein;
  });
  
  // Objectif protéique avec seuil minimum requis
  const proteinGoal = targetMacros.protein * MACRO_TOLERANCES.PROTEIN_MIN;
  let currentProtein = meal.totalNutrition.protein;
  let attemptsLeft = Math.min(2, proteinFoods.length); // Maximum 2 aliments protéinés différents
  
  while (currentProtein < proteinGoal && attemptsLeft > 0 && proteinFoods.length > 0) {
    attemptsLeft--;
    
    // Sélectionner la meilleure source protéinée disponible
    const selectedFood = proteinFoods[0];
    
    // Éviter les doublons
    if (meal.items.some(item => item.foodId === selectedFood.foodId)) {
      // Supprimer cet aliment et continuer
      proteinFoods.splice(0, 1);
      continue;
    }
    
    // Calculer la quantité nécessaire pour atteindre l'objectif protéique
    const proteinPer100g = selectedFood.food.nutritionPer100g.protein;
    const proteinNeeded = proteinGoal - currentProtein;
    const quantityForProtein = Math.ceil((proteinNeeded / proteinPer100g) * 100);
    
    // Limiter la quantité à une valeur raisonnable et à la disponibilité
    const maxQuantity = Math.min(
      FOOD_PARAMETERS.PROTEIN.MAX_QUANTITY,
      selectedFood.quantity
    );
    
    // Ajuster la quantité pour ne pas dépasser le maximum
    const finalQuantity = Math.min(quantityForProtein, maxQuantity);
    
    // Arrondir à 5g près
    const roundedQuantity = roundFoodQuantity(finalQuantity, FOOD_PARAMETERS.PROTEIN.MIN_QUANTITY);
    
    // Calculer les nutriments pour cette quantité
    const ratio = roundedQuantity / 100;
    let itemNutrition = {
      calories: selectedFood.food.nutritionPer100g.calories * ratio,
      protein: selectedFood.food.nutritionPer100g.protein * ratio,
      fat: selectedFood.food.nutritionPer100g.fat * ratio,
      carbs: selectedFood.food.nutritionPer100g.carbs * ratio,
      netCarbs: (selectedFood.food.nutritionPer100g.carbs - (selectedFood.food.nutritionPer100g.fiber || 0)) * ratio
    };
    
    // Vérifier que l'ajout de cet aliment ne dépasse pas la limite de glucides
    if (meal.totalNutrition.netCarbs + itemNutrition.netCarbs > targetMacros.carbs) {
      // Essayer de réduire la quantité pour respecter la limite de glucides
      const netCarbsPer100g = selectedFood.food.nutritionPer100g.carbs - (selectedFood.food.nutritionPer100g.fiber || 0);
      if (netCarbsPer100g <= 0) netCarbsPer100g = 0.1; // Éviter division par zéro
      
      const maxAllowedForCarbs = ((targetMacros.carbs - meal.totalNutrition.netCarbs) / netCarbsPer100g) * 100;
      
      if (maxAllowedForCarbs < FOOD_PARAMETERS.PROTEIN.MIN_QUANTITY) {
        // Trop peu pour être utile, essayer un autre aliment
        proteinFoods.splice(0, 1);
        continue;
      }
      
      // Ajuster la quantité pour respecter la limite de glucides
      const newQuantity = roundFoodQuantity(maxAllowedForCarbs, FOOD_PARAMETERS.PROTEIN.MIN_QUANTITY);
      const newRatio = newQuantity / 100;
      
      // Recalculer les nutriments
      itemNutrition = {
        calories: selectedFood.food.nutritionPer100g.calories * newRatio,
        protein: selectedFood.food.nutritionPer100g.protein * newRatio,
        fat: selectedFood.food.nutritionPer100g.fat * newRatio,
        carbs: selectedFood.food.nutritionPer100g.carbs * newRatio,
        netCarbs: (selectedFood.food.nutritionPer100g.carbs - (selectedFood.food.nutritionPer100g.fiber || 0)) * newRatio
      };
    }
    
    // Ajouter l'aliment au repas
    meal.items.push({
      food: selectedFood.food,
      foodId: selectedFood.foodId,
      quantity: roundedQuantity,
      isFavorite: selectedFood.isFavorite
    });
    
    // Mettre à jour les totaux nutritionnels du repas
    meal.totalNutrition.calories += itemNutrition.calories;
    meal.totalNutrition.protein += itemNutrition.protein;
    meal.totalNutrition.fat += itemNutrition.fat;
    meal.totalNutrition.netCarbs += itemNutrition.netCarbs;
    
    // Mettre à jour le compteur de protéines
    currentProtein = meal.totalNutrition.protein;
    
    // Supprimer cet aliment de la liste pour éviter de le réutiliser
    proteinFoods.splice(0, 1);
  }
  
  // Vérifier si nous avons atteint l'objectif minimal de protéines
  return meal.totalNutrition.protein >= targetMacros.protein * MACRO_TOLERANCES.PROTEIN_MIN;
}

/**
 * Ajoute des légumes au repas en respectant la limite de glucides
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} vegetableFoods - Légumes disponibles
 * @param {Object} targetMacros - Objectifs de macronutriments
 */
function addVegetableFoods(meal, vegetableFoods, targetMacros) {
  if (vegetableFoods.length === 0) return;
  
  // Calculer les glucides nets restants disponibles
  const currentNetCarbs = meal.totalNutrition.netCarbs;
  const remainingNetCarbs = targetMacros.carbs - currentNetCarbs;
  
  if (remainingNetCarbs <= 0) return; // Pas de marge pour les glucides
  
  // Trier les légumes d'abord par favoris, puis par teneur en glucides nets (du moins au plus)
  vegetableFoods.sort((a, b) => {
    // Favoris en premier
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    
    // Ensuite par teneur en glucides nets
    const netCarbsA = a.food.nutritionPer100g.carbs - (a.food.nutritionPer100g.fiber || 0);
    const netCarbsB = b.food.nutritionPer100g.carbs - (b.food.nutritionPer100g.fiber || 0);
    return netCarbsA - netCarbsB;
  });
  
  // Sélectionner max 2 légumes différents
  const vegetableCount = Math.min(FOOD_PARAMETERS.VEGETABLE.MAX_COUNT, vegetableFoods.length);
  
  // Calculer les ressources disponibles pour tous les légumes
  const totalRemainingNetCarbs = remainingNetCarbs;
  const carbsPerVegetable = totalRemainingNetCarbs / vegetableCount;
  let carbsRemaining = totalRemainingNetCarbs;
  
  for (let i = 0; i < vegetableCount; i++) {
    // Éviter de choisir un légume déjà dans le repas
    let selectedVegetable = null;
    for (const vegetable of vegetableFoods) {
      if (!meal.items.some(item => item.foodId === vegetable.foodId)) {
        selectedVegetable = vegetable;
        break;
      }
    }
    
    if (!selectedVegetable) break; // Pas de légume disponible
    
    // Calculer le contenu en glucides nets pour 100g
    const netCarbsPer100g = selectedVegetable.food.nutritionPer100g.carbs - 
                          (selectedVegetable.food.nutritionPer100g.fiber || 0);
    
    // Si le légume n'a pas de glucides, utiliser une petite valeur pour éviter division par zéro
    const effectiveNetCarbsPer100g = Math.max(0.1, netCarbsPer100g);
    
    // Calculer la quantité maximale selon les contraintes de glucides
    const maxQuantityByCarbs = Math.floor((carbsPerVegetable / effectiveNetCarbsPer100g) * 100);
    const availableQuantity = selectedVegetable.quantity;
    
    // Choisir la quantité la plus contraignante
    let quantity = Math.min(
      maxQuantityByCarbs,
      availableQuantity,
      FOOD_PARAMETERS.VEGETABLE.MAX_QUANTITY // Maximum raisonnable pour un légume
    );
    
    // Minimum 50g de légumes si possible
    quantity = Math.max(Math.min(FOOD_PARAMETERS.VEGETABLE.MIN_QUANTITY, availableQuantity), quantity);
    
    // Arrondir à 5g près
    quantity = roundFoodQuantity(quantity, FOOD_PARAMETERS.VEGETABLE.MIN_QUANTITY);
    
    if (quantity <= 0) continue; // Quantité trop faible, passer au légume suivant
    
    // Calculer les nutriments pour cette quantité
    const ratio = quantity / 100;
    const itemNutrition = {
      calories: selectedVegetable.food.nutritionPer100g.calories * ratio,
      protein: selectedVegetable.food.nutritionPer100g.protein * ratio,
      fat: selectedVegetable.food.nutritionPer100g.fat * ratio,
      carbs: selectedVegetable.food.nutritionPer100g.carbs * ratio,
      netCarbs: netCarbsPer100g * ratio
    };
    
    // Mettre à jour carbsRemaining
    carbsRemaining -= itemNutrition.netCarbs;
    
    // Ajouter le légume au repas
    meal.items.push({
      food: selectedVegetable.food,
      foodId: selectedVegetable.foodId,
      quantity: quantity,
      isFavorite: selectedVegetable.isFavorite
    });
    
    // Mettre à jour les totaux nutritionnels
    meal.totalNutrition.calories += itemNutrition.calories;
    meal.totalNutrition.protein += itemNutrition.protein;
    meal.totalNutrition.fat += itemNutrition.fat;
    meal.totalNutrition.netCarbs += itemNutrition.netCarbs;
    
    // Supprimer ce légume des options disponibles
    vegetableFoods = vegetableFoods.filter(veg => veg.foodId !== selectedVegetable.foodId);
    
    // Arrêter si nous avons atteint la limite de glucides
    if (carbsRemaining <= 0 || vegetableFoods.length === 0) {
      break;
    }
  }
}

/**
 * Ajoute des sources de graisses au repas
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} fatFoods - Sources de graisses disponibles
 * @param {Object} targetMacros - Objectifs de macronutriments
 */
function addFatFoods(meal, fatFoods, targetMacros) {
  if (fatFoods.length === 0) return;
  
  // Ne pas dépasser l'objectif de lipides
  const fatRemaining = targetMacros.fat - meal.totalNutrition.fat;
  if (fatRemaining <= 0) return;
  
  // Trier les sources de graisses par favoris, puis teneur en lipides
  fatFoods.sort((a, b) => {
    // Favoris en premier
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    
    // Ensuite par teneur en lipides (du plus au moins)
    return b.food.nutritionPer100g.fat - a.food.nutritionPer100g.fat;
  });
  
  // Sélectionner 1-2 sources de graisses différentes
  const fatCount = Math.min(2, fatFoods.length);
  let fatAdded = 0;
  
  for (let i = 0; i < fatCount; i++) {
    // Choisir une source de graisse qui n'est pas déjà dans le repas
    let selectedFat = null;
    for (const fat of fatFoods) {
      if (!meal.items.some(item => item.foodId === fat.foodId)) {
        selectedFat = fat;
        break;
      }
    }
    
    if (!selectedFat) continue; // Pas de source de graisse disponible
    
    // Détecter s'il s'agit d'une huile (ou source très riche en graisses)
    const isHighFatSource = selectedFat.food.nutritionPer100g.fat > 80;
    
    // Calculer combien nous pouvons ajouter sans dépasser l'objectif
    const fatPer100g = selectedFat.food.nutritionPer100g.fat;
    const remainingFatNeeded = fatRemaining - fatAdded;
    const quantityForFat = Math.ceil((remainingFatNeeded / fatPer100g) * 100);
    
    // Vérifier si l'ajout n'entraînerait pas un dépassement des glucides
    const netCarbsPer100g = selectedFat.food.nutritionPer100g.carbs - 
                          (selectedFat.food.nutritionPer100g.fiber || 0);
    const carbsRemaining = targetMacros.carbs - meal.totalNutrition.netCarbs;
    
    if (netCarbsPer100g > 0 && carbsRemaining < netCarbsPer100g) {
      continue; // Passer à une autre source de graisse
    }
    
    // Pour les huiles et sources très riches en graisses, limiter davantage
    const maxReasonableQuantity = isHighFatSource ? 
                               FOOD_PARAMETERS.FAT.MAX_QUANTITY_OIL : 
                               FOOD_PARAMETERS.FAT.MAX_QUANTITY_OTHER;
    
    // Choisir la quantité la plus contraignante
    const availableQuantity = selectedFat.quantity;
    let quantity = Math.min(
      quantityForFat,
      availableQuantity,
      maxReasonableQuantity
    );
    
    // Minimum différent selon le type
    const minQuantity = isHighFatSource ? 
                      FOOD_PARAMETERS.FAT.MIN_QUANTITY_OIL : 
                      FOOD_PARAMETERS.FAT.MIN_QUANTITY_OTHER;
    
    quantity = Math.max(Math.min(minQuantity, availableQuantity), quantity);
    
    // Arrondir à 5g près
    quantity = roundFoodQuantity(quantity, minQuantity);
    
    if (quantity <= 0) continue; // Quantité trop faible, passer à la suivante
    
    // Calculer les nutriments pour cette quantité
    const ratio = quantity / 100;
    const itemNutrition = {
      calories: selectedFat.food.nutritionPer100g.calories * ratio,
      protein: selectedFat.food.nutritionPer100g.protein * ratio,
      fat: fatPer100g * ratio,
      carbs: selectedFat.food.nutritionPer100g.carbs * ratio,
      netCarbs: netCarbsPer100g * ratio
    };
    
    // Vérifier que l'ajout ne fait pas dépasser les glucides
    if (meal.totalNutrition.netCarbs + itemNutrition.netCarbs > targetMacros.carbs) {
      continue; // Essayer une autre source
    }
    
    // Ajouter la source de graisse au repas
    meal.items.push({
      food: selectedFat.food,
      foodId: selectedFat.foodId,
      quantity: quantity,
      isFavorite: selectedFat.isFavorite
    });
    
    // Mettre à jour les totaux nutritionnels
    meal.totalNutrition.calories += itemNutrition.calories;
    meal.totalNutrition.protein += itemNutrition.protein;
    meal.totalNutrition.fat += itemNutrition.fat;
    meal.totalNutrition.netCarbs += itemNutrition.netCarbs;
    
    // Mettre à jour le compteur
    fatAdded += itemNutrition.fat;
    
    // Si nous avons atteint 95% de l'objectif de lipides, arrêter
    if (fatAdded >= remainingFatNeeded * 0.95) {
      break;
    }
    
    // Supprimer cette source de graisse des options disponibles
    fatFoods = fatFoods.filter(fat => fat.foodId !== selectedFat.foodId);
    
    // Arrêter si nous n'avons plus d'options
    if (fatFoods.length === 0) {
      break;
    }
  }
}
/**
 * Ajuste les quantités d'aliments pour équilibrer les macronutriments
 * @param {Object} meal - Le repas à équilibrer
 * @param {Object} targetMacros - Objectifs de macronutriments
 */
function balanceMealMacros(meal, targetMacros) {
  if (!meal.items || meal.items.length === 0) return;
  
  // Calculer les ratios actuels par rapport aux cibles
  const currentRatios = {
    protein: meal.totalNutrition.protein / targetMacros.protein,
    fat: meal.totalNutrition.fat / targetMacros.fat,
    carbs: meal.totalNutrition.netCarbs / targetMacros.carbs,
  };
  
  // Si tous les ratios sont proches des cibles, pas besoin d'ajuster
  if (currentRatios.protein >= MACRO_TOLERANCES.PROTEIN_MIN && 
      currentRatios.fat <= MACRO_TOLERANCES.FAT_MAX && 
      currentRatios.carbs <= MACRO_TOLERANCES.CARBS_MAX) {
    return;
  }
  
  // Identifier les problèmes à résoudre
  const issues = [];
  
  // Vérifier si les objectifs protéiques ne sont pas atteints
  if (currentRatios.protein < MACRO_TOLERANCES.PROTEIN_MIN) {
    issues.push({
      macro: 'protein',
      direction: 'increase',
      severity: (MACRO_TOLERANCES.PROTEIN_MIN - currentRatios.protein)
    });
  }
  
  // Vérifier si les lipides dépassent l'objectif
  if (currentRatios.fat > MACRO_TOLERANCES.FAT_MAX) {
    issues.push({
      macro: 'fat',
      direction: 'decrease',
      severity: (currentRatios.fat - MACRO_TOLERANCES.FAT_MAX)
    });
  }
  
  // Vérifier si les glucides dépassent l'objectif
  if (currentRatios.carbs > MACRO_TOLERANCES.CARBS_MAX) {
    issues.push({
      macro: 'carbs',
      direction: 'decrease',
      severity: (currentRatios.carbs - MACRO_TOLERANCES.CARBS_MAX)
    });
  }
  
  // Trier les problèmes par sévérité
  issues.sort((a, b) => b.severity - a.severity);
  
  // Pas de problèmes à régler
  if (issues.length === 0) return;
  
  // Problème principal à régler
  const mainIssue = issues[0];
  
  switch (mainIssue.macro) {
    case 'protein':
      if (mainIssue.direction === 'increase') {
        // Identifier les aliments protéinés
        const proteinItems = meal.items.filter(item => 
          determineFoodType(item.food) === FOOD_TYPES.PROTEIN
        );
        
        if (proteinItems.length > 0) {
          // Trier par concentration en protéines
          proteinItems.sort((a, b) => 
            b.food.nutritionPer100g.protein - a.food.nutritionPer100g.protein
          );
          
          // Calculer combien de protéines manquent
          const proteinNeeded = (targetMacros.protein * MACRO_TOLERANCES.PROTEIN_MIN) - meal.totalNutrition.protein;
          
          // Augmenter les aliments protéinés les plus efficaces
          for (const item of proteinItems) {
            const currentQuantity = item.quantity;
            const proteinPer100g = item.food.nutritionPer100g.protein;
            
            // Calculer l'augmentation nécessaire
            const additionalQty = Math.ceil((proteinNeeded / proteinPer100g) * 100);
            
            // Limiter l'augmentation
            const maxIncrease = Math.min(additionalQty, 50);
            const newQuantity = Math.min(
              currentQuantity + maxIncrease,
              FOOD_PARAMETERS.PROTEIN.MAX_QUANTITY
            );
            
            // Si pas d'augmentation significative, passer au suivant
            if (newQuantity - currentQuantity < 5) continue;
            
            // Mettre à jour la quantité et les totaux nutritionnels
            const diffQty = newQuantity - currentQuantity;
            const diffRatio = diffQty / 100;
            
            // Calculer l'impact nutritionnel
            const additionalNutrition = {
              calories: item.food.nutritionPer100g.calories * diffRatio,
              protein: item.food.nutritionPer100g.protein * diffRatio,
              fat: item.food.nutritionPer100g.fat * diffRatio,
              netCarbs: (item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0)) * diffRatio
            };
            
            // Vérifier si cela ne ferait pas dépasser les autres objectifs (notamment glucides)
            if (meal.totalNutrition.netCarbs + additionalNutrition.netCarbs > targetMacros.carbs) {
              continue; // Essayer un autre aliment
            }
            
            // Mettre à jour la quantité
            item.quantity = newQuantity;
            
            // Mettre à jour les totaux nutritionnels
            meal.totalNutrition.calories += additionalNutrition.calories;
            meal.totalNutrition.protein += additionalNutrition.protein;
            meal.totalNutrition.fat += additionalNutrition.fat;
            meal.totalNutrition.netCarbs += additionalNutrition.netCarbs;
            
            // Vérifier si on a atteint l'objectif
            if (meal.totalNutrition.protein >= targetMacros.protein * MACRO_TOLERANCES.PROTEIN_MIN) {
              break;
            }
          }
        }
      }
      break;
      
    case 'fat':
      if (mainIssue.direction === 'decrease') {
        // Identifier les aliments gras
        const fatItems = meal.items.filter(item => 
          item.food.nutritionPer100g.fat / 
          (item.food.nutritionPer100g.protein + item.food.nutritionPer100g.fat + item.food.nutritionPer100g.carbs) > 0.3
        );
        
        if (fatItems.length > 0) {
          // Trier par contribution totale aux lipides
          fatItems.sort((a, b) => 
            (b.food.nutritionPer100g.fat * b.quantity) - 
            (a.food.nutritionPer100g.fat * a.quantity)
          );
          
          // Calculer l'excès de lipides à réduire
          const excessFat = meal.totalNutrition.fat - targetMacros.fat;
          
          // Réduire les aliments gras en commençant par les plus contributeurs
          for (const item of fatItems) {
            const currentQuantity = item.quantity;
            const fatPer100g = item.food.nutritionPer100g.fat;
            
            // Éviter de réduire en dessous d'un minimum raisonnable
            const isHighFatSource = fatPer100g > 80;
            const minQuantity = isHighFatSource ? 
                              FOOD_PARAMETERS.FAT.MIN_QUANTITY_OIL : 
                              FOOD_PARAMETERS.FAT.MIN_QUANTITY_OTHER;
            
            // Si déjà au minimum, passer au suivant
            if (currentQuantity <= minQuantity) continue;
            
            // Calculer la réduction nécessaire
            const fatToReduce = excessFat;
            const qtyToReduce = Math.ceil((fatToReduce / fatPer100g) * 100);
            
            // Limiter la réduction pour ne pas descendre sous le minimum
            const maxReduction = Math.min(qtyToReduce, currentQuantity - minQuantity);
            
            // Si pas de réduction significative possible, passer au suivant
            if (maxReduction < 5) continue;
            
            // Nouvelle quantité (arrondie à 5g près)
            const newQuantity = roundFoodQuantity(currentQuantity - maxReduction, minQuantity);
            
            // Mettre à jour la quantité et les totaux nutritionnels
            const diffQty = newQuantity - currentQuantity; // Négatif
            const diffRatio = diffQty / 100;
            
            // Calculer l'impact nutritionnel
            const reducedNutrition = {
              calories: item.food.nutritionPer100g.calories * diffRatio,
              protein: item.food.nutritionPer100g.protein * diffRatio,
              fat: item.food.nutritionPer100g.fat * diffRatio,
              netCarbs: (item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0)) * diffRatio
            };
            
            // Mettre à jour la quantité
            item.quantity = newQuantity;
            
            // Mettre à jour les totaux nutritionnels
            meal.totalNutrition.calories += reducedNutrition.calories; // Réduction donc addition de valeurs négatives
            meal.totalNutrition.protein += reducedNutrition.protein;
            meal.totalNutrition.fat += reducedNutrition.fat;
            meal.totalNutrition.netCarbs += reducedNutrition.netCarbs;
            
            // Vérifier si on est sous la limite
            if (meal.totalNutrition.fat <= targetMacros.fat * MACRO_TOLERANCES.FAT_MAX) {
              break;
            }
          }
        }
      }
      break;
      
    case 'carbs':
      if (mainIssue.direction === 'decrease') {
        // Identifier les aliments glucidiques
        const carbItems = meal.items.filter(item => {
          const netCarbsPer100g = item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0);
          return netCarbsPer100g > 1; // Au moins 1g de glucides nets pour 100g
        });
        
        if (carbItems.length > 0) {
          // Trier par contribution totale aux glucides
          carbItems.sort((a, b) => {
            const netCarbsA = a.food.nutritionPer100g.carbs - (a.food.nutritionPer100g.fiber || 0);
            const netCarbsB = b.food.nutritionPer100g.carbs - (b.food.nutritionPer100g.fiber || 0);
            return (netCarbsB * b.quantity) - (netCarbsA * a.quantity);
          });
          
          // Calculer l'excès de glucides à réduire
          const excessCarbs = meal.totalNutrition.netCarbs - targetMacros.carbs;
          
          // Réduire les aliments glucidiques en commençant par les plus contributeurs
          for (const item of carbItems) {
            const currentQuantity = item.quantity;
            const netCarbsPer100g = item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0);
            
            // Éviter de réduire en dessous d'un minimum raisonnable
            let minQuantity;
            if (determineFoodType(item.food) === FOOD_TYPES.VEGETABLE) {
              minQuantity = FOOD_PARAMETERS.VEGETABLE.MIN_QUANTITY;
            } else {
              minQuantity = 5; // Minimum général
            }
            
            // Si déjà au minimum, passer au suivant
            if (currentQuantity <= minQuantity) continue;
            
            // Calculer la réduction nécessaire
            const carbsToReduce = excessCarbs;
            const qtyToReduce = Math.ceil((carbsToReduce / netCarbsPer100g) * 100);
            
            // Limiter la réduction pour ne pas descendre sous le minimum
            const maxReduction = Math.min(qtyToReduce, currentQuantity - minQuantity);
            
            // Si pas de réduction significative possible, passer au suivant
            if (maxReduction < 5) continue;
            
            // Nouvelle quantité (arrondie à 5g près)
            const newQuantity = roundFoodQuantity(currentQuantity - maxReduction, minQuantity);
            
            // Mettre à jour la quantité et les totaux nutritionnels
            const diffQty = newQuantity - currentQuantity; // Négatif
            const diffRatio = diffQty / 100;
            
            // Calculer l'impact nutritionnel
            const reducedNutrition = {
              calories: item.food.nutritionPer100g.calories * diffRatio,
              protein: item.food.nutritionPer100g.protein * diffRatio,
              fat: item.food.nutritionPer100g.fat * diffRatio,
              netCarbs: netCarbsPer100g * diffRatio
            };
            
            // Mettre à jour la quantité
            item.quantity = newQuantity;
            
            // Mettre à jour les totaux nutritionnels
            meal.totalNutrition.calories += reducedNutrition.calories;
            meal.totalNutrition.protein += reducedNutrition.protein;
            meal.totalNutrition.fat += reducedNutrition.fat;
            meal.totalNutrition.netCarbs += reducedNutrition.netCarbs;
            
            // Vérifier si on est sous la limite
            if (meal.totalNutrition.netCarbs <= targetMacros.carbs * MACRO_TOLERANCES.CARBS_MAX) {
              break;
            }
          }
        }
      }
      break;
  }
  
  // Arrondir toutes les valeurs nutritionnelles pour éviter les nombres bizarres
  meal.totalNutrition.calories = Math.round(meal.totalNutrition.calories);
  meal.totalNutrition.protein = Math.round(meal.totalNutrition.protein * 10) / 10;
  meal.totalNutrition.fat = Math.round(meal.totalNutrition.fat * 10) / 10;
  meal.totalNutrition.netCarbs = Math.round(meal.totalNutrition.netCarbs * 10) / 10;
}

/**
 * Adapte une recette pour qu'elle correspond mieux aux objectifs de macros
 * @param {Object} recipe - La recette à adapter
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {Number} servings - Nombre de portions souhaité
 * @returns {Object} Informations adaptées pour la recette
 */
function adaptRecipe(recipe, targetMacros, servings = 1) {
  if (!recipe || !recipe.nutritionPerServing) {
    return null;
  }
  
  // Calculer les macros pour la recette avec le nombre de portions demandé
  const baseNutrition = {
    calories: recipe.nutritionPerServing.calories * servings,
    protein: recipe.nutritionPerServing.protein * servings,
    fat: recipe.nutritionPerServing.fat * servings,
    netCarbs: recipe.nutritionPerServing.netCarbs * servings
  };
  
  // Calculer le facteur d'adaptation idéal pour s'approcher au mieux des objectifs
  // Priorité aux protéines et aux glucides (limiter)
  const proteinFactor = targetMacros.protein / baseNutrition.protein;
  const carbsFactor = targetMacros.carbs / baseNutrition.netCarbs;
  
  // Facteur final - prioriser le respect strict des glucides et un minimum de protéines
  let adaptationFactor;
  
  if (baseNutrition.netCarbs > targetMacros.carbs) {
    // Si trop de glucides, prioriser la réduction des glucides
    adaptationFactor = Math.min(carbsFactor, 1.0); // Ne jamais augmenter si les glucides dépassent
  } else if (baseNutrition.protein < targetMacros.protein * MACRO_TOLERANCES.PROTEIN_MIN) {
    // Si pas assez de protéines, prioriser l'augmentation de protéines
    adaptationFactor = Math.min(proteinFactor, 2.0); // Limiter le facteur à 2x
  } else {
    // Sinon, ajuster globalement
    adaptationFactor = (targetMacros.calories / baseNutrition.calories + proteinFactor) / 2;
    adaptationFactor = Math.min(Math.max(adaptationFactor, 0.5), 2.0); // Limiter entre 0.5x et 2x
  }
  
  // Arrondir le facteur à 0.25 près pour des portions plus naturelles
  const roundedFactor = Math.round(adaptationFactor * 4) / 4;
  
  // Calculer le nombre de portions adapté
  const adaptedServings = Math.max(0.5, roundedFactor * servings);
  
  // Calculer les macros adaptées
  return {
    servings: Math.round(adaptedServings * 10) / 10, // Arrondi à 0.1 près
    nutrition: {
      calories: Math.round(recipe.nutritionPerServing.calories * adaptedServings),
      protein: Math.round(recipe.nutritionPerServing.protein * adaptedServings * 10) / 10,
      fat: Math.round(recipe.nutritionPerServing.fat * adaptedServings * 10) / 10,
      netCarbs: Math.round(recipe.nutritionPerServing.netCarbs * adaptedServings * 10) / 10
    }
  };
}

/**
 * Crée un repas à partir d'une recette
 * @param {Object} recipe - La recette à utiliser
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {Boolean} isFavorite - Si la recette est un favori
 * @returns {Object} Le repas créé
 */
function createMealFromRecipe(recipe, targetMacros, isFavorite = false) {
  // Adapter la recette aux objectifs de macros
  const adaptedRecipe = adaptRecipe(recipe, targetMacros);
  
  if (!adaptedRecipe) return null;
  
  // Créer la structure du repas
  const meal = {
    name: generateRecipeMealName(recipe),
    items: [{
      type: 'recipe',
      recipe: recipe,
      recipeId: recipe.id,
      servings: adaptedRecipe.servings,
      isFavorite: isFavorite
    }],
    totalNutrition: {
      calories: adaptedRecipe.nutrition.calories,
      protein: adaptedRecipe.nutrition.protein,
      fat: adaptedRecipe.nutrition.fat,
      netCarbs: adaptedRecipe.nutrition.netCarbs
    }
  };
  
  // Vérifier si le repas respecte les limites de glucides
  if (meal.totalNutrition.netCarbs > targetMacros.carbs) {
    return null; // Rejeter si trop de glucides
  }
  
  // Vérifier si le repas fournit suffisamment de protéines
  if (meal.totalNutrition.protein < targetMacros.protein * MACRO_TOLERANCES.PROTEIN_MIN) {
    // On pourrait essayer de compléter avec des aliments protéinés,
    // mais pour simplifier on retourne null pour l'instant
    return null;
  }
  
  return meal;
}
/**
 * Génère un repas individuel à partir d'aliments et/ou recettes
 * @param {Array} availableFoods - Aliments disponibles
 * @param {Array} availableRecipes - Recettes disponibles
 * @param {Object} targetMacros - Objectifs de macronutriments pour le repas
 * @param {Object} options - Options de génération
 * @returns {Object} Repas généré ou null si impossible
 */
function generateSingleMeal(availableFoods, availableRecipes, targetMacros, options = {}) {
  // Options par défaut
  const defaultOptions = {
    favoriteRecipeIds: [],
    favoriteFoodIds: [],
    useFavorites: true,
    useRecipes: true,
    seasonFilter: null
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Structure de base du repas
  const meal = {
    name: "",
    items: [],
    totalNutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      netCarbs: 0,
    }
  };
  
  let recipeUsed = false;
  
  // ÉTAPE 1: Essayer d'utiliser une recette favorite si demandé
  if (mergedOptions.useRecipes && mergedOptions.useFavorites && 
      mergedOptions.favoriteRecipeIds && mergedOptions.favoriteRecipeIds.length > 0) {
    
    // Filtrer les recettes favorites disponibles
    const favoriteRecipes = availableRecipes.filter(recipe => 
      mergedOptions.favoriteRecipeIds.includes(recipe.id)
    );
    
    if (favoriteRecipes.length > 0) {
      // Prioriser les recettes pour trouver la plus adaptée aux objectifs
      const sortedRecipes = prioritizeRecipes(favoriteRecipes, [], targetMacros);
      
      // Essayer de créer un repas avec la meilleure recette
      for (const recipe of sortedRecipes) {
        const mealFromRecipe = createMealFromRecipe(recipe, targetMacros, true);
        if (mealFromRecipe) {
          recipeUsed = true;
          meal.name = mealFromRecipe.name;
          meal.items = mealFromRecipe.items;
          meal.totalNutrition = mealFromRecipe.totalNutrition;
          break;
        }
      }
    }
  }
  
  // ÉTAPE 2: Si pas de recette favorite utilisée, essayer une recette non-favorite
  if (!recipeUsed && mergedOptions.useRecipes && availableRecipes && availableRecipes.length > 0) {
    // Prioriser les recettes
    const sortedRecipes = prioritizeRecipes(availableRecipes, mergedOptions.favoriteRecipeIds, targetMacros);
    
    // Prendre les 3 meilleures recettes et en choisir une au hasard pour la variété
    const topRecipeCount = Math.min(3, sortedRecipes.length);
    const selectedRecipes = sortedRecipes.slice(0, topRecipeCount);
    const randomRecipe = selectedRecipes[Math.floor(Math.random() * topRecipeCount)];
    
    if (randomRecipe) {
      const mealFromRecipe = createMealFromRecipe(randomRecipe, targetMacros, 
                                               mergedOptions.favoriteRecipeIds.includes(randomRecipe.id));
      if (mealFromRecipe) {
        recipeUsed = true;
        meal.name = mealFromRecipe.name;
        meal.items = mealFromRecipe.items;
        meal.totalNutrition = mealFromRecipe.totalNutrition;
      }
    }
  }
  
  // ÉTAPE 3: Si aucune recette utilisée, composer un repas à partir d'aliments individuels
  if (!recipeUsed) {
    // Filtrer les aliments par saison si nécessaire
    let filteredFoods = [...availableFoods];
    if (mergedOptions.seasonFilter) {
      filteredFoods = filteredFoods.filter(food => 
        !food.food.seasons || food.food.seasons.includes(mergedOptions.seasonFilter)
      );
    }
    
    // Organiser les aliments par type et prioriser les favoris
    const foodsByType = organizeAndPrioritizeFoods(filteredFoods, mergedOptions.favoriteFoodIds, targetMacros);
    
    // 1. PHASE PROTÉINES: Ajouter des aliments protéinés
    const proteinSuccess = addProteinFoods(meal, foodsByType[FOOD_TYPES.PROTEIN], targetMacros);
    
    if (!proteinSuccess) {
      return null; // Impossible de créer un repas avec suffisamment de protéines
    }
    
    // 2. PHASE LÉGUMES: Ajouter des légumes
    addVegetableFoods(meal, foodsByType[FOOD_TYPES.VEGETABLE], targetMacros);
    
    // 3. PHASE LIPIDES: Compléter avec des sources de graisses
    addFatFoods(meal, foodsByType[FOOD_TYPES.FAT], targetMacros);
    
    // 4. ÉQUILIBRAGE FINAL: Ajuster les quantités pour atteindre les objectifs
    balanceMealMacros(meal, targetMacros);
    
    // Générer un nom pour le repas
    meal.name = generateMealName(meal.items);
  }
  
  // ÉTAPE 4: Vérification finale du repas
  const validation = validateMealMacros(meal.totalNutrition, targetMacros);
  
  if (!validation.isValid) {
    console.log(`Repas rejeté: ${validation.issues.join(', ')}`);
    return null;
  }
  
  return meal;
}

/**
 * Génère un plan de repas complet
 * @param {Array} availableFoods - Aliments disponibles
 * @param {Array} availableRecipes - Recettes disponibles
 * @param {Object} nutritionalNeeds - Besoins nutritionnels journaliers
 * @param {Object} options - Options de génération
 * @returns {Array} Repas générés
 */
function generateMealPlan(availableFoods, availableRecipes, nutritionalNeeds, options = {}) {
  // Options par défaut
  const defaultOptions = {
    mealCount: 3,
    useRecipes: true,
    useFavorites: true,
    favoriteRecipeIds: [],
    favoriteFoodIds: [],
    seasonFilter: getCurrentSeason(),
    maxAttempts: 5 // Maximum de tentatives par repas
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Valider les données d'entrée
  if (!availableFoods || availableFoods.length < 3) {
    console.error("Pas assez d'aliments disponibles pour générer un plan");
    return [];
  }
  
  // Ne garder que les aliments avec une quantité positive
  const validFoods = availableFoods.filter(item => item.quantity > 0);
  
  // Utiliser les besoins nutritionnels fournis ou des valeurs par défaut
  const needs = nutritionalNeeds || {
    calories: 2000,
    protein: 150,
    fat: 150,
    carbs: 25
  };
  
  // Calculer les objectifs par repas
  const mealsPerDay = mergedOptions.mealCount;
  const targetMacrosPerMeal = {
    protein: needs.protein / mealsPerDay,
    fat: needs.fat / mealsPerDay,
    carbs: needs.carbs / mealsPerDay
  };
  
  console.log(`Génération de ${mealsPerDay} repas avec objectifs par repas:`, targetMacrosPerMeal);
  
  const generatedMeals = [];
  const copyOfFoods = [...validFoods]; // Copie pour suivre la consommation
  
  // Générer chaque repas
  for (let i = 0; i < mealsPerDay; i++) {
    let meal = null;
    let attempts = 0;
    
    // Essayer plusieurs fois de générer un repas valide
    while (!meal && attempts < mergedOptions.maxAttempts) {
      attempts++;
      
      try {
        meal = generateSingleMeal(
          copyOfFoods,
          availableRecipes,
          targetMacrosPerMeal,
          mergedOptions
        );
      } catch (error) {
        console.error(`Erreur lors de la génération du repas ${i+1}, tentative ${attempts}:`, error);
        meal = null;
      }
    }
    
    if (meal) {
      generatedMeals.push(meal);
      
      // Mettre à jour les quantités disponibles après chaque repas généré
      meal.items.forEach(mealItem => {
        if (mealItem.type === 'recipe') return; // Les recettes n'affectent pas les disponibilités
        
        const foodIndex = copyOfFoods.findIndex(item => item.foodId === mealItem.foodId);
        
        if (foodIndex !== -1) {
          copyOfFoods[foodIndex].quantity -= mealItem.quantity;
          // Si la quantité tombe à zéro ou moins, supprimer l'aliment
          if (copyOfFoods[foodIndex].quantity <= 0) {
            copyOfFoods.splice(foodIndex, 1);
          }
        }
      });
    } else {
      console.warn(`Impossible de générer le repas ${i+1} après ${mergedOptions.maxAttempts} tentatives`);
    }
  }
  
  return generatedMeals;
}

/**
 * Obtient la saison actuelle
 * @returns {string} Saison actuelle ('printemps', 'été', 'automne', 'hiver')
 */
function getCurrentSeason() {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'printemps';
  if (month >= 5 && month <= 7) return 'été';
  if (month >= 8 && month <= 10) return 'automne';
  return 'hiver';
}

/**
 * Analyse la qualité d'un plan de repas
 * @param {Array} meals - Repas générés
 * @param {Object} dailyTargets - Objectifs journaliers
 * @returns {Object} Résultats de l'analyse
 */
function analyzeMealPlan(meals, dailyTargets) {
  if (!meals || meals.length === 0) {
    return {
      valid: false,
      totalNutrition: { calories: 0, protein: 0, fat: 0, netCarbs: 0 },
      achievements: { protein: 0, fat: 0, carbs: 0 },
      issues: ["Aucun repas généré"]
    };
  }
  
  // Calculer les macros totales
  const totalNutrition = {
    calories: 0,
    protein: 0,
    fat: 0,
    netCarbs: 0
  };
  
  meals.forEach(meal => {
    totalNutrition.calories += meal.totalNutrition.calories;
    totalNutrition.protein += meal.totalNutrition.protein;
    totalNutrition.fat += meal.totalNutrition.fat;
    totalNutrition.netCarbs += meal.totalNutrition.netCarbs;
  });
  
  // Calculer les pourcentages d'atteinte
  const achievements = {
    protein: totalNutrition.protein / dailyTargets.protein,
    fat: totalNutrition.fat / dailyTargets.fat,
    carbs: totalNutrition.netCarbs / dailyTargets.carbs
  };
  
  // Identifier les problèmes
  const issues = [];
  
  if (achievements.protein < MACRO_TOLERANCES.PROTEIN_MIN) {
    issues.push(`Protéines insuffisantes: ${Math.round(achievements.protein * 100)}% de l'objectif`);
  }
  
  if (achievements.fat > MACRO_TOLERANCES.FAT_MAX) {
    issues.push(`Excès de lipides: ${Math.round(achievements.fat * 100)}% de l'objectif`);
  }
  
  if (achievements.carbs > MACRO_TOLERANCES.CARBS_MAX) {
    issues.push(`Excès de glucides: ${Math.round(achievements.carbs * 100)}% de l'objectif`);
  }
  
  return {
    valid: issues.length === 0,
    totalNutrition,
    achievements,
    issues
  };
}

// Exporter les fonctions principales
export {
  generateMealPlan,
  generateSingleMeal,
  analyzeMealPlan,
  calculateKetoCompatibilityScore,
  validateMealMacros,
  adaptRecipe,
  balanceMealMacros,
  generateMealsFromFridge // Ajouter cet export
};

// Et ajouter la fonction manquante:
function generateMealsFromFridge(availableFoods, nutritionNeeds, options) {
  // Vous pouvez simplement créer un alias pour la nouvelle fonction generateMealPlan
  return generateMealPlan(availableFoods, [], nutritionNeeds, options);
}
