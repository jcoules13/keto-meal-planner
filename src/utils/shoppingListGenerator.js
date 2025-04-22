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
  
  console.log("Génération de liste de courses pour le plan:", mealPlan.id || "plan sans ID");
  
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
  
  try {
    // Vérifier que le plan a des jours
    if (!mealPlan.days || !Array.isArray(mealPlan.days) || mealPlan.days.length === 0) {
      console.warn("Le plan de repas n'a pas de jours définis ou days n'est pas un tableau");
      return shoppingList;
    }
  
    // Parcourir tous les jours et repas du plan
    mealPlan.days.forEach((day, dayIndex) => {
      if (!day) {
        console.warn(`Jour ${dayIndex} est undefined ou null`);
        return;
      }
      
      if (!day.meals || !Array.isArray(day.meals) || day.meals.length === 0) {
        console.warn(`Jour ${dayIndex} n'a pas de repas définis ou meals n'est pas un tableau`);
        return;
      }
      
      day.meals.forEach((meal, mealIndex) => {
        if (!meal) {
          console.warn(`Repas ${mealIndex} du jour ${dayIndex} est undefined ou null`);
          return;
        }
        
        if (!meal.items || !Array.isArray(meal.items) || meal.items.length === 0) {
          console.warn(`Repas ${mealIndex} du jour ${dayIndex} n'a pas d'items ou items n'est pas un tableau`);
          return;
        }
        
        meal.items.forEach(item => {
          if (!item || !item.type) {
            console.warn("Un item de repas est invalide ou n'a pas de type");
            return;
          }
          
          if (item.type === 'food') {
            // Aliment individuel
            if (!item.id) {
              console.warn("Item de type 'food' sans ID");
              return;
            }
            
            const quantity = item.quantity || 0;
            processFood(item.id, quantity, getFoodById, addedFoods);
          } else if (item.type === 'recipe') {
            // Recette: extraire tous les ingrédients
            if (!item.id) {
              console.warn("Item de type 'recipe' sans ID");
              return;
            }
            
            const servings = item.servings || 1;
            processRecipe(item.id, servings, getRecipeById, getFoodById, addedFoods);
          }
        });
      });
    });
  
    // Organiser les aliments par catégorie
    for (const foodId in addedFoods) {
      const foodItem = addedFoods[foodId];
      const food = getFoodById(foodId);
      
      if (!food) {
        console.warn(`Aliment avec ID ${foodId} non trouvé dans la base de données`);
        continue;
      }
      
      const category = food.category || 'Autres';
      
      if (!shoppingList.categories[category]) {
        shoppingList.categories[category] = [];
      }
      
      // Liste très stricte d'aliments qui peuvent être comptés en unités
      // Uniquement des fruits et légumes entiers facilement comptables
      const countableItems = [
        'aubergine', 'concombre', 'courgette', 'avocat', 'citron', 'orange', 
        'pomme', 'poire', 'banane', 'kiwi', 'oeuf', 'œuf', 'sachet de thé'
      ];
      
      // Liste d'aliments qui ne doivent jamais être en unités
      // même s'ils ont commonUnitWeight défini
      const neverInUnits = [
        'steak', 'boeuf', 'bœuf', 'porc', 'poulet', 'dinde', 'agneau', 'veau',
        'poisson', 'saumon', 'thon', 'cabillaud', 'fromage', 'filet', 'magret',
        'jambon', 'viande', 'côte', 'cote', 'escalope', 'tranche', 'râpé', 'rapé'
      ];
      
      // Déterminer si l'aliment est liquide
      const isLiquid = food.isLiquid || 
                     /huile|vinaigre|sauce|lait|crème|bouillon|jus/.test(food.name.toLowerCase());
      
      // Vérifier si c'est un aliment qui ne doit jamais être en unités
      const isNeverInUnits = neverInUnits.some(term => 
        food.name.toLowerCase().includes(term)
      );
      
      // Déterminer si l'aliment est comptable en unités
      // Doit être dans la liste des comptables ET ne pas être dans la liste des "jamais en unités"
      const isCountable = !isNeverInUnits && 
                         countableItems.some(item => 
                           food.name.toLowerCase().includes(item) || 
                           (food.category && food.category.toLowerCase().includes(item))
                         );
      
      // Arrondir à 5g près (toujours vers le haut)
      const roundedQuantity = Math.ceil(foodItem.quantity / 5) * 5;
      
      // Déterminer l'unité de mesure la plus appropriée
      let quantity = roundedQuantity;
      let unit = 'g';
      
      if (isLiquid) {
        // Convertir en ml/L pour les liquides
        if (roundedQuantity >= 1000) {
          quantity = Math.round(roundedQuantity / 10) / 100; // Arrondir à 0.01L près
          unit = 'L';
        } else {
          unit = 'ml';
        }
      } else if (isCountable && food.commonUnitWeight && !isNeverInUnits) {
        // Pour les aliments comptables, convertir en unités si le poids unitaire est défini
        // et si le nombre d'unités est supérieur à 0.75 (pour éviter les fractions trop petites)
        const unitsCount = roundedQuantity / food.commonUnitWeight;
        if (unitsCount >= 0.75) {
          quantity = Math.ceil(unitsCount * 2) / 2; // Arrondir à 0.5 unité près (vers le haut)
          unit = 'unité';
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
    
    // Supprimer les catégories vides
    for (const category in shoppingList.categories) {
      if (shoppingList.categories[category].length === 0) {
        delete shoppingList.categories[category];
      } else {
        // Trier chaque catégorie par nom
        shoppingList.categories[category].sort((a, b) => a.name.localeCompare(b.name));
      }
    }
    
    console.log("Liste de courses générée avec succès:", 
      Object.keys(shoppingList.categories).length, "catégories");
    
    return shoppingList;
  } catch (error) {
    console.error("Erreur lors de la génération de la liste de courses:", error);
    
    // Retourner quand même la liste vide en cas d'erreur
    return {
      ...shoppingList,
      error: error.message
    };
  }
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
  if (!food) {
    console.warn(`Aliment avec ID ${foodId} non trouvé lors du traitement`);
    return;
  }
  
  // Ajouter ou mettre à jour la quantité
  if (addedFoods[foodId]) {
    addedFoods[foodId].quantity += quantity;
  } else {
    addedFoods[foodId] = {
      quantity: quantity
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
  if (!recipe) {
    console.warn(`Recette avec ID ${recipeId} non trouvée`);
    return;
  }
  
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    console.warn(`Recette ${recipeId} n'a pas d'ingrédients ou ingredients n'est pas un tableau`);
    return;
  }
  
  recipe.ingredients.forEach(ingredient => {
    if (!ingredient || !ingredient.foodId) {
      console.warn(`Ingrédient invalide dans la recette ${recipeId}`);
      return;
    }
    
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
  
  let formattedList = `LISTE DE COURSES - ${shoppingList.planName}\\n`;
  formattedList += `Du ${formatDate(shoppingList.startDate)} au ${formatDate(shoppingList.endDate)}\\n\\n`;
  
  for (const category in shoppingList.categories) {
    formattedList += `=== ${category.toUpperCase()} ===\\n`;
    
    shoppingList.categories[category].forEach(item => {
      formattedList += `□ ${item.name} (${item.quantity} ${item.unit})\\n`;
    });
    
    formattedList += '\\n';
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
