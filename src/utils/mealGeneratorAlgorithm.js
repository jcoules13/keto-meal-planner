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
    PROTEIN_PRIORITY: 2, // Priorité élevée pour les protéines (modifié de 1 à 2)
    MAX_PROTEIN_QUANTITY: 300, // Quantité maximale d'aliment protéiné (g) (augmenté de 200 à 300)
    MIN_PROTEIN_ACHIEVEMENT: 0.95, // Minimum 95% de l'objectif protéique doit être atteint
  },
  'perte_poids': {
    FAT_PERCENTAGE: 0.75, // 75% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.20, // 20% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.05, // 5% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 10, // Maximum réduit de glucides nets par repas
    PROTEIN_PRIORITY: 2.5, // Priorité élevée pour les protéines (modifié de 1.2 à 2.5)
    MAX_PROTEIN_QUANTITY: 350, // Quantité maximale d'aliment protéiné (g) (augmenté de 250 à 350)
    MIN_PROTEIN_ACHIEVEMENT: 0.95, // Minimum 95% de l'objectif protéique doit être atteint
  },
  'prise_masse': {
    FAT_PERCENTAGE: 0.65, // 65% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.30, // 30% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.05, // 5% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 15, // Maximum de glucides nets par repas
    PROTEIN_PRIORITY: 3, // Priorité très élevée pour les protéines (modifié de 1.5 à 3)
    MAX_PROTEIN_QUANTITY: 450, // Quantité maximale d'aliment protéiné augmentée (g) (augmenté de 350 à 450)
    MIN_PROTEIN_ACHIEVEMENT: 0.95, // Minimum 95% de l'objectif protéique doit être atteint
  },
  'cyclique': {
    FAT_PERCENTAGE: 0.70, // 70% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.20, // 20% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.10, // 10% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 25, // Maximum plus élevé de glucides nets par repas
    PROTEIN_PRIORITY: 2, // Priorité élevée pour les protéines (modifié de 1 à 2)
    MAX_PROTEIN_QUANTITY: 300, // Quantité maximale d'aliment protéiné (g) (augmenté de 200 à 300)
    MIN_PROTEIN_ACHIEVEMENT: 0.95, // Minimum 95% de l'objectif protéique doit être atteint
  },
  'hyperproteine': {
    FAT_PERCENTAGE: 0.40, // 40% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.50, // 50% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.10, // 10% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 20, // Maximum de glucides nets par repas
    PROTEIN_PRIORITY: 4, // Priorité extrêmement élevée pour les protéines (modifié de 2 à 4)
    MAX_PROTEIN_QUANTITY: 500, // Quantité maximale d'aliment protéiné très augmentée (g) (augmenté de 400 à 500)
    MIN_PROTEIN_ACHIEVEMENT: 0.95, // Minimum 95% de l'objectif protéique doit être atteint
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
  const proteinDeviation = Math.abs(proteinRatio - ketoRatios.PROTEIN_PERCENTAGE) * 0.5; // Réduit de 1 à 0.5 pour moins pénaliser les protéines élevées
  // Pénaliser davantage les glucides élevés
  const carbsDeviation = Math.abs(carbsRatio - ketoRatios.CARBS_PERCENTAGE) * 4; // Augmenté de 3 à 4 pour pénaliser davantage les glucides
  
  // Calculer le score (10 - déviations)
  let score = 10 - (fatDeviation + proteinDeviation + carbsDeviation) * 10;
  
  // Pénaliser fortement les aliments à teneur élevée en glucides nets
  if (netCarbs > 5) { // Réduit de 10 à 5 pour être plus strict sur les glucides
    score -= (netCarbs - 5) * 1; // Augmenté de 0.5 à 1 pour pénaliser davantage les glucides élevés
  }
  
  // Bonus pour les aliments riches en protéines
  const proteinBonus = (protein / 100) * ketoRatios.PROTEIN_PRIORITY * 2; // Multiplié par 2 pour augmenter le bonus protéique
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
 * Vérifie si un repas respecte les objectifs de macronutriments
 * @param {Object} meal - Le repas à évaluer
 * @param {Object} targetMacros - Les objectifs de macronutriments
 * @param {string} ketoProfile - Le profil keto utilisé
 * @returns {boolean} True si le repas respecte les critères, false sinon
 */
function validateMealMacros(meal, targetMacros, ketoProfile = 'standard') {
  const ketoRatios = getKetoRatios(ketoProfile);
  
  // Vérifier l'atteinte des objectifs protéiques
  const proteinAchievement = meal.totalNutrition.protein / targetMacros.protein;
  
  // Vérifier que les protéines atteignent au moins le pourcentage minimal défini dans le profil
  if (proteinAchievement < ketoRatios.MIN_PROTEIN_ACHIEVEMENT) {
    console.log(`Repas rejeté: Objectif protéique non atteint (${Math.round(proteinAchievement * 100)}% < ${Math.round(ketoRatios.MIN_PROTEIN_ACHIEVEMENT * 100)}%)`);
    return false;
  }
  
  // Vérifier le respect de la limite de glucides
  if (meal.totalNutrition.netCarbs > targetMacros.carbs) {
    console.log(`Repas rejeté: Limite de glucides dépassée (${meal.totalNutrition.netCarbs}g > ${targetMacros.carbs}g)`);
    return false;
  }
  
  // Vérifier que les lipides ne dépassent pas trop l'objectif
  const fatDeviation = meal.totalNutrition.fat / targetMacros.fat;
  if (fatDeviation > 1.05) { // Maximum 5% au-dessus de l'objectif
    console.log(`Repas rejeté: Excès de lipides (${Math.round(fatDeviation * 100)}% > 105%)`);
    return false;
  }
  
  return true; // Le repas respecte tous les critères
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
  const mealsPerDay = options.mealCount;
  const caloriesPerMeal = targetNutrition.calories / mealsPerDay;
  
  // Limites pour chaque macronutriment par repas (en grammes)
  const targetMacros = {
    protein: (targetNutrition.protein || 100) / mealsPerDay,
    fat: (targetNutrition.fat || 150) / mealsPerDay,
    carbs: (targetNutrition.carbs || 25) / mealsPerDay,
  };
  
  console.log(`Objectifs par repas - Protéines: ${Math.round(targetMacros.protein)}g, Lipides: ${Math.round(targetMacros.fat)}g, Glucides: ${Math.round(targetMacros.carbs)}g`);
  
  const generatedMeals = [];
  
  // Essayer de générer le nombre requis de repas
  for (let i = 0; i < options.mealCount; i++) {
    // Essayer plusieurs fois de générer un repas valide
    let meal = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!meal && attempts < maxAttempts) {
      attempts++;
      console.log(`Tentative de génération du repas ${i+1}/${options.mealCount} (essai ${attempts}/${maxAttempts})`);
      
      meal = generateSingleMeal(
        foodsByType,
        caloriesPerMeal,
        targetMacros,
        { ...options, ketoProfile }
      );
      
      // Valider que le repas généré respecte les contraintes de macros
      if (meal && !validateMealMacros(meal, targetMacros, ketoProfile)) {
        console.log(`Le repas généré ne respecte pas les contraintes de macros, nouvelle tentative...`);
        meal = null; // Rejeter le repas et réessayer
      }
    }
    
    if (meal) {
      console.log(`Repas ${i+1} généré avec succès: Protéines=${meal.totalNutrition.protein}g, Lipides=${meal.totalNutrition.fat}g, Glucides=${meal.totalNutrition.netCarbs}g`);
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
      console.warn(`Impossible de générer un repas valide après ${maxAttempts} tentatives`);
    }
  }
  
  return generatedMeals;
}
/**
 * Génère un seul repas équilibré à partir des aliments disponibles.
 * Algorithme modifié pour prioriser absolument l'atteinte des objectifs protéiques.
 * 
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
  
  console.log(`[Génération] Objectif de protéines pour ce repas: ${Math.round(targetMacros.protein)}g`);
  
  // PHASE 1: TRAITER LES PROTÉINES EN PRIORITÉ ABSOLUE
  // Sélectionner en priorité les aliments protéinés pour atteindre l'objectif en protéines
  if (!addProteinFoods(meal, foodsByType[FOOD_TYPES.PROTEIN], targetMacros, options)) {
    console.log("[Génération] Impossible d'atteindre l'objectif protéique minimum");
    return null; // Impossible de créer un repas sans source de protéines
  }
  
  // À ce stade, l'objectif protéique devrait être proche d'être atteint (>= 95%)
  const proteinAchievement = meal.totalNutrition.protein / targetMacros.protein;
  console.log(`[Génération] Protéines après phase 1: ${meal.totalNutrition.protein}g (${Math.round(proteinAchievement * 100)}% de l'objectif)`);
  
  // PHASE 2: AJOUTER LES LÉGUMES SANS DÉPASSER LA LIMITE DE GLUCIDES
  // Calculer combien de glucides nous pouvons encore ajouter
  const remainingCarbs = targetMacros.carbs - meal.totalNutrition.netCarbs;
  if (remainingCarbs > 0 && foodsByType[FOOD_TYPES.VEGETABLE].length > 0) {
    addVegetables(meal, foodsByType[FOOD_TYPES.VEGETABLE], remainingCarbs, options);
  }
  
  // PHASE 3: COMBLER AVEC DES LIPIDES
  // Calories restantes après les protéines et légumes
  const currentCalories = meal.totalNutrition.calories;
  const remainingCalories = targetCalories - currentCalories;
  
  if (remainingCalories > 0 && foodsByType[FOOD_TYPES.FAT].length > 0) {
    // Objectif: Ne pas dépasser l'objectif de lipides de plus de 5%
    const maxFat = targetMacros.fat * 1.05;
    const remainingFat = maxFat - meal.totalNutrition.fat;
    
    if (remainingFat > 0) {
      addFatFoods(meal, foodsByType[FOOD_TYPES.FAT], remainingFat, options);
    }
  }
  
  // Vérifier si le repas est viable (minimum de calories et au moins 2 aliments)
  if (meal.totalNutrition.calories < targetCalories * 0.5 || meal.items.length < 2) {
    console.log("[Génération] Repas non viable: trop peu de calories ou d'aliments");
    return null;
  }
  
  // Vérification finale pour les protéines
  const finalProteinPercentage = meal.totalNutrition.protein / targetMacros.protein;
  if (finalProteinPercentage < ketoRatios.MIN_PROTEIN_ACHIEVEMENT) {
    console.log(`[Génération] Échec: protéines finales ${meal.totalNutrition.protein}g (${Math.round(finalProteinPercentage * 100)}%) < objectif ${Math.round(ketoRatios.MIN_PROTEIN_ACHIEVEMENT * 100)}%`);
    return null;
  }
  
  // Ajuster les quantités pour équilibrer les macros si l'option est activée
  if (options.balancedMacros) {
    balanceMealMacros(meal, targetMacros, ketoProfile);
  }
  
  return meal;
}

/**
 * Ajoute spécifiquement des aliments protéinés pour atteindre l'objectif protéique
 * 
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} proteinFoods - Aliments protéinés disponibles
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {Object} options - Options de génération
 * @returns {boolean} True si l'objectif protéique minimum est atteint
 */
function addProteinFoods(meal, proteinFoods, targetMacros, options) {
  if (proteinFoods.length === 0) return false;
  
  const ketoProfile = options.ketoProfile || 'standard';
  const ketoRatios = getKetoRatios(ketoProfile);
  
  // Objectif protéique à atteindre (grammes)
  const targetProtein = targetMacros.protein;
  const minimumProtein = targetProtein * ketoRatios.MIN_PROTEIN_ACHIEVEMENT;
  
  console.log(`[Protéines] Objectif: ${targetProtein}g, Minimum requis: ${minimumProtein}g`);
  
  // Trier les aliments protéinés par teneur en protéines (du plus élevé au plus faible)
  const sortedProteinFoods = [...proteinFoods].sort((a, b) => {
    return (b.food.nutritionPer100g.protein / b.food.nutritionPer100g.calories) - 
           (a.food.nutritionPer100g.protein / a.food.nutritionPer100g.calories);
  });
  
  // Essayer d'ajouter suffisamment d'aliments protéinés pour atteindre l'objectif
  let proteinAchieved = meal.totalNutrition.protein;
  let attemptCount = 0;
  const maxAttempts = Math.min(sortedProteinFoods.length, 5); // Limiter le nombre d'aliments protéinés différents
  
  while (proteinAchieved < minimumProtein && attemptCount < maxAttempts) {
    const foodItem = sortedProteinFoods[attemptCount];
    const { food, quantity: availableQuantity, foodId } = foodItem;
    
    // Vérifier si l'aliment est déjà dans le repas
    if (meal.items.some(item => item.foodId === foodId)) {
      attemptCount++;
      continue;
    }
    
    // Calculer la quantité nécessaire pour atteindre l'objectif protéique restant
    const proteinPer100g = food.nutritionPer100g.protein;
    const proteinNeeded = targetProtein - proteinAchieved;
    
    // Quantité nécessaire pour atteindre l'objectif protéique
    let neededQuantity = (proteinNeeded / proteinPer100g) * 100;
    
    // Limiter à la quantité disponible et à la quantité maximale définie dans le profil
    const maxQuantity = Math.min(availableQuantity, ketoRatios.MAX_PROTEIN_QUANTITY);
    const quantity = Math.min(neededQuantity, maxQuantity);
    
    // Assurer une quantité minimale pour les aliments protéinés
    const minProteinQuantity = ketoProfile === 'hyperproteine' ? 125 : 
                               ketoProfile === 'prise_masse' ? 100 : 75;
                              
    const finalQuantity = Math.max(quantity, minProteinQuantity);
    
    // Arrondir à 5g près
    const roundedQuantity = Math.max(10, Math.round(finalQuantity / 5) * 5);
    
    // Calculer les nutriments pour cette quantité
    const ratio = roundedQuantity / 100;
    const itemNutrition = {
      calories: food.nutritionPer100g.calories * ratio,
      protein: food.nutritionPer100g.protein * ratio,
      fat: food.nutritionPer100g.fat * ratio,
      carbs: food.nutritionPer100g.carbs * ratio,
      netCarbs: (
        food.nutritionPer100g.carbs - (food.nutritionPer100g.fiber || 0)
      ) * ratio,
    };
    
    // Vérifier que l'ajout ne dépasse pas les limites de glucides
    if ((meal.totalNutrition.netCarbs + itemNutrition.netCarbs) > targetMacros.carbs) {
      console.log(`[Protéines] Aliment ${food.name} rejeté: dépasserait la limite de glucides`);
      attemptCount++;
      continue;
    }
    
    // Ajouter l'aliment au repas
    meal.items.push({
      food,
      foodId,
      quantity: roundedQuantity,
    });
    
    // Mettre à jour les totaux nutritionnels du repas
    meal.totalNutrition.calories += itemNutrition.calories;
    meal.totalNutrition.protein += itemNutrition.protein;
    meal.totalNutrition.fat += itemNutrition.fat;
    meal.totalNutrition.netCarbs += itemNutrition.netCarbs;
    
    // Mettre à jour le total de protéines atteint
    proteinAchieved = meal.totalNutrition.protein;
    
    console.log(`[Protéines] Ajouté ${roundedQuantity}g de ${food.name}: +${itemNutrition.protein.toFixed(1)}g de protéines, total=${proteinAchieved.toFixed(1)}g (${Math.round(proteinAchieved/targetProtein*100)}%)`);
    
    attemptCount++;
  }
  
  // Vérifier si nous avons atteint l'objectif minimum de protéines
  const proteinPercentage = proteinAchieved / targetProtein;
  if (proteinPercentage >= ketoRatios.MIN_PROTEIN_ACHIEVEMENT) {
    console.log(`[Protéines] Objectif atteint: ${proteinAchieved.toFixed(1)}g (${Math.round(proteinPercentage * 100)}%)`);
    return true;
  }
  
  console.log(`[Protéines] Objectif non atteint: ${proteinAchieved.toFixed(1)}g (${Math.round(proteinPercentage * 100)}%)`);
  return false;
}

/**
 * Ajoute des légumes au repas sans dépasser la limite de glucides
 * 
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} vegetables - Légumes disponibles
 * @param {number} maxNetCarbs - Maximum de glucides nets à ajouter
 * @param {Object} options - Options de génération
 */
function addVegetables(meal, vegetables, maxNetCarbs, options) {
  if (vegetables.length === 0 || maxNetCarbs <= 0) return;
  
  console.log(`[Légumes] Ajout de légumes avec max ${maxNetCarbs}g de glucides nets`);
  
  // Trier les légumes par teneur en glucides nets (du plus faible au plus élevé)
  const sortedVegetables = [...vegetables].sort((a, b) => {
    const netCarbsA = a.food.nutritionPer100g.carbs - (a.food.nutritionPer100g.fiber || 0);
    const netCarbsB = b.food.nutritionPer100g.carbs - (b.food.nutritionPer100g.fiber || 0);
    return netCarbsA - netCarbsB;
  });
  
  // Essayer d'ajouter 1-2 types de légumes
  const maxVegetableTypes = Math.min(2, sortedVegetables.length);
  let remainingCarbs = maxNetCarbs;
  let vegetableCount = 0;
  
  for (let i = 0; i < maxVegetableTypes; i++) {
    if (remainingCarbs <= 0) break;
    
    const vegItem = sortedVegetables[i];
    const { food, quantity: availableQuantity, foodId } = vegItem;
    
    // Vérifier si l'aliment est déjà dans le repas
    if (meal.items.some(item => item.foodId === foodId)) {
      continue;
    }
    
    // Calculer le maximum de légumes qu'on peut ajouter sans dépasser la limite
    const netCarbsPer100g = food.nutritionPer100g.carbs - (food.nutritionPer100g.fiber || 0);
    if (netCarbsPer100g <= 0) continue; // Éviter la division par zéro
    
    const maxQuantityByCarbs = (remainingCarbs / netCarbsPer100g) * 100;
    // Limiter à la quantité disponible et à une quantité raisonnable pour les légumes
    const maxQuantity = Math.min(availableQuantity, 300);
    let quantity = Math.min(maxQuantityByCarbs, maxQuantity);
    
    // Assurer une quantité minimale pour les légumes (lisibilité recette)
    const minVegQuantity = 75;
    
    // Si la quantité calculée est trop faible, passer au légume suivant
    if (quantity < minVegQuantity) {
      continue;
    }
    
    // Arrondir à 5g près
    const roundedQuantity = Math.round(quantity / 5) * 5;
    
    // Calculer les nutriments pour cette quantité
    const ratio = roundedQuantity / 100;
    const itemNutrition = {
      calories: food.nutritionPer100g.calories * ratio,
      protein: food.nutritionPer100g.protein * ratio,
      fat: food.nutritionPer100g.fat * ratio,
      carbs: food.nutritionPer100g.carbs * ratio,
      netCarbs: (
        food.nutritionPer100g.carbs - (food.nutritionPer100g.fiber || 0)
      ) * ratio,
    };
    
    // Ajouter le légume au repas
    meal.items.push({
      food,
      foodId,
      quantity: roundedQuantity,
    });
    
    // Mettre à jour les totaux nutritionnels du repas
    meal.totalNutrition.calories += itemNutrition.calories;
    meal.totalNutrition.protein += itemNutrition.protein;
    meal.totalNutrition.fat += itemNutrition.fat;
    meal.totalNutrition.netCarbs += itemNutrition.netCarbs;
    
    // Mettre à jour les glucides restants
    remainingCarbs -= itemNutrition.netCarbs;
    vegetableCount++;
    
    console.log(`[Légumes] Ajouté ${roundedQuantity}g de ${food.name}: +${itemNutrition.netCarbs.toFixed(1)}g de glucides nets, restant=${Math.max(0, remainingCarbs).toFixed(1)}g`);
  }
}

/**
 * Ajoute des sources de matières grasses au repas
 * 
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} fatFoods - Sources de matières grasses disponibles
 * @param {number} maxFat - Maximum de lipides à ajouter
 * @param {Object} options - Options de génération
 */
function addFatFoods(meal, fatFoods, maxFat, options) {
  if (fatFoods.length === 0 || maxFat <= 0) return;
  
  console.log(`[Lipides] Ajout de sources de gras avec max ${maxFat.toFixed(1)}g de lipides`);
  
  // Mélanger les sources de gras pour la variété
  const shuffledFatFoods = [...fatFoods].sort(() => Math.random() - 0.5);
  
  // Limiter à 1-2 sources de gras
  const maxFatTypes = Math.min(2, shuffledFatFoods.length);
  let remainingFat = maxFat;
  let fatFoodCount = 0;
  
  for (let i = 0; i < maxFatTypes; i++) {
    if (remainingFat <= 0) break;
    
    const fatItem = shuffledFatFoods[i];
    const { food, quantity: availableQuantity, foodId } = fatItem;
    
    // Vérifier si l'aliment est déjà dans le repas
    if (meal.items.some(item => item.foodId === foodId)) {
      continue;
    }
    
    // Vérifier la teneur en glucides pour ne pas dépasser la limite
    const netCarbsPer100g = food.nutritionPer100g.carbs - (food.nutritionPer100g.fiber || 0);
    const fatPer100g = food.nutritionPer100g.fat;
    
    // Si la source de gras contient des glucides, vérifier qu'on ne dépasse pas la limite
    if (netCarbsPer100g > 0) {
      const currentNetCarbs = meal.totalNutrition.netCarbs;
const targetMacros = options.targetMacros || {
        carbs: options.ketoRatios?.MAX_NET_CARBS_PER_MEAL || 20
      };
      
      const maxAdditionalCarbs = targetMacros.carbs - currentNetCarbs;
      if (maxAdditionalCarbs <= 0) {
        console.log(`[Lipides] Limite de glucides atteinte, impossible d'ajouter plus d'aliments`);
        break;
      }
      
      // Calculer la quantité maximale de cet aliment qu'on peut ajouter sans dépasser la limite de glucides
      const maxQuantityByCarbs = (maxAdditionalCarbs / netCarbsPer100g) * 100;
      // Mais on n'utilise pas cette quantité car on priorise les lipides
    }
    
    // Calculer la quantité nécessaire pour atteindre l'objectif de lipides
    const maxQuantityByFat = (remainingFat / fatPer100g) * 100;
    
    // Limiter la quantité en fonction de la teneur calorique de l'aliment
    let maxQuantity;
    if (food.nutritionPer100g.calories > 700) {
      // Aliments très caloriques (huiles, beurres purs)
      maxQuantity = Math.min(30, availableQuantity);
    } else if (food.nutritionPer100g.calories > 400) {
      // Aliments moyennement caloriques (fromages gras, avocat)
      maxQuantity = Math.min(75, availableQuantity);
    } else {
      // Autres sources de gras
      maxQuantity = Math.min(150, availableQuantity);
    }
    
    // Déterminer la quantité finale en prenant le minimum entre les différentes contraintes
    let quantity = Math.min(maxQuantityByFat, maxQuantity);
    
    // Si l'aliment contient des glucides, prendre aussi en compte cette contrainte
    if (netCarbsPer100g > 0) {
      quantity = Math.min(quantity, maxQuantityByCarbs);
    }
    
    // Assurer une quantité minimale pour éviter les portions insignifiantes
    const minFatQuantity = 10;
    
    // Si la quantité calculée est trop faible, passer à la source de gras suivante
    if (quantity < minFatQuantity) {
      continue;
    }
    
    // Arrondir à 5g près
    const roundedQuantity = Math.round(quantity / 5) * 5;
    
    // Calculer les nutriments pour cette quantité
    const ratio = roundedQuantity / 100;
    const itemNutrition = {
      calories: food.nutritionPer100g.calories * ratio,
      protein: food.nutritionPer100g.protein * ratio,
      fat: food.nutritionPer100g.fat * ratio,
      carbs: food.nutritionPer100g.carbs * ratio,
      netCarbs: (
        food.nutritionPer100g.carbs - (food.nutritionPer100g.fiber || 0)
      ) * ratio,
    };
    
    // Ajouter la source de gras au repas
    meal.items.push({
      food,
      foodId,
      quantity: roundedQuantity,
    });
    
    // Mettre à jour les totaux nutritionnels du repas
    meal.totalNutrition.calories += itemNutrition.calories;
    meal.totalNutrition.protein += itemNutrition.protein;
    meal.totalNutrition.fat += itemNutrition.fat;
    meal.totalNutrition.netCarbs += itemNutrition.netCarbs;
    
    // Mettre à jour les lipides restants
    remainingFat -= itemNutrition.fat;
    fatFoodCount++;
    
    console.log(`[Lipides] Ajouté ${roundedQuantity}g de ${food.name}: +${itemNutrition.fat.toFixed(1)}g de lipides, restant=${Math.max(0, remainingFat).toFixed(1)}g`);
  }
}

/**
 * Ajuste les quantités pour équilibrer les macronutriments
 * @param {Object} meal - Le repas à équilibrer
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {string} ketoProfile - Le profil keto utilisé
 */
function balanceMealMacros(meal, targetMacros, ketoProfile = 'standard') {
  // Calculer les ratios actuels par rapport aux cibles
  const currentRatios = {
    protein: meal.totalNutrition.protein / targetMacros.protein,
    fat: meal.totalNutrition.fat / targetMacros.fat,
    carbs: meal.totalNutrition.netCarbs / targetMacros.carbs,
  };
  
  console.log(`[Équilibrage] Ratios actuels - Protéines: ${Math.round(currentRatios.protein * 100)}%, Lipides: ${Math.round(currentRatios.fat * 100)}%, Glucides: ${Math.round(currentRatios.carbs * 100)}%`);
  
  // Définir l'ordre de priorité en fonction du profil
  let priorityOrder = ['protein', 'fat', 'carbs']; // Priorité aux protéines par défaut
  
  const ketoRatios = getKetoRatios(ketoProfile);
  
  // Vérifier d'abord si les protéines sont au niveau minimum requis
  if (currentRatios.protein < ketoRatios.MIN_PROTEIN_ACHIEVEMENT) {
    // Les protéines sont insuffisantes, les ajuster en premier
    adjustProteinQuantities(meal, targetMacros, ketoProfile);
    
    // Recalculer les ratios après ajustement des protéines
    currentRatios.protein = meal.totalNutrition.protein / targetMacros.protein;
    currentRatios.fat = meal.totalNutrition.fat / targetMacros.fat;
    currentRatios.carbs = meal.totalNutrition.netCarbs / targetMacros.carbs;
  }
  
  // Identifier le macronutriment le plus éloigné de sa cible
  const macroDeviations = {
    protein: Math.abs(1 - currentRatios.protein),
    fat: Math.abs(1 - currentRatios.fat),
    carbs: Math.abs(1 - currentRatios.carbs),
  };
  
  // Si le déficit/excès est faible dans tous les cas, ne pas ajuster
  const maxDeviation = Math.max(macroDeviations.protein, macroDeviations.fat, macroDeviations.carbs);
  if (maxDeviation < 0.05) {
    console.log(`[Équilibrage] Écarts faibles (max ${Math.round(maxDeviation * 100)}%), pas d'ajustement nécessaire`);
    return;
  }
  
  // Si les glucides sont au-dessus de la limite, les réduire
  if (currentRatios.carbs > 1.0) {
    reduceNetCarbs(meal, targetMacros.carbs);
    
    // Recalculer les ratios après réduction des glucides
    currentRatios.protein = meal.totalNutrition.protein / targetMacros.protein;
    currentRatios.fat = meal.totalNutrition.fat / targetMacros.fat;
    currentRatios.carbs = meal.totalNutrition.netCarbs / targetMacros.carbs;
  }
  
  // Si les lipides sont trop élevés, les réduire
  if (currentRatios.fat > 1.05) { // 5% de marge autorisée
    reduceFat(meal, targetMacros.fat);
  }
  
  // Ajuster les éléments pour une meilleure balance des macros
  finetuneQuantities(meal, targetMacros, ketoProfile);
  
  // Arrondir les valeurs nutritionnelles finales
  meal.totalNutrition.calories = Math.round(meal.totalNutrition.calories);
  meal.totalNutrition.protein = Math.round(meal.totalNutrition.protein * 10) / 10;
  meal.totalNutrition.fat = Math.round(meal.totalNutrition.fat * 10) / 10;
  meal.totalNutrition.netCarbs = Math.round(meal.totalNutrition.netCarbs * 10) / 10;
  
  // Afficher les ratios finaux
  const finalRatios = {
    protein: meal.totalNutrition.protein / targetMacros.protein,
    fat: meal.totalNutrition.fat / targetMacros.fat,
    carbs: meal.totalNutrition.netCarbs / targetMacros.carbs,
  };
  
  console.log(`[Équilibrage] Ratios finaux - Protéines: ${Math.round(finalRatios.protein * 100)}%, Lipides: ${Math.round(finalRatios.fat * 100)}%, Glucides: ${Math.round(finalRatios.carbs * 100)}%`);
}
/**
 * Ajuste les quantités des aliments protéinés pour atteindre l'objectif
 * @param {Object} meal - Le repas à ajuster
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {string} ketoProfile - Le profil keto utilisé
 */
function adjustProteinQuantities(meal, targetMacros, ketoProfile) {
  const ketoRatios = getKetoRatios(ketoProfile);
  const minProteinRequired = targetMacros.protein * ketoRatios.MIN_PROTEIN_ACHIEVEMENT;
  const currentProtein = meal.totalNutrition.protein;
  
  // Si les protéines sont déjà suffisantes, ne rien faire
  if (currentProtein >= minProteinRequired) return;
  
  // Calculer le déficit protéique
  const proteinDeficit = minProteinRequired - currentProtein;
  console.log(`[Ajustement] Déficit protéique: ${proteinDeficit.toFixed(1)}g`);
  
  // Identifier les aliments protéinés du repas
  const proteinItems = meal.items.filter(item => 
    determineFoodType(item.food) === FOOD_TYPES.PROTEIN
  );
  
  if (proteinItems.length === 0) {
    console.log("[Ajustement] Aucun aliment protéiné dans le repas, impossible d'ajuster");
    return;
  }
  
  // Calculer la teneur en protéines totale des aliments protéinés
  const totalProteinContent = proteinItems.reduce((sum, item) => {
    return sum + item.food.nutritionPer100g.protein;
  }, 0);
  
  // Répartir le déficit proportionnellement entre les aliments protéinés
  let remainingDeficit = proteinDeficit;
  
  for (const item of proteinItems) {
    if (remainingDeficit <= 0) break;
    
    // Calculer la part du déficit à combler par cet aliment
    const proteinRatio = item.food.nutritionPer100g.protein / totalProteinContent;
    const proteinToAdd = remainingDeficit * proteinRatio;
    
    // Calculer la quantité supplémentaire nécessaire
    const additionalGrams = (proteinToAdd / item.food.nutritionPer100g.protein) * 100;
    
    // Nouvelle quantité
    const newQuantity = item.quantity + additionalGrams;
    
    // Limiter à la quantité maximale définie dans le profil
    const maxQuantity = Math.min(ketoRatios.MAX_PROTEIN_QUANTITY, 500);
    
    // S'assurer que la nouvelle quantité ne dépasse pas le maximum
    const finalQuantity = Math.min(newQuantity, maxQuantity);
    
    // Si la quantité ne change pas significativement, passer à l'item suivant
    if (Math.abs(finalQuantity - item.quantity) < 5) continue;
    
    // Arrondir à 5g près
    const roundedQuantity = Math.round(finalQuantity / 5) * 5;
    
    // Calculer l'ajustement des nutriments
    const oldRatio = item.quantity / 100;
    const newRatio = roundedQuantity / 100;
    const diffRatio = newRatio - oldRatio;
    
    // Mettre à jour les macros du repas
    meal.totalNutrition.calories += item.food.nutritionPer100g.calories * diffRatio;
    meal.totalNutrition.protein += item.food.nutritionPer100g.protein * diffRatio;
    meal.totalNutrition.fat += item.food.nutritionPer100g.fat * diffRatio;
    meal.totalNutrition.netCarbs += (
      item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0)
    ) * diffRatio;
    
    // Mettre à jour la quantité
    console.log(`[Ajustement] ${item.food.name}: ${item.quantity}g → ${roundedQuantity}g (+${Math.round(item.food.nutritionPer100g.protein * diffRatio)}g protéines)`);
    item.quantity = roundedQuantity;
    
    // Mettre à jour le déficit restant
    remainingDeficit -= item.food.nutritionPer100g.protein * diffRatio;
  }
}

/**
 * Réduit les glucides nets si nécessaire
 * @param {Object} meal - Le repas à ajuster
 * @param {number} targetCarbs - Objectif de glucides
 */
function reduceNetCarbs(meal, targetCarbs) {
  const currentCarbs = meal.totalNutrition.netCarbs;
  
  // Si les glucides sont déjà sous la limite, ne rien faire
  if (currentCarbs <= targetCarbs) return;
  
  // Calculer l'excès de glucides
  const carbsExcess = currentCarbs - targetCarbs;
  console.log(`[Ajustement] Excès de glucides: ${carbsExcess.toFixed(1)}g`);
  
  // Trier les éléments par leur contenu en glucides nets (du plus élevé au plus faible)
  const sortedItems = [...meal.items].sort((a, b) => {
    const netCarbsA = (a.food.nutritionPer100g.carbs - (a.food.nutritionPer100g.fiber || 0)) * (a.quantity / 100);
    const netCarbsB = (b.food.nutritionPer100g.carbs - (b.food.nutritionPer100g.fiber || 0)) * (b.quantity / 100);
    return netCarbsB - netCarbsA;
  });
  
  // Trouver les éléments avec des glucides et réduire leurs quantités
  for (const item of sortedItems) {
    const netCarbsPer100g = item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0);
    if (netCarbsPer100g <= 0) continue; // Ignorer les éléments sans glucides nets
    
    // Ne pas toucher aux aliments protéinés si possible
    if (determineFoodType(item.food) === FOOD_TYPES.PROTEIN && 
        sortedItems.some(i => determineFoodType(i.food) !== FOOD_TYPES.PROTEIN && 
                          (i.food.nutritionPer100g.carbs - (i.food.nutritionPer100g.fiber || 0)) > 0)) {
      continue;
    }
    
    // Calculer la réduction nécessaire pour atteindre l'objectif
    const currentItemCarbs = netCarbsPer100g * (item.quantity / 100);
    const reductionNeeded = Math.min(currentItemCarbs, carbsExcess);
    const percentReduction = reductionNeeded / currentItemCarbs;
    
    // Calculer la nouvelle quantité
    const newQuantity = item.quantity * (1 - percentReduction);
    
    // Assurer une quantité minimale
    const minQuantity = 10;
    if (newQuantity < minQuantity) {
      // Plutôt que de réduire à une quantité insignifiante, supprimer l'élément si possible
      if (meal.items.length > 2) {
        console.log(`[Ajustement] Suppression de ${item.food.name} (${item.quantity}g) pour réduire les glucides`);
        
        // Mettre à jour les nutriments totaux
        const ratio = item.quantity / 100;
        meal.totalNutrition.calories -= item.food.nutritionPer100g.calories * ratio;
        meal.totalNutrition.protein -= item.food.nutritionPer100g.protein * ratio;
        meal.totalNutrition.fat -= item.food.nutritionPer100g.fat * ratio;
        meal.totalNutrition.netCarbs -= netCarbsPer100g * ratio;
        
        // Supprimer l'élément du repas
        const itemIndex = meal.items.findIndex(i => i.foodId === item.foodId);
        if (itemIndex !== -1) {
          meal.items.splice(itemIndex, 1);
        }
        
        return; // Une suppression devrait suffire
      } else {
        continue; // Passer à l'élément suivant si on ne peut pas supprimer
      }
    }
    
    // Arrondir à 5g près
    const roundedQuantity = Math.round(newQuantity / 5) * 5;
    
    // Calculer l'ajustement des nutriments
    const oldRatio = item.quantity / 100;
    const newRatio = roundedQuantity / 100;
    const diffRatio = newRatio - oldRatio;
    
    // Mettre à jour les macros du repas
    meal.totalNutrition.calories += item.food.nutritionPer100g.calories * diffRatio;
    meal.totalNutrition.protein += item.food.nutritionPer100g.protein * diffRatio;
    meal.totalNutrition.fat += item.food.nutritionPer100g.fat * diffRatio;
    meal.totalNutrition.netCarbs += netCarbsPer100g * diffRatio;
    
    // Mettre à jour la quantité
    console.log(`[Ajustement] ${item.food.name}: ${item.quantity}g → ${roundedQuantity}g (${Math.round(netCarbsPer100g * diffRatio)}g glucides nets)`);
    item.quantity = roundedQuantity;
    
    // Si les glucides sont maintenant sous la limite, arrêter
    if (meal.totalNutrition.netCarbs <= targetCarbs) {
      break;
    }
  }
}
/**
 * Réduit les lipides si nécessaire
 * @param {Object} meal - Le repas à ajuster
 * @param {number} targetFat - Objectif de lipides
 */
function reduceFat(meal, targetFat) {
  const currentFat = meal.totalNutrition.fat;
  
  // Si les lipides sont déjà sous la limite, ne rien faire
  if (currentFat <= targetFat * 1.05) return; // 5% de marge autorisée
  
  // Calculer l'excès de lipides
  const fatExcess = currentFat - targetFat;
  console.log(`[Ajustement] Excès de lipides: ${fatExcess.toFixed(1)}g`);
  
  // Trier les éléments par leur contenu en lipides (du plus élevé au plus faible)
  const sortedItems = [...meal.items].sort((a, b) => {
    const fatA = a.food.nutritionPer100g.fat * (a.quantity / 100);
    const fatB = b.food.nutritionPer100g.fat * (b.quantity / 100);
    return fatB - fatA;
  });
  
  // Trouver les éléments riches en lipides (non protéinés de préférence) et réduire leurs quantités
  for (const item of sortedItems) {
    // Ne pas toucher aux aliments protéinés si possible
    if (determineFoodType(item.food) === FOOD_TYPES.PROTEIN && 
        sortedItems.some(i => determineFoodType(i.food) !== FOOD_TYPES.PROTEIN && i.food.nutritionPer100g.fat > 0)) {
      continue;
    }
    
    // Ignorer les éléments avec peu de lipides
    if (item.food.nutritionPer100g.fat < 5) continue;
    
    // Calculer la réduction nécessaire pour atteindre l'objectif
    const currentItemFat = item.food.nutritionPer100g.fat * (item.quantity / 100);
    const reductionNeeded = Math.min(currentItemFat, fatExcess);
    const percentReduction = reductionNeeded / currentItemFat;
    
    // Calculer la nouvelle quantité
    const newQuantity = item.quantity * (1 - percentReduction);
    
    // Assurer une quantité minimale
    const minQuantity = 5;
    if (newQuantity < minQuantity) {
      // Si c'est une source de gras pure et qu'il y a d'autres aliments, on peut la supprimer
      if (determineFoodType(item.food) === FOOD_TYPES.FAT && meal.items.length > 2) {
        console.log(`[Ajustement] Suppression de ${item.food.name} (${item.quantity}g) pour réduire les lipides`);
        
        // Mettre à jour les nutriments totaux
        const ratio = item.quantity / 100;
        meal.totalNutrition.calories -= item.food.nutritionPer100g.calories * ratio;
        meal.totalNutrition.protein -= item.food.nutritionPer100g.protein * ratio;
        meal.totalNutrition.fat -= item.food.nutritionPer100g.fat * ratio;
        meal.totalNutrition.netCarbs -= (
          item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0)
        ) * ratio;
        
        // Supprimer l'élément du repas
        const itemIndex = meal.items.findIndex(i => i.foodId === item.foodId);
        if (itemIndex !== -1) {
          meal.items.splice(itemIndex, 1);
        }
        
        return; // Une suppression devrait suffire
      } else {
        continue; // Passer à l'élément suivant
      }
    }
    
    // Arrondir à 5g près
    const roundedQuantity = Math.round(newQuantity / 5) * 5;
    
    // Calculer l'ajustement des nutriments
    const oldRatio = item.quantity / 100;
    const newRatio = roundedQuantity / 100;
    const diffRatio = newRatio - oldRatio;
    
    // Mettre à jour les macros du repas
    meal.totalNutrition.calories += item.food.nutritionPer100g.calories * diffRatio;
    meal.totalNutrition.protein += item.food.nutritionPer100g.protein * diffRatio;
    meal.totalNutrition.fat += item.food.nutritionPer100g.fat * diffRatio;
    meal.totalNutrition.netCarbs += (
      item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0)
    ) * diffRatio;
    
    // Mettre à jour la quantité
    console.log(`[Ajustement] ${item.food.name}: ${item.quantity}g → ${roundedQuantity}g (${Math.round(item.food.nutritionPer100g.fat * diffRatio)}g lipides)`);
    item.quantity = roundedQuantity;
    
    // Si les lipides sont maintenant sous la limite, arrêter
    if (meal.totalNutrition.fat <= targetFat * 1.05) {
      break;
    }
  }
}

/**
 * Ajustement fin des quantités pour équilibrer les macros
 * @param {Object} meal - Le repas à ajuster
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {string} ketoProfile - Le profil keto utilisé
 */
function finetuneQuantities(meal, targetMacros, ketoProfile) {
  // Calculer les écarts actuels
  const currentRatios = {
    protein: meal.totalNutrition.protein / targetMacros.protein,
    fat: meal.totalNutrition.fat / targetMacros.fat,
    carbs: meal.totalNutrition.netCarbs / targetMacros.carbs,
  };
  
  // Si tous les ratios sont dans les tolérances, ne rien faire
  const tolerances = {
    protein: 0.05, // 5% d'écart autorisé
    fat: 0.05,
    carbs: 0.05,
  };
  
  let needsAdjustment = false;
  for (const macro of ['protein', 'fat', 'carbs']) {
    if (Math.abs(1 - currentRatios[macro]) > tolerances[macro]) {
      needsAdjustment = true;
      break;
    }
  }
  
  if (!needsAdjustment) {
    console.log(`[Ajustement fin] Tous les macros sont dans les tolérances, pas d'ajustement nécessaire`);
    return;
  }
  
  // Priorités d'ajustement selon le profil
  const priorities = {
    'standard': ['protein', 'fat', 'carbs'],
    'perte_poids': ['protein', 'carbs', 'fat'],
    'prise_masse': ['protein', 'fat', 'carbs'],
    'cyclique': ['protein', 'carbs', 'fat'],
    'hyperproteine': ['protein', 'carbs', 'fat'],
  };
  
  const macroOrder = priorities[ketoProfile] || priorities.standard;
  
  // Faire des ajustements fins item par item
  for (const macro of macroOrder) {
    // Si ce macro est déjà dans les tolérances, passer au suivant
    if (Math.abs(1 - currentRatios[macro]) <= tolerances[macro]) {
      continue;
    }
    
    // Déterminer si on doit augmenter ou diminuer
    const shouldIncrease = currentRatios[macro] < 1;
    
    // Trouver les éléments qui peuvent ajuster ce macro
    let eligibleItems = [...meal.items].filter(item => {
      if (macro === 'protein') {
        return item.food.nutritionPer100g.protein > 0;
      } else if (macro === 'fat') {
        return item.food.nutritionPer100g.fat > 0;
      } else { // carbs
        return (item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0)) > 0;
      }
    });
    
    // Trier par efficacité pour ajuster ce macro
    eligibleItems.sort((a, b) => {
      let valueA, valueB;
      
      if (macro === 'protein') {
        valueA = a.food.nutritionPer100g.protein / a.food.nutritionPer100g.calories;
        valueB = b.food.nutritionPer100g.protein / b.food.nutritionPer100g.calories;
      } else if (macro === 'fat') {
        valueA = a.food.nutritionPer100g.fat / a.food.nutritionPer100g.calories;
        valueB = b.food.nutritionPer100g.fat / b.food.nutritionPer100g.calories;
      } else { // carbs
        valueA = (a.food.nutritionPer100g.carbs - (a.food.nutritionPer100g.fiber || 0)) / a.food.nutritionPer100g.calories;
        valueB = (b.food.nutritionPer100g.carbs - (b.food.nutritionPer100g.fiber || 0)) / b.food.nutritionPer100g.calories;
      }
      
      return shouldIncrease ? (valueB - valueA) : (valueA - valueB);
    });
    
    // Limiter aux 2 meilleurs candidats pour l'ajustement
    const adjustmentCandidates = eligibleItems.slice(0, 2);
    
    // Calculer le déficit/excès global
    let macroGap;
    if (macro === 'protein') {
      macroGap = targetMacros.protein - meal.totalNutrition.protein;
    } else if (macro === 'fat') {
      macroGap = targetMacros.fat - meal.totalNutrition.fat;
    } else { // carbs
      macroGap = targetMacros.carbs - meal.totalNutrition.netCarbs;
    }
    
    // Si le gap est minuscule, ignorer
    if (Math.abs(macroGap) < 2) {
      continue;
    }
    
    // Ajuster les candidats sélectionnés
    for (const item of adjustmentCandidates) {
      if (Math.abs(macroGap) < 2) break; // Si le gap est comblé, arrêter
      
      let macroContentPer100g;
      if (macro === 'protein') {
        macroContentPer100g = item.food.nutritionPer100g.protein;
      } else if (macro === 'fat') {
        macroContentPer100g = item.food.nutritionPer100g.fat;
      } else { // carbs
        macroContentPer100g = item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0);
      }
      
      if (macroContentPer100g <= 0) continue;
      
      // Calculer l'ajustement de quantité nécessaire
      const quantityAdjustment = (macroGap / macroContentPer100g) * 100;
      
      // Ne pas faire de grands ajustements
      const maxAdjustment = shouldIncrease ? 50 : -50; // Max 50g d'ajustement
      const cappedAdjustment = Math.max(Math.min(quantityAdjustment, maxAdjustment), -maxAdjustment);
      
      // Nouvelle quantité
      const newQuantity = item.quantity + cappedAdjustment;
      
      // Assurer une quantité minimale et raisonnable
      const minQuantity = 5;
      if (newQuantity < minQuantity) continue;
      
      // Arrondir à 5g près
      const roundedQuantity = Math.round(newQuantity / 5) * 5;
      
      // Si l'ajustement est trop faible, passer
      if (Math.abs(roundedQuantity - item.quantity) < 5) continue;
      
      // Calculer l'ajustement des nutriments
      const oldRatio = item.quantity / 100;
      const newRatio = roundedQuantity / 100;
      const diffRatio = newRatio - oldRatio;
      
      // Vérifier que l'ajustement n'entraîne pas de dépassement des autres macros
      const newProtein = meal.totalNutrition.protein + item.food.nutritionPer100g.protein * diffRatio;
      const newFat = meal.totalNutrition.fat + item.food.nutritionPer100g.fat * diffRatio;
      const newNetCarbs = meal.totalNutrition.netCarbs + 
        (item.food.nutritionPer100g.carbs - (item.food.nutritionPer100g.fiber || 0)) * diffRatio;
      
      // Vérifier que les nouvelles valeurs respectent les limites
      if (newNetCarbs > targetMacros.carbs * 1.05) continue; // Ne pas dépasser les glucides
      
      // Mettre à jour les macros du repas
      meal.totalNutrition.calories += item.food.nutritionPer100g.calories * diffRatio;
      meal.totalNutrition.protein = newProtein;
      meal.totalNutrition.fat = newFat;
      meal.totalNutrition.netCarbs = newNetCarbs;
      
      // Mettre à jour la quantité
      console.log(`[Ajustement fin] ${item.food.name}: ${item.quantity}g → ${roundedQuantity}g`);
      item.quantity = roundedQuantity;
      
      // Mettre à jour le déficit/excès
      if (macro === 'protein') {
        macroGap = targetMacros.protein - meal.totalNutrition.protein;
      } else if (macro === 'fat') {
        macroGap = targetMacros.fat - meal.totalNutrition.fat;
      } else { // carbs
        macroGap = targetMacros.carbs - meal.totalNutrition.netCarbs;
      }
    }
  }
}.protein / a.food.nutritionPer100g.calories;
        valueB = b.food.nutritionPer100g.protein / b.food.nutritionPer100g.calories;
      } else if (macro === 'fat') {
        valueA = a.food.nutritionPer100g
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
    console.log("Pas assez d'aliments disponibles pour générer des repas");
    return [];
  }
  
  // Ne garder que les aliments avec une quantité positive
  const validFoods = availableFoods.filter(item => item.quantity > 0);
  
  // Obtenir le profil keto
  const ketoProfile = options?.ketoProfile || 'standard';
  
  // Obtenir les ratios correspondant au profil keto
  const ketoRatios = getKetoRatios(ketoProfile);
  
  console.log(`Génération avec profil ${ketoProfile}, ratios idéaux: Protéines: ${Math.round(ketoRatios.PROTEIN_PERCENTAGE * 100)}%, Lipides: ${Math.round(ketoRatios.FAT_PERCENTAGE * 100)}%, Glucides: ${Math.round(ketoRatios.CARBS_PERCENTAGE * 100)}%`);
  
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
  
  console.log(`Objectifs nutritionnels journaliers:`, needs);
  
  // Valeurs par défaut pour les options si non fournies
  const defaultOptions = {
    mealCount: 2,
    preferLowCarbs: true,
    balancedMacros: true,
    ketoProfile: ketoProfile
  };
  
  // Ajuster automatiquement l'option maximizeProtein en fonction du profil
  let shouldMaximizeProtein = options?.maximizeProtein || false;
  if (ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine') {
    shouldMaximizeProtein = true;
  }
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    // Forcer ces options en fonction du profil si non spécifiées explicitement
    maximizeProtein: options?.maximizeProtein !== undefined ? options.maximizeProtein : shouldMaximizeProtein,
    ketoProfile: ketoProfile
  };
  
  console.log(`Génération de ${mergedOptions.mealCount} repas avec profil: ${ketoProfile}`);
  console.log(`Besoins protéiques: ${needs.protein}g, objectif min: ${Math.round(needs.protein * ketoRatios.MIN_PROTEIN_ACHIEVEMENT)}g (${Math.round(ketoRatios.MIN_PROTEIN_ACHIEVEMENT * 100)}%)`);
  
  // Générer les repas en tenant compte des contraintes
  return findFoodCombinations(validFoods, needs, mergedOptions);
}
