/**
 * Utilitaire pour générer une liste de courses à partir d'un plan de repas
 */

/**
 * Génère une liste de courses à partir d'un plan de repas
 * @param {Object} plan - Le plan de repas
 * @param {Object} options - Options de génération
 * @param {Array} options.foods - Liste complète des aliments
 * @param {Function} options.getFoodById - Fonction pour obtenir un aliment par son ID
 * @param {Array} options.recipes - Liste complète des recettes
 * @param {Function} options.getRecipeById - Fonction pour obtenir une recette par son ID
 * @returns {Object} La liste de courses générée
 */
export function generateShoppingList(plan, { foods, getFoodById, recipes, getRecipeById }) {
  // Initialiser la liste des aliments nécessaires
  const requiredFoods = {};
  
  // Parcourir tous les jours du plan
  for (const day of plan.days) {
    // Parcourir tous les repas de la journée
    for (const meal of day.meals) {
      // Parcourir tous les éléments du repas (recettes ou aliments individuels)
      for (const item of meal.items) {
        if (item.type === 'recipe') {
          // C'est une recette, extraire tous ses ingrédients
          const recipe = getRecipeById(item.id);
          if (!recipe) {
            console.warn(`Recette non trouvée: ${item.id}`);
            continue;
          }
          
          // Calculer le facteur de portion
          const portionFactor = item.servings || 1;
          
          // Ajouter chaque ingrédient
          for (const ingredient of recipe.ingredients) {
            const foodId = ingredient.foodId;
            const quantity = ingredient.quantity * portionFactor;
            
            if (requiredFoods[foodId]) {
              requiredFoods[foodId].quantity += quantity;
            } else {
              requiredFoods[foodId] = {
                id: foodId,
                quantity
              };
            }
          }
        } else if (item.type === 'food') {
          // C'est un aliment individuel
          const foodId = item.id;
          const quantity = item.quantity || 0;
          
          if (requiredFoods[foodId]) {
            requiredFoods[foodId].quantity += quantity;
          } else {
            requiredFoods[foodId] = {
              id: foodId,
              quantity
            };
          }
        }
      }
    }
  }
  
  // Organiser les aliments par catégorie
  const categorizedItems = {};
  
  // Parcourir tous les aliments nécessaires
  for (const [foodId, entry] of Object.entries(requiredFoods)) {
    const food = getFoodById(foodId);
    if (!food) {
      console.warn(`Aliment non trouvé: ${foodId}`);
      continue;
    }
    
    // Convertir la quantité en unité appropriée
    const { quantity, unit } = convertToAppropriateUnit(food, entry.quantity);
    
    // Créer l'élément de liste de courses
    const shoppingItem = {
      id: food.id,
      name: food.name,
      quantity: Math.round(quantity * 10) / 10, // Arrondi à 1 décimale
      unit,
      checked: false
    };
    
    // Ajouter à la catégorie appropriée
    const category = food.category || 'autres';
    if (!categorizedItems[category]) {
      categorizedItems[category] = [];
    }
    
    categorizedItems[category].push(shoppingItem);
  }
  
  // Trier les éléments par nom dans chaque catégorie
  for (const category in categorizedItems) {
    categorizedItems[category].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  return {
    categories: categorizedItems
  };
}

/**
 * Convertit une quantité en unité la plus appropriée pour un aliment
 * @param {Object} food - L'aliment
 * @param {number} quantity - La quantité en grammes
 * @returns {Object} Quantité convertie et unité
 */
function convertToAppropriateUnit(food, quantity) {
  // Si l'aliment a une unité commune définie
  if (food.commonUnitWeight && food.commonUnitWeight > 0 && food.unitName) {
    // Calculer le nombre d'unités
    const units = quantity / food.commonUnitWeight;
    
    // Si le nombre d'unités est raisonnable (> 0.75), utiliser cette unité
    if (units >= 0.75) {
      return {
        quantity: units,
        unit: food.unitName
      };
    }
  }
  
  // Par défaut, retourner en grammes
  return {
    quantity,
    unit: 'g'
  };
}

/**
 * Estime le coût total d'une liste de courses (si les prix sont disponibles)
 * @param {Object} shoppingList - La liste de courses
 * @param {Array} foods - Liste complète des aliments
 * @returns {number} Le coût total estimé
 */
export function estimateShoppingListCost(shoppingList, foods) {
  let totalCost = 0;
  
  // Parcourir toutes les catégories
  for (const category in shoppingList.categories) {
    // Parcourir tous les éléments de la catégorie
    for (const item of shoppingList.categories[category]) {
      // Trouver l'aliment correspondant
      const food = foods.find(f => f.id === item.id);
      if (!food || !food.price) continue;
      
      // Calculer le coût de cet élément
      // Note: Cette fonctionnalité n'est pas implémentée dans la base de données actuelle,
      // mais pourrait être ajoutée dans une version future
      const cost = (item.quantity / food.commonUnitWeight) * food.price;
      totalCost += cost;
    }
  }
  
  return totalCost;
}

/**
 * Optimise une liste de courses en regroupant les aliments similaires
 * @param {Object} shoppingList - La liste de courses
 * @returns {Object} La liste optimisée
 */
export function optimizeShoppingList(shoppingList) {
  // Copie profonde de la liste de courses
  const optimizedList = JSON.parse(JSON.stringify(shoppingList));
  
  // Fonctionnalité à implémenter dans une version future:
  // - Regrouper les aliments similaires (ex: différents types de tomates)
  // - Remplacer des ingrédients isolés par des packs (ex: 1 carotte + 1 oignon + 1 poireau = 1 pack légumes à soupe)
  // - Trier les éléments par emplacement dans le magasin
  
  return optimizedList;
}

/**
 * Génère un format texte simple pour la liste de courses (pour le partage ou l'impression)
 * @param {Object} shoppingList - La liste de courses
 * @returns {string} La liste au format texte
 */
export function shoppingListToText(shoppingList) {
  let text = "LISTE DE COURSES\n\n";
  
  // Parcourir toutes les catégories
  for (const category in shoppingList.categories) {
    if (shoppingList.categories[category].length === 0) continue;
    
    // Ajouter le nom de la catégorie
    text += `${formatCategoryName(category).toUpperCase()}:\n`;
    
    // Ajouter chaque élément
    for (const item of shoppingList.categories[category]) {
      text += `- ${item.quantity} ${item.unit} ${item.name}\n`;
    }
    
    text += "\n";
  }
  
  return text;
}

/**
 * Formate le nom d'une catégorie pour l'affichage
 * @param {string} category - Le nom de la catégorie
 * @returns {string} Le nom formaté
 */
function formatCategoryName(category) {
  const categoryMap = {
    'viande': 'Viandes',
    'poisson': 'Poissons et fruits de mer',
    'œufs': 'Œufs',
    'produits_laitiers': 'Produits laitiers',
    'légumes': 'Légumes',
    'fruits': 'Fruits',
    'noix_graines': 'Noix et graines',
    'matières_grasses': 'Matières grasses',
    'autres': 'Autres'
  };
  
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Calcule les proportions du régime keto dans la liste de courses
 * @param {Object} shoppingList - La liste de courses
 * @param {Array} foods - Liste complète des aliments
 * @returns {Object} Proportions de macronutriments
 */
export function analyzeShoppingListMacros(shoppingList, foods) {
  // Initialiser les totaux
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  
  // Parcourir tous les éléments de la liste
  for (const category in shoppingList.categories) {
    for (const item of shoppingList.categories[category]) {
      const food = foods.find(f => f.id === item.id);
      if (!food) continue;
      
      // Calculer la part proportionnelle à la quantité
      const ratio = item.unit === 'g' 
        ? item.quantity / 100  // Déjà en grammes
        : (item.quantity * (food.commonUnitWeight || 100)) / 100; // Convertir unités en grammes
      
      // Accumuler les valeurs nutritionnelles
      totalCalories += food.nutritionPer100g.calories * ratio;
      totalProtein += food.nutritionPer100g.protein * ratio;
      totalFat += food.nutritionPer100g.fat * ratio;
      totalCarbs += food.nutritionPer100g.netCarbs * ratio;
    }
  }
  
  // Calculer le total des calories par macronutriment
  const proteinCalories = totalProtein * 4;  // 4 kcal/g
  const fatCalories = totalFat * 9;          // 9 kcal/g
  const carbsCalories = totalCarbs * 4;      // 4 kcal/g
  
  // Calculer les pourcentages
  const totalMacroCalories = proteinCalories + fatCalories + carbsCalories;
  
  return {
    protein: Math.round((proteinCalories / totalMacroCalories) * 100) || 0,
    fat: Math.round((fatCalories / totalMacroCalories) * 100) || 0,
    carbs: Math.round((carbsCalories / totalMacroCalories) * 100) || 0
  };
}
