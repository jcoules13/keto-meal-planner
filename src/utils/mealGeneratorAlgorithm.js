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
    PROTEIN_PRIORITY: 1, // Priorité standard pour les protéines
    MAX_PROTEIN_QUANTITY: 200, // Quantité maximale d'aliment protéiné (g)
  },
  'perte_poids': {
    FAT_PERCENTAGE: 0.75, // 75% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.20, // 20% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.05, // 5% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 10, // Maximum réduit de glucides nets par repas
    PROTEIN_PRIORITY: 1.2, // Priorité légèrement plus élevée pour les protéines
    MAX_PROTEIN_QUANTITY: 250, // Quantité maximale d'aliment protéiné (g)
  },
  'prise_masse': {
    FAT_PERCENTAGE: 0.65, // 65% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.30, // 30% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.05, // 5% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 15, // Maximum de glucides nets par repas
    PROTEIN_PRIORITY: 1.5, // Priorité élevée pour les protéines
    MAX_PROTEIN_QUANTITY: 350, // Quantité maximale d'aliment protéiné augmentée (g)
  },
  'cyclique': {
    FAT_PERCENTAGE: 0.70, // 70% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.20, // 20% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.10, // 10% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 25, // Maximum plus élevé de glucides nets par repas
    PROTEIN_PRIORITY: 1, // Priorité standard pour les protéines
    MAX_PROTEIN_QUANTITY: 200, // Quantité maximale d'aliment protéiné (g)
  },
  'hyperproteine': {
    FAT_PERCENTAGE: 0.40, // 40% des calories proviennent des lipides
    PROTEIN_PERCENTAGE: 0.50, // 50% des calories proviennent des protéines
    CARBS_PERCENTAGE: 0.10, // 10% des calories proviennent des glucides
    MAX_NET_CARBS_PER_MEAL: 20, // Maximum de glucides nets par repas
    PROTEIN_PRIORITY: 2, // Priorité très élevée pour les protéines
    MAX_PROTEIN_QUANTITY: 400, // Quantité maximale d'aliment protéiné très augmentée (g)
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
  const fatDeviation = Math.abs(fatRatio - ketoRatios.FAT_PERCENTAGE) * 2;
  const proteinDeviation = Math.abs(proteinRatio - ketoRatios.PROTEIN_PERCENTAGE);
  // Pénaliser davantage les glucides élevés
  const carbsDeviation = Math.abs(carbsRatio - ketoRatios.CARBS_PERCENTAGE) * 3; 
  
  // Calculer le score (10 - déviations)
  let score = 10 - (fatDeviation + proteinDeviation + carbsDeviation) * 10;
  
  // Pénaliser fortement les aliments à teneur élevée en glucides nets
  if (netCarbs > 10) {
    score -= (netCarbs - 10) * 0.5;
  }
  
  // Pour le profil "prise_masse" ou "hyperproteine", bonifier les aliments riches en protéines
  if (ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine') {
    const proteinBonus = (protein / 100) * ketoRatios.PROTEIN_PRIORITY;
    score += proteinBonus;
  }
  
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
  
  const generatedMeals = [];
  
  // Essayer de générer le nombre requis de repas
  for (let i = 0; i < options.mealCount; i++) {
    const meal = generateSingleMeal(
      foodsByType,
      caloriesPerMeal,
      targetMacros,
      { ...options, ketoProfile }
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
  
  // Essayer d'ajouter au moins un aliment protéiné
  // Utiliser un pourcentage plus élevé pour assurer que les protéines sont priorisées
  if (!addFoodOfType(meal, foodsByType[FOOD_TYPES.PROTEIN], proteinCalories * 1.1, targetMacros, options)) {
    return null; // Impossible de créer un repas sans source de protéines
  }
  
  // Essayer d'ajouter au moins un légume (si disponible)
  if (foodsByType[FOOD_TYPES.VEGETABLE].length > 0) {
    addFoodOfType(meal, foodsByType[FOOD_TYPES.VEGETABLE], carbsCalories * 1.5, targetMacros, options);
  }
  
  // Essayer d'ajouter au moins une source de gras (si disponible)
  if (foodsByType[FOOD_TYPES.FAT].length > 0) {
    addFoodOfType(meal, foodsByType[FOOD_TYPES.FAT], fatCalories, targetMacros, options);
  }
  
  // Si le repas est encore trop faible en calories, ajouter d'autres aliments
  if (meal.totalNutrition.calories < targetCalories * 0.7) {
    // Ajouter des aliments supplémentaires jusqu'à atteindre ~90% des calories cibles
    const remainingCalories = targetCalories - meal.totalNutrition.calories;
    
    // Priorité aux aliments en fonction des options
    let availableFoods = [];
    
    if (options.maximizeProtein || ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine') {
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
  
  // Vérifier le niveau de protéines et ajouter plus si nécessaire
  if (meal.totalNutrition.protein < targetMacros.protein * 0.8 && foodsByType[FOOD_TYPES.PROTEIN].length > 0) {
    // Calculer le déficit en protéines
    const proteinDeficit = targetMacros.protein - meal.totalNutrition.protein;
    if (proteinDeficit > 5) { // Ne s'inquiéter que des déficits importants
      // Filtrer les protéines qui ne sont pas encore dans le repas
      const existingFoodIds = meal.items.map(item => item.foodId);
      const availableProteins = foodsByType[FOOD_TYPES.PROTEIN].filter(
        item => !existingFoodIds.includes(item.foodId)
      );
      
      if (availableProteins.length > 0) {
        // Calculer les calories nécessaires pour combler le déficit en protéines
        const neededProteinCalories = proteinDeficit * CALORIC_FACTORS.PROTEIN;
        addFoodOfType(meal, availableProteins, neededProteinCalories * 1.2, targetMacros, {
          ...options,
          prioritizeProtein: true
        });
      }
    }
  }
  
  // Ajuster les quantités pour équilibrer les macros si l'option est activée
  if (options.balancedMacros) {
    balanceMealMacros(meal, targetMacros, ketoProfile);
  }
  
  return meal;
}

/**
 * Ajoute un aliment du type spécifié au repas
 * @param {Object} meal - Le repas en cours de construction
 * @param {Array} foodsOfType - Aliments disponibles du type spécifié
 * @param {number} targetCalories - Calories cibles à ajouter
 * @param {Object} targetMacros - Objectifs de macronutriments
 * @param {Object} options - Options de génération, incluant prioritizeProtein
 * @returns {boolean} True si un aliment a été ajouté, false sinon
 */
function addFoodOfType(meal, foodsOfType, targetCalories, targetMacros, options) {
  if (foodsOfType.length === 0) return false;
  
  const ketoProfile = options.ketoProfile || 'standard';
  const ketoRatios = getKetoRatios(ketoProfile);
  
  // Choisir un aliment au hasard parmi les plus compatibles
  // Pour les protéines, réduire un peu l'aléatoire en fonction du profil
  let topCount = (options.prioritizeProtein || ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine') ? 2 : 3;
  const topFoods = foodsOfType.slice(0, Math.min(topCount, foodsOfType.length));
  const selectedFoodItem = topFoods[Math.floor(Math.random() * topFoods.length)];
  
  if (!selectedFoodItem) return false;
  
  const { food, quantity: availableQuantity, foodId } = selectedFoodItem;
  
  // Vérifier si l'aliment n'est pas déjà dans le repas
  if (meal.items.some(item => item.foodId === foodId)) {
    return false;
  }
  
  // Déterminer le type de l'aliment
  const foodType = determineFoodType(food);
  
  // Calculer la quantité nécessaire pour atteindre les calories cibles
  const caloriesPer100g = food.nutritionPer100g.calories;
  
  // Définir une limite supérieure en fonction du type d'aliment et du profil keto
  let maxQuantity;
  
  if (foodType === FOOD_TYPES.PROTEIN) {
    // Utiliser la limite spécifique au profil pour les protéines
    maxQuantity = ketoRatios.MAX_PROTEIN_QUANTITY;
  } else if (foodType === FOOD_TYPES.FAT) {
    // Limiter les graisses pures à une quantité raisonnable
    maxQuantity = caloriesPer100g > 700 ? 50 : 150;
  } else if (foodType === FOOD_TYPES.VEGETABLE) {
    // Les légumes peuvent être en plus grande quantité
    maxQuantity = 300;
  } else {
    // Autres aliments
    maxQuantity = 200;
  }
  
  // Si on veut prioriser les protéines, augmenter encore la quantité maximale
  if (options.prioritizeProtein && foodType === FOOD_TYPES.PROTEIN) {
    maxQuantity *= 1.2;
  }
  
  let quantity = Math.min(
    (targetCalories / caloriesPer100g) * 100,
    availableQuantity,
    maxQuantity
  );
  
  // Ajuster pour les aliments très caloriques (comme les huiles)
  if (caloriesPer100g > 700) {
    quantity = Math.min(quantity, 30);
  }
  
  // Ajuster pour les aliments faibles en calories
  if (caloriesPer100g < 50) {
    quantity = Math.min(quantity, 300);
  }
  
  // Pour les aliments protéinés, s'assurer d'une quantité minimum en fonction du profil
  if (foodType === FOOD_TYPES.PROTEIN) {
    const minProteinQuantity = ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine' ? 100 : 80;
    quantity = Math.max(quantity, minProteinQuantity);
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
 * @param {string} ketoProfile - Le profil keto utilisé
 */
function balanceMealMacros(meal, targetMacros, ketoProfile = 'standard') {
  // Calculer les ratios actuels par rapport aux cibles
  const currentRatios = {
    protein: meal.totalNutrition.protein / targetMacros.protein,
    fat: meal.totalNutrition.fat / targetMacros.fat,
    carbs: meal.totalNutrition.netCarbs / targetMacros.carbs,
  };
  
  // Définir l'ordre de priorité en fonction du profil
  let priorityOrder = ['fat', 'protein', 'carbs']; // Par défaut
  
  if (ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine') {
    priorityOrder = ['protein', 'fat', 'carbs']; // Protéines en premier pour prise de masse
  } else if (ketoProfile === 'perte_poids') {
    priorityOrder = ['protein', 'carbs', 'fat']; // Protéines puis limiter carbs pour perte de poids
  }
  
  // Identifier le macronutriment le plus éloigné de sa cible selon l'ordre de priorité
  let furthestMacro = priorityOrder[0];
  let furthestRatio = Math.abs(1 - currentRatios[furthestMacro]);
  
  // Parcourir l'ordre de priorité pour trouver le plus éloigné
  for (const macro of priorityOrder) {
    const macroDeviation = Math.abs(1 - currentRatios[macro]);
    // Ne considérer que les macros déficitaires pour les profils protéinés
    if ((ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine') && macro === 'protein' && currentRatios[macro] < 1) {
      furthestMacro = macro;
      furthestRatio = macroDeviation;
      break; // Priorité absolue aux protéines déficitaires
    }
    
    if (macroDeviation > furthestRatio) {
      furthestMacro = macro;
      furthestRatio = macroDeviation;
    }
  }
  
  // Si le déficit/excès est faible, ne pas ajuster
  if (furthestRatio < 0.15) return;
  
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
      
      // Définir un facteur de contribution pour déterminer l'impact de l'ajustement
      const macroContribution = macroContent / food.nutritionPer100g.calories * 100;
      const isSignificantContributor = macroContribution > 10; // >10% des calories viennent de ce macro
      
      if (currentRatios[furthestMacro] < 0.85) {
        // Si nous sommes en dessous de la cible, augmenter les aliments riches en ce macro
        if (isSignificantContributor) {
          adjustmentFactor = ketoProfile === 'prise_masse' && furthestMacro === 'protein' ? 1.4 : 1.25;
        }
      } else if (currentRatios[furthestMacro] > 1.15) {
        // Si nous sommes au-dessus de la cible, réduire les aliments riches en ce macro
        if (isSignificantContributor) {
          adjustmentFactor = ketoProfile === 'prise_masse' && furthestMacro === 'fat' ? 0.7 : 0.8;
        }
      }
      
      // Ne jamais réduire les protéines pour les profils prise de masse et hyperprotéiné
      if ((ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine') && 
          furthestMacro === 'protein' && 
          adjustmentFactor < 1) {
        adjustmentFactor = 1; // Ne pas réduire les protéines pour ces profils
      }
      
      // Appliquer l'ajustement
      if (adjustmentFactor !== 1) {
        // Calculer la nouvelle quantité
        const newQuantity = Math.round(item.quantity * adjustmentFactor / 5) * 5;
        
        // S'assurer que la quantité minimale est respectée pour les aliments protéinés
        let finalQuantity = newQuantity;
        if (determineFoodType(food) === FOOD_TYPES.PROTEIN && 
            (ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine')) {
          const minProteinQuantity = ketoProfile === 'hyperproteine' ? 100 : 80;
          finalQuantity = Math.max(newQuantity, minProteinQuantity);
        }
        
        // Mettre à jour les macros du repas
        const oldRatio = item.quantity / 100;
        const newRatio = finalQuantity / 100;
        const diffRatio = newRatio - oldRatio;
        
        meal.totalNutrition.calories += food.nutritionPer100g.calories * diffRatio;
        meal.totalNutrition.protein += food.nutritionPer100g.protein * diffRatio;
        meal.totalNutrition.fat += food.nutritionPer100g.fat * diffRatio;
        meal.totalNutrition.netCarbs += (
          food.nutritionPer100g.carbs - (food.nutritionPer100g.fiber || 0)
        ) * diffRatio;
        
        // Mettre à jour la quantité
        item.quantity = finalQuantity;
      }
    }
  });
  
  // Arrondir les valeurs nutritionnelles
  meal.totalNutrition.calories = Math.round(meal.totalNutrition.calories);
  meal.totalNutrition.protein = Math.round(meal.totalNutrition.protein * 10) / 10;
  meal.totalNutrition.fat = Math.round(meal.totalNutrition.fat * 10) / 10;
  meal.totalNutrition.netCarbs = Math.round(meal.totalNutrition.netCarbs * 10) / 10;
  
  // Vérification finale des objectifs protéinés pour les profils spécifiques
  if ((ketoProfile === 'prise_masse' || ketoProfile === 'hyperproteine') && 
      meal.totalNutrition.protein < targetMacros.protein * 0.9) {
    console.log(`Avertissement: Objectif protéiné non atteint: ${meal.totalNutrition.protein}g vs ${targetMacros.protein}g cible`);
  }
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
  return findFoodCombinations(validFoods, needs, mergedOptions);
}
