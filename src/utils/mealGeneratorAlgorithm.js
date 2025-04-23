/**
 * Algorithme de génération de repas basé sur les aliments disponibles dans le frigo
 * 
 * Cet algorithme prend en compte:
 * - Les aliments disponibles et leurs quantités
 * - Les besoins nutritionnels de l'utilisateur
 * - Les préférences (faible en glucides, riche en protéines, équilibré)
 * - Le profil keto sélectionné (standard, prise de masse, perte de poids, etc.)
 * 
 * Il génère des repas qui respectent les contraintes keto tout en utilisant les aliments disponibles.
 * IMPORTANT: Priorité de 95% minimum pour les protéines, jamais plus de 100% pour les lipides et glucides.
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

// Profils keto disponibles avec leurs ratios de macronutriments
const KETO_PROFILES = {
  'standard': {
    FAT_PERCENTAGE: 0.75, // 75% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.20, // 20% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.05, // 5% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 15, // Maximum de glucides nets par repas
    PROTEIN_PRIORITY: 1.5, // Priorité augmentée pour les protéines (était 1)
    MAX_PROTEIN_QUANTITY: 250, // Quantité maximale d'aliment protéiné augmentée (était 200g)
    MIN_PROTEIN_TARGET_PERCENTAGE: 0.95, // Minimum 95% de l'objectif protéique
  },
  'perte_poids': {
    FAT_PERCENTAGE: 0.75, // 75% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.20, // 20% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.05, // 5% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 10, // Maximum réduit de glucides nets par repas
    PROTEIN_PRIORITY: 1.6, // Priorité plus élevée pour les protéines (était 1.2)
    MAX_PROTEIN_QUANTITY: 280, // Quantité maximale d'aliment protéiné augmentée (était 250g)
    MIN_PROTEIN_TARGET_PERCENTAGE: 0.95, // Minimum 95% de l'objectif protéique
  },
  'prise_masse': {
    FAT_PERCENTAGE: 0.65, // 65% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.30, // 30% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.05, // 5% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 15, // Maximum de glucides nets par repas
    PROTEIN_PRIORITY: 2.0, // Priorité très élevée pour les protéines (était 1.5)
    MAX_PROTEIN_QUANTITY: 400, // Quantité maximale d'aliment protéiné augmentée (était 350g)
    MIN_PROTEIN_TARGET_PERCENTAGE: 0.97, // Minimum 97% de l'objectif protéique
  },
  'cyclique': {
    FAT_PERCENTAGE: 0.70, // 70% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.20, // 20% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.10, // 10% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 25, // Maximum plus élevé de glucides nets par repas
    PROTEIN_PRIORITY: 1.5, // Priorité augmentée pour les protéines (était 1)
    MAX_PROTEIN_QUANTITY: 250, // Quantité maximale d'aliment protéiné augmentée (était 200g)
    MIN_PROTEIN_TARGET_PERCENTAGE: 0.95, // Minimum 95% de l'objectif protéique
  },
  'hyperproteine': {
    FAT_PERCENTAGE: 0.40, // 40% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.50, // 50% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.10, // 10% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 20, // Maximum de glucides nets par repas
    PROTEIN_PRIORITY: 2.5, // Priorité extrêmement élevée pour les protéines (était 2)
    MAX_PROTEIN_QUANTITY: 450, // Quantité maximale d'aliment protéiné très augmentée (était 400g)
    MIN_PROTEIN_TARGET_PERCENTAGE: 0.98, // Minimum 98% de l'objectif protéique
  }
};

// Fonction pour obtenir les ratios keto en fonction du profil sélectionné
function getKetoRatios(ketoProfile = 'standard') {
  return KETO_PROFILES[ketoProfile] || KETO_PROFILES.standard;
}

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
 * @param {string} ketoProfile - Le profil keto sélectionné
 * @returns {number} Score de compatibilité keto (0-10)
 */
function calculateKetoCompatibilityScore(food, ketoProfile = 'standard') {
  const { protein, fat, carbs, fiber = 0 } = food.nutritionPer100g;
  const netCarbs = Math.max(0, carbs - fiber);
  const ketoRatios = getKetoRatios(ketoProfile);
  
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
  const fatDeviation = Math.abs(fatRatio - ketoRatios.FAT_PERCENTAGE) * 1.5; // Réduit de 2 à 1.5
  const proteinDeviation = Math.abs(proteinRatio - ketoRatios.PROTEIN_PERCENTAGE) * 0.8; // Réduit de 1 à 0.8 (moins pénalisant)
  // Pénaliser davantage les glucides élevés
  const carbsDeviation = Math.abs(carbsRatio - ketoRatios.CARBS_PERCENTAGE) * 4; // Augmenté de 3 à 4
  
  // Calculer le score (10 - déviations)
  let score = 10 - (fatDeviation + proteinDeviation + carbsDeviation) * 10;
  
  // Pénaliser fortement les aliments à teneur élevée en glucides nets
  if (netCarbs > 8) { // Réduit de 10 à 8 pour être plus strict sur les glucides
    score -= (netCarbs - 8) * 0.7; // Augmenté de 0.5 à 0.7
  }
  
  // Bonifier les aliments riches en protéines en fonction du profil
  const proteinBonus = (protein / 100) * ketoRatios.PROTEIN_PRIORITY;
  score += proteinBonus;
  
  // Borner le score entre 0 et 10
  return Math.max(0, Math.min(10, score));
}
/**
 * Génère un nom pour le repas en fonction de ses ingrédients principaux et du profil keto
 * @param {string} ketoProfile - Le profil keto utilisé
 * @returns {string} Nom du repas
 */
function generateMealName(ketoProfile = 'standard') {
  const mealTypes = [
    'Assiette', 'Plat', 'Bowl', 'Cocotte', 'Poêlée', 'Salade'
  ];
  
  const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
  
  let prefix = 'Keto';
  if (ketoProfile === 'prise_masse') {
    prefix = 'Keto Protéiné';
  } else if (ketoProfile === 'hyperproteine') {
    prefix = 'Keto Hyperprotéiné';
  } else if (ketoProfile === 'perte_poids') {
    prefix = 'Keto Minceur';
  }
  
  return `${mealType} ${prefix} du frigo`;
}

/**
 * Vérifie si un repas respecte les objectifs de macros à un seuil minimum (notamment protéines)
 * @param {Object} mealNutrition - Nutrition totale du repas
 * @param {Object} targetMacros - Objectifs de macros pour le repas
 * @param {string} ketoProfile - Le profil keto utilisé
 * @returns {Object} Résultat de la validation avec statut et messages
 */
function validateMealMacros(mealNutrition, targetMacros, ketoProfile = 'standard') {
  const ketoRatios = getKetoRatios(ketoProfile);
  const minProteinPercentage = ketoRatios.MIN_PROTEIN_TARGET_PERCENTAGE;
  
  // Calculer les pourcentages d'atteinte des objectifs
  const proteinPercentage = mealNutrition.protein / targetMacros.protein;
  const fatPercentage = mealNutrition.fat / targetMacros.fat;
  const carbsPercentage = mealNutrition.netCarbs / targetMacros.carbs;
  
  const issues = [];
  
  // Vérifier l'objectif protéique (exigence très stricte)
  if (proteinPercentage < minProteinPercentage) {
    issues.push(`Protéines insuffisantes: ${Math.round(proteinPercentage * 100)}% de l'objectif (minimum ${Math.round(minProteinPercentage * 100)}% requis)`);
  }
  
  // Vérifier que les lipides ne dépassent pas 100%
  if (fatPercentage > 1.0) {
    issues.push(`Excès de lipides: ${Math.round(fatPercentage * 100)}% de l'objectif`);
  }
  
  // Vérifier que les glucides ne dépassent pas 100%
  if (carbsPercentage > 1.0) {
    issues.push(`Excès de glucides: ${Math.round(carbsPercentage * 100)}% de l'objectif`);
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
 * Trouve les combinaisons d'aliments qui forment un repas équilibré keto
 * @param {Array} availableFoods - Liste des aliments disponibles avec quantités
 * @param {Object} targetNutrition - Objectifs nutritionnels pour le repas
 * @param {Object} options - Options de génération, incluant le profil keto
 * @returns {Array} Repas générés respectant les contraintes
 */
function findFoodCombinations(availableFoods, targetNutrition, options) {
  const ketoProfile = options.ketoProfile || 'standard';
  const ketoRatios = getKetoRatios(ketoProfile);
  
  // Trier les aliments par score de compatibilité keto
  const sortedFoods = [...availableFoods].sort((a, b) => {
    const scoreA = calculateKetoCompatibilityScore(a.food, ketoProfile);
    const scoreB = calculateKetoCompatibilityScore(b.food, ketoProfile);
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
  const mealsPerDay = options.mealCount || 3; // Valeur par défaut si non spécifiée
  const caloriesPerMeal = targetNutrition.calories / mealsPerDay;
  
  // Limites pour chaque macronutriment par repas (en grammes)
  const targetMacros = {
    protein: (targetNutrition.protein || 100) / mealsPerDay,
    fat: (targetNutrition.fat || 150) / mealsPerDay,
    carbs: (targetNutrition.carbs || 25) / mealsPerDay,
  };
  
  const generatedMeals = [];
  let generationAttempts = 0;
  const maxGenerationAttempts = 5; // Maximum de tentatives par repas
  
  // Essayer de générer le nombre requis de repas
  for (let i = 0; i < options.mealCount; i++) {
    let meal = null;
    generationAttempts = 0;
    
    // Essayer plusieurs fois de générer un repas valide
    while (!meal && generationAttempts < maxGenerationAttempts) {
      generationAttempts++;
      
      meal = generateSingleMeal(
        foodsByType,
        caloriesPerMeal,
        targetMacros,
        { ...options, ketoProfile }
      );
      
      // Vérifier si le repas respecte les contraintes de macros
      if (meal) {
        const validation = validateMealMacros(meal.totalNutrition, targetMacros, ketoProfile);
        if (!validation.isValid) {
          console.log(`Repas rejeté (tentative ${generationAttempts}): ${validation.issues.join(', ')}`);
          meal = null; // Rejeter le repas et réessayer
        }
      }
    }
    
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
    } else {
      console.warn(`Impossible de générer un repas valide après ${maxGenerationAttempts} tentatives`);
    }
  }
  
  return generatedMeals;
}

/**
 * Génère un seul repas équilibré à partir des aliments disponibles
 * @param {Object} foodsByType - Aliments disponibles organisés par type
 * @param {number} targetCalories - Calories cibles pour le repas
 * @param {Object} targetMacros - Macronutriments cibles pour le repas
 * @param {Object} options - Options de génération, incluant le profil keto
 * @returns {Object|null} Repas généré ou null si impossible
 */
function generateSingleMeal(foodsByType, targetCalories, targetMacros, options) {
  const ketoProfile = options.ketoProfile || 'standard';
  const ketoRatios = getKetoRatios(ketoProfile);
  
  // Structure de base du repas
  const meal = {
    name: generateMealName(ketoProfile),
    items: [],
    totalNutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      netCarbs: 0,
    },
  };
// Calculer la répartition des calories selon le profil keto
  const proteinCalories = targetCalories * ketoRatios.PROTEIN_PERCENTAGE;
  const fatCalories = targetCalories * ketoRatios.FAT_PERCENTAGE;
  const carbsCalories = targetCalories * ketoRatios.CARBS_PERCENTAGE;
  
  // NOUVEAU: Approche améliorée pour s'assurer d'atteindre les objectifs protéiques
  
  // 1. PHASE PROTÉINES: Priorité absolue aux protéines
  // Utiliser un facteur plus élevé pour garantir l'atteinte de l'objectif protéique
  // On vise 120% de l'objectif, puis on ajustera lors de la validation finale
  const proteinTargetCalories = proteinCalories * 1.5; // Facteur 1.5x pour s'assurer d'atteindre l'objectif
  
  // Essayer d'ajouter suffisamment d'aliments protéinés pour atteindre l'objectif
  let proteinSuccess = addProteinFoods(meal, foodsByType[FOOD_TYPES.PROTEIN], proteinTargetCalories, targetMacros, options);
  
  if (!proteinSuccess) {
    return null; // Impossible de créer un repas avec suffisamment de protéines
  }
  
  // Vérifier si nous avons atteint au moins le minimum requis de protéines
  const proteinPercentage = meal.totalNutrition.protein / targetMacros.protein;
  if (proteinPercentage < ketoRatios.MIN_PROTEIN_TARGET_PERCENTAGE) {
    return null; // Échec: impossible d'atteindre l'objectif protéique minimum
  }
  
  // 2. PHASE LÉGUMES: Ajouter des légumes en respectant la limite de glucides
  // Calculer les glucides restants disponibles
  const currentNetCarbs = meal.totalNutrition.netCarbs;
  const maxAllowedNetCarbs = Math.min(targetMacros.carbs, ketoRatios.MAX_NET_CARBS_PER_MEAL);
  const remainingNetCarbs = maxAllowedNetCarbs - currentNetCarbs;
  
  if (remainingNetCarbs > 1 && foodsByType[FOOD_TYPES.VEGETABLE].length > 0) {
    // Objectif de calories pour les légumes (limité par les glucides restants)
    const vegetableTargetCalories = Math.min(
      carbsCalories * 1.5, // Facteur 1.5x pour permettre suffisamment de légumes
      remainingNetCarbs * 10 // Approximation: environ 10 calories par gramme de glucides nets
    );
    
    addVegetableFoods(meal, foodsByType[FOOD_TYPES.VEGETABLE], vegetableTargetCalories, 
                     remainingNetCarbs, targetMacros, options);
  }
  
  // 3. PHASE LIPIDES: Compléter avec des sources de graisse
  // Ne pas dépasser l'objectif de lipides (maximum 100%)
  const fatRemaining = targetMacros.fat - meal.totalNutrition.fat;
  
  if (fatRemaining > 0 && foodsByType[FOOD_TYPES.FAT].length > 0) {
    // Calculer les calories correspondant aux lipides restants
    const fatRemainingCalories = fatRemaining * CALORIC_FACTORS.FAT;
    
    addFatFoods(meal, foodsByType[FOOD_TYPES.FAT], fatRemainingCalories, targetMacros, options);
  }
  
  // 4. PHASE ÉQUILIBRAGE: Si nécessaire, compléter avec d'autres aliments appropriés
  if (meal.totalNutrition.calories < targetCalories * 0.85) {
    // Déterminer quels macros doivent être complétés
    const macrosNeeded = {
      protein: targetMacros.protein - meal.totalNutrition.protein,
      fat: targetMacros.fat - meal.totalNutrition.fat,
      carbs: targetMacros.carbs - meal.totalNutrition.netCarbs
    };
    
    // Priorité aux macros à compléter selon le profil
    let priorityMacro = 'protein';
    
    if (macrosNeeded.protein <= 0) {
      // Si objectif protéique atteint, prioriser les lipides ou les glucides selon ce qui manque le plus
      priorityMacro = (macrosNeeded.fat > macrosNeeded.carbs * 5) ? 'fat' : 'carbs';
    }
    
    // Fusionner tous les aliments restants
    const remainingFoods = [
      ...foodsByType[FOOD_TYPES.PROTEIN], 
      ...foodsByType[FOOD_TYPES.FAT], 
      ...foodsByType[FOOD_TYPES.VEGETABLE],
      ...foodsByType[FOOD_TYPES.OTHER]
    ];
    
    // Filtrer les aliments déjà utilisés et trier selon le besoin prioritaire
    const existingFoodIds = meal.items.map(item => item.foodId);
    const filteredFoods = remainingFoods
      .filter(item => !existingFoodIds.includes(item.foodId))
      .sort((a, b) => {
        // Triez selon le macro prioritaire
        if (priorityMacro === 'protein') {
          return b.food.nutritionPer100g.protein - a.food.nutritionPer100g.protein;
        } else if (priorityMacro === 'fat') {
          return b.food.nutritionPer100g.fat - a.food.nutritionPer100g.fat;
        } else {
          // Pour les glucides, préférer les aliments à faible teneur
          const netCarbsA = a.food.nutritionPer100g.carbs - (a.food.nutritionPer100g.fiber || 0);
          const netCarbsB = b.food.nutritionPer100g.carbs - (b.food.nutritionPer100g.fiber || 0);
          return netCarbsA - netCarbsB;
        }
      });
    
    const remainingCalories = targetCalories * 0.95 - meal.totalNutrition.calories;
    
    if (remainingCalories > 0 && filteredFoods.length > 0) {
      addFoodOfType(meal, filteredFoods, remainingCalories, targetMacros, {
        ...options,
        prioritizeMacro: priorityMacro
      });
    }
  }
  
  // Vérifier si le repas est viable (minimum de calories et au moins 2 aliments)
  if (meal.totalNutrition.calories < targetCalories * 0.5 || meal.items.length < 2) {
    return null;
  }
  
  // Ajuster les quantités finales pour équilibrer les macros si nécessaire
  balanceMealMacros(meal, targetMacros, ketoProfile);
  
  // Vérification finale des objectifs protéiques
  const finalProteinPercentage = meal.totalNutrition.protein / targetMacros.protein;
  if (finalProteinPercentage < ketoRatios.MIN_PROTEIN_TARGET_PERCENTAGE) {
    console.log(`Repas rejeté: objectif protéique non atteint (${Math.round(finalProteinPercentage * 100)}%)`);
    return null;
  }
  
  // Vérification finale pour s'assurer que les limites de lipides et glucides ne sont pas dépassées
  if (meal.totalNutrition.fat > targetMacros.fat || meal.totalNutrition.netCarbs > targetMacros.carbs) {
    console.log(`Repas rejeté: limites de lipides ou glucides dépassées (Lipides: ${Math.round(meal.totalNutrition.fat)}g, Glucides: ${Math.round(meal.totalNutrition.netCarbs)}g)`);
    return null;
  }
  
  return meal;
}

/**
 * Ajoute spécifiquement des aliments protéinés pour atteindre l'objectif de protéines
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} proteinFoods - Aliments protéinés disponibles
 * @param {number} targetProteinCalories - Calories protéiques cibles
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {Object} options - Options de génération
 * @returns {boolean} True si suffisamment de protéines ajoutées, false sinon
 */
function addProteinFoods(meal, proteinFoods, targetProteinCalories, targetMacros, options) {
  if (proteinFoods.length === 0) return false;
  
  const ketoProfile = options.ketoProfile || 'standard';
  const ketoRatios = getKetoRatios(ketoProfile);
  
  // Trier les aliments protéinés par teneur en protéines (du plus riche au moins riche)
  proteinFoods.sort((a, b) => 
    b.food.nutritionPer100g.protein - a.food.nutritionPer100g.protein
  );
  
  // Sélectionner plusieurs sources de protéines pour assurer la diversité et l'atteinte des objectifs
  const proteinGoal = targetMacros.protein * ketoRatios.MIN_PROTEIN_TARGET_PERCENTAGE;
  let currentProtein = meal.totalNutrition.protein;
  let attemptsLeft = Math.min(3, proteinFoods.length); // Maximum 3 aliments protéinés différents
  
  while (currentProtein < proteinGoal && attemptsLeft > 0 && proteinFoods.length > 0) {
    attemptsLeft--;
    
    // Sélectionner une source protéinée parmi les meilleures disponibles
    // Plus l'objectif est loin d'être atteint, plus on prend des aliments riches en protéines
    const selectionIndex = Math.min(
      Math.floor((proteinGoal - currentProtein) / 10), // Plus le déficit est grand, plus on prend en haut de la liste
      proteinFoods.length - 1
    );
    
    const selectedFood = proteinFoods[selectionIndex];
    
    // Éviter les doublons
    if (meal.items.some(item => item.foodId === selectedFood.foodId)) {
      // Supprimer cet aliment et continuer
      proteinFoods.splice(selectionIndex, 1);
      continue;
    }
    
    // Calculer la quantité nécessaire pour atteindre l'objectif protéique
    const proteinPer100g = selectedFood.food.nutritionPer100g.protein;
    const proteinNeeded = proteinGoal - currentProtein;
    const quantityForProtein = Math.ceil((proteinNeeded / proteinPer100g) * 100);
    
    // Limiter la quantité à une valeur raisonnable et à la disponibilité
    const maxQuantity = Math.min(
      ketoRatios.MAX_PROTEIN_QUANTITY,
      selectedFood.quantity
    );
    
    // Ajuster la quantité pour ne pas dépasser le maximum
    const finalQuantity = Math.min(quantityForProtein, maxQuantity);
    
    // Arrondir à 5g près
    const roundedQuantity = Math.max(10, Math.round(finalQuantity / 5) * 5);
    
    // Calculer les nutriments pour cette quantité
    const ratio = roundedQuantity / 100;
    const itemNutrition = {
      calories: selectedFood.food.nutritionPer100g.calories * ratio,
      protein: selectedFood.food.nutritionPer100g.protein * ratio,
      fat: selectedFood.food.nutritionPer100g.fat * ratio,
      carbs: selectedFood.food.nutritionPer100g.carbs * ratio,
      netCarbs: (
        selectedFood.food.nutritionPer100g.carbs - (selectedFood.food.nutritionPer100g.fiber || 0)
      ) * ratio,
    };
    
    // Vérifier que l'ajout de cet aliment ne dépasse pas la limite de glucides
    if (meal.totalNutrition.netCarbs + itemNutrition.netCarbs > targetMacros.carbs) {
      // Essayer de réduire la quantité pour respecter la limite de glucides
      const maxAllowedForCarbs = ((targetMacros.carbs - meal.totalNutrition.netCarbs) / 
                               (selectedFood.food.nutritionPer100g.carbs - (selectedFood.food.nutritionPer100g.fiber || 0))) * 100;
      
      if (maxAllowedForCarbs < 10) {
        // Trop peu pour être utile, essayer un autre aliment
        proteinFoods.splice(selectionIndex, 1);
        continue;
      }
      
      // Ajuster la quantité pour respecter la limite de glucides
      const newQuantity = Math.floor(maxAllowedForCarbs / 5) * 5;
      const newRatio = newQuantity / 100;
      
      // Recalculer les nutriments
      itemNutrition.calories = selectedFood.food.nutritionPer100g.calories * newRatio;
      itemNutrition.protein = selectedFood.food.nutritionPer100g.protein * newRatio;
      itemNutrition.fat = selectedFood.food.nutritionPer100g.fat * newRatio;
      itemNutrition.carbs = selectedFood.food.nutritionPer100g.carbs * newRatio;
      itemNutrition.netCarbs = (
        selectedFood.food.nutritionPer100g.carbs - (selectedFood.food.nutritionPer100g.fiber || 0)
      ) * newRatio;
    }
    
    // Ajouter l'aliment au repas
    meal.items.push({
      food: selectedFood.food,
      foodId: selectedFood.foodId,
      quantity: roundedQuantity,
    });
    
    // Mettre à jour les totaux nutritionnels du repas
    meal.totalNutrition.calories += itemNutrition.calories;
    meal.totalNutrition.protein += itemNutrition.protein;
    meal.totalNutrition.fat += itemNutrition.fat;
    meal.totalNutrition.netCarbs += itemNutrition.netCarbs;
    
    // Mettre à jour le compteur de protéines
    currentProtein = meal.totalNutrition.protein;
    
    // Supprimer cet aliment de la liste pour éviter de le réutiliser
    proteinFoods.splice(selectionIndex, 1);
  }
  
  // Vérifier si nous avons atteint l'objectif minimal de protéines
  return meal.totalNutrition.protein >= targetMacros.protein * ketoRatios.MIN_PROTEIN_TARGET_PERCENTAGE;
}
/**
 * Ajoute spécifiquement des légumes en respectant la limite de glucides
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} vegetableFoods - Légumes disponibles
 * @param {number} targetCalories - Calories cibles pour les légumes
 * @param {number} maxNetCarbs - Maximum de glucides nets disponibles
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {Object} options - Options de génération
 */
function addVegetableFoods(meal, vegetableFoods, targetCalories, maxNetCarbs, targetMacros, options) {
  if (vegetableFoods.length === 0 || maxNetCarbs <= 0) return;
  
  // Trier les légumes par teneur en glucides nets (du moins au plus)
  vegetableFoods.sort((a, b) => {
    const netCarbsA = a.food.nutritionPer100g.carbs - (a.food.nutritionPer100g.fiber || 0);
    const netCarbsB = b.food.nutritionPer100g.carbs - (b.food.nutritionPer100g.fiber || 0);
    return netCarbsA - netCarbsB;
  });
  
  // Sélectionner 1-2 légumes différents
  const vegetableCount = Math.min(2, vegetableFoods.length);
  let currentNetCarbs = 0;
  let caloriesAdded = 0;
  
  for (let i = 0; i < vegetableCount; i++) {
    // Choisir un légume qui n'est pas déjà dans le repas
    let selectedVegetable = null;
    for (const vegetable of vegetableFoods) {
      if (!meal.items.some(item => item.foodId === vegetable.foodId)) {
        selectedVegetable = vegetable;
        break;
      }
    }
    
    if (!selectedVegetable) continue; // Pas de légume disponible
    
    // Calculer combien de ce légume nous pouvons ajouter sans dépasser la limite de glucides
    const netCarbsPer100g = selectedVegetable.food.nutritionPer100g.carbs - 
                          (selectedVegetable.food.nutritionPer100g.fiber || 0);
    
    if (netCarbsPer100g <= 0) netCarbsPer100g = 0.1; // Éviter division par zéro
    
    const caloriesPer100g = selectedVegetable.food.nutritionPer100g.calories;
    const remainingNetCarbs = maxNetCarbs - currentNetCarbs;
    const remainingCalories = targetCalories - caloriesAdded;
    
    // Calculer la quantité maximale selon les contraintes
    const maxQuantityByCarbs = Math.floor((remainingNetCarbs / netCarbsPer100g) * 100);
    const maxQuantityByCalories = caloriesPer100g > 0 ? 
                               Math.floor((remainingCalories / caloriesPer100g) * 100) : 300;
    const availableQuantity = selectedVegetable.quantity;
    
    // Choisir la quantité la plus contraignante
    let quantity = Math.min(
      maxQuantityByCarbs,
      maxQuantityByCalories,
      availableQuantity,
      300 // Maximum raisonnable pour un légume
    );
    
    // Minimum 50g de légumes si possible
    quantity = Math.max(Math.min(50, availableQuantity), quantity);
    
    // Arrondir à 5g près
    quantity = Math.round(quantity / 5) * 5;
    
    if (quantity <= 0) continue; // Quantité trop faible, passer au légume suivant
    
    // Calculer les nutriments pour cette quantité
    const ratio = quantity / 100;
    const itemNutrition = {
      calories: selectedVegetable.food.nutritionPer100g.calories * ratio,
      protein: selectedVegetable.food.nutritionPer100g.protein * ratio,
      fat: selectedVegetable.food.nutritionPer100g.fat * ratio,
      carbs: selectedVegetable.food.nutritionPer100g.carbs * ratio,
      netCarbs: netCarbsPer100g * ratio,
    };
    
    // Ajouter le légume au repas
    meal.items.push({
      food: selectedVegetable.food,
      foodId: selectedVegetable.foodId,
      quantity: quantity,
    });
    
    // Mettre à jour les totaux nutritionnels
    meal.totalNutrition.calories += itemNutrition.calories;
    meal.totalNutrition.protein += itemNutrition.protein;
    meal.totalNutrition.fat += itemNutrition.fat;
    meal.totalNutrition.netCarbs += itemNutrition.netCarbs;
    
    // Mettre à jour les compteurs
    currentNetCarbs += itemNutrition.netCarbs;
    caloriesAdded += itemNutrition.calories;
    
    // Supprimer ce légume des options disponibles
    vegetableFoods = vegetableFoods.filter(veg => veg.foodId !== selectedVegetable.foodId);
    
    // Arrêter si nous avons atteint la limite de glucides
    if (currentNetCarbs >= maxNetCarbs || vegetableFoods.length === 0) {
      break;
    }
  }
}

/**
 * Ajoute spécifiquement des sources de graisses sans dépasser l'objectif
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} fatFoods - Sources de graisses disponibles
 * @param {number} targetCalories - Calories cibles pour les graisses
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {Object} options - Options de génération
 */
function addFatFoods(meal, fatFoods, targetCalories, targetMacros, options) {
  if (fatFoods.length === 0 || targetCalories <= 0) return;
  
  // Ne pas dépasser l'objectif de lipides
  const fatRemaining = targetMacros.fat - meal.totalNutrition.fat;
  if (fatRemaining <= 0) return;
  
  // Trier les sources de graisses par teneur en lipides (du plus au moins)
  fatFoods.sort((a, b) => 
    b.food.nutritionPer100g.fat - a.food.nutritionPer100g.fat
  );
  
  // Sélectionner 1-2 sources de graisses différentes
  const fatCount = Math.min(2, fatFoods.length);
  let caloriesAdded = 0;
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
    
    // Calculer combien nous pouvons ajouter sans dépasser l'objectif
    const fatPer100g = selectedFat.food.nutritionPer100g.fat;
    const caloriesPer100g = selectedFat.food.nutritionPer100g.calories;
    const netCarbsPer100g = selectedFat.food.nutritionPer100g.carbs - 
                          (selectedFat.food.nutritionPer100g.fiber || 0);
    
    // Vérifier si l'ajout n'entraînerait pas un dépassement des glucides
    const carbsRemaining = targetMacros.carbs - meal.totalNutrition.netCarbs;
    if (netCarbsPer100g > 0 && carbsRemaining < 1) {
      continue; // Passer à une autre source de graisse
    }
    
    const remainingFat = fatRemaining - fatAdded;
    const remainingCalories = targetCalories - caloriesAdded;
    
    // Calculer la quantité maximale selon les contraintes
    const maxQuantityByFat = Math.floor((remainingFat / fatPer100g) * 100);
    const maxQuantityByCalories = Math.floor((remainingCalories / caloriesPer100g) * 100);
    const maxQuantityByCarbs = netCarbsPer100g > 0 ? 
                            Math.floor((carbsRemaining / netCarbsPer100g) * 100) : 1000;
    const availableQuantity = selectedFat.quantity;
    
    // Pour les huiles et sources très riches en graisses, limiter davantage
    const isHighFatSource = fatPer100g > 80;
    const maxReasonableQuantity = isHighFatSource ? 30 : 100;
    
    // Choisir la quantité la plus contraignante
    let quantity = Math.min(
      maxQuantityByFat,
      maxQuantityByCalories,
      maxQuantityByCarbs,
      availableQuantity,
      maxReasonableQuantity
    );
    
    // Minimum 5g pour les huiles, 15g pour les autres sources
    const minQuantity = isHighFatSource ? 5 : 15;
    quantity = Math.max(Math.min(minQuantity, availableQuantity), quantity);
    
    // Arrondir à 5g près
    quantity = Math.round(quantity / 5) * 5;
    
    if (quantity <= 0) continue; // Quantité trop faible, passer à la suivante
    
    // Calculer les nutriments pour cette quantité
    const ratio = quantity / 100;
    const itemNutrition = {
      calories: caloriesPer100g * ratio,
      protein: selectedFat.food.nutritionPer100g.protein * ratio,
      fat: fatPer100g * ratio,
      carbs: selectedFat.food.nutritionPer100g.carbs * ratio,
      netCarbs: netCarbsPer100g * ratio,
    };
    
    // Ajouter la source de graisse au repas
    meal.items.push({
      food: selectedFat.food,
      foodId: selectedFat.foodId,
      quantity: quantity,
    });
    
    // Mettre à jour les totaux nutritionnels
    meal.totalNutrition.calories += itemNutrition.calories;
    meal.totalNutrition.protein += itemNutrition.protein;
    meal.totalNutrition.fat += itemNutrition.fat;
    meal.totalNutrition.netCarbs += itemNutrition.netCarbs;
    
    // Mettre à jour les compteurs
    fatAdded += itemNutrition.fat;
    caloriesAdded += itemNutrition.calories;
    
    // Si nous avons atteint 95% de l'objectif de lipides, arrêter
    if (fatAdded >= fatRemaining * 0.95) {
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
 * Ajoute un aliment du type spécifié au repas
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} foodsOfType - Aliments disponibles du type spécifié
 * @param {number} targetCalories - Calories cibles à ajouter
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {Object} options - Options de génération, incluant prioritizeMacro
 * @returns {boolean} True si un aliment a été ajouté, false sinon
 */
function addFoodOfType(meal, foodsOfType, targetCalories, targetMacros, options) {
  if (foodsOfType.length === 0) return false;
  
  const ketoProfile = options.ketoProfile || 'standard';
  const ketoRatios = getKetoRatios(ketoProfile);
  const priorityMacro = options.prioritizeMacro || null;
  
  // Filtrer les aliments déjà présents dans le repas
  const availableFoods = foodsOfType.filter(food => 
    !meal.items.some(item => item.foodId === food.foodId)
  );
  
  if (availableFoods.length === 0) return false;
  
  // Priorité selon le macro si spécifié
  if (priorityMacro) {
    availableFoods.sort((a, b) => {
      if (priorityMacro === 'protein') {
        return b.food.nutritionPer100g.protein - a.food.nutritionPer100g.protein;
      } else if (priorityMacro === 'fat') {
        return b.food.nutritionPer100g.fat - a.food.nutritionPer100g.fat;
      } else {
        // Pour carbs, on trie du moins au plus
        const netCarbsA = a.food.nutritionPer100g.carbs - (a.food.nutritionPer100g.fiber || 0);
        const netCarbsB = b.food.nutritionPer100g.carbs - (b.food.nutritionPer100g.fiber || 0);
        return netCarbsA - netCarbsB;
      }
    });
  }
  
  // Choisir un aliment au hasard parmi les plus appropriés
  const topCount = Math.min(3, availableFoods.length);
  const selectedFoodItem = availableFoods[Math.floor(Math.random() * topCount)];
  
  if (!selectedFoodItem) return false;
  
  const { food, quantity: availableQuantity, foodId } = selectedFoodItem;
  
  // Déterminer le type de l'aliment
  const foodType = determineFoodType(food);
  
  // Vérifier si l'ajout n'entraînerait pas un dépassement des glucides
  const netCarbsPer100g = food.nutritionPer100g.carbs - (food.nutritionPer100g.fiber || 0);
  const carbsRemaining = targetMacros.carbs - meal.totalNutrition.netCarbs;
  
  if (netCarbsPer100g > 0 && carbsRemaining < 1) {
    return false; // Pas assez de marge pour les glucides
  }
  
  // Calculer la quantité nécessaire pour atteindre les calories cibles
  const caloriesPer100g = food.nutritionPer100g.calories;
  
  if (caloriesPer100g <= 0) return false; // Éviter division par zéro
  
  // Définir des limites en fonction du type d'aliment
  let maxQuantity;
  
  if (foodType === FOOD_TYPES.PROTEIN) {
    maxQuantity = ketoRatios.MAX_PROTEIN_QUANTITY;
  } else if (foodType === FOOD_TYPES.FAT) {
    // Limiter les graisses pures
    maxQuantity = food.nutritionPer100g.fat > 80 ? 30 : 100;
  } else if (foodType === FOOD_TYPES.VEGETABLE) {
    maxQuantity = 300;
  } else {
    maxQuantity = 200;
  }
  
  // Calculer la quantité maximale selon les contraintes
  const maxQuantityByCalories = Math.floor((targetCalories / caloriesPer100g) * 100);
  const maxQuantityByCarbs = netCarbsPer100g > 0 ? 
                          Math.floor((carbsRemaining / netCarbsPer100g) * 100) : 1000;
  
  // Choisir la quantité la plus contraignante
  let quantity = Math.min(
    maxQuantityByCalories,
    maxQuantityByCarbs,
    availableQuantity,
    maxQuantity
  );
  
  // Minimum raisonnable selon le type d'aliment
  let minQuantity;
  if (foodType === FOOD_TYPES.PROTEIN) {
    minQuantity = 50;
  } else if (foodType === FOOD_TYPES.FAT && food.nutritionPer100g.fat > 80) {
    minQuantity = 5;
  } else if (foodType === FOOD_TYPES.VEGETABLE) {
    minQuantity = 50;
  } else {
    minQuantity = 15;
  }
  
  quantity = Math.max(Math.min(minQuantity, availableQuantity), quantity);
  
  // Arrondir à 5g près
  quantity = Math.round(quantity / 5) * 5;
  
  if (quantity <= 0) return false; // Quantité trop faible
  
  // Calculer les nutriments pour cette quantité
  const ratio = quantity / 100;
  const itemNutrition = {
    calories: food.nutritionPer100g.calories * ratio,
    protein: food.nutritionPer100g.protein * ratio,
    fat: food.nutritionPer100g.fat * ratio,
    carbs: food.nutritionPer100g.carbs * ratio,
    netCarbs: netCarbsPer100g * ratio,
  };
  
  // Vérifier si l'ajout ne ferait pas dépasser les objectifs de lipides ou de glucides
  if (meal.totalNutrition.fat + itemNutrition.fat > targetMacros.fat ||
      meal.totalNutrition.netCarbs + itemNutrition.netCarbs > targetMacros.carbs) {
    // Essayer de réduire la quantité pour respecter les limites
    const maxByFat = targetMacros.fat > meal.totalNutrition.fat ? 
                    Math.floor(((targetMacros.fat - meal.totalNutrition.fat) / food.nutritionPer100g.fat) * 100) : 0;
    
    const maxByCarbs = targetMacros.carbs > meal.totalNutrition.netCarbs && netCarbsPer100g > 0 ? 
                      Math.floor(((targetMacros.carbs - meal.totalNutrition.netCarbs) / netCarbsPer100g) * 100) : 1000;
    
    // Nouvelle quantité ajustée
    const adjustedQuantity = Math.min(maxByFat, maxByCarbs);
    
    if (adjustedQuantity < minQuantity) {
      return false; // Quantité trop faible après ajustement
    }
    
    // Recalculer avec la quantité ajustée
    quantity = Math.round(adjustedQuantity / 5) * 5;
    const newRatio = quantity / 100;
    
    // Recalculer les nutriments
    itemNutrition.calories = food.nutritionPer100g.calories * newRatio;
    itemNutrition.protein = food.nutritionPer100g.protein * newRatio;
    itemNutrition.fat = food.nutritionPer100g.fat * newRatio;
    itemNutrition.carbs = food.nutritionPer100g.carbs * newRatio;
    itemNutrition.netCarbs = netCarbsPer100g * newRatio;
  }
  
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
 * @param {string} ketoProfile - Le profil keto utilisé
 */
function balanceMealMacros(meal, targetMacros, ketoProfile = 'standard') {
  // Obtenir les seuils du profil keto
  const ketoRatios = getKetoRatios(ketoProfile);
  
  // Calculer les ratios actuels par rapport aux cibles
  const currentRatios = {
    protein: meal.totalNutrition.protein / targetMacros.protein,
    fat: meal.totalNutrition.fat / targetMacros.fat,
    carbs: meal.totalNutrition.netCarbs / targetMacros.carbs,
  };
  
  // Si tous les ratios sont proches des cibles, pas besoin d'ajuster
  // Seuil réduit à 0.05 (5%) pour être plus strict (était 0.15)
  if (Math.abs(1 - currentRatios.protein) < 0.05 && 
      Math.abs(1 - currentRatios.fat) < 0.05 && 
      Math.abs(1 - currentRatios.carbs) < 0.05) {
    return;
  }
  
  // Définir l'ordre de priorité en fonction du profil
  let priorityOrder = ['protein', 'fat', 'carbs'];
  
  // Identifier les problèmes à résoudre
  const issues = [];
  
  // Vérifier si les objectifs protéiques ne sont pas atteints
  if (currentRatios.protein < ketoRatios.MIN_PROTEIN_TARGET_PERCENTAGE) {
    issues.push({
      macro: 'protein',
      direction: 'increase',
      severity: (ketoRatios.MIN_PROTEIN_TARGET_PERCENTAGE - currentRatios.protein)
    });
  }
  // Vérifier si les lipides dépassent l'objectif
  if (currentRatios.fat > 1.0) {
    issues.push({
      macro: 'fat',
      direction: 'decrease',
      severity: (currentRatios.fat - 1.0)
    });
  }
  // Vérifier si les glucides dépassent l'objectif
  if (currentRatios.carbs > 1.0) {
    issues.push({
      macro: 'carbs',
      direction: 'decrease',
      severity: (currentRatios.carbs - 1.0)
    });
  }
  
  // Trier les problèmes par sévérité
  issues.sort((a, b) => b.severity - a.severity);
  
  // Pas de problèmes à régler
  if (issues.length === 0) return;
  
  // Problème principal à régler
  const mainIssue = issues[0];
  
  // Régler le problème en ajustant les quantités
  if (mainIssue.macro === 'protein' && mainIssue.direction === 'increase') {
    // Augmenter les protéines en priorité
    const proteinItems = meal.items.filter(item => 
      item.food.nutritionPer100g.protein / 
      (item.food.nutritionPer100g.protein + item.food.nutritionPer100g.fat + item.food.nutritionPer100g.carbs) > 0.25
    );
    
    if (proteinItems.length > 0) {
      // Augmenter les quantités des aliments protéinés
      proteinItems.sort((a, b) => 
        b.food.nutritionPer100g.protein - a.food.nutritionPer100g.protein
      );
      
      // Calculer combien de protéines doivent encore être ajoutées
      const proteinNeeded = (targetMacros.protein * ketoRatios.MIN_PROTEIN_TARGET_PERCENTAGE) - meal.totalNutrition.protein;
      
      if (proteinNeeded > 0) {
        // Commencer par l'aliment avec la meilleure teneur en protéines
        for (const item of proteinItems) {
          const currentQuantity = item.quantity;
          const proteinPer100g = item.food.nutritionPer100g.protein;
          
          // Calculer la quantité nécessaire pour obtenir les protéines manquantes
          const additionalGrams = Math.ceil((proteinNeeded / proteinPer100g) * 100);
          
          // Limiter l'augmentation à une valeur raisonnable
          const maxIncrease = Math.min(additionalGrams, 100);
          
          // Calculer la nouvelle quantité
          const newQuantity = Math.min(
            currentQuantity + maxIncrease,
            ketoRatios.MAX_PROTEIN_QUANTITY // Limite maximale selon le profil
          );
          
          // Mettre à jour la nutrition totale du repas avec la différence
          const diffQuantity = newQuantity - currentQuantity;
          const diffRatio = diffQuantity / 100;
          
          meal.totalNutrition.calories += item.food.nutritionPer100g.calories * diffRatio;
          meal.totalNutrition.protein += item.food.nutritionPer100g.protein * diffRatio;
          meal.totalNutrition.fat += item.food.nutritionPer100g.fat * diffRatio;
          meal.totalNutrition.netCarbs += (
            item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0)
          ) * diffRatio;
          
          // Mettre à jour la quantité
          item.quantity = newQuantity;
          
          // Vérifier si nous avons atteint l'objectif
          if (meal.totalNutrition.protein >= targetMacros.protein * ketoRatios.MIN_PROTEIN_TARGET_PERCENTAGE) {
            break;
          }
        }
      }
    }
  } else if (mainIssue.macro === 'fat' && mainIssue.direction === 'decrease') {
    // Réduire les lipides en excès
    const fatItems = meal.items.filter(item => 
      item.food.nutritionPer100g.fat / 
      (item.food.nutritionPer100g.protein + item.food.nutritionPer100g.fat + item.food.nutritionPer100g.carbs) > 0.3
    );
    
    if (fatItems.length > 0) {
      // Trier les éléments par contribution absolue aux lipides
      fatItems.sort((a, b) => 
        (b.food.nutritionPer100g.fat * b.quantity / 100) - 
        (a.food.nutritionPer100g.fat * a.quantity / 100)
      );
      
      // Calculer l'excès de lipides
      const excessFat = meal.totalNutrition.fat - targetMacros.fat;
      
      if (excessFat > 0) {
        let fatReduced = 0;
        
        // Réduire progressivement en commençant par les plus gros contributeurs
        for (const item of fatItems) {
          const currentQuantity = item.quantity;
          const fatPer100g = item.food.nutritionPer100g.fat;
          const currentFatContribution = fatPer100g * currentQuantity / 100;
          
          // Ne jamais réduire en dessous d'une quantité minimale
          const minQuantity = 5; // 5g minimum
          
          // Calculer de combien on peut réduire cet aliment
          const fatToReduce = Math.min(excessFat - fatReduced, currentFatContribution);
          const gramsToReduce = Math.floor((fatToReduce / fatPer100g) * 100);
          
          // Limiter la réduction
          const maxReduction = Math.min(gramsToReduce, currentQuantity - minQuantity);
          
          if (maxReduction <= 0) continue; // Impossibilité de réduire davantage
          
          // Calculer la nouvelle quantité (arrondie à 5g près)
          const newQuantity = Math.max(minQuantity, Math.round((currentQuantity - maxReduction) / 5) * 5);
          
          // Mettre à jour la nutrition totale du repas avec la différence
          const diffQuantity = newQuantity - currentQuantity; // Négatif car réduction
          const diffRatio = diffQuantity / 100;
          
          meal.totalNutrition.calories += item.food.nutritionPer100g.calories * diffRatio;
          meal.totalNutrition.protein += item.food.nutritionPer100g.protein * diffRatio;
          meal.totalNutrition.fat += item.food.nutritionPer100g.fat * diffRatio;
          meal.totalNutrition.netCarbs += (
            item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0)
          ) * diffRatio;
          
          // Mettre à jour la quantité
          item.quantity = newQuantity;
          
          // Mettre à jour le compteur de graisses réduites
          fatReduced += item.food.nutritionPer100g.fat * (-diffRatio);
          
          // Vérifier si nous avons suffisamment réduit
          if (fatReduced >= excessFat * 0.9) { // 90% de l'excès suffit
            break;
          }
        }
      }
    }
  } else if (mainIssue.macro === 'carbs' && mainIssue.direction === 'decrease') {
    // Réduire les glucides en excès
    const carbItems = meal.items.filter(item => {
      const netCarbsPer100g = item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0);
      return netCarbsPer100g > 1; // Au moins 1g de glucides nets pour 100g
    });
    
    if (carbItems.length > 0) {
      // Trier les éléments par contribution absolue aux glucides
      carbItems.sort((a, b) => {
        const netCarbsA = a.food.nutritionPer100g.carbs - (a.food.nutritionPer100g.fiber || 0);
        const netCarbsB = b.food.nutritionPer100g.carbs - (b.food.nutritionPer100g.fiber || 0);
        return (netCarbsB * b.quantity / 100) - (netCarbsA * a.quantity / 100);
      });
      
      // Calculer l'excès de glucides
      const excessCarbs = meal.totalNutrition.netCarbs - targetMacros.carbs;
      
      if (excessCarbs > 0) {
        let carbsReduced = 0;
        
        // Réduire progressivement en commençant par les plus gros contributeurs
        for (const item of carbItems) {
          const currentQuantity = item.quantity;
          const netCarbsPer100g = item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0);
          const currentCarbsContribution = netCarbsPer100g * currentQuantity / 100;
          
          // Ne jamais réduire en dessous d'une quantité minimale
          let minQuantity;
          if (determineFoodType(item.food) === FOOD_TYPES.VEGETABLE) {
            minQuantity = 25; // 25g minimum pour les légumes
          } else {
            minQuantity = 5; // 5g minimum pour les autres
          }
          
          // Calculer de combien on peut réduire cet aliment
          const carbsToReduce = Math.min(excessCarbs - carbsReduced, currentCarbsContribution);
          const gramsToReduce = Math.floor((carbsToReduce / netCarbsPer100g) * 100);
          
          // Limiter la réduction
          const maxReduction = Math.min(gramsToReduce, currentQuantity - minQuantity);
          
          if (maxReduction <= 0) continue; // Impossibilité de réduire davantage
          
          // Calculer la nouvelle quantité (arrondie à 5g près)
          const newQuantity = Math.max(minQuantity, Math.round((currentQuantity - maxReduction) / 5) * 5);
          
          // Mettre à jour la nutrition totale du repas avec la différence
          const diffQuantity = newQuantity - currentQuantity; // Négatif car réduction
          const diffRatio = diffQuantity / 100;
          
          meal.totalNutrition.calories += item.food.nutritionPer100g.calories * diffRatio;
          meal.totalNutrition.protein += item.food.nutritionPer100g.protein * diffRatio;
          meal.totalNutrition.fat += item.food.nutritionPer100g.fat * diffRatio;
          meal.totalNutrition.netCarbs += netCarbsPer100g * diffRatio;
          
          // Mettre à jour la quantité
          item.quantity = newQuantity;
          
          // Mettre à jour le compteur de glucides réduits
          carbsReduced += netCarbsPer100g * (-diffRatio);
          
          // Vérifier si nous avons suffisamment réduit
          if (carbsReduced >= excessCarbs) {
            break;
          }
        }
      }
    }
  }
  
  // Arrondir toutes les valeurs nutritionnelles pour éviter les nombres bizarres
  meal.totalNutrition.calories = Math.round(meal.totalNutrition.calories);
  meal.totalNutrition.protein = Math.round(meal.totalNutrition.protein * 10) / 10;
  meal.totalNutrition.fat = Math.round(meal.totalNutrition.fat * 10) / 10;
  meal.totalNutrition.netCarbs = Math.round(meal.totalNutrition.netCarbs * 10) / 10;
}

/**
 * Fonction principale pour générer des repas à partir des aliments du frigo
 * @param {Array} availableFoods - Aliments disponibles avec leurs quantités
 * @param {Object} nutritionNeeds - Besoins nutritionnels journaliers
 * @param {Object} options - Options de génération incluant le profil keto
 * @returns {Array} Repas générés
 */
export function generateMealsFromFridge(availableFoods, nutritionNeeds, options) {
  // Si pas assez d'aliments, retourner un tableau vide
  if (!availableFoods || availableFoods.length < 3) {
    return [];
  }
  
  // Ne garder que les aliments avec une quantité positive
  const validFoods = availableFoods.filter(item => item.quantity > 0);
  
  // Obtenir le profil keto
  const ketoProfile = options?.ketoProfile || 'standard';
  
  // Obtenir les ratios correspondant au profil keto
  const ketoRatios = getKetoRatios(ketoProfile);
  
  // Valeurs par défaut pour les besoins nutritionnels si non fournis
  const defaultNeeds = {
    calories: 2000,
    protein: Math.round((2000 * ketoRatios.PROTEIN_PERCENTAGE) / CALORIC_FACTORS.PROTEIN),
    fat: Math.round((2000 * ketoRatios.FAT_PERCENTAGE) / CALORIC_FACTORS.FAT),
    carbs: Math.round((2000 * ketoRatios.CARBS_PERCENTAGE) / CALORIC_FACTORS.CARBS),
  };
  
  const needs = {
    calories: nutritionNeeds?.calories || defaultNeeds.calories,
    protein: nutritionNeeds?.protein || defaultNeeds.protein,
    fat: nutritionNeeds?.fat || defaultNeeds.fat,
    carbs: nutritionNeeds?.carbs || defaultNeeds.carbs,
  };
  
  // Ajuster automatiquement l'option maximizeProtein en fonction du profil
  let shouldMaximizeProtein = options?.maximizeProtein || false;
  if (ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine') {
    shouldMaximizeProtein = true;
  }
  
  // Valeurs par défaut pour les options si non fournies
  const defaultOptions = {
    mealCount: 2,
    preferLowCarbs: true,
    maximizeProtein: shouldMaximizeProtein,
    balancedMacros: true,
    ketoProfile: ketoProfile
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    // Forcer ces options en fonction du profil si non spécifiées explicitement
    maximizeProtein: options?.maximizeProtein !== undefined ? options.maximizeProtein : shouldMaximizeProtein,
    ketoProfile: ketoProfile
  };
  
  console.log(`Génération des repas avec profil: ${ketoProfile}, besoins protéiques: ${needs.protein}g`);
  
  // Générer les repas en tenant compte des contraintes
  const meals = findFoodCombinations(validFoods, needs, mergedOptions);
  
  // Vérifier que les repas générés respectent collectivement les objectifs
  if (meals && meals.length > 0) {
    const totalMacros = {
      protein: 0,
      fat: 0,
      netCarbs: 0
    };
    
    // Calculer les macros totales de tous les repas générés
    meals.forEach(meal => {
      totalMacros.protein += meal.totalNutrition.protein;
      totalMacros.fat += meal.totalNutrition.fat;
      totalMacros.netCarbs += meal.totalNutrition.netCarbs;
    });
    
    const dailyMacroPercentages = {
      protein: totalMacros.protein / needs.protein,
      fat: totalMacros.fat / needs.fat,
      netCarbs: totalMacros.netCarbs / needs.carbs
    };
    
    console.log(`Totaux des repas générés: Protéines: ${Math.round(totalMacros.protein)}g (${Math.round(dailyMacroPercentages.protein * 100)}%), Lipides: ${Math.round(totalMacros.fat)}g (${Math.round(dailyMacroPercentages.fat * 100)}%), Glucides nets: ${Math.round(totalMacros.netCarbs)}g (${Math.round(dailyMacroPercentages.netCarbs * 100)}%)`);
    
    // Vérifier spécifiquement les protéines pour les profils hyperprotéinés
    if ((ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine') && 
        dailyMacroPercentages.protein < ketoRatios.MIN_PROTEIN_TARGET_PERCENTAGE) {
      console.warn(`Attention: Les repas générés n'atteignent que ${Math.round(dailyMacroPercentages.protein * 100)}% de l'objectif protéique journalier (${Math.round(totalMacros.protein)}g/${needs.protein}g)`);
    }
  }
  
  return meals;
}
