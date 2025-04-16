

/**
 * Génère une liste de courses à partir d'un plan de repas
 * @param {Object} plan - Le plan de repas
 * @returns {Array} La liste de courses générée
 */
function generateShoppingList(mealPlan) {
  if (!mealPlan || !mealPlan.days) {
    console.error('Invalid meal plan structure provided.', mealPlan);
    return []; // Retourne une liste vide si mealPlan ou mealPlan.days n'est pas défini
  }

  const shoppingList = [];
  const categoryMap = new Map();

  mealPlan.days.forEach((day) => {
    if (!day.meals) return; // Passe au jour suivant si meals n'est pas défini

    day.meals.forEach((meal) => {
      if (!meal.ingredients) return; // Passe au repas suivant si ingredients n'est pas défini

      meal.ingredients.forEach((ingredient) => {
        if (!ingredient.category || !ingredient.name || !ingredient.quantity) {
          console.warn('Incomplete ingredient data:', ingredient);
          return; // Passe à l'ingrédient suivant si des données sont manquantes
        }
        const category = ingredient.category;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {});
        }
        if (categoryMap.get(category)[ingredient.name]) {
          categoryMap.get(category)[ingredient.name].quantity += ingredient.quantity;
        } else {
          categoryMap.get(category)[ingredient.name] = {
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          };
        }
      });
    });
  });

  // Transformation de la map en tableau pour la liste de courses
  categoryMap.forEach((ingredients, category) => {
    Object.keys(ingredients).forEach((ingredientName) => {
      shoppingList.push({
        id: generateUniqueId(), // Assurez-vous d'avoir une fonction qui génère des IDs uniques
        name: ingredientName,
        quantity: ingredients[ingredientName].quantity,
        unit: ingredients[ingredientName].unit || '', // Ajout de l'unité si disponible
        category,
      });
    });
  });

  return shoppingList;
}

// Fonction pour générer des IDs uniques (simple exemple)
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

export default generateShoppingList;

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
/*export function estimateShoppingListCost(shoppingList, foods) {
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
}*/

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
/*export function shoppingListToText(shoppingList) {
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
}*/

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
/*export function analyzeShoppingListMacros(shoppingList, foods) {
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
}*/
