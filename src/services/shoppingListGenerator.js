/**
 * Service de génération de liste de courses à partir d'un plan de repas
 * Ce service transforme les repas d'un plan en une liste de courses organisée par catégories
 */

/**
 * Génère une liste de courses à partir d'un plan de repas
 * @param {Object} plan - Le plan de repas complet
 * @param {Array} foods - La base de données d'aliments
 * @param {Array} recipes - La base de données de recettes
 * @returns {Object} La liste de courses organisée par catégories
 */
export function generateShoppingList(plan, foods, recipes) {
  // Si le plan est invalide, retourner une liste vide
  if (!plan || !plan.days || !Array.isArray(plan.days)) {
    return { categories: {} };
  }

  // Initialiser la liste temporaire (map pour agréger les quantités)
  const tempList = new Map();

  // Parcourir tous les jours du plan
  plan.days.forEach(day => {
    if (!day.meals || !Array.isArray(day.meals)) return;

    // Parcourir tous les repas de la journée
    day.meals.forEach(meal => {
      if (!meal.items || !Array.isArray(meal.items)) return;

      // Traiter chaque élément du repas
      meal.items.forEach(item => {
        if (item.type === 'recipe') {
          // Cas d'une recette : extraire tous les ingrédients
          const recipe = recipes.find(r => r.id === item.id);
          if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(ingredient => {
              addToShoppingList(tempList, ingredient.foodId, ingredient.quantity * (item.servings || 1), foods);
            });
          }
        } else if (item.type === 'food') {
          // Cas d'un aliment individuel
          addToShoppingList(tempList, item.id, item.quantity, foods);
        }
      });
    });
  });

  // Organiser en catégories
  const categorized = organizeByCategories(tempList, foods);

  // Retourner la liste finale
  return {
    planId: plan.id,
    planName: plan.name,
    startDate: plan.startDate,
    endDate: plan.endDate,
    generatedAt: new Date().toISOString(),
    categories: categorized
  };
}

/**
 * Ajoute un aliment à la liste de courses temporaire
 * @param {Map} tempList - La liste temporaire
 * @param {string} foodId - L'ID de l'aliment
 * @param {number} quantity - La quantité à ajouter
 * @param {Array} foods - La base de données d'aliments
 */
function addToShoppingList(tempList, foodId, quantity, foods) {
  // Récupérer l'aliment depuis la base de données
  const food = foods.find(f => f.id === foodId);
  if (!food) return;

  // Si l'aliment existe déjà dans la liste, augmenter la quantité
  if (tempList.has(foodId)) {
    const existingItem = tempList.get(foodId);
    existingItem.quantity += quantity;
    tempList.set(foodId, existingItem);
  } else {
    // Sinon, ajouter l'aliment à la liste
    tempList.set(foodId, {
      id: foodId,
      name: food.name,
      quantity,
      category: food.category,
      unit: food.commonUnitWeight && food.unitName ? food.unitName : 'g',
      checked: false
    });
  }
}

/**
 * Organise la liste de courses par catégories
 * @param {Map} tempList - La liste temporaire
 * @param {Array} foods - La base de données d'aliments
 * @returns {Object} La liste organisée par catégories
 */
function organizeByCategories(tempList, foods) {
  const result = {};

  // Convertir la Map en tableau et organiser par catégories
  Array.from(tempList.values()).forEach(item => {
    const food = foods.find(f => f.id === item.id);
    if (!food) return;

    const category = food.category;
    
    // Créer la catégorie si elle n'existe pas
    if (!result[category]) {
      result[category] = [];
    }

    // Convertir en unités pratiques si possible
    const convertedItem = convertToUsefulUnits(item, food);
    
    // Ajouter l'élément à sa catégorie
    result[category].push(convertedItem);
  });

  // Trier chaque catégorie par nom
  Object.keys(result).forEach(category => {
    result[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  return result;
}

/**
 * Convertit les quantités en unités pratiques
 * @param {Object} item - L'élément de la liste
 * @param {Object} food - Les données complètes de l'aliment
 * @returns {Object} L'élément avec quantité convertie si nécessaire
 */
function convertToUsefulUnits(item, food) {
  let result = { ...item };

  // Si l'aliment a un poids d'unité commune et que c'est approprié pour la conversion
  if (food.commonUnitWeight && food.unitName && item.quantity >= food.commonUnitWeight) {
    // Convertir en unités (ex: œufs, cuillères, tasses)
    const unitCount = item.quantity / food.commonUnitWeight;
    
    // On arrondit à 0.5 près pour des quantités pratiques
    const roundedCount = Math.ceil(unitCount * 2) / 2;
    
    result.quantity = roundedCount;
    result.unit = food.unitName;
  } else {
    // Arrondir les grammes à l'entier le plus proche pour plus de lisibilité
    result.quantity = Math.round(item.quantity);
  }

  return result;
}

/**
 * Exporte une liste de courses au format texte
 * @param {Object} shoppingList - La liste de courses à exporter
 * @returns {string} La liste au format texte
 */
export function exportShoppingListAsText(shoppingList) {
  if (!shoppingList || !shoppingList.categories) {
    return "Liste de courses vide";
  }
  
  let result = `LISTE DE COURSES\n`;
  result += `Plan: ${shoppingList.planName || 'Sans nom'}\n`;
  result += `Période: ${formatDate(shoppingList.startDate)} - ${formatDate(shoppingList.endDate)}\n\n`;
  
  // Parcourir les catégories
  Object.keys(shoppingList.categories).forEach(category => {
    // Ajouter le titre de la catégorie
    result += `== ${formatCategoryName(category)} ==\n`;
    
    // Parcourir les éléments de la catégorie
    shoppingList.categories[category].forEach(item => {
      result += `[ ] ${item.name}: ${item.quantity} ${item.unit}\n`;
    });
    
    result += '\n';
  });
  
  return result;
}

/**
 * Formate un nom de catégorie pour l'affichage
 * @param {string} category - Le nom de catégorie brut
 * @returns {string} Le nom formaté
 */
function formatCategoryName(category) {
  // Remplace les underscores par des espaces
  const withSpaces = category.replace(/_/g, ' ');
  
  // Met la première lettre en majuscule
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

/**
 * Formate une date pour l'affichage
 * @param {string} dateString - La date au format ISO
 * @returns {string} La date formatée
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
}
