/**
 * Générateur de liste de courses basé sur un plan de repas
 * Cette fonctionnalité permet de convertir un plan de repas
 * en liste de courses organisée par catégories.
 */

/**
 * Génère une liste de courses à partir d'un plan de repas
 * @param {Object} mealPlan - Plan de repas complet
 * @param {Object} dependencies - Dépendances {foods, getFoodById, recipes, getRecipeById}
 * @returns {Object} Liste de courses organisée par catégories
 */
export function generateShoppingList(mealPlan, dependencies) {
  const { getFoodById, getRecipeById } = dependencies;
  
  // Structure de base pour la liste de courses
  const shoppingList = {
    planId: mealPlan.id,
    planName: mealPlan.name,
    startDate: mealPlan.startDate,
    endDate: mealPlan.endDate,
    generatedAt: new Date().toISOString(),
    categories: {}
  };
  
  // Dictionnaire pour suivre les aliments déjà ajoutés
  const addedFoods = {};
  
  // Parcourir tous les jours et repas du plan
  mealPlan.days.forEach(day => {
    if (!day.meals || day.meals.length === 0) return;
    
    day.meals.forEach(meal => {
      if (!meal.items || meal.items.length === 0) return;
      
      meal.items.forEach(item => {
        if (item.type === 'food') {
          // Aliment individuel
          processFood(item.id, item.quantity, getFoodById, addedFoods);
        } else if (item.type === 'recipe') {
          // Recette: extraire tous les ingrédients
          processRecipe(item.id, item.servings, getRecipeById, getFoodById, addedFoods);
        }
      });
    });
  });
  
  // Organiser les aliments par catégorie
  for (const foodId in addedFoods) {
    const foodItem = addedFoods[foodId];
    const food = getFoodById(foodId);
    
    if (!food) continue;
    
    const category = food.category || 'Autres';
    
    if (!shoppingList.categories[category]) {
      shoppingList.categories[category] = [];
    }
    
    // Convertir en unités pratiques si possible
    let quantity = foodItem.quantity;
    let unit = 'g';
    
    if (food.commonUnitWeight && food.unitName) {
      const unitsCount = quantity / food.commonUnitWeight;
      // Si le nombre d'unités est assez grand, utiliser cette unité
      if (unitsCount >= 0.75) {
        quantity = Math.round(unitsCount * 10) / 10; // Arrondir à 1 décimale
        unit = food.unitName;
      }
    }
    
    shoppingList.categories[category].push({
      id: foodId,
      name: food.name,
      quantity: quantity,
      unit: unit,
      checked: false
    });
  }
  
  // Trier chaque catégorie par nom
  for (const category in shoppingList.categories) {
    shoppingList.categories[category].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  return shoppingList;
}

/**
 * Traite un aliment individuel pour l'ajouter à la liste
 * @param {string} foodId - ID de l'aliment
 * @param {number} quantity - Quantité en grammes
 * @param {Function} getFoodById - Fonction pour obtenir un aliment par ID
 * @param {Object} addedFoods - Dictionnaire des aliments déjà ajoutés
 */
function processFood(foodId, quantity, getFoodById, addedFoods) {
  const food = getFoodById(foodId);
  if (!food) return;
  
  // Arrondir à 5g près
  const roundedQuantity = Math.ceil(quantity / 5) * 5;
  
  if (addedFoods[foodId]) {
    addedFoods[foodId].quantity += roundedQuantity;
  } else {
    addedFoods[foodId] = {
      quantity: roundedQuantity
    };
  }
}

/**
 * Traite une recette pour extraire tous ses ingrédients
 * @param {string} recipeId - ID de la recette
 * @param {number} servings - Nombre de portions
 * @param {Function} getRecipeById - Fonction pour obtenir une recette par ID
 * @param {Function} getFoodById - Fonction pour obtenir un aliment par ID
 * @param {Object} addedFoods - Dictionnaire des aliments déjà ajoutés
 */
function processRecipe(recipeId, servings, getRecipeById, getFoodById, addedFoods) {
  const recipe = getRecipeById(recipeId);
  if (!recipe || !recipe.ingredients) return;
  
  recipe.ingredients.forEach(ingredient => {
    const foodId = ingredient.foodId;
    const ingredientQuantity = ingredient.quantity * servings;
    
    processFood(foodId, ingredientQuantity, getFoodById, addedFoods);
  });
}

/**
 * Calcule le pourcentage d'items cochés dans une liste de courses
 * @param {Object} shoppingList - Liste de courses
 * @returns {number} Pourcentage d'items cochés (0-100)
 */
export function calculateShoppingProgress(shoppingList) {
  if (!shoppingList || !shoppingList.categories) return 0;
  
  let totalItems = 0;
  let checkedItems = 0;
  
  Object.values(shoppingList.categories).forEach(category => {
    totalItems += category.length;
    checkedItems += category.filter(item => item.checked).length;
  });
  
  return totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);
}

/**
 * Formate une liste de courses pour l'impression
 * @param {Object} shoppingList - Liste de courses
 * @returns {string} Version formatée de la liste pour impression
 */
export function formatShoppingListForPrint(shoppingList) {
  if (!shoppingList || !shoppingList.categories) return '';
  
  let formattedList = `LISTE DE COURSES - ${shoppingList.planName}\n`;
  formattedList += `Du ${formatDate(shoppingList.startDate)} au ${formatDate(shoppingList.endDate)}\n\n`;
  
  for (const category in shoppingList.categories) {
    formattedList += `=== ${category.toUpperCase()} ===\n`;
    
    shoppingList.categories[category].forEach(item => {
      formattedList += `□ ${item.name} (${item.quantity} ${item.unit})\n`;
    });
    
    formattedList += '\n';
  }
  
  return formattedList;
}

/**
 * Formate une date au format lisible
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {string} Date au format JJ/MM/YYYY
 */
function formatDate(dateString) {
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}